import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
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
                url: string;
                isPrimary: boolean;
                altText: string | null;
                productId: string;
            }[];
            _count: {
                reviews: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            slug: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            price: Prisma.Decimal;
            discountPrice: Prisma.Decimal | null;
            unit: import(".prisma/client").$Enums.ProductUnit;
            unitStep: Prisma.Decimal;
            stockQuantity: number;
            minStockThreshold: number;
            isFeatured: boolean;
            categoryId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    findBySlug(slugOrId: string): Promise<{
        averageRating: number;
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
            userId: string;
            productId: string;
            isPublished: boolean;
            rating: number;
            title: string | null;
            comment: string | null;
        })[];
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            parentId: string | null;
        };
        images: {
            id: string;
            sortOrder: number;
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
        _count: {
            reviews: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    findById(id: string): Promise<{
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            parentId: string | null;
        };
        images: {
            id: string;
            sortOrder: number;
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    findFeatured(limit?: number): Promise<({
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            sortOrder: number;
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
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
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
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
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
    })[]>;
    search(query: string, limit?: number): Promise<{
        id: string;
        name: string;
        slug: string;
        category: {
            name: string;
            slug: string;
        };
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        stockQuantity: number;
        images: {
            url: string;
        }[];
    }[]>;
    create(dto: CreateProductDto, adminUserId?: string): Promise<{
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            parentId: string | null;
        };
        images: {
            id: string;
            sortOrder: number;
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateProductDto, adminUserId?: string): Promise<{
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            sortOrder: number;
            parentId: string | null;
        };
        images: {
            id: string;
            sortOrder: number;
            url: string;
            isPrimary: boolean;
            altText: string | null;
            productId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        slug: string;
        description: string | null;
        sku: string;
        barcode: string | null;
        price: Prisma.Decimal;
        discountPrice: Prisma.Decimal | null;
        unit: import(".prisma/client").$Enums.ProductUnit;
        unitStep: Prisma.Decimal;
        stockQuantity: number;
        minStockThreshold: number;
        isFeatured: boolean;
        categoryId: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    private generateSlug;
}
