import { PrismaService } from '../common/prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class InventoryService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getInventoryOverview(query: PaginationQueryDto): Promise<{
        data: {
            isLowStock: boolean;
            isOutOfStock: boolean;
            id: string;
            isActive: boolean;
            updatedAt: Date;
            name: string;
            category: {
                id: string;
                name: string;
            };
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            unit: import(".prisma/client").$Enums.ProductUnit;
            stockQuantity: number;
            minStockThreshold: number;
        }[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    getLowStockAlerts(): Promise<{
        id: string;
        name: string;
        category: {
            name: string;
        };
        sku: string;
        price: import("@prisma/client/runtime/library").Decimal;
        unit: import(".prisma/client").$Enums.ProductUnit;
        stockQuantity: number;
        minStockThreshold: number;
        images: {
            url: string;
        }[];
    }[]>;
    adjustStock(dto: AdjustStockDto, adminUserId?: string): Promise<{
        product: {
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
            price: import("@prisma/client/runtime/library").Decimal;
            discountPrice: import("@prisma/client/runtime/library").Decimal | null;
            unit: import(".prisma/client").$Enums.ProductUnit;
            unitStep: import("@prisma/client/runtime/library").Decimal;
            stockQuantity: number;
            minStockThreshold: number;
            isFeatured: boolean;
            categoryId: string;
        };
        log: {
            id: string;
            createdAt: Date;
            changeType: import(".prisma/client").$Enums.InventoryChangeType;
            quantityChanged: number;
            previousQuantity: number;
            newQuantity: number;
            reason: string | null;
            referenceId: string | null;
            productId: string;
            performedByUserId: string | null;
        };
    }>;
    reserveStock(dto: ReserveStockDto): Promise<{
        success: boolean;
        reservedAt: Date;
    }>;
    releaseStock(dto: ReserveStockDto): Promise<{
        success: boolean;
        releasedAt: Date;
    }>;
    getInventoryLogs(productId: string, query: PaginationQueryDto): Promise<{
        data: ({
            performedBy: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            changeType: import(".prisma/client").$Enums.InventoryChangeType;
            quantityChanged: number;
            previousQuantity: number;
            newQuantity: number;
            reason: string | null;
            referenceId: string | null;
            productId: string;
            performedByUserId: string | null;
        })[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
}
