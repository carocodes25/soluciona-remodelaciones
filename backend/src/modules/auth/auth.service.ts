import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  UnauthorizedException,
  ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refreshtoken.dto';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role || UserRole.CLIENT,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    });

    // Create Pro profile if role is PRO
    if (user.role === UserRole.PRO) {
      await this.prisma.pro.create({
        data: {
          userId: user.id,
          businessName: dto.businessName,
          bio: dto.bio || '',
        },
      });
    }

    // Generate OTP for email verification
    await this.generateAndSaveOtp(user.id, user.email, 'EMAIL_VERIFICATION');

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Log audit
    await this.createAuditLog(user.id, 'USER_REGISTERED', {
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      message: 'Registration successful. Please verify your email.',
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        pro: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log audit
    await this.createAuditLog(user.id, 'USER_LOGIN', {
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(dto: RefreshTokenDto) {
    // Find refresh token
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check if token is revoked
    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role,
    );

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    return tokens;
  }

  /**
   * Send OTP to user
   */
  async sendOtp(userId: string, type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const target = type === 'PHONE_VERIFICATION' ? user.phone : user.email;
    
    if (!target) {
      throw new BadRequestException(`${type === 'PHONE_VERIFICATION' ? 'Phone' : 'Email'} not provided`);
    }

    await this.generateAndSaveOtp(userId, target, type);

    return {
      message: `OTP sent to ${type === 'PHONE_VERIFICATION' ? 'phone' : 'email'}`,
    };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: dto.userId,
        code: dto.code,
        type: dto.type,
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const expiresAt = new Date(otpRecord.createdAt.getTime() + 10 * 60 * 1000);
    
    if (now > expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Update user verification status
    const updateData: any = {};
    if (dto.type === 'EMAIL_VERIFICATION') {
      updateData.isEmailVerified = true;
    } else if (dto.type === 'PHONE_VERIFICATION') {
      updateData.isPhoneVerified = true;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: updateData,
      });
    }

    // Log audit
    await this.createAuditLog(dto.userId, 'OTP_VERIFIED', {
      type: dto.type,
    });

    return {
      verified: true,
      message: 'Verification successful',
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a reset link has been sent',
      };
    }

    await this.generateAndSaveOtp(user.id, email, 'PASSWORD_RESET');

    return {
      message: 'If the email exists, a reset link has been sent',
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid request');
    }

    // Verify OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Check if OTP is expired (30 minutes for password reset)
    const now = new Date();
    const expiresAt = new Date(otpRecord.createdAt.getTime() + 30 * 60 * 1000);
    
    if (now > expiresAt) {
      throw new BadRequestException('Reset code has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    // Log audit
    await this.createAuditLog(user.id, 'PASSWORD_RESET', {
      email: user.email,
    });

    return {
      message: 'Password reset successful',
    };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
        },
        data: { isRevoked: true },
      });
    }

    // Log audit
    await this.createAuditLog(userId, 'USER_LOGOUT', {});

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // Long-lived
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Generate and save OTP
   */
  private async generateAndSaveOtp(
    userId: string,
    target: string,
    type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET',
  ) {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiration (10 minutes for verification, 30 minutes for password reset)
    const expiryMinutes = type === 'PASSWORD_RESET' ? 30 : 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save to database
    await this.prisma.otpCode.create({
      data: {
        userId,
        code,
        type,
        purpose: target, // 'email' or 'phone'
        expiresAt,
      } as any,
    });

    // TODO: Send OTP via email/SMS using notifications service
    // For now, just log it (in production, this should send actual emails/SMS)
    console.log(`[OTP] Code for ${target}: ${code}`);

    return code;
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Create audit log
   */
  private async createAuditLog(userId: string, action: string, metadata: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity: 'Auth',
          metadata,
        } as any,
      });
    } catch (error) {
      // Don't fail the request if audit logging fails
      console.error('Audit log error:', error);
    }
  }
}
