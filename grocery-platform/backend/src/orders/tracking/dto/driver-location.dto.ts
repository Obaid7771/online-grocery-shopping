import { IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDriverLocationDto {
  @ApiProperty({ example: 37.7749, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -122.4194, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 45.0, description: 'Heading/bearing in degrees' })
  @IsOptional()
  @IsNumber()
  bearing?: number;

  @ApiPropertyOptional({ example: 15, description: 'Estimated remaining minutes to delivery' })
  @IsOptional()
  @IsNumber()
  estimatedMinutes?: number;
}
