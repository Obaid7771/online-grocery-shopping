import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CouponsService } from '../coupons/coupons.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, CancelOrderDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import {
  OrderStatus,
  DeliveryType,
  PaymentStatus,
  Role,
  PaymentMethod,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderTrackingService } from './tracking/order-tracking.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // Standard California/US average grocery sales tax rate
  private readonly TAX_RATE = 0.085;

  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryService: DeliveryService,
    private readonly couponsService: CouponsService,
    private readonly inventoryService: InventoryService,
    private readonly notificationsService: NotificationsService,
    private readonly orderTrackingService: OrderTrackingService,
  ) {}

  /**
   * 1. Place a new Order with atomic inventory reservation and delivery slot validation.
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cannot create an order without items.');
    }

    // A. Validate Delivery or Pickup constraints
    let address: any = null;
    let zone: any = null;
    let deliveryFee = 0;

    if (dto.deliveryType === DeliveryType.DELIVERY) {
      if (!dto.addressId) {
        throw new BadRequestException('A delivery address is required for home delivery.');
      }

      address = await this.prisma.address.findFirst({
        where: { id: dto.addressId, userId },
      });

      if (!address) {
        throw new NotFoundException('Delivery address not found or does not belong to you.');
      }

      // Lookup zone coverage
      try {
        zone = await this.deliveryService.findZoneByPostalCode(address.postalCode);
      } catch (e) {
        throw new BadRequestException(
          `Delivery is not available in postal code ${address.postalCode}. Please select Pickup.`,
        );
      }
    }

    // B. Fetch products and verify pricing & stock
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products are unavailable or have been removed.');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      productName: string;
      productSku: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }> = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;

      if (product.stockQuantity < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for '${product.name}'. Requested: ${item.quantity}, In stock: ${product.stockQuantity}`,
        );
      }

      const effectivePrice = product.discountPrice
        ? Number(product.discountPrice)
        : Number(product.price);

      const lineTotal = Math.round(effectivePrice * item.quantity * 100) / 100;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice: effectivePrice,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // Minimum order check for zone
    if (zone && subtotal < zone.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount for ${zone.name} is $${zone.minOrderAmount.toFixed(2)}. Current subtotal: $${subtotal.toFixed(2)}`,
      );
    }

    // Calculate delivery fee
    if (dto.deliveryType === DeliveryType.DELIVERY && zone) {
      deliveryFee = this.deliveryService.calculateDeliveryFee(zone, subtotal);
    }

    // C. Validate Coupon Discount
    let discountAmount = 0;
    let couponValidation: any = null;
    if (dto.couponCode) {
      couponValidation = await this.couponsService.validateCoupon(
        { code: dto.couponCode, subtotal },
        userId,
      );
      discountAmount = couponValidation.discountAmount;
    }

    // D. Compute Taxes & Total
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableAmount * this.TAX_RATE * 100) / 100;
    const totalAmount = Math.round((subtotal + deliveryFee - discountAmount + taxAmount) * 100) / 100;

    // E. Book Delivery Slot if chosen
    if (dto.deliverySlotId) {
      await this.deliveryService.bookSlot(dto.deliverySlotId);
    }

    // F. Generate Order Number: FC-YYYYMMDD-XXXXX
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `FC-${datePrefix}-${randomSuffix}`;

    // G. Atomic Database Transaction: Order + Stock Reservation + Coupon Usage + Payment Record
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Reserve stock atomically
        await this.inventoryService.reserveStock({
          items: dto.items,
          referenceId: orderNumber,
        });

        // 2. Initial status: Cash on delivery is CONFIRMED, digital payments are PENDING_PAYMENT
        const initialStatus =
          dto.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
            ? OrderStatus.CONFIRMED
            : OrderStatus.PENDING_PAYMENT;

        // 3. Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            addressId: dto.addressId,
            deliverySlotId: dto.deliverySlotId,
            deliveryZoneId: zone ? zone.id : null,
            deliveryType: dto.deliveryType,
            status: initialStatus,
            subtotal: new Decimal(subtotal),
            deliveryFee: new Decimal(deliveryFee),
            discountAmount: new Decimal(discountAmount),
            taxAmount: new Decimal(taxAmount),
            totalAmount: new Decimal(totalAmount),
            notes: dto.notes,
            items: {
              create: orderItemsData.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                unitPrice: new Decimal(item.unitPrice),
                quantity: item.quantity,
                totalPrice: new Decimal(item.totalPrice),
              })),
            },
            payments: {
              create: {
                paymentMethod: dto.paymentMethod,
                status:
                  dto.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                    ? PaymentStatus.AUTHORIZED
                    : PaymentStatus.PENDING,
                amount: new Decimal(totalAmount),
                currency: 'usd',
              },
            },
          },
          include: {
            items: true,
            payments: true,
            address: true,
            deliverySlot: true,
            deliveryZone: true,
          },
        });

        // 4. Apply coupon if validated
        if (couponValidation) {
          await tx.coupon.update({
            where: { id: couponValidation.couponId },
            data: { timesUsed: { increment: 1 } },
          });

          await tx.couponUsage.create({
            data: {
              couponId: couponValidation.couponId,
              userId,
              orderId: order.id,
              discountAmount: new Decimal(discountAmount),
            },
          });
        }

        return order;
      });

      // Emit real-time tracking event & push notification
      this.orderTrackingService.publishStatusUpdate(result.id, result.status, result);
      this.notificationsService
        .notifyOrderStatusChanged(userId, result.id, result.orderNumber, result.status)
        .catch(() => {});

      return result;
    } catch (err) {
      // Release delivery slot if the transaction failed
      if (dto.deliverySlotId) {
        await this.deliveryService.releaseSlot(dto.deliverySlotId).catch(() => {});
      }
      throw err;
    }
  }

  /**
   * 2. Retrieve single order by ID with authorization check.
   */
  async getOrderById(orderId: string, userId: string, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
              },
            },
          },
        },
        payments: true,
        address: true,
        deliverySlot: true,
        deliveryZone: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found.`);
    }

    // Check customer authorization
    if (userRole === Role.CUSTOMER && order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order.');
    }

    return order;
  }

  /**
   * 3. Get customer's order history with pagination and status filters.
   */
  async getUserOrders(userId: string, query: QueryOrdersDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.deliveryType && { deliveryType: query.deliveryType }),
      ...(query.startDate && query.endDate && {
        createdAt: {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        },
      }),
    };

    const [orders, totalItems] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            take: 3,
            include: {
              product: {
                select: {
                  images: { where: { isPrimary: true }, take: 1, select: { url: true } },
                },
              },
            },
          },
          payments: { select: { paymentMethod: true, status: true } },
          deliverySlot: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * 4. Admin/Dispatcher: Get all orders across the platform with search & filters.
   */
  async getAllOrders(query: QueryOrdersDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      ...(query.status && { status: query.status }),
      ...(query.deliveryType && { deliveryType: query.deliveryType }),
      ...(query.userId && { userId: query.userId }),
      ...(query.search && {
        OR: [
          { orderNumber: { contains: query.search, mode: 'insensitive' } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [orders, totalItems] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          payments: true,
          deliverySlot: true,
          deliveryZone: true,
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  /**
   * 5. State Machine: Transition order status with inventory release on cancellation.
   */
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, adminUserId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${orderId}' not found.`);
    }

    this.validateStatusTransition(order.status, dto.status);

    // If order is transitioning to CANCELLED, release stock & delivery slot
    if (dto.status === OrderStatus.CANCELLED) {
      await this.inventoryService.releaseStock({
        items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        referenceId: order.orderNumber,
      });

      if (order.deliverySlotId) {
        await this.deliveryService.releaseSlot(order.deliverySlotId);
      }
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        cancelReason: dto.cancelReason ?? order.cancelReason,
        estimatedDeliveryTime: dto.estimatedDeliveryTime
          ? new Date(dto.estimatedDeliveryTime)
          : order.estimatedDeliveryTime,
        actualDeliveryTime:
          dto.status === OrderStatus.DELIVERED ? new Date() : order.actualDeliveryTime,
      },
      include: {
        items: true,
        payments: true,
        address: true,
        deliverySlot: true,
      },
    });

    // Audit log for admin action
    if (adminUserId) {
      await this.prisma.adminActionLog.create({
        data: {
          adminId: adminUserId,
          action: 'UPDATE_ORDER_STATUS',
          entity: 'Order',
          entityId: orderId,
          changes: {
            fromStatus: order.status,
            toStatus: dto.status,
            cancelReason: dto.cancelReason,
          },
        },
      });
    }

    // Emit real-time tracking event & push notification
    this.orderTrackingService.publishStatusUpdate(orderId, dto.status, updated);
    this.notificationsService
      .notifyOrderStatusChanged(order.userId, orderId, order.orderNumber, dto.status)
      .catch(() => {});

    return updated;
  }

  /**
   * 6. Customer cancels order (only permitted prior to PREPARING phase).
   */
  async cancelOrderByCustomer(orderId: string, userId: string, dto: CancelOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${orderId}' not found.`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this order.');
    }

    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be cancelled at status '${order.status}'. Please contact customer support.`,
      );
    }

    return this.updateOrderStatus(orderId, {
      status: OrderStatus.CANCELLED,
      cancelReason: `Customer cancellation: ${dto.cancelReason}`,
    });
  }

  /**
   * Status Transition Validator (Strict Finite State Machine)
   */
  private validateStatusTransition(current: OrderStatus, target: OrderStatus) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    const validTargets = allowedTransitions[current] || [];
    if (!validTargets.includes(target)) {
      throw new BadRequestException(
        `Invalid status transition from '${current}' to '${target}'.`,
      );
    }
  }
}
