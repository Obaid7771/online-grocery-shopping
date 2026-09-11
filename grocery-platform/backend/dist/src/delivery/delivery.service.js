"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DeliveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let DeliveryService = DeliveryService_1 = class DeliveryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeliveryService_1.name);
    }
    async findZoneByPostalCode(postalCode) {
        const zones = await this.prisma.deliveryZone.findMany({
            where: { isActive: true },
        });
        const zone = zones.find((z) => z.postalCodes.includes(postalCode));
        if (!zone) {
            throw new common_1.NotFoundException(`No delivery zone covers postal code '${postalCode}'. Pickup may still be available.`);
        }
        return {
            id: zone.id,
            name: zone.name,
            baseFee: Number(zone.baseFee),
            minOrderAmount: Number(zone.minOrderAmount),
            freeDeliveryThreshold: zone.freeDeliveryThreshold
                ? Number(zone.freeDeliveryThreshold)
                : null,
            estimatedMinutes: zone.estimatedMinutes,
        };
    }
    async findAllZones() {
        const zones = await this.prisma.deliveryZone.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return zones.map((z) => ({
            id: z.id,
            name: z.name,
            postalCodes: z.postalCodes,
            baseFee: Number(z.baseFee),
            minOrderAmount: Number(z.minOrderAmount),
            freeDeliveryThreshold: z.freeDeliveryThreshold
                ? Number(z.freeDeliveryThreshold)
                : null,
            estimatedMinutes: z.estimatedMinutes,
        }));
    }
    async getAvailableSlots(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dateFilter;
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            if (targetDate < today) {
                throw new common_1.BadRequestException('Cannot query slots for past dates.');
            }
            dateFilter = { equals: targetDate };
        }
        else {
            const sevenDaysOut = new Date(today);
            sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
            dateFilter = { gte: today, lte: sevenDaysOut };
        }
        const slots = await this.prisma.deliverySlot.findMany({
            where: {
                isActive: true,
                slotDate: dateFilter,
            },
            orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
        });
        return slots.map((s) => ({
            id: s.id,
            slotDate: s.slotDate,
            startTime: s.startTime,
            endTime: s.endTime,
            maxCapacity: s.maxCapacity,
            bookedCount: s.bookedCount,
            availableSlots: s.maxCapacity - s.bookedCount,
            isAvailable: s.bookedCount < s.maxCapacity,
        }));
    }
    async bookSlot(slotId) {
        return this.prisma.$transaction(async (tx) => {
            const slot = await tx.deliverySlot.findUnique({
                where: { id: slotId },
            });
            if (!slot || !slot.isActive) {
                throw new common_1.NotFoundException('Delivery slot not found or inactive.');
            }
            if (slot.bookedCount >= slot.maxCapacity) {
                throw new common_1.BadRequestException('This delivery slot is fully booked. Please choose another.');
            }
            return tx.deliverySlot.update({
                where: { id: slotId },
                data: { bookedCount: { increment: 1 } },
            });
        });
    }
    async releaseSlot(slotId) {
        return this.prisma.deliverySlot.update({
            where: { id: slotId },
            data: { bookedCount: { decrement: 1 } },
        });
    }
    calculateDeliveryFee(zone, subtotal) {
        if (zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) {
            return 0;
        }
        return zone.baseFee;
    }
    async getAllZonesAdmin() {
        const zones = await this.prisma.deliveryZone.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { orders: true } },
            },
        });
        return zones.map((z) => ({
            id: z.id,
            name: z.name,
            postalCodes: z.postalCodes,
            baseFee: Number(z.baseFee),
            minOrderAmount: Number(z.minOrderAmount),
            freeDeliveryThreshold: z.freeDeliveryThreshold ? Number(z.freeDeliveryThreshold) : null,
            estimatedMinutes: z.estimatedMinutes,
            isActive: z.isActive,
            ordersCount: z._count.orders,
            createdAt: z.createdAt,
            updatedAt: z.updatedAt,
        }));
    }
    async createZone(data) {
        const { Decimal } = require('@prisma/client/runtime/library');
        return this.prisma.deliveryZone.create({
            data: {
                name: data.name,
                postalCodes: data.postalCodes,
                baseFee: new Decimal(data.baseFee),
                minOrderAmount: new Decimal(data.minOrderAmount ?? 15),
                freeDeliveryThreshold: data.freeDeliveryThreshold
                    ? new Decimal(data.freeDeliveryThreshold)
                    : null,
                estimatedMinutes: data.estimatedMinutes ?? 45,
                isActive: true,
            },
        });
    }
    async updateZone(id, data) {
        const zone = await this.prisma.deliveryZone.findUnique({ where: { id } });
        if (!zone) {
            throw new common_1.NotFoundException('Delivery zone not found.');
        }
        const { Decimal } = require('@prisma/client/runtime/library');
        return this.prisma.deliveryZone.update({
            where: { id },
            data: {
                name: data.name,
                postalCodes: data.postalCodes,
                baseFee: data.baseFee !== undefined ? new Decimal(data.baseFee) : undefined,
                minOrderAmount: data.minOrderAmount !== undefined ? new Decimal(data.minOrderAmount) : undefined,
                freeDeliveryThreshold: data.freeDeliveryThreshold !== undefined
                    ? (data.freeDeliveryThreshold === null ? null : new Decimal(data.freeDeliveryThreshold))
                    : undefined,
                estimatedMinutes: data.estimatedMinutes,
                isActive: data.isActive,
            },
        });
    }
    async deleteZone(id) {
        const zone = await this.prisma.deliveryZone.findUnique({
            where: { id },
            include: { _count: { select: { orders: true } } },
        });
        if (!zone) {
            throw new common_1.NotFoundException('Delivery zone not found.');
        }
        if (zone._count.orders > 0) {
            await this.prisma.deliveryZone.update({
                where: { id },
                data: { isActive: false },
            });
            return { deactivated: true, message: 'Zone has orders and was deactivated instead of deleted.' };
        }
        await this.prisma.deliveryZone.delete({ where: { id } });
        return { deleted: true };
    }
    async getAllSlotsAdmin(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.slotDate = {};
            if (startDate)
                where.slotDate.gte = new Date(startDate);
            if (endDate)
                where.slotDate.lte = new Date(endDate);
        }
        const slots = await this.prisma.deliverySlot.findMany({
            where,
            orderBy: [{ slotDate: 'asc' }, { startTime: 'asc' }],
        });
        return slots.map((s) => ({
            id: s.id,
            slotDate: s.slotDate,
            startTime: s.startTime,
            endTime: s.endTime,
            maxCapacity: s.maxCapacity,
            bookedCount: s.bookedCount,
            availableSlots: s.maxCapacity - s.bookedCount,
            isActive: s.isActive,
            createdAt: s.createdAt,
        }));
    }
    async createSlots(data) {
        const slots = [];
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const slotDate = new Date(d);
            slotDate.setHours(0, 0, 0, 0);
            for (const ts of data.timeSlots) {
                const existing = await this.prisma.deliverySlot.findFirst({
                    where: {
                        slotDate,
                        startTime: ts.startTime,
                        endTime: ts.endTime,
                    },
                });
                if (!existing) {
                    slots.push({
                        slotDate,
                        startTime: ts.startTime,
                        endTime: ts.endTime,
                        maxCapacity: data.maxCapacity,
                        bookedCount: 0,
                        isActive: true,
                    });
                }
            }
        }
        if (slots.length > 0) {
            await this.prisma.deliverySlot.createMany({ data: slots });
        }
        return { created: slots.length, message: `Created ${slots.length} delivery slots.` };
    }
    async updateSlot(id, data) {
        const slot = await this.prisma.deliverySlot.findUnique({ where: { id } });
        if (!slot) {
            throw new common_1.NotFoundException('Delivery slot not found.');
        }
        if (data.maxCapacity !== undefined && data.maxCapacity < slot.bookedCount) {
            throw new common_1.BadRequestException(`Cannot set capacity below current bookings (${slot.bookedCount}).`);
        }
        return this.prisma.deliverySlot.update({
            where: { id },
            data: {
                maxCapacity: data.maxCapacity,
                isActive: data.isActive,
            },
        });
    }
    async deleteSlot(id) {
        const slot = await this.prisma.deliverySlot.findUnique({ where: { id } });
        if (!slot) {
            throw new common_1.NotFoundException('Delivery slot not found.');
        }
        if (slot.bookedCount > 0) {
            throw new common_1.BadRequestException('Cannot delete slot with existing bookings. Deactivate it instead.');
        }
        await this.prisma.deliverySlot.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = DeliveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map