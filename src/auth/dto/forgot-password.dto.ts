import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address of the account to reset',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  email: string;
}
