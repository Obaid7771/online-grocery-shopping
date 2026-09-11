export declare class StockReservationItemDto {
    productId: string;
    quantity: number;
}
export declare class ReserveStockDto {
    items: StockReservationItemDto[];
    referenceId: string;
}
