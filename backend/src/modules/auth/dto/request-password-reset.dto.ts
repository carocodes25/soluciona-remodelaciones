import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'juan.perez@gmail.com' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;
}
