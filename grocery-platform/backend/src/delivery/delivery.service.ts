import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find delivery zone by postal code.
   */
  async findZoneByPostalCode(postalCode: string) {
    const zones = await this.prisma.deliveryZone.findMany({
      where: { isActive: true },
    });

    const zone = zones.find((z) => z.postalCodes.includes(postalCode));

    if (!zone) {
      throw new NotFoundException(
        `No delivery zone covers postal code '${postalCode}'. Pickup may still be available.`,
      );
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

  /**
   * Get all active delivery zones.
   */
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

  /**
   * Get available delivery slots for a given date.
   * If no date provided, returns next 7 days of slots.
   */
  async getAvailableSlots(date?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dateFilter: any;

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        throw new BadRequestException('Cannot query slots for past dates.');
      }

      dateFilter = { equals: targetDate };
    } else {
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

  /**
   * Book a delivery slot (increment bookedCount). Called internally from OrdersService.
   */
  async bookSlot(slotId: string) {
    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.deliverySlot.findUnique({
        where: { id: slotId },
      });

      if (!slot || !slot.isActive) {
        throw new NotFoundException('Delivery slot not found or inactive.');
      }

      if (slot.bookedCount >= slot.maxCapacity) {
        throw new BadRequestException('This delivery slot is fully booked. Please choose another.');
      }

      return tx.deliverySlot.update({
        where: { id: slotId },
        data: { bookedCount: { increment: 1 } },
      });
    });
  }

  /**
   * Release a delivery slot booking (decrement bookedCount). Called on order cancellation.
   */
  async releaseSlot(slotId: string) {
    return this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: { bookedCount: { decrement: 1 } },
    });
  }

  /**
   * Calculate delivery fee based on zone and subtotal.
   */
  calculateDeliveryFee(
    zone: { baseFee: number; freeDeliveryThreshold: number | null },
    subtotal: number,
  ): number {
    if (zone.freeDeliveryThreshold && subtotal >= zone.freeDeliveryThreshold) {
      return 0;
    }
    return zone.baseFee;
  }

  // ─────────────────────────────────────────────────────────────
  // ADMIN: Delivery Zone Management
  // ─────────────────────────────────────────────────────────────

  /**
   * Admin: Get all zones (including inactive).
   */
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

  /**
   * Admin: Create a delivery zone.
   */
  async createZone(data: {
    name: string;
    postalCodes: string[];
    baseFee: number;
    minOrderAmount?: number;
    freeDeliveryThreshold?: number;
    estimatedMinutes?: number;
  }) {
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

  /**
   * Admin: Update a delivery zone.
   */
  async updateZone(id: string, data: {
    name?: string;
    postalCodes?: string[];
    baseFee?: number;
    minOrderAmount?: number;
    freeDeliveryThreshold?: number | null;
    estimatedMinutes?: number;
    isActive?: boolean;
  }) {
    const zone = await this.prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Delivery zone not found.');
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

  /**
   * Admin: Delete a delivery zone (only if no orders).
   */
  async deleteZone(id: string) {
    const zone = await this.prisma.deliveryZone.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!zone) {
      throw new NotFoundException('Delivery zone not found.');
    }

    if (zone._count.orders > 0) {
      // Soft delete by deactivating
      await this.prisma.deliveryZone.update({
        where: { id },
        data: { isActive: false },
      });
      return { deactivated: true, message: 'Zone has orders and was deactivated instead of deleted.' };
    }

    await this.prisma.deliveryZone.delete({ where: { id } });
    return { deleted: true };
  }

  // ─────────────────────────────────────────────────────────────
  // ADMIN: Delivery Slot Management
  // ─────────────────────────────────────────────────────────────

  /**
   * Admin: Get all slots for management.
   */
  async getAllSlotsAdmin(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.slotDate = {};
      if (startDate) where.slotDate.gte = new Date(startDate);
      if (endDate) where.slotDate.lte = new Date(endDate);
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

  /**
   * Admin: Create delivery slots for a date range.
   */
  async createSlots(data: {
    startDate: string;
    endDate: string;
    timeSlots: { startTime: string; endTime: string }[];
    maxCapacity: number;
  }) {
    const slots: any[] = [];
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Iterate through each day
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const slotDate = new Date(d);
      slotDate.setHours(0, 0, 0, 0);

      // Create each time slot for this day
      for (const ts of data.timeSlots) {
        // Check if slot already exists
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

  /**
   * Admin: Update a delivery slot.
   */
  async updateSlot(id: string, data: {
    maxCapacity?: number;
    isActive?: boolean;
  }) {
    const slot = await this.prisma.deliverySlot.findUnique({ where: { id } });
    if (!slot) {
      throw new NotFoundException('Delivery slot not found.');
    }

    if (data.maxCapacity !== undefined && data.maxCapacity < slot.bookedCount) {
      throw new BadRequestException(
        `Cannot set capacity below current bookings (${slot.bookedCount}).`,
      );
    }

    return this.prisma.deliverySlot.update({
      where: { id },
      data: {
        maxCapacity: data.maxCapacity,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Admin: Delete a delivery slot (only if no bookings).
   */
  async deleteSlot(id: string) {
    const slot = await this.prisma.deliverySlot.findUnique({ where: { id } });
    if (!slot) {
      throw new NotFoundException('Delivery slot not found.');
    }

    if (slot.bookedCount > 0) {
      throw new BadRequestException('Cannot delete slot with existing bookings. Deactivate it instead.');
    }

    await this.prisma.deliverySlot.delete({ where: { id } });
    return { deleted: true };
  }
}
