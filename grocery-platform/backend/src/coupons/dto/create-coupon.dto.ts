import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER25', description: 'Unique coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '25% off summer sale' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DiscountType, example: 'PERCENTAGE' })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 25, description: 'Discount value (% or fixed amount)' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 50, description: 'Minimum order amount to apply coupon' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum discount amount (for percentage coupons)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 1000, description: 'Total usage limit' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitTotal?: number;

  @ApiPropertyOptional({ example: 1, description: 'Per-user usage limit' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitPerUser?: number;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: '25% off summer sale' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 25 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  maxDiscountAmount?: number | null;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitTotal?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
