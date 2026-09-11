import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaypalOrderDto {
  @ApiProperty({ description: 'Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}

export class CapturePaypalOrderDto {
  @ApiProperty({ description: 'Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'PayPal Order ID returned by PayPal SDK or checkout flow' })
  @IsString()
  @IsNotEmpty()
  paypalOrderId: string;
}
