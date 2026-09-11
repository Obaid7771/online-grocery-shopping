import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductUnit } from '@prisma/client';

export class ProductImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;

  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;

  @IsOptional()
  @IsString()
  altText?: string;
}

export class CreateProductDto {
  @IsUUID('4', { message: 'Valid category UUID is required' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Price must be greater than 0' })
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  discountPrice?: number;

  @IsOptional()
  @IsEnum(ProductUnit, { message: 'Invalid product unit' })
  unit?: ProductUnit = ProductUnit.PIECE;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  unitStep?: number = 1.0;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockThreshold?: number = 5;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
