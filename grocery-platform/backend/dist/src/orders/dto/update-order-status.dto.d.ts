import { OrderStatus } from '@prisma/client';
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    cancelReason?: string;
    estimatedDeliveryTime?: string;
}
export declare class CancelOrderDto {
    cancelReason: string;
}
