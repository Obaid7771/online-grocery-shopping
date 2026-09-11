import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LookupZoneDto {
  @ApiProperty({ example: '94105', description: 'Postal code for zone lookup' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class QuerySlotsDto {
  @ApiPropertyOptional({ example: '2026-09-10', description: 'Date for slot availability (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
