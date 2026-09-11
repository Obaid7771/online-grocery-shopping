import { IsNotEmpty, IsString, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({ example: 'FRESH20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 45.99, description: 'Cart subtotal before coupon' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class ApplyCouponDto {
  @ApiProperty({ example: 'FRESH20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 45.99 })
  @IsNumber()
  @Min(0)
  subtotal: number;
}
