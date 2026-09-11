import { ProductUnit } from '@prisma/client';
import { ProductImageDto } from './create-product.dto';
export declare class UpdateProductDto {
    categoryId?: string;
    name?: string;
    slug?: string;
    description?: string;
    sku?: string;
    barcode?: string;
    price?: number;
    discountPrice?: number | null;
    unit?: ProductUnit;
    unitStep?: number;
    stockQuantity?: number;
    minStockThreshold?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: ProductImageDto[];
}
