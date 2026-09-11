import { PrismaService } from '../common/prisma/prisma.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CouponsService } from '../coupons/coupons.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, CancelOrderDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderTrackingService } from './tracking/order-tracking.service';
export declare class OrdersService {
    private readonly prisma;
    private readonly deliveryService;
    private readonly couponsService;
    private readonly inventoryService;
    private readonly notificationsService;
    private readonly orderTrackingService;
    private readonly logger;
    private readonly TAX_RATE;
    constructor(prisma: PrismaService, deliveryService: DeliveryService, couponsService: CouponsService, inventoryService: InventoryService, notificationsService: NotificationsService, orderTrackingService: OrderTrackingService);
    createOrder(userId: string, dto: CreateOrderDto): Promise<{
        address: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            recipientName: string;
            street: string;
            apartment: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            latitude: number | null;
            longitude: number | null;
            isDefault: boolean;
            deliveryInstructions: string | null;
            userId: string;
        } | null;
        deliveryZone: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            postalCodes: string[];
            baseFee: Decimal;
            minOrderAmount: Decimal;
            freeDeliveryThreshold: Decimal | null;
            estimatedMinutes: number;
        } | null;
        deliverySlot: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            slotDate: Date;
            startTime: string;
            endTime: string;
            maxCapacity: number;
            bookedCount: number;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            orderId: string;
            productName: string;
            productSku: string;
            unitPrice: Decimal;
            totalPrice: Decimal;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: Decimal;
            transactionId: string | null;
            paymentIntentId: string | null;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            failureReason: string | null;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subtotal: Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: Decimal;
        discountAmount: Decimal;
        taxAmount: Decimal;
        totalAmount: Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    getOrderById(orderId: string, userId: string, userRole: Role): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
        };
        address: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            recipientName: string;
            street: string;
            apartment: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            latitude: number | null;
            longitude: number | null;
            isDefault: boolean;
            deliveryInstructions: string | null;
            userId: string;
        } | null;
        deliveryZone: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            postalCodes: string[];
            baseFee: Decimal;
            minOrderAmount: Decimal;
            freeDeliveryThreshold: Decimal | null;
            estimatedMinutes: number;
        } | null;
        deliverySlot: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            slotDate: Date;
            startTime: string;
            endTime: string;
            maxCapacity: number;
            bookedCount: number;
        } | null;
        items: ({
            product: {
                id: string;
                slug: string;
                images: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            orderId: string;
            productName: string;
            productSku: string;
            unitPrice: Decimal;
            totalPrice: Decimal;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: Decimal;
            transactionId: string | null;
            paymentIntentId: string | null;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            failureReason: string | null;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subtotal: Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: Decimal;
        discountAmount: Decimal;
        taxAmount: Decimal;
        totalAmount: Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    getUserOrders(userId: string, query: QueryOrdersDto): Promise<{
        data: ({
            deliverySlot: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                slotDate: Date;
                startTime: string;
                endTime: string;
                maxCapacity: number;
                bookedCount: number;
            } | null;
            _count: {
                items: number;
            };
            items: ({
                product: {
                    images: {
                        url: string;
                    }[];
                };
            } & {
                id: string;
                createdAt: Date;
                productId: string;
                quantity: number;
                orderId: string;
                productName: string;
                productSku: string;
                unitPrice: Decimal;
                totalPrice: Decimal;
            })[];
            payments: {
                status: import(".prisma/client").$Enums.PaymentStatus;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            subtotal: Decimal;
            orderNumber: string;
            addressId: string | null;
            deliverySlotId: string | null;
            deliveryZoneId: string | null;
            deliveryType: import(".prisma/client").$Enums.DeliveryType;
            status: import(".prisma/client").$Enums.OrderStatus;
            deliveryFee: Decimal;
            discountAmount: Decimal;
            taxAmount: Decimal;
            totalAmount: Decimal;
            notes: string | null;
            cancelReason: string | null;
            estimatedDeliveryTime: Date | null;
            actualDeliveryTime: Date | null;
        })[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    getAllOrders(query: QueryOrdersDto): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
            };
            deliveryZone: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                postalCodes: string[];
                baseFee: Decimal;
                minOrderAmount: Decimal;
                freeDeliveryThreshold: Decimal | null;
                estimatedMinutes: number;
            } | null;
            deliverySlot: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                slotDate: Date;
                startTime: string;
                endTime: string;
                maxCapacity: number;
                bookedCount: number;
            } | null;
            _count: {
                items: number;
            };
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                orderId: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                amount: Decimal;
                transactionId: string | null;
                paymentIntentId: string | null;
                currency: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                failureReason: string | null;
                paidAt: Date | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            subtotal: Decimal;
            orderNumber: string;
            addressId: string | null;
            deliverySlotId: string | null;
            deliveryZoneId: string | null;
            deliveryType: import(".prisma/client").$Enums.DeliveryType;
            status: import(".prisma/client").$Enums.OrderStatus;
            deliveryFee: Decimal;
            discountAmount: Decimal;
            taxAmount: Decimal;
            totalAmount: Decimal;
            notes: string | null;
            cancelReason: string | null;
            estimatedDeliveryTime: Date | null;
            actualDeliveryTime: Date | null;
        })[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, adminUserId?: string): Promise<{
        address: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            recipientName: string;
            street: string;
            apartment: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            latitude: number | null;
            longitude: number | null;
            isDefault: boolean;
            deliveryInstructions: string | null;
            userId: string;
        } | null;
        deliverySlot: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            slotDate: Date;
            startTime: string;
            endTime: string;
            maxCapacity: number;
            bookedCount: number;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            orderId: string;
            productName: string;
            productSku: string;
            unitPrice: Decimal;
            totalPrice: Decimal;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: Decimal;
            transactionId: string | null;
            paymentIntentId: string | null;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            failureReason: string | null;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subtotal: Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: Decimal;
        discountAmount: Decimal;
        taxAmount: Decimal;
        totalAmount: Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    cancelOrderByCustomer(orderId: string, userId: string, dto: CancelOrderDto): Promise<{
        address: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            label: string;
            recipientName: string;
            street: string;
            apartment: string | null;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            latitude: number | null;
            longitude: number | null;
            isDefault: boolean;
            deliveryInstructions: string | null;
            userId: string;
        } | null;
        deliverySlot: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            slotDate: Date;
            startTime: string;
            endTime: string;
            maxCapacity: number;
            bookedCount: number;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            productId: string;
            quantity: number;
            orderId: string;
            productName: string;
            productSku: string;
            unitPrice: Decimal;
            totalPrice: Decimal;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: Decimal;
            transactionId: string | null;
            paymentIntentId: string | null;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            failureReason: string | null;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subtotal: Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: Decimal;
        discountAmount: Decimal;
        taxAmount: Decimal;
        totalAmount: Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    private validateStatusTransition;
}
