import { InventoryChangeType } from '@prisma/client';
export declare class AdjustStockDto {
    productId: string;
    quantityChanged: number;
    changeType: InventoryChangeType;
    reason: string;
    referenceId?: string;
}
