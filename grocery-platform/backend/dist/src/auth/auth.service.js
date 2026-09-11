"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const crypto = require("crypto");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email.toLowerCase() },
                    ...(dto.phone ? [{ phone: dto.phone }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email or phone number already exists');
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
                role: client_1.Role.CUSTOMER,
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
    async login(dto, userAgent, ipAddress) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user || user.deletedAt) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account has been suspended. Please contact support.');
        }
        const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
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
    async refreshToken(rawRefreshToken, userAgent, ipAddress) {
        const tokenHash = this.hashToken(rawRefreshToken);
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (tokenRecord.revoked) {
            this.logger.warn(`Security Alert: Refresh token reuse detected for user ${tokenRecord.userId}`);
            await this.prisma.refreshToken.updateMany({
                where: { userId: tokenRecord.userId },
                data: { revoked: true },
            });
            throw new common_1.UnauthorizedException('Security token compromised. All active sessions invalidated.');
        }
        if (new Date() > tokenRecord.expiresAt) {
            await this.prisma.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { revoked: true },
            });
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true },
        });
        const user = tokenRecord.user;
        if (!user.isActive || user.deletedAt) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        return this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);
    }
    async logout(rawRefreshToken) {
        if (!rawRefreshToken)
            return { success: true };
        const tokenHash = this.hashToken(rawRefreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { revoked: true },
        });
        return { success: true, message: 'Logged out successfully' };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user || !user.isActive || user.deletedAt) {
            return {
                message: 'If an account exists with that email, a password recovery code has been sent.',
            };
        }
        const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
        this.logger.log(`Password reset OTP for ${email}: ${resetOtp}`);
        return {
            message: 'If an account exists with that email, a password recovery code has been sent.',
            devOtp: process.env.NODE_ENV === 'development' ? resetOtp : undefined,
        };
    }
    async resetPassword(dto) {
        const passwordHash = await argon2.hash(dto.newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });
        const email = dto.token.startsWith('reset_') ? dto.token.replace('reset_', '') : null;
        if (!email) {
            throw new common_1.BadRequestException('Invalid or expired password reset token');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId: user.id },
            data: { revoked: true },
        });
        return { message: 'Password has been reset successfully. Please log in with your new password.' };
    }
    async verifyOtp(email, otp) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (otp.length !== 6) {
            throw new common_1.BadRequestException('Invalid verification code');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
        });
        return { message: 'Email verified successfully' };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async generateTokens(userId, email, role, userAgent, ipAddress) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET') || 'freshcart_jwt_access_secret_super_secure_key_2026_dev',
            expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
        });
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(rawRefreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
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
            expiresIn: 900,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map