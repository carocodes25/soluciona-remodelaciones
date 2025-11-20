import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProProfileDto } from './dto/update-pro-profile.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { AddServiceAreaDto } from './dto/add-service-area.dto';

@Injectable()
export class ProsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get pro profile by user ID
   */
  async findByUserId(userId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
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
        portfolioItems: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
        },
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    return pro;
  }

  /**
   * Get pro by ID
   */
  async findOne(proId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { id: proId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
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
        portfolioItems: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
        },
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!pro) {
      throw new NotFoundException('Pro not found');
    }

    return pro;
  }

  /**
   * Find pros with filters
   */
  async findAll(filters: {
    categoryId?: string;
    cityId?: string;
    verificationLevel?: string;
    isAvailable?: boolean;
    minRating?: number;
    skip?: number;
    take?: number;
  }) {
    const {
      categoryId,
      cityId,
      verificationLevel,
      isAvailable,
      minRating,
      skip = 0,
      take = 20,
    } = filters;

    const where: any = {};

    if (categoryId) {
      where.skills = {
        some: {
          skill: {
            categoryId,
          },
        },
      };
    }

    if (cityId) {
      where.serviceAreas = {
        some: {
          cityId,
        },
      };
    }

    if (verificationLevel) {
      where.verificationLevel = verificationLevel;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    if (minRating) {
      where.averageRating = {
        gte: minRating,
      };
    }

    const [pros, total] = await Promise.all([
      this.prisma.pro.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
            take: 5,
          },
          serviceAreas: {
            include: {
              city: true,
            },
            take: 3,
          },
        },
        skip,
        take,
        orderBy: [
          { verificationLevel: 'desc' },
          { averageRating: 'desc' },
          { totalReviews: 'desc' },
        ],
      }),
      this.prisma.pro.count({ where }),
    ]);

    return {
      data: pros,
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Update pro profile
   */
  async updateProfile(userId: string, dto: UpdateProProfileDto) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    const updated = await this.prisma.pro.update({
      where: { userId },
      data: dto,
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        serviceAreas: {
          include: {
            city: true,
          },
        },
      },
    });

    // Log audit
    await this.createAuditLog(userId, 'PRO_PROFILE_UPDATED', {
      fields: Object.keys(dto),
    });

    return updated;
  }

  /**
   * Add skill to pro
   */
  async addSkill(userId: string, dto: AddSkillDto) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    // Check if skill exists
    const skill = await this.prisma.skill.findUnique({
      where: { id: dto.skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Check if already added
    const existing = await this.prisma.proSkill.findUnique({
      where: {
        proId_skillId: {
          proId: pro.id,
          skillId: dto.skillId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Skill already added');
    }

    const proSkill = await this.prisma.proSkill.create({
      data: {
        proId: pro.id,
        skillId: dto.skillId,
      },
      include: {
        skill: {
          include: {
            category: true,
          },
        },
      },
    });

    return proSkill;
  }

  /**
   * Remove skill from pro
   */
  async removeSkill(userId: string, skillId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    await this.prisma.proSkill.delete({
      where: {
        proId_skillId: {
          proId: pro.id,
          skillId,
        },
      },
    });

    return { message: 'Skill removed successfully' };
  }

  /**
   * Add service area
   */
  async addServiceArea(userId: string, dto: AddServiceAreaDto) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    // Check if city exists
    const city = await this.prisma.city.findUnique({
      where: { id: dto.cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    // Check if already added
    const existing = await this.prisma.proServiceArea.findUnique({
      where: {
        proId_cityId: {
          proId: pro.id,
          cityId: dto.cityId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Service area already added');
    }

    const serviceArea = await this.prisma.proServiceArea.create({
      data: {
        proId: pro.id,
        cityId: dto.cityId,
      },
      include: {
        city: true,
      },
    });

    return serviceArea;
  }

  /**
   * Remove service area
   */
  async removeServiceArea(userId: string, cityId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    await this.prisma.proServiceArea.delete({
      where: {
        proId_cityId: {
          proId: pro.id,
          cityId,
        },
      },
    });

    return { message: 'Service area removed successfully' };
  }

  /**
   * Create portfolio item
   */
  async createPortfolioItem(userId: string, dto: CreatePortfolioItemDto) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    const portfolioItem = await this.prisma.portfolioItem.create({
      data: {
        proId: pro.id,
        title: dto.title,
        description: dto.description,
        category: '', // TODO: Get from pro's main category
        photos: dto.photos || [],
        videoUrl: dto.videoUrl,
        isPublished: dto.isPublished ?? true,
      } as any,
    });

    return portfolioItem;
  }

  /**
   * Update portfolio item
   */
  async updatePortfolioItem(
    userId: string,
    itemId: string,
    dto: UpdatePortfolioItemDto,
  ) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (item.proId !== pro.id) {
      throw new ForbiddenException('You do not own this portfolio item');
    }

    const updated = await this.prisma.portfolioItem.update({
      where: { id: itemId },
      data: dto,
    });

    return updated;
  }

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(userId: string, itemId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    if (item.proId !== pro.id) {
      throw new ForbiddenException('You do not own this portfolio item');
    }

    await this.prisma.portfolioItem.delete({
      where: { id: itemId },
    });

    return { message: 'Portfolio item deleted successfully' };
  }

  /**
   * Toggle availability
   */
  async toggleAvailability(userId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    const updated = await this.prisma.pro.update({
      where: { userId },
      data: {
        isAvailable: !pro.isAvailable,
      },
    });

    return {
      isAvailable: updated.isAvailable,
      message: `Availability ${updated.isAvailable ? 'enabled' : 'disabled'}`,
    };
  }

  /**
   * Get pro statistics
   */
  async getStatistics(userId: string) {
    const pro = await this.prisma.pro.findUnique({
      where: { userId },
    });

    if (!pro) {
      throw new NotFoundException('Pro profile not found');
    }

    const [activeProposals, activeContracts, completedJobs, totalEarnings] =
      await Promise.all([
        this.prisma.proposal.count({
          where: {
            proId: pro.id,
            status: { in: ['PENDING', 'ACCEPTED'] },
          },
        }),
        this.prisma.contract.count({
          where: {
            proId: pro.id,
            status: 'ACTIVE',
          },
        }),
        this.prisma.contract.count({
          where: {
            proId: pro.id,
            status: 'COMPLETED',
          },
        }),
        // TODO: Fix payment aggregate query when Payment model is properly related
        Promise.resolve({ _sum: { amount: 0 } }),
        // this.prisma.payment.aggregate({
        //   where: {
        //     contract: {
        //       proId: pro.id,
        //     },
        //     status: 'COMPLETED' as any,
        //   },
        //   _sum: {
        //     amount: true,
        //   },
        // }),
      ]);

    return {
      activeProposals,
      activeContracts,
      completedJobs,
      totalEarnings: totalEarnings._sum.amount || 0,
      averageRating: pro.averageRating,
      totalReviews: pro.totalReviews,
      verificationLevel: pro.verificationLevel,
      responseTimeHours: pro.responseTimeHours,
    };
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
          entity: 'Pro',
          metadata,
        } as any,
      });
    } catch (error) {
      console.error('Audit log creation failed:', error);
    }
  }
}
