import { DiscountType } from '@prisma/client';
export declare class CreateCouponDto {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    startDate: string;
    endDate: string;
    usageLimitTotal?: number;
    usageLimitPerUser?: number;
}
export declare class UpdateCouponDto {
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number | null;
    startDate?: string;
    endDate?: string;
    usageLimitTotal?: number;
    usageLimitPerUser?: number;
    isActive?: boolean;
}
