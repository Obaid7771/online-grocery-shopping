import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_token'),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test_secret',
        JWT_REFRESH_SECRET: 'test_refresh_secret',
        JWT_ACCESS_EXPIRY: '15m',
        JWT_REFRESH_EXPIRY: '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: Role.CUSTOMER,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-uuid',
      email: loginDto.email,
      passwordHash: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CUSTOMER,
      isActive: true,
      isEmailVerified: true,
      deletedAt: null,
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto, {
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(loginDto, { userAgent: 'test', ipAddress: '127.0.0.1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(loginDto, { userAgent: 'test', ipAddress: '127.0.0.1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login(loginDto, { userAgent: 'test', ipAddress: '127.0.0.1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login(loginDto, { userAgent: 'test', ipAddress: '127.0.0.1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should generate new token pair with valid refresh token', async () => {
      const mockRefreshToken = {
        id: 'token-uuid',
        userId: 'user-uuid',
        tokenHash: 'hashed_token',
        expiresAt: new Date(Date.now() + 86400000),
        revoked: false,
        user: {
          id: 'user-uuid',
          email: 'test@example.com',
          role: Role.CUSTOMER,
          isActive: true,
          deletedAt: null,
        },
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.refreshTokens('valid_refresh_token', {
        userAgent: 'test',
        ipAddress: '127.0.0.1',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);

      await expect(
        service.refreshTokens('invalid_token', {
          userAgent: 'test',
          ipAddress: '127.0.0.1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for user', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      await service.logout('user-uuid');

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid', revoked: false },
        data: { revoked: true },
      });
    });
  });
});
