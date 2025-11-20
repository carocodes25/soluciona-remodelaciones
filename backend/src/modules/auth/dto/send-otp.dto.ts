import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({ 
    enum: ['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET'],
    example: 'EMAIL_VERIFICATION' 
  })
  @IsEnum(['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET'], {
    message: 'Type must be EMAIL_VERIFICATION, PHONE_VERIFICATION, or PASSWORD_RESET'
  })
  type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET';
}
