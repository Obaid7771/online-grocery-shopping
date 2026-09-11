import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/coupon.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validate(dto: ValidateCouponDto, userId: string): Promise<{
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
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: import("@prisma/client/runtime/library").Decimal;
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    })[]>;
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
                totalAmount: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            userId: string;
            orderId: string;
            couponId: string;
            usedAt: Date;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
        _count: {
            usages: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: import("@prisma/client/runtime/library").Decimal;
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    }>;
    create(dto: CreateCouponDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: import("@prisma/client/runtime/library").Decimal;
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    }>;
    update(id: string, dto: UpdateCouponDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: import("@prisma/client/runtime/library").Decimal;
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
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
        minOrderAmount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: import("@prisma/client/runtime/library").Decimal;
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        startDate: Date;
        endDate: Date;
        usageLimitTotal: number;
        usageLimitPerUser: number;
        timesUsed: number;
    } | {
        deleted: boolean;
    }>;
}
