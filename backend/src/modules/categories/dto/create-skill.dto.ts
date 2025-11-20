import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'Pintura de interiores' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Aplicación de pintura en paredes y techos interiores' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
