import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateProposalDto,
  UpdateProposalDto,
  AcceptProposalDto,
  ProposalStatus,
} from './dto';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProposalDto: CreateProposalDto) {
    // Verify user is a Pro
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { pro: true },
    });

    if (!user || !user.pro) {
      throw new ForbiddenException('Only professionals can create proposals');
    }

    // Verify job exists and is open
    const job = await this.prisma.job.findFirst({
      where: {
        id: createProposalDto.jobId,
        deletedAt: null,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const jobWithStatus = job as any;
    if (jobWithStatus.status !== 'OPEN') {
      throw new BadRequestException('Job is not open for proposals');
    }

    // Check if pro already submitted a proposal
    const existingProposal = await this.prisma.proposal.findFirst({
      where: {
        jobId: createProposalDto.jobId,
        proId: user.pro.id,
        deletedAt: null,
      },
    });

    if (existingProposal) {
      throw new BadRequestException('You already submitted a proposal for this job');
    }

    // Create proposal
    const proposal = await this.prisma.proposal.create({
      data: {
        jobId: createProposalDto.jobId,
        proId: user.pro.id,
        userId,
        totalPrice: createProposalDto.totalPrice,
        estimatedDays: createProposalDto.estimatedDays,
        description: createProposalDto.description,
        scope: createProposalDto.scope,
        status: ProposalStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        job: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_PROPOSAL',
        entity: 'Proposal',
        entityId: proposal.id,
        metadata: { jobId: job.id, totalPrice: proposal.totalPrice },
      } as any,
    });

    // TODO: Send notification to job client

    return proposal;
  }

  async findByJob(jobId: string, userId?: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        deletedAt: null,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // If user is not the job owner, only show non-sensitive data
    const isJobOwner = userId === job.clientId;

    const proposals = await this.prisma.proposal.findMany({
      where: {
        jobId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
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
            skills: {
              include: {
                skill: true,
              },
              take: 5,
            },
          },
        },
      },
    });

    return proposals;
  }

  async findMyProposals(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { pro: true },
    });

    if (!user || !user.pro) {
      throw new ForbiddenException('Only professionals can view proposals');
    }

    const proposals = await this.prisma.proposal.findMany({
      where: {
        proId: user.pro.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
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
          },
        },
      },
    });

    return proposals;
  }

  async findOne(id: string, userId: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: {
        id,
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
                phone: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
            portfolioItems: {
              where: { isPublished: true },
              take: 5,
            },
          },
        },
        job: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            category: true,
            city: true,
            photos: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Verify user has access (job owner or proposal creator)
    const proposalWithJob = proposal as any;
    if (proposal.userId !== userId && proposalWithJob.job?.clientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return proposal;
  }

  async update(userId: string, id: string, updateProposalDto: UpdateProposalDto) {
    const proposal = await this.prisma.proposal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.userId !== userId) {
      throw new ForbiddenException('You can only update your own proposals');
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw new BadRequestException('Can only update pending proposals');
    }

    const updatedProposal = await this.prisma.proposal.update({
      where: { id },
      data: {
        totalPrice: updateProposalDto.totalPrice,
        estimatedDays: updateProposalDto.estimatedDays,
        description: updateProposalDto.description,
        scope: updateProposalDto.scope,
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
        job: true,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_PROPOSAL',
        entity: 'Proposal',
        entityId: id,
        metadata: { changes: Object.keys(updateProposalDto) },
      } as any,
    });

    return updatedProposal;
  }

  async accept(userId: string, id: string, acceptDto: AcceptProposalDto) {
    const proposal = await this.prisma.proposal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        job: true,
        pro: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Verify user is job owner
    if (proposal.job.clientId !== userId) {
      throw new ForbiddenException('Only job owner can accept proposals');
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw new BadRequestException('Proposal is not pending');
    }

    const jobWithStatus = proposal.job as any;
    if (jobWithStatus.status !== 'OPEN') {
      throw new BadRequestException('Job is no longer open');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Accept this proposal
      const acceptedProposal = await tx.proposal.update({
        where: { id },
        data: {
          status: ProposalStatus.ACCEPTED,
          respondedAt: new Date(),
        },
        include: {
          pro: {
            include: {
              user: true,
            },
          },
          job: {
            include: {
              client: true,
            },
          },
        },
      });

      // Reject all other proposals for this job
      await tx.proposal.updateMany({
        where: {
          jobId: proposal.jobId,
          id: { not: id },
          status: ProposalStatus.PENDING,
        },
        data: {
          status: ProposalStatus.REJECTED,
          respondedAt: new Date(),
        },
      });

      // Update job status
      await tx.job.update({
        where: { id: proposal.jobId },
        data: { status: 'IN_PROGRESS' },
      });

      // Create contract
      const contract = await tx.contract.create({
        data: {
          proposalId: id,
          clientId: proposal.job.clientId,
          proId: proposal.proId,
          totalAmount: proposal.totalPrice,
          status: 'ACTIVE',
          startDate: new Date(),
        } as any,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'ACCEPT_PROPOSAL',
          entity: 'Proposal',
          entityId: id,
          metadata: { contractId: contract.id, notes: acceptDto.notes },
        } as any,
      });

      return { proposal: acceptedProposal, contract };
    });

    // TODO: Send notifications to pro and other proposers

    return result;
  }

  async withdraw(userId: string, id: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.userId !== userId) {
      throw new ForbiddenException('You can only withdraw your own proposals');
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw new BadRequestException('Can only withdraw pending proposals');
    }

    await this.prisma.proposal.update({
      where: { id },
      data: {
        status: ProposalStatus.WITHDRAWN,
        respondedAt: new Date(),
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'WITHDRAW_PROPOSAL',
        entity: 'Proposal',
        entityId: id,
        metadata: {},
      } as any,
    });

    return { message: 'Proposal withdrawn successfully' };
  }

  async remove(userId: string, id: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.userId !== userId) {
      throw new ForbiddenException('You can only delete your own proposals');
    }

    if (proposal.status === ProposalStatus.ACCEPTED) {
      throw new BadRequestException('Cannot delete accepted proposals');
    }

    // Soft delete
    await this.prisma.proposal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Proposal deleted successfully' };
  }
}
