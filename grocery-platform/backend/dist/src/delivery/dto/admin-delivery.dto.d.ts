export declare class CreateDeliveryZoneDto {
    name: string;
    postalCodes: string[];
    baseFee: number;
    minOrderAmount?: number;
    freeDeliveryThreshold?: number;
    estimatedMinutes?: number;
}
export declare class UpdateDeliveryZoneDto {
    name?: string;
    postalCodes?: string[];
    baseFee?: number;
    minOrderAmount?: number;
    freeDeliveryThreshold?: number | null;
    estimatedMinutes?: number;
    isActive?: boolean;
}
declare class TimeSlotDefinition {
    startTime: string;
    endTime: string;
}
export declare class CreateDeliverySlotsDto {
    startDate: string;
    endDate: string;
    timeSlots: TimeSlotDefinition[];
    maxCapacity: number;
}
export declare class UpdateDeliverySlotDto {
    maxCapacity?: number;
    isActive?: boolean;
}
export declare class QuerySlotsAdminDto {
    startDate?: string;
    endDate?: string;
}
export {};
