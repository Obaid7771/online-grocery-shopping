import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ProductUnit } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class QueryProductsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStockOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;
}
