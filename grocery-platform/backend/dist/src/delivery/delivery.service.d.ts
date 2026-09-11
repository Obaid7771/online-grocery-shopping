import { PrismaService } from '../common/prisma/prisma.service';
export declare class DeliveryService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findZoneByPostalCode(postalCode: string): Promise<{
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
    getAvailableSlots(date?: string): Promise<{
        id: string;
        slotDate: Date;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        bookedCount: number;
        availableSlots: number;
        isAvailable: boolean;
    }[]>;
    bookSlot(slotId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        slotDate: Date;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        bookedCount: number;
    }>;
    releaseSlot(slotId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        slotDate: Date;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        bookedCount: number;
    }>;
    calculateDeliveryFee(zone: {
        baseFee: number;
        freeDeliveryThreshold: number | null;
    }, subtotal: number): number;
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
    createZone(data: {
        name: string;
        postalCodes: string[];
        baseFee: number;
        minOrderAmount?: number;
        freeDeliveryThreshold?: number;
        estimatedMinutes?: number;
    }): Promise<{
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
    updateZone(id: string, data: {
        name?: string;
        postalCodes?: string[];
        baseFee?: number;
        minOrderAmount?: number;
        freeDeliveryThreshold?: number | null;
        estimatedMinutes?: number;
        isActive?: boolean;
    }): Promise<{
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
    getAllSlotsAdmin(startDate?: string, endDate?: string): Promise<{
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
    createSlots(data: {
        startDate: string;
        endDate: string;
        timeSlots: {
            startTime: string;
            endTime: string;
        }[];
        maxCapacity: number;
    }): Promise<{
        created: number;
        message: string;
    }>;
    updateSlot(id: string, data: {
        maxCapacity?: number;
        isActive?: boolean;
    }): Promise<{
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
