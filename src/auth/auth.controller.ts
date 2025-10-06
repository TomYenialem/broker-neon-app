import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { JwtPayload } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetTokenDto } from './dto/verify-reset-token.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user (USER role only)',
    description:
      'Create a new user account with email and password. Role is automatically set to USER. To create ADMIN users, use /auth/register-admin endpoint.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered with USER role',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'joao.silva@example.com',
          firstName: 'João',
          lastName: 'Silva',
          phone: '+244 923 456 789',
          role: 'USER',
          createdAt: '2025-10-04T20:00:00.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register ADMIN user (ADMIN only)',
    description:
      'Create a new user with ADMIN or USER role. This endpoint requires ADMIN authentication.',
  })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Admin user successfully registered',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'admin@broker.com',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+244 923 456 789',
          role: 'ADMIN',
          createdAt: '2025-10-04T20:00:00.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Must be an ADMIN',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    return this.authService.registerAdmin(
      registerAdminDto,
      registerAdminDto.role,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user and return JWT tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'joao.silva@example.com',
          firstName: 'João',
          lastName: 'Silva',
          phone: '+244 923 456 789',
          role: 'USER',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 900,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve the authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        email: 'joao.silva@example.com',
        firstName: 'João',
        lastName: 'Silva',
        phone: '+244 923 456 789',
        role: 'USER',
        image: null,
        emailVerified: false,
        createdAt: '2025-10-04T20:00:00.000Z',
        updatedAt: '2025-10-04T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Send a password reset token to the user email. Token expires in 1 hour.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (or message for security)',
    schema: {
      example: {
        message: 'If the email exists, a password reset link has been sent',
        devToken: 'a1b2c3d4e5f6g7h8i9j0...',
        devNote: 'This token is only shown in development mode',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify password reset token',
    description: 'Check if a password reset token is valid and not expired',
  })
  @ApiBody({ type: VerifyResetTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      example: {
        valid: true,
        email: 'user@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  async verifyResetToken(@Body() verifyResetTokenDto: VerifyResetTokenDto) {
    return this.authService.verifyResetToken(verifyResetTokenDto.token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using the reset token received via email',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users (ADMIN only)',
    description:
      'Retrieve all users with filtering, search, and pagination. Only accessible by administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        users: [
          {
            id: 'uuid-1',
            email: 'user1@example.com',
            firstName: 'João',
            lastName: 'Silva',
            phone: '+244 923 456 789',
            role: 'USER',
            image: null,
            emailVerified: true,
            createdAt: '2025-10-04T20:00:00.000Z',
            updatedAt: '2025-10-04T20:00:00.000Z',
            _count: {
              listings: 5,
            },
          },
          {
            id: 'uuid-2',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            phone: '+244 912 345 678',
            role: 'ADMIN',
            image: null,
            emailVerified: true,
            createdAt: '2025-10-03T15:00:00.000Z',
            updatedAt: '2025-10-03T15:00:00.000Z',
            _count: {
              listings: 0,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ADMIN role',
  })
  async getAllUsers(@Query() filters: UserFilterDto) {
    return this.authService.getAllUsers(filters);
  }
}
