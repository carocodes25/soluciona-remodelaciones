import { 
  IsString, 
  IsOptional, 
  IsBoolean,
  IsArray,
  MaxLength 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioItemDto {
  @ApiProperty({ example: 'Remodelación de apartamento en Bogotá' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Remodelación completa de apartamento de 80m2 incluyendo cocina, baños y pisos' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
