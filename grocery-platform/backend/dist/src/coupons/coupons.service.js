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
var CouponsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let CouponsService = CouponsService_1 = class CouponsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CouponsService_1.name);
    }
    async validateCoupon(dto, userId) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: dto.code.toUpperCase() },
        });
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon '${dto.code}' does not exist.`);
        }
        if (!coupon.isActive) {
            throw new common_1.BadRequestException('This coupon is no longer active.');
        }
        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
            throw new common_1.BadRequestException('This coupon has expired or is not yet valid.');
        }
        if (coupon.timesUsed >= coupon.usageLimitTotal) {
            throw new common_1.BadRequestException('This coupon has reached its maximum redemption limit.');
        }
        const userUsageCount = await this.prisma.couponUsage.count({
            where: { couponId: coupon.id, userId },
        });
        if (userUsageCount >= coupon.usageLimitPerUser) {
            throw new common_1.ConflictException('You have already used this coupon the maximum number of times.');
        }
        const minOrder = Number(coupon.minOrderAmount);
        if (dto.subtotal < minOrder) {
            throw new common_1.BadRequestException(`Order subtotal must be at least $${minOrder.toFixed(2)} to use this coupon.`);
        }
        let discountAmount;
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = dto.subtotal * (Number(coupon.discountValue) / 100);
        }
        else {
            discountAmount = Number(coupon.discountValue);
        }
        if (coupon.maxDiscountAmount) {
            const maxDiscount = Number(coupon.maxDiscountAmount);
            discountAmount = Math.min(discountAmount, maxDiscount);
        }
        discountAmount = Math.min(discountAmount, dto.subtotal);
        discountAmount = Math.round(discountAmount * 100) / 100;
        return {
            valid: true,
            couponId: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            discountAmount,
            description: coupon.description,
        };
    }
    async applyCoupon(dto, userId) {
        const validation = await this.validateCoupon({ code: dto.code, subtotal: dto.subtotal }, userId);
        return this.prisma.$transaction(async (tx) => {
            await tx.coupon.update({
                where: { code: dto.code.toUpperCase() },
                data: { timesUsed: { increment: 1 } },
            });
            await tx.couponUsage.create({
                data: {
                    couponId: validation.couponId,
                    userId,
                    orderId: dto.orderId,
                    discountAmount: new library_1.Decimal(validation.discountAmount),
                },
            });
            return validation;
        });
    }
    async findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { usages: true } },
            },
        });
    }
    async create(data) {
        const existing = await this.prisma.coupon.findUnique({
            where: { code: data.code.toUpperCase() },
        });
        if (existing) {
            throw new common_1.ConflictException(`Coupon code '${data.code}' already exists.`);
        }
        return this.prisma.coupon.create({
            data: {
                code: data.code.toUpperCase(),
                description: data.description,
                discountType: data.discountType,
                discountValue: new library_1.Decimal(data.discountValue),
                minOrderAmount: data.minOrderAmount ? new library_1.Decimal(data.minOrderAmount) : new library_1.Decimal(0),
                maxDiscountAmount: data.maxDiscountAmount ? new library_1.Decimal(data.maxDiscountAmount) : null,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                usageLimitTotal: data.usageLimitTotal ?? 1000,
                usageLimitPerUser: data.usageLimitPerUser ?? 1,
                isActive: true,
            },
        });
    }
    async update(id, data) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found.');
        }
        return this.prisma.coupon.update({
            where: { id },
            data: {
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue !== undefined ? new library_1.Decimal(data.discountValue) : undefined,
                minOrderAmount: data.minOrderAmount !== undefined ? new library_1.Decimal(data.minOrderAmount) : undefined,
                maxDiscountAmount: data.maxDiscountAmount !== undefined
                    ? (data.maxDiscountAmount === null ? null : new library_1.Decimal(data.maxDiscountAmount))
                    : undefined,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                usageLimitTotal: data.usageLimitTotal,
                usageLimitPerUser: data.usageLimitPerUser,
                isActive: data.isActive,
            },
        });
    }
    async delete(id) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found.');
        }
        const usageCount = await this.prisma.couponUsage.count({ where: { couponId: id } });
        if (usageCount > 0) {
            return this.prisma.coupon.update({
                where: { id },
                data: { isActive: false },
            });
        }
        await this.prisma.coupon.delete({ where: { id } });
        return { deleted: true };
    }
    async findById(id) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
            include: {
                _count: { select: { usages: true } },
                usages: {
                    take: 50,
                    orderBy: { usedAt: 'desc' },
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true } },
                        order: { select: { id: true, orderNumber: true, totalAmount: true } },
                    },
                },
            },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found.');
        }
        return coupon;
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = CouponsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map