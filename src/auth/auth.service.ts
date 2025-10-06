import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserFilterDto } from './dto/user-filter.dto';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with USER role (public registration always creates USER)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
        phone: dto.phone,
        role: 'USER', // Force USER role for public registration
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async registerAdmin(dto: RegisterDto, role: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with specified role (ADMIN or USER)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
        phone: dto.phone,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Generate new tokens
      const tokens = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Delete any existing reset tokens for this email
    await this.prisma.verification.deleteMany({
      where: { identifier: dto.email },
    });

    // Store hashed token in database
    await this.prisma.verification.create({
      data: {
        identifier: dto.email,
        value: hashedToken,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    // For development: Log the token (REMOVE IN PRODUCTION!)
    if (this.config.get('NODE_ENV') === 'development') {
      console.log('\n🔑 Password Reset Token (DEV ONLY):');
      console.log('Email:', dto.email);
      console.log('Token:', resetToken);
      console.log(
        'Reset URL:',
        `http://localhost:3000/reset-password?token=${resetToken}`,
      );
      console.log('Expires:', expiresAt.toISOString());
      console.log('\n');
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
      // In development, return token for testing
      ...(this.config.get('NODE_ENV') === 'development' && {
        devToken: resetToken,
        devNote: 'This token is only shown in development mode',
      }),
    };
  }

  async verifyResetToken(token: string) {
    // Find all verification records (we need to check hashed values)
    const verifications = await this.prisma.verification.findMany({
      where: {
        expiresAt: {
          gte: new Date(), // Not expired
        },
      },
    });

    // Check each hashed token
    for (const verification of verifications) {
      const isValid = await bcrypt.compare(token, verification.value);

      if (isValid) {
        return {
          valid: true,
          email: verification.identifier,
        };
      }
    }

    throw new BadRequestException('Invalid or expired reset token');
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Verify token and get email
    const { email } = await this.verifyResetToken(dto.token);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Delete used reset token
    await this.prisma.verification.deleteMany({
      where: { identifier: email },
    });

    // Optionally: Invalidate all existing sessions/tokens for this user
    // (Requires token blacklist or session management)

    return {
      message: 'Password reset successfully',
    };
  }

  async getAllUsers(filters: UserFilterDto) {
    const { page = 1, limit = 10, role, search, sort = 'newest' } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Search by name, email, or phone
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };

    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'name_asc') {
      orderBy = [{ firstName: 'asc' }, { lastName: 'asc' }];
    } else if (sort === 'name_desc') {
      orderBy = [{ firstName: 'desc' }, { lastName: 'desc' }];
    }

    // Query database
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              listings: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Access token (15 minutes)
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
      }),
      // Refresh token (7 days)
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
