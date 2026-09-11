import { DeliveryType, PaymentMethod } from '@prisma/client';
export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    deliveryType: DeliveryType;
    addressId?: string;
    deliverySlotId?: string;
    notes?: string;
    couponCode?: string;
    paymentMethod: PaymentMethod;
    items: CreateOrderItemDto[];
}
