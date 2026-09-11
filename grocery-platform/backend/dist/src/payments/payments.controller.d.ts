import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/create-payment-intent.dto';
import { CreatePaypalOrderDto, CapturePaypalOrderDto } from './dto/paypal.dto';
import { ProcessRefundDto } from './dto/refund.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createIntent(userId: string, dto: CreatePaymentIntentDto): Promise<{
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
    handleStripeWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
        note: string;
    } | {
        received: boolean;
        note?: undefined;
    }>;
    processRefund(adminUserId: string, dto: ProcessRefundDto): Promise<{
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
}
