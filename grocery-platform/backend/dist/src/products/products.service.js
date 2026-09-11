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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            isActive: true,
            ...(query.categoryId && { categoryId: query.categoryId }),
            ...(query.isFeatured !== undefined && { isFeatured: query.isFeatured }),
            ...(query.unit && { unit: query.unit }),
            ...(query.inStockOnly && { stockQuantity: { gt: 0 } }),
            ...(query.minPrice !== undefined || query.maxPrice !== undefined
                ? {
                    price: {
                        ...(query.minPrice !== undefined && { gte: query.minPrice }),
                        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
                    },
                }
                : {}),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { description: { contains: query.search, mode: 'insensitive' } },
                    { sku: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        let orderBy = { createdAt: 'desc' };
        if (query.sortBy === 'price') {
            orderBy = { price: query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc' };
        }
        else if (query.sortBy === 'name') {
            orderBy = { name: query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc' };
        }
        else if (query.sortBy === 'stock') {
            orderBy = { stockQuantity: 'desc' };
        }
        const [products, totalItems] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    images: {
                        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    },
                    _count: { select: { reviews: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products,
            meta: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        };
    }
    async findBySlug(slugOrId) {
        let product = await this.prisma.product.findUnique({
            where: { slug: slugOrId },
            include: {
                category: true,
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                reviews: {
                    where: { isPublished: true },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
                    },
                },
                _count: { select: { reviews: true } },
            },
        });
        if (!product) {
            product = await this.prisma.product.findUnique({
                where: { id: slugOrId },
                include: {
                    category: true,
                    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                    reviews: {
                        where: { isPublished: true },
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
                        },
                    },
                    _count: { select: { reviews: true } },
                },
            });
        }
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException(`Product '${slugOrId}' not found`);
        }
        const avgRating = await this.prisma.review.aggregate({
            where: { productId: product.id, isPublished: true },
            _avg: { rating: true },
        });
        return {
            ...product,
            averageRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 5.0,
        };
    }
    async findById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            },
        });
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException(`Product with ID '${id}' not found`);
        }
        return product;
    }
    async findFeatured(limit = 10) {
        return this.prisma.product.findMany({
            where: { isFeatured: true, isActive: true, deletedAt: null },
            take: limit,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { where: { isPrimary: true }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findPopular(limit = 10) {
        return this.prisma.product.findMany({
            where: { isActive: true, deletedAt: null, stockQuantity: { gt: 0 } },
            take: limit,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { where: { isPrimary: true }, take: 1 },
            },
            orderBy: { orderItems: { _count: 'desc' } },
        });
    }
    async findRecommended(limit = 10) {
        return this.prisma.product.findMany({
            where: { isActive: true, deletedAt: null, discountPrice: { not: null } },
            take: limit,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { where: { isPrimary: true }, take: 1 },
            },
            orderBy: { discountPrice: 'asc' },
        });
    }
    async search(query, limit = 10) {
        if (!query || query.trim().length === 0) {
            return [];
        }
        return this.prisma.product.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                    { category: { name: { contains: query, mode: 'insensitive' } } },
                ],
            },
            take: limit,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                unit: true,
                stockQuantity: true,
                category: { select: { name: true, slug: true } },
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async create(dto, adminUserId) {
        const slug = dto.slug || this.generateSlug(dto.name);
        const [existingSlug, existingSku] = await Promise.all([
            this.prisma.product.findUnique({ where: { slug } }),
            this.prisma.product.findUnique({ where: { sku: dto.sku } }),
        ]);
        if (existingSlug) {
            throw new common_1.ConflictException(`A product with slug '${slug}' already exists`);
        }
        if (existingSku) {
            throw new common_1.ConflictException(`A product with SKU '${dto.sku}' already exists`);
        }
        const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
        if (!category) {
            throw new common_1.BadRequestException(`Category with ID '${dto.categoryId}' does not exist`);
        }
        const product = await this.prisma.product.create({
            data: {
                categoryId: dto.categoryId,
                name: dto.name,
                slug,
                description: dto.description,
                sku: dto.sku,
                barcode: dto.barcode,
                price: dto.price,
                discountPrice: dto.discountPrice,
                unit: dto.unit,
                unitStep: dto.unitStep,
                stockQuantity: dto.stockQuantity ?? 0,
                minStockThreshold: dto.minStockThreshold ?? 5,
                isFeatured: dto.isFeatured ?? false,
                isActive: dto.isActive ?? true,
                ...(dto.images && dto.images.length > 0
                    ? {
                        images: {
                            create: dto.images.map((img, index) => ({
                                url: img.url,
                                isPrimary: img.isPrimary ?? index === 0,
                                sortOrder: img.sortOrder ?? index,
                                altText: img.altText || dto.name,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                category: true,
                images: true,
            },
        });
        if (dto.stockQuantity && dto.stockQuantity > 0) {
            await this.prisma.inventoryLog.create({
                data: {
                    productId: product.id,
                    changeType: 'PURCHASE_RECEIPT',
                    quantityChanged: dto.stockQuantity,
                    previousQuantity: 0,
                    newQuantity: dto.stockQuantity,
                    reason: 'Initial stock intake upon product creation',
                    performedByUserId: adminUserId,
                },
            });
        }
        return product;
    }
    async update(id, dto, adminUserId) {
        const existing = await this.findById(id);
        let slug = dto.slug;
        if (dto.name && !slug) {
            slug = this.generateSlug(dto.name);
        }
        if (slug) {
            const slugConflict = await this.prisma.product.findFirst({
                where: { slug, NOT: { id } },
            });
            if (slugConflict) {
                throw new common_1.ConflictException(`Slug '${slug}' is already in use by another product`);
            }
        }
        if (dto.sku) {
            const skuConflict = await this.prisma.product.findFirst({
                where: { sku: dto.sku, NOT: { id } },
            });
            if (skuConflict) {
                throw new common_1.ConflictException(`SKU '${dto.sku}' is already in use by another product`);
            }
        }
        if (dto.stockQuantity !== undefined && dto.stockQuantity !== existing.stockQuantity) {
            const diff = dto.stockQuantity - existing.stockQuantity;
            await this.prisma.inventoryLog.create({
                data: {
                    productId: id,
                    changeType: 'MANUAL_ADJUSTMENT',
                    quantityChanged: diff,
                    previousQuantity: existing.stockQuantity,
                    newQuantity: dto.stockQuantity,
                    reason: 'Manual adjustment via product update',
                    performedByUserId: adminUserId,
                },
            });
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.categoryId && { categoryId: dto.categoryId }),
                ...(dto.name && { name: dto.name }),
                ...(slug && { slug }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.sku && { sku: dto.sku }),
                ...(dto.barcode !== undefined && { barcode: dto.barcode }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.discountPrice !== undefined && { discountPrice: dto.discountPrice }),
                ...(dto.unit && { unit: dto.unit }),
                ...(dto.unitStep !== undefined && { unitStep: dto.unitStep }),
                ...(dto.stockQuantity !== undefined && { stockQuantity: dto.stockQuantity }),
                ...(dto.minStockThreshold !== undefined && { minStockThreshold: dto.minStockThreshold }),
                ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.images
                    ? {
                        images: {
                            deleteMany: {},
                            create: dto.images.map((img, idx) => ({
                                url: img.url,
                                isPrimary: img.isPrimary ?? idx === 0,
                                sortOrder: img.sortOrder ?? idx,
                                altText: img.altText,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                category: true,
                images: true,
            },
        });
    }
    async delete(id) {
        await this.findById(id);
        await this.prisma.product.update({
            where: { id },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });
        return { message: 'Product archived successfully' };
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map