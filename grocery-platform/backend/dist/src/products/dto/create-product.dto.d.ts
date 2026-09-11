import { ProductUnit } from '@prisma/client';
export declare class ProductImageDto {
    url: string;
    isPrimary?: boolean;
    sortOrder?: number;
    altText?: string;
}
export declare class CreateProductDto {
    categoryId: string;
    name: string;
    slug?: string;
    description?: string;
    sku: string;
    barcode?: string;
    price: number;
    discountPrice?: number;
    unit?: ProductUnit;
    unitStep?: number;
    stockQuantity?: number;
    minStockThreshold?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    images?: ProductImageDto[];
}
