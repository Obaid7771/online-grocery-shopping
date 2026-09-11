import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from '../../src/inventory/inventory.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { InventoryChangeType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: PrismaService;

  const mockProduct = {
    id: 'product-uuid',
    name: 'Test Product',
    sku: 'TEST-001',
    stockQuantity: 100,
    minStockThreshold: 10,
    isActive: true,
    deletedAt: null,
    images: [{ url: 'https://example.com/image.jpg' }],
  };

  const mockInventoryLog = {
    id: 'log-uuid',
    productId: 'product-uuid',
    changeType: InventoryChangeType.MANUAL_ADJUSTMENT,
    quantityChanged: 50,
    previousQuantity: 100,
    newQuantity: 150,
    reason: 'Stock replenishment',
    performedByUserId: 'admin-uuid',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inventoryLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getInventoryOverview', () => {
    it('should return paginated inventory overview', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.getInventoryOverview({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter active products only', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.getInventoryOverview({ page: 1, limit: 20 });

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

  describe('getLowStockAlerts', () => {
    it('should return products with low stock', async () => {
      const lowStockProduct = {
        ...mockProduct,
        stockQuantity: 5,
      };
      mockPrismaService.product.findMany.mockResolvedValue([lowStockProduct]);

      const result = await service.getLowStockAlerts();

      expect(result).toHaveLength(1);
      expect(result[0].stockQuantity).toBeLessThanOrEqual(result[0].minStockThreshold);
    });

    it('should include out of stock products', async () => {
      const outOfStockProduct = {
        ...mockProduct,
        stockQuantity: 0,
      };
      mockPrismaService.product.findMany.mockResolvedValue([outOfStockProduct]);

      const result = await service.getLowStockAlerts();

      expect(result).toHaveLength(1);
      expect(result[0].stockQuantity).toBe(0);
    });
  });

  describe('adjustStock', () => {
    const adjustDto = {
      productId: 'product-uuid',
      changeType: InventoryChangeType.MANUAL_ADJUSTMENT,
      quantity: 50,
      reason: 'Stock replenishment',
    };

    it('should add stock successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 150,
      });
      mockPrismaService.inventoryLog.create.mockResolvedValue(mockInventoryLog);

      const result = await service.adjustStock(adjustDto, 'admin-uuid');

      expect(result.newQuantity).toBe(150);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-uuid' },
        data: { stockQuantity: 150 },
      });
    });

    it('should remove stock successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 50,
      });
      mockPrismaService.inventoryLog.create.mockResolvedValue({
        ...mockInventoryLog,
        quantityChanged: -50,
        newQuantity: 50,
      });

      const result = await service.adjustStock(
        { ...adjustDto, quantity: -50 },
        'admin-uuid',
      );

      expect(result.newQuantity).toBe(50);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.adjustStock(adjustDto, 'admin-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when removing more than available', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 30,
      });

      await expect(
        service.adjustStock({ ...adjustDto, quantity: -50 }, 'admin-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create inventory log entry', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        stockQuantity: 150,
      });
      mockPrismaService.inventoryLog.create.mockResolvedValue(mockInventoryLog);

      await service.adjustStock(adjustDto, 'admin-uuid');

      expect(mockPrismaService.inventoryLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'product-uuid',
          changeType: InventoryChangeType.MANUAL_ADJUSTMENT,
          quantityChanged: 50,
          previousQuantity: 100,
          newQuantity: 150,
          performedByUserId: 'admin-uuid',
        }),
      });
    });
  });

  describe('getInventoryLogs', () => {
    it('should return paginated inventory logs for product', async () => {
      mockPrismaService.inventoryLog.findMany.mockResolvedValue([mockInventoryLog]);
      mockPrismaService.inventoryLog.count.mockResolvedValue(1);

      const result = await service.getInventoryLogs('product-uuid', {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should order logs by creation date descending', async () => {
      mockPrismaService.inventoryLog.findMany.mockResolvedValue([]);
      mockPrismaService.inventoryLog.count.mockResolvedValue(0);

      await service.getInventoryLogs('product-uuid', { page: 1, limit: 20 });

      expect(mockPrismaService.inventoryLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should include performer details', async () => {
      mockPrismaService.inventoryLog.findMany.mockResolvedValue([
        {
          ...mockInventoryLog,
          performedBy: { firstName: 'Admin', lastName: 'User' },
        },
      ]);
      mockPrismaService.inventoryLog.count.mockResolvedValue(1);

      const result = await service.getInventoryLogs('product-uuid', {
        page: 1,
        limit: 20,
      });

      expect(result.data[0].performedBy).toBeDefined();
    });
  });

  describe('inventory change types', () => {
    const changeTypes = [
      InventoryChangeType.PURCHASE_RECEIPT,
      InventoryChangeType.ORDER_RESERVATION,
      InventoryChangeType.ORDER_FULFILLMENT,
      InventoryChangeType.ORDER_CANCELLATION,
      InventoryChangeType.MANUAL_ADJUSTMENT,
      InventoryChangeType.WASTAGE_DAMAGE,
    ];

    changeTypes.forEach((changeType) => {
      it(`should handle ${changeType} change type`, async () => {
        mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
        mockPrismaService.product.update.mockResolvedValue({
          ...mockProduct,
          stockQuantity: 150,
        });
        mockPrismaService.inventoryLog.create.mockResolvedValue({
          ...mockInventoryLog,
          changeType,
        });

        const result = await service.adjustStock(
          {
            productId: 'product-uuid',
            changeType,
            quantity: 50,
            reason: 'Test',
          },
          'admin-uuid',
        );

        expect(result).toBeDefined();
      });
    });
  });
});
