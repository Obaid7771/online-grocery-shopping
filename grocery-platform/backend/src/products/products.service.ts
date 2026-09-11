import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. Paginated products listing with dynamic filtering & sorting
  async findAll(query: QueryProductsDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
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

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price') {
      orderBy = { price: query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'name') {
      orderBy = { name: query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    } else if (query.sortBy === 'stock') {
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

  // 2. Product details by unique slug or ID
  async findBySlug(slugOrId: string) {
    // Try finding by slug first, then by ID
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

    // If not found by slug, try finding by ID
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
      throw new NotFoundException(`Product '${slugOrId}' not found`);
    }

    // Calculate aggregate average rating
    const avgRating = await this.prisma.review.aggregate({
      where: { productId: product.id, isPublished: true },
      _avg: { rating: true },
    });

    return {
      ...product,
      averageRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 5.0,
    };
  }

  // 3. Find product by ID
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return product;
  }

  // 4. Featured products for Home Screen
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

  // 5. Popular products for Home Screen
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

  // 6. Recommended products
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

  // 7. Full-text search and autocomplete
  async search(query: string, limit = 10) {
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

  // 8. Create new product
  async create(dto: CreateProductDto, adminUserId?: string) {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Verify unique slug and SKU
    const [existingSlug, existingSku] = await Promise.all([
      this.prisma.product.findUnique({ where: { slug } }),
      this.prisma.product.findUnique({ where: { sku: dto.sku } }),
    ]);

    if (existingSlug) {
      throw new ConflictException(`A product with slug '${slug}' already exists`);
    }
    if (existingSku) {
      throw new ConflictException(`A product with SKU '${dto.sku}' already exists`);
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw new BadRequestException(`Category with ID '${dto.categoryId}' does not exist`);
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

    // Record initial inventory log if initial stock was provided
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

  // 9. Update product
  async update(id: string, dto: UpdateProductDto, adminUserId?: string) {
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
        throw new ConflictException(`Slug '${slug}' is already in use by another product`);
      }
    }

    if (dto.sku) {
      const skuConflict = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (skuConflict) {
        throw new ConflictException(`SKU '${dto.sku}' is already in use by another product`);
      }
    }

    // Check if stock quantity is being updated directly
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

  // 10. Soft-delete product
  async delete(id: string) {
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
