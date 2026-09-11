import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ValidateCouponDto, ApplyCouponDto } from './dto/coupon.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Validate a coupon code against business rules without consuming it.
   */
  async validateCoupon(dto: ValidateCouponDto, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon '${dto.code}' does not exist.`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active.');
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('This coupon has expired or is not yet valid.');
    }

    if (coupon.timesUsed >= coupon.usageLimitTotal) {
      throw new BadRequestException('This coupon has reached its maximum redemption limit.');
    }

    // Check per-user usage
    const userUsageCount = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });

    if (userUsageCount >= coupon.usageLimitPerUser) {
      throw new ConflictException('You have already used this coupon the maximum number of times.');
    }

    // Minimum order amount check
    const minOrder = Number(coupon.minOrderAmount);
    if (dto.subtotal < minOrder) {
      throw new BadRequestException(
        `Order subtotal must be at least $${minOrder.toFixed(2)} to use this coupon.`,
      );
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = dto.subtotal * (Number(coupon.discountValue) / 100);
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Cap discount if maxDiscountAmount is set
    if (coupon.maxDiscountAmount) {
      const maxDiscount = Number(coupon.maxDiscountAmount);
      discountAmount = Math.min(discountAmount, maxDiscount);
    }

    // Never exceed the subtotal
    discountAmount = Math.min(discountAmount, dto.subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount,
      description: coupon.description,
    };
  }

  /**
   * Record coupon usage against a completed order. Called internally during order creation.
   */
  async applyCoupon(dto: ApplyCouponDto, userId: string) {
    // Re-validate
    const validation = await this.validateCoupon(
      { code: dto.code, subtotal: dto.subtotal },
      userId,
    );

    return this.prisma.$transaction(async (tx) => {
      // Increment global usage counter
      await tx.coupon.update({
        where: { code: dto.code.toUpperCase() },
        data: { timesUsed: { increment: 1 } },
      });

      // Record per-user usage
      await tx.couponUsage.create({
        data: {
          couponId: validation.couponId,
          userId,
          orderId: dto.orderId,
          discountAmount: new Decimal(validation.discountAmount),
        },
      });

      return validation;
    });
  }

  /**
   * Admin: List all coupons.
   */
  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { usages: true } },
      },
    });
  }

  /**
   * Admin: Create a new coupon.
   */
  async create(data: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate: Date;
    endDate: Date;
    usageLimitTotal?: number;
    usageLimitPerUser?: number;
  }) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Coupon code '${data.code}' already exists.`);
    }

    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: new Decimal(data.discountValue),
        minOrderAmount: data.minOrderAmount ? new Decimal(data.minOrderAmount) : new Decimal(0),
        maxDiscountAmount: data.maxDiscountAmount ? new Decimal(data.maxDiscountAmount) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimitTotal: data.usageLimitTotal ?? 1000,
        usageLimitPerUser: data.usageLimitPerUser ?? 1,
        isActive: true,
      },
    });
  }

  /**
   * Admin: Update an existing coupon.
   */
  async update(id: string, data: {
    description?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number | null;
    startDate?: Date;
    endDate?: Date;
    usageLimitTotal?: number;
    usageLimitPerUser?: number;
    isActive?: boolean;
  }) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue !== undefined ? new Decimal(data.discountValue) : undefined,
        minOrderAmount: data.minOrderAmount !== undefined ? new Decimal(data.minOrderAmount) : undefined,
        maxDiscountAmount: data.maxDiscountAmount !== undefined
          ? (data.maxDiscountAmount === null ? null : new Decimal(data.maxDiscountAmount))
          : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        usageLimitTotal: data.usageLimitTotal,
        usageLimitPerUser: data.usageLimitPerUser,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Admin: Delete a coupon.
   */
  async delete(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    // Check if coupon has been used
    const usageCount = await this.prisma.couponUsage.count({ where: { couponId: id } });
    if (usageCount > 0) {
      // Soft delete by deactivating instead
      return this.prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
    }

    await this.prisma.coupon.delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Admin: Get a single coupon by ID.
   */
  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true } },
        usages: {
          take: 50,
          orderBy: { usedAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            order: { select: { id: true, orderNumber: true, totalAmount: true } },
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    return coupon;
  }
}
