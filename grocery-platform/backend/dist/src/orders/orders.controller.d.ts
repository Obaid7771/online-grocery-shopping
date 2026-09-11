import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { OrderTrackingService } from './tracking/order-tracking.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, CancelOrderDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateDriverLocationDto } from './tracking/dto/driver-location.dto';
import { Role } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    private readonly orderTrackingService;
    constructor(ordersService: OrdersService, orderTrackingService: OrderTrackingService);
    create(userId: string, dto: CreateOrderDto): Promise<{
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
            baseFee: import("@prisma/client/runtime/library").Decimal;
            minOrderAmount: import("@prisma/client/runtime/library").Decimal;
            freeDeliveryThreshold: import("@prisma/client/runtime/library").Decimal | null;
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
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
        subtotal: import("@prisma/client/runtime/library").Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    getMyOrders(userId: string, query: QueryOrdersDto): Promise<{
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
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
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
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderNumber: string;
            addressId: string | null;
            deliverySlotId: string | null;
            deliveryZoneId: string | null;
            deliveryType: import(".prisma/client").$Enums.DeliveryType;
            status: import(".prisma/client").$Enums.OrderStatus;
            deliveryFee: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
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
                baseFee: import("@prisma/client/runtime/library").Decimal;
                minOrderAmount: import("@prisma/client/runtime/library").Decimal;
                freeDeliveryThreshold: import("@prisma/client/runtime/library").Decimal | null;
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
                amount: import("@prisma/client/runtime/library").Decimal;
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
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderNumber: string;
            addressId: string | null;
            deliverySlotId: string | null;
            deliveryZoneId: string | null;
            deliveryType: import(".prisma/client").$Enums.DeliveryType;
            status: import(".prisma/client").$Enums.OrderStatus;
            deliveryFee: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
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
    getById(id: string, userId: string, role: Role): Promise<{
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
            baseFee: import("@prisma/client/runtime/library").Decimal;
            minOrderAmount: import("@prisma/client/runtime/library").Decimal;
            freeDeliveryThreshold: import("@prisma/client/runtime/library").Decimal | null;
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
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
        subtotal: import("@prisma/client/runtime/library").Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    updateStatus(id: string, adminUserId: string, dto: UpdateOrderStatusDto): Promise<{
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
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
        subtotal: import("@prisma/client/runtime/library").Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    cancel(id: string, userId: string, dto: CancelOrderDto): Promise<{
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client/runtime/library").Decimal;
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
        subtotal: import("@prisma/client/runtime/library").Decimal;
        orderNumber: string;
        addressId: string | null;
        deliverySlotId: string | null;
        deliveryZoneId: string | null;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        status: import(".prisma/client").$Enums.OrderStatus;
        deliveryFee: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        cancelReason: string | null;
        estimatedDeliveryTime: Date | null;
        actualDeliveryTime: Date | null;
    }>;
    liveTracking(id: string): Observable<{
        data: any;
    }>;
    updateDriverLocation(id: string, dto: UpdateDriverLocationDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
