import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsUUID,
} from 'class-validator';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum JobUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateJobDto {
  @ApiProperty({ example: 'Renovación de cocina' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Necesito renovar la cocina completa, cambiar mesones, instalar nuevos gabinetes...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'clh5k9m7v0001l308abc12345' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ type: [String], example: ['skill-uuid-1', 'skill-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  skillIds?: string[];

  @ApiProperty({ example: 5000000, description: 'Budget in COP' })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiProperty({ enum: JobUrgency, example: JobUrgency.MEDIUM })
  @IsEnum(JobUrgency)
  urgency: JobUrgency;

  @ApiProperty({ example: 'clh5k9m7v0001l308city123' })
  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @ApiProperty({ example: 'Calle 123 #45-67, Apartamento 301' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string;

  @ApiPropertyOptional({ example: 4.678123 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.053459 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ type: [String], example: ['photo-uuid-1', 'photo-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  photoIds?: string[];

  @ApiPropertyOptional({ example: 'video-uuid-1' })
  @IsUUID()
  @IsOptional()
  videoId?: string;
}

export class UpdateJobDto {
  @ApiPropertyOptional({ example: 'Renovación de cocina - Actualizado' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 6000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ enum: JobUrgency })
  @IsEnum(JobUrgency)
  @IsOptional()
  urgency?: JobUrgency;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  photoIds?: string[];

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  videoId?: string;
}

export class SearchJobsDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  skillIds?: string[];

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional({ enum: JobUrgency })
  @IsEnum(JobUrgency)
  @IsOptional()
  urgency?: JobUrgency;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ example: 1000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minBudget?: number;

  @ApiPropertyOptional({ example: 10000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxBudget?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
