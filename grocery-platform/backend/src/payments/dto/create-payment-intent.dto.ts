import { IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({
    enum: [PaymentMethod.STRIPE, PaymentMethod.APPLE_PAY, PaymentMethod.GOOGLE_PAY],
    default: PaymentMethod.STRIPE,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Payment Intent ID or Transaction ID' })
  @IsNotEmpty()
  paymentIntentId: string;
}
