import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // 1. Get all active categories with tree hierarchy
  async findAll(includeInactive = false) {
    const categories = await this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Return root-level categories with populated children
    return categories.filter((cat) => cat.parentId === null);
  }

  // 2. Get single category by slug with child categories and product count
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category;
  }

  // 3. Find category by UUID
  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    return category;
  }

  // 4. Create category
  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`A category with slug '${slug}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException(`Parent category with ID '${dto.parentId}' does not exist`);
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        parent: true,
      },
    });
  }

  // 5. Update category
  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    let slug = dto.slug;
    if (dto.name && !slug) {
      slug = this.generateSlug(dto.name);
    }

    if (slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Category slug '${slug}' is already taken`);
      }
    }

    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        parent: true,
      },
    });
  }

  // 6. Delete category
  async delete(id: string) {
    const category = await this.findById(id);

    const productsCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot delete category containing ${productsCount} active products. Reassign or delete products first.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });

    return { message: `Category '${category.name}' deleted successfully` };
  }

  // Helper: Slugify utility
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
