import { ProductUnit } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class QueryProductsDto extends PaginationQueryDto {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    isFeatured?: boolean;
    unit?: ProductUnit;
}
