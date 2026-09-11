import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CouponsService } from '../../src/coupons/coupons.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { DiscountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('CouponsService', () => {
  let service: CouponsService;
  let prismaService: PrismaService;

  const mockCoupon = {
    id: 'coupon-uuid',
    code: 'SUMMER25',
    description: '25% off summer sale',
    discountType: DiscountType.PERCENTAGE,
    discountValue: new Decimal(25),
    minOrderAmount: new Decimal(50),
    maxDiscountAmount: new Decimal(100),
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    usageLimitTotal: 1000,
    usageLimitPerUser: 1,
    timesUsed: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    coupon: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    couponUsage: {
      count: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    // Mock current date to be within coupon validity
    jest.useFakeTimers().setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('validateCoupon', () => {
    it('should validate a valid coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.couponUsage.count.mockResolvedValue(0);

      const result = await service.validateCoupon(
        { code: 'SUMMER25', subtotal: 100 },
        'user-uuid',
      );

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(25); // 25% of 100
    });

    it('should throw NotFoundException for non-existent coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.validateCoupon({ code: 'INVALID', subtotal: 100 }, 'user-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        isActive: false,
      });

      await expect(
        service.validateCoupon({ code: 'SUMMER25', subtotal: 100 }, 'user-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        endDate: new Date('2024-01-01'),
      });

      await expect(
        service.validateCoupon({ code: 'SUMMER25', subtotal: 100 }, 'user-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when coupon usage limit reached', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        timesUsed: 1000,
      });

      await expect(
        service.validateCoupon({ code: 'SUMMER25', subtotal: 100 }, 'user-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user has used coupon max times', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.couponUsage.count.mockResolvedValue(1);

      await expect(
        service.validateCoupon({ code: 'SUMMER25', subtotal: 100 }, 'user-uuid'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when subtotal below minimum', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.couponUsage.count.mockResolvedValue(0);

      await expect(
        service.validateCoupon({ code: 'SUMMER25', subtotal: 30 }, 'user-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should cap discount at maxDiscountAmount', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.couponUsage.count.mockResolvedValue(0);

      const result = await service.validateCoupon(
        { code: 'SUMMER25', subtotal: 500 },
        'user-uuid',
      );

      // 25% of 500 = 125, but capped at 100
      expect(result.discountAmount).toBe(100);
    });

    it('should calculate fixed discount correctly', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        discountType: DiscountType.FIXED,
        discountValue: new Decimal(15),
      });
      mockPrismaService.couponUsage.count.mockResolvedValue(0);

      const result = await service.validateCoupon(
        { code: 'SUMMER25', subtotal: 100 },
        'user-uuid',
      );

      expect(result.discountAmount).toBe(15);
    });

    it('should not exceed subtotal for fixed discount', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        discountType: DiscountType.FIXED,
        discountValue: new Decimal(100),
        minOrderAmount: new Decimal(0),
      });
      mockPrismaService.couponUsage.count.mockResolvedValue(0);

      const result = await service.validateCoupon(
        { code: 'SUMMER25', subtotal: 50 },
        'user-uuid',
      );

      expect(result.discountAmount).toBe(50);
    });
  });

  describe('findAll', () => {
    it('should return all coupons', async () => {
      mockPrismaService.coupon.findMany.mockResolvedValue([mockCoupon]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockPrismaService.coupon.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('create', () => {
    const createData = {
      code: 'NEWCODE',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    };

    it('should create a new coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);
      mockPrismaService.coupon.create.mockResolvedValue({
        ...mockCoupon,
        code: 'NEWCODE',
      });

      const result = await service.create(createData);

      expect(result.code).toBe('NEWCODE');
    });

    it('should throw ConflictException for duplicate code', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);

      await expect(
        service.create({ ...createData, code: 'SUMMER25' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should uppercase the coupon code', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);
      mockPrismaService.coupon.create.mockResolvedValue({
        ...mockCoupon,
        code: 'LOWERCASE',
      });

      await service.create({ ...createData, code: 'lowercase' });

      expect(mockPrismaService.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'LOWERCASE' },
      });
    });
  });

  describe('update', () => {
    it('should update a coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.coupon.update.mockResolvedValue({
        ...mockCoupon,
        description: 'Updated description',
      });

      const result = await service.update('coupon-uuid', {
        description: 'Updated description',
      });

      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException for non-existent coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { description: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a coupon with no usage', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.couponUsage.count.mockResolvedValue(0);
      mockPrismaService.coupon.delete.mockResolvedValue({});

      const result = await service.delete('coupon-uuid');

      expect(result.deleted).toBe(true);
    });

    it('should deactivate coupon if it has usage', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(mockCoupon);
      mockPrismaService.couponUsage.count.mockResolvedValue(5);
      mockPrismaService.coupon.update.mockResolvedValue({
        ...mockCoupon,
        isActive: false,
      });

      const result = await service.delete('coupon-uuid');

      expect(mockPrismaService.coupon.update).toHaveBeenCalledWith({
        where: { id: 'coupon-uuid' },
        data: { isActive: false },
      });
    });
  });
});
