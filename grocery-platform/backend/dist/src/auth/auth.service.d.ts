import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            isEmailVerified: boolean;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: true;
            isEmailVerified: boolean;
        };
    }>;
    refreshToken(rawRefreshToken: string, userAgent?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    logout(rawRefreshToken: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        devOtp?: undefined;
    } | {
        message: string;
        devOtp: string | undefined;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        message: string;
    }>;
    private hashToken;
    private generateTokens;
}
