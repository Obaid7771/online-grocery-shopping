import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Downtown' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: ['10001', '10002', '10003'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  postalCodes: string[];

  @ApiProperty({ example: 4.99 })
  @IsNumber()
  @Min(0)
  baseFee: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 50.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  freeDeliveryThreshold?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  estimatedMinutes?: number;
}

export class UpdateDeliveryZoneDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  postalCodes?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  baseFee?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  freeDeliveryThreshold?: number | null;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  estimatedMinutes?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

class TimeSlotDefinition {
  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class CreateDeliverySlotsDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-21' })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    type: [TimeSlotDefinition],
    example: [
      { startTime: '09:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '13:00' },
      { startTime: '13:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '19:00' },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDefinition)
  timeSlots: TimeSlotDefinition[];

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(1)
  maxCapacity: number;
}

export class UpdateDeliverySlotDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxCapacity?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QuerySlotsAdminDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
