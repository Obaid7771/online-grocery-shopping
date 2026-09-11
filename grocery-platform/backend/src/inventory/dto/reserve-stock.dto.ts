import { IsArray, IsInt, IsNotEmpty, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StockReservationItemDto {
  @IsUUID('4')
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class ReserveStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockReservationItemDto)
  items: StockReservationItemDto[];

  @IsString()
  @IsNotEmpty()
  referenceId: string; // Order ID or Cart Session ID
}
