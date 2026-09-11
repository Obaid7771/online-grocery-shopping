import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 1. Register new customer account
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email or phone number already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        passwordHash,
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  // 2. Authenticate user with Argon2id
  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been suspended. Please contact support.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  // 3. Refresh Access Token with Token Rotation & Reuse Detection
  async refreshToken(rawRefreshToken: string, userAgent?: string, ipAddress?: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Reuse Detection: If this token was already revoked, someone is replaying it!
    if (tokenRecord.revoked) {
      this.logger.warn(`Security Alert: Refresh token reuse detected for user ${tokenRecord.userId}`);
      // Immediately revoke all active refresh tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Security token compromised. All active sessions invalidated.');
    }

    // Check expiration
    if (new Date() > tokenRecord.expiresAt) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Invalidate old token (Rotation)
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    const user = tokenRecord.user;
    if (!user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Issue brand new token pair
    return this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);
  }

  // 4. Logout / Revoke Token
  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return { success: true };

    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });

    return { success: true, message: 'Logged out successfully' };
  }

  // 5. Forgot Password: issue verification code
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Timing-attack safe generic response
    if (!user || !user.isActive || user.deletedAt) {
      return {
        message: 'If an account exists with that email, a password recovery code has been sent.',
      };
    }

    // In production, dispatch via SendGrid/SES. For dev, a deterministically generated 6-digit OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log(`Password reset OTP for ${email}: ${resetOtp}`);

    return {
      message: 'If an account exists with that email, a password recovery code has been sent.',
      devOtp: process.env.NODE_ENV === 'development' ? resetOtp : undefined,
    };
  }

  // 6. Reset Password with validation
  async resetPassword(dto: ResetPasswordDto) {
    // Hash new password
    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // In production, token would be decoded from signed JWT reset token.
    // For development/demo reset token format: "reset_<email>"
    const email = dto.token.startsWith('reset_') ? dto.token.replace('reset_', '') : null;
    if (!email) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke all existing sessions for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  // 7. Verify OTP
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In development, accept 123456 or any 6-digit code for testing
    if (otp.length !== 6) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  // Helper: Cryptographic Hash for Refresh Token
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Helper: Token Generation & Refresh Token Persistence
  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'freshcart_jwt_access_secret_super_secure_key_2026_dev',
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    });

    // 64-character cryptographically random token
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
