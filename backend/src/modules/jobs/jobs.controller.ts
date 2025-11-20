import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateJobDto, UpdateJobDto, SearchJobsDto, JobStatus } from './dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create job posting',
    description: 'Clients create a new job posting with details, budget, and location',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job created successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only clients can create jobs',
  })
  async create(@CurrentUser() user: any, @Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(user.userId, createJobDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Search jobs',
    description: 'Public endpoint to search available jobs with filters',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jobs retrieved successfully',
  })
  async findAll(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.findAll(searchDto);
  }

  @Get('my-jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my jobs',
    description: 'Get all jobs created by the authenticated client',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jobs retrieved successfully',
  })
  async getMyJobs(
    @CurrentUser() user: any,
    @Query('status') status?: JobStatus,
  ) {
    return this.jobsService.findMyJobs(user.sub, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get job by ID',
    description: 'Get detailed information about a specific job',
  })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update job',
    description: 'Update job details (only by job owner)',
  })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only update your own jobs',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot edit job in progress or completed',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(user.sub, id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete job',
    description: 'Soft delete a job (only by job owner)',
  })
  @ApiParam({ name: 'id', description: 'Job ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only delete your own jobs',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete job in progress',
  })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.jobsService.remove(user.sub, id);
  }
}
