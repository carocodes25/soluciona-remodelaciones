import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user profile by ID
   */
  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        pro: {
          include: {
            skills: {
              include: {
                skill: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            serviceAreas: {
              include: {
                city: true,
              },
            },
            verifications: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
            portfolioItems: {
              where: {
                isPublished: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get multiple users with filters
   */
  async findMany(filters: {
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { role, isActive, skip = 0, take = 20 } = filters;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(user => this.sanitizeUser(user)),
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Update user profile
   */
  async update(userId: string, dto: UpdateUserDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check if phone is being changed and if it's already taken
    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        // Reset verification if email/phone changed
        ...(dto.email && dto.email !== user.email && { isEmailVerified: false }),
        ...(dto.phone && dto.phone !== user.phone && { isPhoneVerified: false }),
      },
      include: {
        pro: true,
      },
    });

    // Log audit
    await this.createAuditLog(userId, 'USER_PROFILE_UPDATED', {
      fields: Object.keys(dto),
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Log audit
    await this.createAuditLog(userId, 'PASSWORD_CHANGED', {});

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Update avatar
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    // Log audit
    await this.createAuditLog(userId, 'AVATAR_UPDATED', {});

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Deactivate user account
   */
  async deactivate(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Log audit
    await this.createAuditLog(userId, 'ACCOUNT_DEACTIVATED', {});

    return {
      message: 'Account deactivated successfully',
    };
  }

  /**
   * Reactivate user account
   */
  async reactivate(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    // Log audit
    await this.createAuditLog(userId, 'ACCOUNT_REACTIVATED', {});

    return {
      message: 'Account reactivated successfully',
    };
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async remove(userId: string) {
    // For now, we just deactivate. In production, you might want hard delete with data anonymization
    return this.deactivate(userId);
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any) {
    if (!user) return null;
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
          entity: 'User',
          metadata,
        } as any,
      });
    } catch (error) {
      // Don't fail the request if audit logging fails
      console.error('Audit log creation failed:', error);
    }
  }
}
