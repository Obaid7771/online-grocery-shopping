import { IsNotEmpty, IsUUID, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessRefundDto {
  @ApiProperty({ description: 'Order UUID' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({ description: 'Specific refund amount. If omitted, full order amount is refunded.' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  amount?: number;

  @ApiProperty({ example: 'Customer requested refund / damaged items during delivery' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
