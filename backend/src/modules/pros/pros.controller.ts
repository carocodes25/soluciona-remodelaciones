import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ProsService } from './pros.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('pros')
export class ProsController {
  constructor(private readonly prosService: ProsService) {}

  /**
   * Search professionals with filters
   * GET /api/pros/search
   */
  @Get('search')
  async search(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('cityId') cityId?: string,
    @Query('minRating') minRating?: string,
    @Query('maxHourlyRate') maxHourlyRate?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 12;
    const skip = (pageNum - 1) * limitNum;

    const filters: any = {
      skip,
      take: limitNum,
    };

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    if (cityId) {
      filters.cityId = cityId;
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        throw new BadRequestException('Invalid minRating value');
      }
      filters.minRating = rating;
    }

    if (isAvailable) {
      filters.isAvailable = isAvailable === 'true';
    }

    const result = await this.prosService.findAll(filters);

    return {
      data: result.data.map(pro => ({
        id: pro.id,
        firstName: pro.user.firstName,
        lastName: pro.user.lastName,
        avatar: pro.user.avatarUrl,
        bio: pro.bio,
        hourlyRate: 50000, // TODO: Add hourlyRate field to Pro model
        rating: pro.averageRating,
        totalReviews: pro.totalReviews,
        completedJobs: pro.completedJobs,
        responseTime: pro.responseTimeHours ? `${pro.responseTimeHours}h` : undefined,
        verificationStatus: pro.verificationLevel,
        isAvailable: pro.isAvailable,
        city: pro.serviceAreas[0]?.city ? {
          id: pro.serviceAreas[0].city.id,
          name: pro.serviceAreas[0].city.name,
        } : undefined,
        skills: pro.skills.map(ps => ({
          id: ps.skill.id,
          name: ps.skill.name,
        })),
      })),
      total: result.pagination.total,
      page: result.pagination.page,
      limit: limitNum,
      totalPages: result.pagination.totalPages,
    };
  }

  /**
   * Get featured professionals
   * GET /api/pros/featured
   */
  @Get('featured')
  async getFeatured(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 6;
    
    const result = await this.prosService.findAll({
      skip: 0,
      take: limitNum,
      minRating: 4,
      isAvailable: true,
    });

    return result.data.map(pro => ({
      id: pro.id,
      firstName: pro.user.firstName,
      lastName: pro.user.lastName,
      avatar: pro.user.avatarUrl,
      bio: pro.bio,
      hourlyRate: 50000, // TODO: Add hourlyRate field to Pro model
      rating: pro.averageRating,
      totalReviews: pro.totalReviews,
      completedJobs: pro.completedJobs,
      verificationStatus: pro.verificationLevel,
      isAvailable: pro.isAvailable,
      city: pro.serviceAreas[0]?.city ? {
        id: pro.serviceAreas[0].city.id,
        name: pro.serviceAreas[0].city.name,
      } : undefined,
      skills: pro.skills.map(ps => ({
        id: ps.skill.id,
        name: ps.skill.name,
      })),
    }));
  }

  /**
   * Get professional by ID
   * GET /api/pros/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const pro = await this.prosService.findOne(id);

    return {
      id: pro.id,
      firstName: pro.user.firstName,
      lastName: pro.user.lastName,
      email: pro.user.email,
      phone: pro.user.phone,
      avatar: pro.user.avatarUrl,
      bio: pro.bio,
      hourlyRate: 50000, // TODO: Add hourlyRate field to Pro model
      rating: pro.averageRating,
      totalReviews: pro.totalReviews,
      completedJobs: pro.completedJobs,
      responseTime: pro.responseTimeHours ? `${pro.responseTimeHours}h` : undefined,
      verificationStatus: pro.verificationLevel,
      isAvailable: pro.isAvailable,
      city: pro.serviceAreas[0]?.city ? {
        id: pro.serviceAreas[0].city.id,
        name: pro.serviceAreas[0].city.name,
      } : undefined,
      skills: pro.skills.map(ps => ({
        id: ps.skill.id,
        name: ps.skill.name,
        category: {
          id: ps.skill.category.id,
          name: ps.skill.category.name,
        },
      })),
      portfolio: pro.portfolioItems.map(item => ({
        id: item.id,
        imageUrl: item.photos?.[0] || '',
        description: item.description,
      })),
      createdAt: pro.createdAt,
      updatedAt: pro.updatedAt,
    };
  }

  /**
   * Get professional's reviews
   * GET /api/pros/:id/reviews
   */
  @Get(':id/reviews')
  async getReviews(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // TODO: Implement when reviews module is ready
    return {
      data: [],
      total: 0,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '10'),
      totalPages: 0,
    };
  }

  /**
   * Get professional's portfolio
   * GET /api/pros/:id/portfolio
   */
  @Get(':id/portfolio')
  async getPortfolio(@Param('id') id: string) {
    const pro = await this.prosService.findOne(id);
    
    return pro.portfolioItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      photos: item.photos || [],
      videoUrl: item.videoUrl,
      createdAt: item.createdAt,
    }));
  }

  /**
   * Get professionals by category
   * GET /api/pros/category/:categoryId
   */
  @Get('category/:categoryId')
  async getByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 12;
    const skip = (pageNum - 1) * limitNum;

    const result = await this.prosService.findAll({
      categoryId,
      skip,
      take: limitNum,
    });

    return {
      data: result.data.map(pro => ({
        id: pro.id,
        firstName: pro.user.firstName,
        lastName: pro.user.lastName,
        avatar: pro.user.avatarUrl,
        bio: pro.bio,
        hourlyRate: 50000, // TODO: Add hourlyRate field to Pro model
        rating: pro.averageRating,
        totalReviews: pro.totalReviews,
        completedJobs: pro.completedJobs,
        verificationStatus: pro.verificationLevel,
        isAvailable: pro.isAvailable,
        city: pro.serviceAreas[0]?.city ? {
          id: pro.serviceAreas[0].city.id,
          name: pro.serviceAreas[0].city.name,
        } : undefined,
        skills: pro.skills.map(ps => ({
          id: ps.skill.id,
          name: ps.skill.name,
        })),
      })),
      total: result.pagination.total,
      page: result.pagination.page,
      limit: limitNum,
      totalPages: result.pagination.totalPages,
    };
  }
}
