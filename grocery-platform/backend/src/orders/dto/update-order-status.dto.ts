import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'New order status' })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Reason for cancellation if status is CANCELLED' })
  @IsOptional()
  @IsString()
  cancelReason?: string;

  @ApiPropertyOptional({ description: 'Updated estimated delivery time (ISO format)' })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryTime?: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Changed my mind / accidental order' })
  @IsString()
  @IsNotEmpty()
  cancelReason: string;
}
