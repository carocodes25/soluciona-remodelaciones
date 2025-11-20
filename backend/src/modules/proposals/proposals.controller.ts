import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateProposalDto,
  UpdateProposalDto,
  AcceptProposalDto,
} from './dto';

@ApiTags('Proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create proposal',
    description: 'Professionals submit a proposal for a job',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Proposal created successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only professionals can create proposals',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Job is not open or you already submitted a proposal',
  })
  async create(
    @CurrentUser() user: any,
    @Body() createProposalDto: CreateProposalDto,
  ) {
    return this.proposalsService.create(user.sub, createProposalDto);
  }

  @Get('my-proposals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my proposals',
    description: 'Get all proposals submitted by the authenticated pro',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proposals retrieved successfully',
  })
  async getMyProposals(@CurrentUser() user: any) {
    return this.proposalsService.findMyProposals(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get proposal by ID',
    description: 'Get detailed information about a specific proposal',
  })
  @ApiParam({ name: 'id', description: 'Proposal ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proposal retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Proposal not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.proposalsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update proposal',
    description: 'Update proposal details (only by proposal creator)',
  })
  @ApiParam({ name: 'id', description: 'Proposal ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proposal updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only update your own proposals',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Can only update pending proposals',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(user.sub, id, updateProposalDto);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept proposal',
    description: 'Client accepts a proposal, creates contract, and rejects others',
  })
  @ApiParam({ name: 'id', description: 'Proposal ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proposal accepted and contract created successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only job owner can accept proposals',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Proposal is not pending or job is no longer open',
  })
  async accept(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() acceptDto: AcceptProposalDto,
  ) {
    return this.proposalsService.accept(user.sub, id, acceptDto);
  }

  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Withdraw proposal',
    description: 'Pro withdraws their own pending proposal',
  })
  @ApiParam({ name: 'id', description: 'Proposal ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proposal withdrawn successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only withdraw your own proposals',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Can only withdraw pending proposals',
  })
  async withdraw(@CurrentUser() user: any, @Param('id') id: string) {
    return this.proposalsService.withdraw(user.sub, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete proposal',
    description: 'Soft delete a proposal (only by proposal creator)',
  })
  @ApiParam({ name: 'id', description: 'Proposal ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proposal deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only delete your own proposals',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete accepted proposals',
  })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.proposalsService.remove(user.sub, id);
  }
}
