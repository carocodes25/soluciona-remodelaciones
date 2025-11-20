import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, SearchJobsDto, JobStatus } from './dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createJobDto: CreateJobDto) {
    // Verify user exists and is a client
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'CLIENT') {
      throw new ForbiddenException('Only clients can create jobs');
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createJobDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify city exists
    const city = await this.prisma.city.findUnique({
      where: { id: createJobDto.cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    // Verify skills if provided
    if (createJobDto.skillIds && createJobDto.skillIds.length > 0) {
      const skills = await this.prisma.skill.findMany({
        where: { id: { in: createJobDto.skillIds } },
      });

      if (skills.length !== createJobDto.skillIds.length) {
        throw new BadRequestException('One or more skills not found');
      }
    }

    // Create job
    const job = await this.prisma.job.create({
      data: {
        title: createJobDto.title,
        description: createJobDto.description,
        budget: createJobDto.budget,
        urgency: createJobDto.urgency,
        status: JobStatus.PUBLISHED,
        address: createJobDto.address,
        latitude: createJobDto.latitude,
        longitude: createJobDto.longitude,
        clientId: userId,
        categoryId: createJobDto.categoryId,
        cityId: createJobDto.cityId,
        skills: createJobDto.skillIds
          ? {
              connect: createJobDto.skillIds.map((id) => ({ id })),
            }
          : undefined,
        photos: createJobDto.photoIds
          ? {
              connect: createJobDto.photoIds.map((id) => ({ id })),
            }
          : undefined,
        video: createJobDto.videoId
          ? {
              connect: { id: createJobDto.videoId },
            }
          : undefined,
      } as any,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        city: true,
        skills: true,
        photos: true,
        video: true,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_JOB',
        entity: 'Job',
        entityId: job.id,
        metadata: { jobTitle: job.title },
      } as any,
    });

    return job;
  }

  async findAll(searchDto: SearchJobsDto) {
    const { page = 1, limit = 20, status = JobStatus.PUBLISHED, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    const where: any = {
      status,
      deletedAt: null,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.cityId) {
      where.cityId = filters.cityId;
    }

    if (filters.urgency) {
      where.urgency = filters.urgency;
    }

    if (filters.minBudget || filters.maxBudget) {
      where.budget = {};
      if (filters.minBudget) {
        where.budget.gte = filters.minBudget;
      }
      if (filters.maxBudget) {
        where.budget.lte = filters.maxBudget;
      }
    }

    if (filters.skillIds && filters.skillIds.length > 0) {
      where.skills = {
        some: {
          id: { in: filters.skillIds },
        },
      };
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { urgency: 'desc' }, // URGENT first
          { createdAt: 'desc' },
        ],
        include: {
          client: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
          city: true,
          skills: true,
          photos: true,
          _count: {
            select: {
              proposals: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        category: true,
        city: true,
        skills: true,
        photos: true,
        video: true,
        proposals: {
          where: {
            deletedAt: null,
          },
          include: {
            pro: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async findMyJobs(userId: string, status?: JobStatus) {
    const where: any = {
      clientId: userId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const jobs = await this.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        city: true,
        skills: true,
        photos: true,
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    return jobs;
  }

  async update(userId: string, id: string, updateJobDto: UpdateJobDto) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.clientId !== userId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    // Don't allow editing if job is in progress or completed
    if (job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot edit job in progress or completed');
    }

    const updateData: any = {
      title: updateJobDto.title,
      description: updateJobDto.description,
      budget: updateJobDto.budget,
      urgency: updateJobDto.urgency,
      status: updateJobDto.status,
      address: updateJobDto.address,
      latitude: updateJobDto.latitude,
      longitude: updateJobDto.longitude,
    };

    // Handle photos and video updates
    if (updateJobDto.photoIds) {
      updateData.photos = {
        set: updateJobDto.photoIds.map((id) => ({ id })),
      };
    }

    if (updateJobDto.videoId) {
      updateData.video = {
        connect: { id: updateJobDto.videoId },
      };
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        city: true,
        skills: true,
        photos: true,
        video: true,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_JOB',
        entity: 'Job',
        entityId: id,
        metadata: { changes: Object.keys(updateJobDto) },
      } as any,
    });

    return updatedJob;
  }

  async remove(userId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.clientId !== userId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    // Don't allow deletion if job is in progress
    if (job.status === JobStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete job in progress');
    }

    // Soft delete
    await this.prisma.job.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: JobStatus.CANCELLED,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE_JOB',
        entity: 'Job',
        entityId: id,
        metadata: { jobTitle: job.title },
      } as any,
    });

    return { message: 'Job deleted successfully' };
  }
}
