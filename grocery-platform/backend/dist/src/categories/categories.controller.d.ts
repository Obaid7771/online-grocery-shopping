import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(includeInactive?: string): Promise<({
        children: {
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
        }[];
        _count: {
            products: number;
        };
    } & {
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
    })[]>;
    findBySlug(slug: string): Promise<{
        children: {
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
        }[];
        _count: {
            products: number;
        };
    } & {
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
    }>;
    create(dto: CreateCategoryDto): Promise<{
        parent: {
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
        } | null;
    } & {
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
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        parent: {
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
        } | null;
    } & {
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
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
