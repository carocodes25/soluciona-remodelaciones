import { 
  IsString, 
  IsOptional, 
  IsInt, 
  IsBoolean,
  Min, 
  Max, 
  MaxLength 
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProProfileDto {
  @ApiPropertyOptional({ example: 'Construcciones Pérez SAS' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Especialistas en remodelación con 10 años de experiencia en Bogotá' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsExperience?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  teamSize?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  responseTimeHours?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(200)
  serviceRadiusKm?: number;
}
