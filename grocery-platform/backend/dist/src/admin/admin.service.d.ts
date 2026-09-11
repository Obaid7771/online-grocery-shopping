import { PrismaService } from '../common/prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        revenue: {
            today: number;
            thisWeek: number;
            thisMonth: number;
            growth: number;
        };
        orders: {
            total: number;
            pending: number;
            delivered: number;
            cancelled: number;
        };
        customers: {
            total: number;
            newThisWeek: number;
        };
        products: {
            total: number;
            lowStock: number;
            outOfStock: number;
        };
    }>;
    getRevenueChartData(days?: number): Promise<{
        date: string;
        revenue: number;
    }[]>;
    getRecentOrders(limit?: number): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        items: {
            id: string;
            quantity: number;
            productName: string;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
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
    })[]>;
    getCustomers(query: PaginationQueryDto & {
        search?: string;
    }): Promise<{
        data: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            isActive: boolean;
            isEmailVerified: boolean;
            avatarUrl: string | null;
            createdAt: Date;
            _count: {
                orders: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCustomerById(customerId: string): Promise<{
        totalSpent: number;
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        isActive: boolean;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        avatarUrl: string | null;
        createdAt: Date;
        addresses: {
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
        }[];
        orders: ({
            items: {
                id: string;
                quantity: number;
                productName: string;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
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
        _count: {
            orders: number;
            reviews: number;
        };
    } | null>;
    toggleCustomerStatus(customerId: string): Promise<{
        id: string;
        isActive: boolean;
    } | null>;
}
