import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryType, PaymentMethod } from '@prisma/client';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity to purchase' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ enum: DeliveryType, default: DeliveryType.DELIVERY })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiPropertyOptional({ description: 'Delivery address UUID (required if deliveryType is DELIVERY)' })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiPropertyOptional({ description: 'Delivery slot UUID for chosen time window' })
  @IsOptional()
  @IsUUID()
  deliverySlotId?: string;

  @ApiPropertyOptional({ example: 'Leave at front porch door please' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'FRESH20' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
