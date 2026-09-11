import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { SearchProductsDto } from './dto/search-products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: QueryProductsDto): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            images: {
                id: string;
                sortOrder: number;
                isPrimary: boolean;
                productId: string;
                url: string;
                altText: string | null;
            }[];
            _count: {
                reviews: number;
            };
        } & {
            id: string;
            categoryId: string;
            name: string;
            slug: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            discountPrice: import("@prisma/client/runtime/library").Decimal | null;
            unit: import(".prisma/client").$Enums.ProductUnit;
            unitStep: import("@prisma/client/runtime/library").Decimal;
            stockQuantity: number;
            minStockThreshold: number;
            isFeatured: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    search(searchDto: SearchProductsDto): Promise<{
        id: string;
        name: string;
        slug: string;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        stockQuantity: number;
        category: {
            name: string;
            slug: string;
        };
        images: {
            url: string;
        }[];
    }[]>;
    findFeatured(limit?: number): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            sortOrder: number;
            isPrimary: boolean;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        categoryId: string;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: import("@prisma/client/runtime/library").Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    findPopular(limit?: number): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            sortOrder: number;
            isPrimary: boolean;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        categoryId: string;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: import("@prisma/client/runtime/library").Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    findRecommended(limit?: number): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            sortOrder: number;
            isPrimary: boolean;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        categoryId: string;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: import("@prisma/client/runtime/library").Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    findBySlug(slug: string): Promise<{
        averageRating: number;
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            imageUrl: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            sortOrder: number;
            isPrimary: boolean;
            productId: string;
            url: string;
            altText: string | null;
        }[];
        reviews: ({
            user: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            isPublished: boolean;
            userId: string;
            rating: number;
            title: string | null;
            comment: string | null;
        })[];
        _count: {
            reviews: number;
        };
        id: string;
        categoryId: string;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: import("@prisma/client/runtime/library").Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    create(dto: CreateProductDto, adminUserId: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            imageUrl: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            sortOrder: number;
            isPrimary: boolean;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        categoryId: string;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: import("@prisma/client/runtime/library").Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, dto: UpdateProductDto, adminUserId: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            imageUrl: string | null;
            sortOrder: number;
        };
        images: {
            id: string;
            sortOrder: number;
            isPrimary: boolean;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        categoryId: string;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        discountPrice: import("@prisma/client/runtime/library").Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: import("@prisma/client/runtime/library").Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
