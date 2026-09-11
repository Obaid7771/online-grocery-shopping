import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from '../../src/orders/orders.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { OrderStatus, DeliveryType, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  const mockOrder = {
    id: 'order-uuid',
    orderNumber: 'FC-20240101-0001',
    userId: 'user-uuid',
    addressId: 'address-uuid',
    deliverySlotId: 'slot-uuid',
    deliveryZoneId: 'zone-uuid',
    deliveryType: DeliveryType.DELIVERY,
    status: OrderStatus.PENDING_PAYMENT,
    subtotal: new Decimal(50.00),
    deliveryFee: new Decimal(4.99),
    discountAmount: new Decimal(0),
    taxAmount: new Decimal(4.25),
    totalAmount: new Decimal(59.24),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 'user-uuid', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    items: [
      {
        id: 'item-uuid',
        productId: 'product-uuid',
        productName: 'Organic Bananas',
        productSku: 'PROD-001',
        quantity: 2,
        unitPrice: new Decimal(2.99),
        totalPrice: new Decimal(5.98),
      },
    ],
  };

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cart: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    deliverySlot: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    deliveryZone: {
      findFirst: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getUserOrders', () => {
    it('should return paginated user orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.getUserOrders('user-uuid', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-uuid' },
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      await service.getUserOrders('user-uuid', {
        page: 1,
        limit: 10,
        status: OrderStatus.DELIVERED,
      });

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OrderStatus.DELIVERED,
          }),
        }),
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders for admin', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.getAllOrders({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('getOrderById', () => {
    it('should return order for owner', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(
        'order-uuid',
        'user-uuid',
        Role.CUSTOMER,
      );

      expect(result).toEqual(mockOrder);
    });

    it('should return order for admin regardless of owner', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById(
        'order-uuid',
        'other-user-uuid',
        Role.ADMIN,
      );

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrderById('non-existent', 'user-uuid', Role.CUSTOMER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when customer tries to access other user order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getOrderById('order-uuid', 'other-user-uuid', Role.CUSTOMER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PAID,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });

      const result = await service.updateOrderStatus(
        'order-uuid',
        { status: OrderStatus.CONFIRMED },
        'admin-uuid',
      );

      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING_PAYMENT,
      });

      // Cannot go from PENDING_PAYMENT to DELIVERED directly
      await expect(
        service.updateOrderStatus(
          'order-uuid',
          { status: OrderStatus.DELIVERED },
          'admin-uuid',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create notification on status change', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PAID,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });

      await service.updateOrderStatus(
        'order-uuid',
        { status: OrderStatus.CONFIRMED },
        'admin-uuid',
      );

      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });

  describe('cancelOrderByCustomer', () => {
    it('should allow cancellation of pending orders', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING_PAYMENT,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancelOrderByCustomer(
        'order-uuid',
        'user-uuid',
        { reason: 'Changed my mind' },
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw ForbiddenException when cancelling other user order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.cancelOrderByCustomer('order-uuid', 'other-user', { reason: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-cancellable orders', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.OUT_FOR_DELIVERY,
      });

      await expect(
        service.cancelOrderByCustomer('order-uuid', 'user-uuid', { reason: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should release inventory on cancellation', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
        items: [
          {
            productId: 'product-uuid',
            quantity: 2,
            product: { stockQuantity: 10 },
          },
        ],
      });
      mockPrismaService.product.update.mockResolvedValue({});
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      await service.cancelOrderByCustomer('order-uuid', 'user-uuid', {
        reason: 'Test',
      });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { stockQuantity: { increment: 2 } },
        }),
      );
    });
  });

  describe('status transitions', () => {
    const validTransitions = [
      [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
      [OrderStatus.PAID, OrderStatus.CONFIRMED],
      [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED, OrderStatus.PREPARING],
      [OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP],
      [OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.READY_FOR_PICKUP, OrderStatus.DELIVERED],
      [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED, OrderStatus.REFUNDED],
    ];

    validTransitions.forEach(([from, to]) => {
      it(`should allow transition from ${from} to ${to}`, async () => {
        mockPrismaService.order.findUnique.mockResolvedValue({
          ...mockOrder,
          status: from,
        });
        mockPrismaService.order.update.mockResolvedValue({
          ...mockOrder,
          status: to,
        });

        const result = await service.updateOrderStatus(
          'order-uuid',
          { status: to },
          'admin-uuid',
        );

        expect(result.status).toBe(to);
      });
    });
  });
});
