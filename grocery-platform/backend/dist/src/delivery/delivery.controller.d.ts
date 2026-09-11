import { DeliveryService } from './delivery.service';
import { LookupZoneDto, QuerySlotsDto } from './dto/delivery.dto';
import { CreateDeliveryZoneDto, UpdateDeliveryZoneDto, CreateDeliverySlotsDto, UpdateDeliverySlotDto, QuerySlotsAdminDto } from './dto/admin-delivery.dto';
export declare class DeliveryController {
    private readonly deliveryService;
    constructor(deliveryService: DeliveryService);
    lookupZone(dto: LookupZoneDto): Promise<{
        id: string;
        name: string;
        baseFee: number;
        minOrderAmount: number;
        freeDeliveryThreshold: number | null;
        estimatedMinutes: number;
    }>;
    findAllZones(): Promise<{
        id: string;
        name: string;
        postalCodes: string[];
        baseFee: number;
        minOrderAmount: number;
        freeDeliveryThreshold: number | null;
        estimatedMinutes: number;
    }[]>;
    getSlots(query: QuerySlotsDto): Promise<{
        id: string;
        slotDate: Date;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        bookedCount: number;
        availableSlots: number;
        isAvailable: boolean;
    }[]>;
    getAllZonesAdmin(): Promise<{
        id: string;
        name: string;
        postalCodes: string[];
        baseFee: number;
        minOrderAmount: number;
        freeDeliveryThreshold: number | null;
        estimatedMinutes: number;
        isActive: boolean;
        ordersCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createZone(dto: CreateDeliveryZoneDto): Promise<{
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
    }>;
    updateZone(id: string, dto: UpdateDeliveryZoneDto): Promise<{
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
    }>;
    deleteZone(id: string): Promise<{
        deactivated: boolean;
        message: string;
        deleted?: undefined;
    } | {
        deleted: boolean;
        deactivated?: undefined;
        message?: undefined;
    }>;
    getAllSlotsAdmin(query: QuerySlotsAdminDto): Promise<{
        id: string;
        slotDate: Date;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        bookedCount: number;
        availableSlots: number;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    createSlots(dto: CreateDeliverySlotsDto): Promise<{
        created: number;
        message: string;
    }>;
    updateSlot(id: string, dto: UpdateDeliverySlotDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        slotDate: Date;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        bookedCount: number;
    }>;
    deleteSlot(id: string): Promise<{
        deleted: boolean;
    }>;
}
