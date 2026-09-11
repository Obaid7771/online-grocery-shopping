import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from '../../src/products/products.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { ProductUnit } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockProduct = {
    id: 'product-uuid',
    name: 'Organic Bananas',
    slug: 'organic-bananas',
    sku: 'PROD-001',
    description: 'Fresh organic bananas',
    categoryId: 'category-uuid',
    price: new Decimal(2.99),
    discountPrice: null,
    unit: ProductUnit.BUNCH,
    unitStep: new Decimal(1),
    stockQuantity: 100,
    minStockThreshold: 10,
    isFeatured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    category: { id: 'category-uuid', name: 'Fruits', slug: 'fruits' },
    images: [{ url: 'https://example.com/banana.jpg', isPrimary: true }],
  };

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by category', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 10, categoryId: 'category-uuid' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'category-uuid',
          }),
        }),
      );
    });

    it('should filter active products only by default', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10 });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            deletedAt: null,
          }),
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('organic-bananas');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'organic-bananas', isActive: true, deletedAt: null },
        }),
      );
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findFeatured', () => {
    it('should return featured products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findFeatured(10);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isFeatured: true,
          }),
        }),
      );
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'New Product',
      sku: 'NEW-001',
      categoryId: 'category-uuid',
      price: 5.99,
      unit: ProductUnit.PIECE,
      stockQuantity: 50,
    };

    it('should create a new product', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue({
        ...mockProduct,
        ...createDto,
      });

      const result = await service.create(createDto, 'admin-uuid');

      expect(result).toBeDefined();
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate SKU', async () => {
      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      await expect(service.create(createDto, 'admin-uuid')).rejects.toThrow();
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Product',
      price: 3.99,
    };

    it('should update an existing product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await service.update('product-uuid', updateDto, 'admin-uuid');

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto, 'admin-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log inventory changes when stock is updated', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 150,
      });

      await service.update(
        'product-uuid',
        { stockQuantity: 150 },
        'admin-uuid',
      );

      expect(mockPrismaService.inventoryLog.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete a product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        deletedAt: new Date(),
        isActive: false,
      });

      const result = await service.delete('product-uuid');

      expect(result.deletedAt).toBeDefined();
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should search products by query', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.search('banana', 10);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: 'banana' }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should return empty array for no matches', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.search('xyz123', 10);

      expect(result).toHaveLength(0);
    });
  });
});
