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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const delivery_service_1 = require("../delivery/delivery.service");
const coupons_service_1 = require("../coupons/coupons.service");
const inventory_service_1 = require("../inventory/inventory.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const notifications_service_1 = require("../notifications/notifications.service");
const order_tracking_service_1 = require("./tracking/order-tracking.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(prisma, deliveryService, couponsService, inventoryService, notificationsService, orderTrackingService) {
        this.prisma = prisma;
        this.deliveryService = deliveryService;
        this.couponsService = couponsService;
        this.inventoryService = inventoryService;
        this.notificationsService = notificationsService;
        this.orderTrackingService = orderTrackingService;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.TAX_RATE = 0.085;
    }
    async createOrder(userId, dto) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Cannot create an order without items.');
        }
        let address = null;
        let zone = null;
        let deliveryFee = 0;
        if (dto.deliveryType === client_1.DeliveryType.DELIVERY) {
            if (!dto.addressId) {
                throw new common_1.BadRequestException('A delivery address is required for home delivery.');
            }
            address = await this.prisma.address.findFirst({
                where: { id: dto.addressId, userId },
            });
            if (!address) {
                throw new common_1.NotFoundException('Delivery address not found or does not belong to you.');
            }
            try {
                zone = await this.deliveryService.findZoneByPostalCode(address.postalCode);
            }
            catch (e) {
                throw new common_1.BadRequestException(`Delivery is not available in postal code ${address.postalCode}. Please select Pickup.`);
            }
        }
        const productIds = dto.items.map((i) => i.productId);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: productIds },
                deletedAt: null,
                isActive: true,
            },
        });
        if (products.length !== productIds.length) {
            throw new common_1.NotFoundException('One or more products are unavailable or have been removed.');
        }
        const productMap = new Map(products.map((p) => [p.id, p]));
        let subtotal = 0;
        const orderItemsData = [];
        for (const item of dto.items) {
            const product = productMap.get(item.productId);
            if (product.stockQuantity < item.quantity) {
                throw new common_1.ConflictException(`Insufficient stock for '${product.name}'. Requested: ${item.quantity}, In stock: ${product.stockQuantity}`);
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
        if (zone && subtotal < zone.minOrderAmount) {
            throw new common_1.BadRequestException(`Minimum order amount for ${zone.name} is $${zone.minOrderAmount.toFixed(2)}. Current subtotal: $${subtotal.toFixed(2)}`);
        }
        if (dto.deliveryType === client_1.DeliveryType.DELIVERY && zone) {
            deliveryFee = this.deliveryService.calculateDeliveryFee(zone, subtotal);
        }
        let discountAmount = 0;
        let couponValidation = null;
        if (dto.couponCode) {
            couponValidation = await this.couponsService.validateCoupon({ code: dto.couponCode, subtotal }, userId);
            discountAmount = couponValidation.discountAmount;
        }
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const taxAmount = Math.round(taxableAmount * this.TAX_RATE * 100) / 100;
        const totalAmount = Math.round((subtotal + deliveryFee - discountAmount + taxAmount) * 100) / 100;
        if (dto.deliverySlotId) {
            await this.deliveryService.bookSlot(dto.deliverySlotId);
        }
        const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderNumber = `FC-${datePrefix}-${randomSuffix}`;
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                await this.inventoryService.reserveStock({
                    items: dto.items,
                    referenceId: orderNumber,
                });
                const initialStatus = dto.paymentMethod === client_1.PaymentMethod.CASH_ON_DELIVERY
                    ? client_1.OrderStatus.CONFIRMED
                    : client_1.OrderStatus.PENDING_PAYMENT;
                const order = await tx.order.create({
                    data: {
                        orderNumber,
                        userId,
                        addressId: dto.addressId,
                        deliverySlotId: dto.deliverySlotId,
                        deliveryZoneId: zone ? zone.id : null,
                        deliveryType: dto.deliveryType,
                        status: initialStatus,
                        subtotal: new library_1.Decimal(subtotal),
                        deliveryFee: new library_1.Decimal(deliveryFee),
                        discountAmount: new library_1.Decimal(discountAmount),
                        taxAmount: new library_1.Decimal(taxAmount),
                        totalAmount: new library_1.Decimal(totalAmount),
                        notes: dto.notes,
                        items: {
                            create: orderItemsData.map((item) => ({
                                productId: item.productId,
                                productName: item.productName,
                                productSku: item.productSku,
                                unitPrice: new library_1.Decimal(item.unitPrice),
                                quantity: item.quantity,
                                totalPrice: new library_1.Decimal(item.totalPrice),
                            })),
                        },
                        payments: {
                            create: {
                                paymentMethod: dto.paymentMethod,
                                status: dto.paymentMethod === client_1.PaymentMethod.CASH_ON_DELIVERY
                                    ? client_1.PaymentStatus.AUTHORIZED
                                    : client_1.PaymentStatus.PENDING,
                                amount: new library_1.Decimal(totalAmount),
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
                            discountAmount: new library_1.Decimal(discountAmount),
                        },
                    });
                }
                return order;
            });
            this.orderTrackingService.publishStatusUpdate(result.id, result.status, result);
            this.notificationsService
                .notifyOrderStatusChanged(userId, result.id, result.orderNumber, result.status)
                .catch(() => { });
            return result;
        }
        catch (err) {
            if (dto.deliverySlotId) {
                await this.deliveryService.releaseSlot(dto.deliverySlotId).catch(() => { });
            }
            throw err;
        }
    }
    async getOrderById(orderId, userId, userRole) {
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
            throw new common_1.NotFoundException(`Order with ID '${orderId}' not found.`);
        }
        if (userRole === client_1.Role.CUSTOMER && order.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this order.');
        }
        return order;
    }
    async getUserOrders(userId, query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 10));
        const skip = (page - 1) * limit;
        const where = {
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
    async getAllOrders(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
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
    async updateOrderStatus(orderId, dto, adminUserId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${orderId}' not found.`);
        }
        this.validateStatusTransition(order.status, dto.status);
        if (dto.status === client_1.OrderStatus.CANCELLED) {
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
                actualDeliveryTime: dto.status === client_1.OrderStatus.DELIVERED ? new Date() : order.actualDeliveryTime,
            },
            include: {
                items: true,
                payments: true,
                address: true,
                deliverySlot: true,
            },
        });
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
        this.orderTrackingService.publishStatusUpdate(orderId, dto.status, updated);
        this.notificationsService
            .notifyOrderStatusChanged(order.userId, orderId, order.orderNumber, dto.status)
            .catch(() => { });
        return updated;
    }
    async cancelOrderByCustomer(orderId, userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${orderId}' not found.`);
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('You are not authorized to cancel this order.');
        }
        const cancellableStatuses = [
            client_1.OrderStatus.PENDING_PAYMENT,
            client_1.OrderStatus.PAID,
            client_1.OrderStatus.CONFIRMED,
        ];
        if (!cancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Order cannot be cancelled at status '${order.status}'. Please contact customer support.`);
        }
        return this.updateOrderStatus(orderId, {
            status: client_1.OrderStatus.CANCELLED,
            cancelReason: `Customer cancellation: ${dto.cancelReason}`,
        });
    }
    validateStatusTransition(current, target) {
        const allowedTransitions = {
            [client_1.OrderStatus.PENDING_PAYMENT]: [client_1.OrderStatus.PAID, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.PAID]: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.CANCELLED, client_1.OrderStatus.REFUNDED],
            [client_1.OrderStatus.CONFIRMED]: [client_1.OrderStatus.PREPARING, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.PREPARING]: [
                client_1.OrderStatus.READY_FOR_PICKUP,
                client_1.OrderStatus.OUT_FOR_DELIVERY,
                client_1.OrderStatus.CANCELLED,
            ],
            [client_1.OrderStatus.READY_FOR_PICKUP]: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.OUT_FOR_DELIVERY]: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.DELIVERED]: [client_1.OrderStatus.REFUNDED],
            [client_1.OrderStatus.CANCELLED]: [],
            [client_1.OrderStatus.REFUNDED]: [],
        };
        const validTargets = allowedTransitions[current] || [];
        if (!validTargets.includes(target)) {
            throw new common_1.BadRequestException(`Invalid status transition from '${current}' to '${target}'.`);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        delivery_service_1.DeliveryService,
        coupons_service_1.CouponsService,
        inventory_service_1.InventoryService,
        notifications_service_1.NotificationsService,
        order_tracking_service_1.OrderTrackingService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map