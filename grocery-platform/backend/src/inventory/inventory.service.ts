import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { InventoryChangeType } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  // 1. Get real-time stock levels with low-stock status
  async getInventoryOverview(query: PaginationQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { sku: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
          price: true,
          stockQuantity: true,
          minStockThreshold: true,
          isActive: true,
          category: { select: { id: true, name: true } },
          updatedAt: true,
        },
        orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    const enrichedProducts = products.map((p) => ({
      ...p,
      isLowStock: p.stockQuantity <= p.minStockThreshold,
      isOutOfStock: p.stockQuantity === 0,
    }));

    return {
      data: enrichedProducts,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  // 2. Query products that have reached or breached their minimum stock threshold
  async getLowStockAlerts() {
    const products = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: true,
        price: true,
        stockQuantity: true,
        minStockThreshold: true,
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    // Filter where stockQuantity <= minStockThreshold
    return products.filter((p) => p.stockQuantity <= p.minStockThreshold);
  }

  // 3. Atomically adjust inventory with audit logging
  async adjustStock(dto: AdjustStockDto, adminUserId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product || product.deletedAt) {
        throw new NotFoundException(`Product with ID '${dto.productId}' not found`);
      }

      const previousQuantity = product.stockQuantity;
      const newQuantity = previousQuantity + dto.quantityChanged;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Cannot reduce stock by ${Math.abs(dto.quantityChanged)}. Current stock is only ${previousQuantity}.`,
        );
      }

      // Update product quantity
      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: { stockQuantity: newQuantity },
      });

      // Write immutable audit log
      const log = await tx.inventoryLog.create({
        data: {
          productId: dto.productId,
          changeType: dto.changeType,
          quantityChanged: dto.quantityChanged,
          previousQuantity,
          newQuantity,
          reason: dto.reason,
          referenceId: dto.referenceId,
          performedByUserId: adminUserId,
        },
      });

      return {
        product: updatedProduct,
        log,
      };
    });
  }

  // 4. Reserve stock for checkout with concurrency safety
  async reserveStock(dto: ReserveStockDto) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.deletedAt || !product.isActive) {
          throw new NotFoundException(`Product '${item.productId}' is not available`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for '${product.name}'. Requested: ${item.quantity}, Available: ${product.stockQuantity}`,
          );
        }

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: product.stockQuantity - item.quantity },
        });

        // Log reservation
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeType: InventoryChangeType.ORDER_RESERVATION,
            quantityChanged: -item.quantity,
            previousQuantity: product.stockQuantity,
            newQuantity: product.stockQuantity - item.quantity,
            reason: `Reservation for checkout (${dto.referenceId})`,
            referenceId: dto.referenceId,
          },
        });
      }

      return { success: true, reservedAt: new Date() };
    });
  }

  // 5. Release reserved stock (e.g. upon payment expiration or order cancellation)
  async releaseStock(dto: ReserveStockDto) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: product.stockQuantity + item.quantity },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeType: InventoryChangeType.ORDER_CANCELLATION,
            quantityChanged: item.quantity,
            previousQuantity: product.stockQuantity,
            newQuantity: product.stockQuantity + item.quantity,
            reason: `Stock released from cancelled/expired reservation (${dto.referenceId})`,
            referenceId: dto.referenceId,
          },
        });
      }

      return { success: true, releasedAt: new Date() };
    });
  }

  // 6. Get historical logs for a product
  async getInventoryLogs(productId: string, query: PaginationQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [logs, totalItems] = await Promise.all([
      this.prisma.inventoryLog.findMany({
        where: { productId },
        skip,
        take: limit,
        include: {
          performedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryLog.count({ where: { productId } }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}
