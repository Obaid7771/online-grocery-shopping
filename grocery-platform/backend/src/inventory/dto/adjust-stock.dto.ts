import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, NotEquals } from 'class-validator';
import { InventoryChangeType } from '@prisma/client';

export class AdjustStockDto {
  @IsUUID('4', { message: 'Valid product UUID is required' })
  productId: string;

  @IsInt({ message: 'Quantity change must be an integer' })
  @NotEquals(0, { message: 'Quantity change cannot be zero' })
  quantityChanged: number;

  @IsEnum(InventoryChangeType, { message: 'Invalid inventory change type' })
  changeType: InventoryChangeType;

  @IsString()
  @IsNotEmpty({ message: 'Reason for inventory adjustment is required' })
  reason: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}
