import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetTokenDto {
  @ApiProperty({
    description: 'Password reset token to verify',
    example: 'a1b2c3d4e5f6g7h8i9j0',
    type: String,
  })
  @IsString()
  token: string;
}
