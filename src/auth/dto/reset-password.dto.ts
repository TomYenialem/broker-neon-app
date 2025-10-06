import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token (received via email)',
    example: 'a1b2c3d4e5f6g7h8i9j0',
    type: String,
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewSecurePassword123!',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
