import { PrismaService } from '../common/prisma/prisma.service';
import { ValidateCouponDto, ApplyCouponDto } from './dto/coupon.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class CouponsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    validateCoupon(dto: ValidateCouponDto, userId: string): Promise<{
        valid: boolean;
        couponId: string;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        discountAmount: number;
        description: string | null;
    }>;
    applyCoupon(dto: ApplyCouponDto, userId: string): Promise<{
        valid: boolean;
        couponId: string;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        discountAmount: number;
        description: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            usages: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountAmount: Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    })[]>;
    create(data: {
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
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountAmount: Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    }>;
    update(id: string, data: {
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
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountAmount: Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountAmount: Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    } | {
        deleted: boolean;
    }>;
    findById(id: string): Promise<{
        usages: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            order: {
                id: string;
                orderNumber: string;
                totalAmount: Decimal;
            };
        } & {
            id: string;
            userId: string;
            orderId: string;
            couponId: string;
            usedAt: Date;
            discountAmount: Decimal;
        })[];
        _count: {
            usages: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountAmount: Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    }>;
}
