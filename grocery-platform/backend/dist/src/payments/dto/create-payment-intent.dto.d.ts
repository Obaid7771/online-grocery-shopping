import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentIntentDto {
    orderId: string;
    paymentMethod?: PaymentMethod;
}
export declare class ConfirmPaymentDto {
    orderId: string;
    paymentIntentId: string;
}
