"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let InventoryService = InventoryService_1 = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(InventoryService_1.name);
    }
    async getInventoryOverview(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { sku: { contains: query.search, mode: 'insensitive' } },
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
        return products.filter((p) => p.stockQuantity <= p.minStockThreshold);
    }
    async adjustStock(dto, adminUserId) {
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: dto.productId },
            });
            if (!product || product.deletedAt) {
                throw new common_1.NotFoundException(`Product with ID '${dto.productId}' not found`);
            }
            const previousQuantity = product.stockQuantity;
            const newQuantity = previousQuantity + dto.quantityChanged;
            if (newQuantity < 0) {
                throw new common_1.BadRequestException(`Cannot reduce stock by ${Math.abs(dto.quantityChanged)}. Current stock is only ${previousQuantity}.`);
            }
            const updatedProduct = await tx.product.update({
                where: { id: dto.productId },
                data: { stockQuantity: newQuantity },
            });
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
    async reserveStock(dto) {
        return this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product || product.deletedAt || !product.isActive) {
                    throw new common_1.NotFoundException(`Product '${item.productId}' is not available`);
                }
                if (product.stockQuantity < item.quantity) {
                    throw new common_1.ConflictException(`Insufficient stock for '${product.name}'. Requested: ${item.quantity}, Available: ${product.stockQuantity}`);
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: product.stockQuantity - item.quantity },
                });
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        changeType: client_1.InventoryChangeType.ORDER_RESERVATION,
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
    async releaseStock(dto) {
        return this.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product)
                    continue;
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: product.stockQuantity + item.quantity },
                });
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        changeType: client_1.InventoryChangeType.ORDER_CANCELLATION,
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
    async getInventoryLogs(productId, query) {
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map