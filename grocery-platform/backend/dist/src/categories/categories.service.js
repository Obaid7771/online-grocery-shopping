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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
        return categories.filter((cat) => cat.parentId === null);
    }
    async findBySlug(slug) {
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
            throw new common_1.NotFoundException(`Category with slug '${slug}' not found`);
        }
        return category;
    }
    async findById(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                _count: { select: { products: true } },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID '${id}' not found`);
        }
        return category;
    }
    async create(dto) {
        const slug = dto.slug || this.generateSlug(dto.name);
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.ConflictException(`A category with slug '${slug}' already exists`);
        }
        if (dto.parentId) {
            const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
            if (!parent) {
                throw new common_1.BadRequestException(`Parent category with ID '${dto.parentId}' does not exist`);
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
    async update(id, dto) {
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
                throw new common_1.ConflictException(`Category slug '${slug}' is already taken`);
            }
        }
        if (dto.parentId && dto.parentId === id) {
            throw new common_1.BadRequestException('A category cannot be its own parent');
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
    async delete(id) {
        const category = await this.findById(id);
        const productsCount = await this.prisma.product.count({
            where: { categoryId: id, deletedAt: null },
        });
        if (productsCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category containing ${productsCount} active products. Reassign or delete products first.`);
        }
        await this.prisma.category.delete({ where: { id } });
        return { message: `Category '${category.name}' deleted successfully` };
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
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map