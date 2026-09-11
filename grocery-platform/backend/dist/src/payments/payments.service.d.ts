import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/create-payment-intent.dto';
import { CreatePaypalOrderDto, CapturePaypalOrderDto } from './dto/paypal.dto';
import { ProcessRefundDto } from './dto/refund.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class PaymentsService {
    private readonly prisma;
    private readonly configService;
    private readonly inventoryService;
    private readonly logger;
    private stripe;
    constructor(prisma: PrismaService, configService: ConfigService, inventoryService: InventoryService);
    createPaymentIntent(userId: string, dto: CreatePaymentIntentDto): Promise<{
        clientSecret: string;
        paymentIntentId: string;
        publishableKey: string;
        amount: number;
        currency: string;
        orderNumber: string;
    }>;
    confirmPayment(userId: string, dto: ConfirmPaymentDto): Promise<{
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
    handleStripeWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
        note: string;
    } | {
        received: boolean;
        note?: undefined;
    }>;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    createPaypalOrder(userId: string, dto: CreatePaypalOrderDto): Promise<{
        paypalOrderId: string;
        approveUrl: string;
        amount: number;
        currency: string;
        links?: undefined;
    } | {
        paypalOrderId: any;
        links: any;
        amount: number;
        approveUrl?: undefined;
        currency?: undefined;
    }>;
    capturePaypalOrder(userId: string, dto: CapturePaypalOrderDto): Promise<{
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
    processRefund(dto: ProcessRefundDto, adminUserId: string): Promise<{
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
    private getPaypalAccessToken;
}
