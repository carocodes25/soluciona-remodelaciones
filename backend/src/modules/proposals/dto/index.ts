import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export enum ProposalStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
}

export class CreateProposalDto {
  @ApiProperty({ example: 'clh5k9m7v0001l308job12345' })
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ example: 5500000, description: 'Total price in COP' })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ example: 15, description: 'Estimated days to complete' })
  @IsNumber()
  @Min(1)
  estimatedDays: number;

  @ApiProperty({
    example: 'Puedo realizar el trabajo con materiales de alta calidad...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    example: 'Incluye: demolición, instalación, acabados...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  scope?: string;
}

export class UpdateProposalDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedDays?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  scope?: string;

  @ApiPropertyOptional({ enum: ProposalStatus })
  @IsEnum(ProposalStatus)
  @IsOptional()
  status?: ProposalStatus;
}

export class AcceptProposalDto {
  @ApiPropertyOptional({
    example: 'Acepto esta propuesta porque...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
