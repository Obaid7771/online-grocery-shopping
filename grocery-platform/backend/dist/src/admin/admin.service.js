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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const [revenueToday, revenueThisWeek, revenueThisMonth, revenueLastMonth] = await Promise.all([
            this.prisma.order.aggregate({
                where: { status: client_1.OrderStatus.DELIVERED, createdAt: { gte: startOfToday } },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.aggregate({
                where: { status: client_1.OrderStatus.DELIVERED, createdAt: { gte: startOfWeek } },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.aggregate({
                where: { status: client_1.OrderStatus.DELIVERED, createdAt: { gte: startOfMonth } },
                _sum: { totalAmount: true },
            }),
            this.prisma.order.aggregate({
                where: {
                    status: client_1.OrderStatus.DELIVERED,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _sum: { totalAmount: true },
            }),
        ]);
        const thisMonthRev = Number(revenueThisMonth._sum.totalAmount || 0);
        const lastMonthRev = Number(revenueLastMonth._sum.totalAmount || 0);
        const revenueGrowth = lastMonthRev > 0
            ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
            : 0;
        const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({
                where: { status: { in: [client_1.OrderStatus.PENDING_PAYMENT, client_1.OrderStatus.PAID, client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.PREPARING] } },
            }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.DELIVERED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.CANCELLED } }),
        ]);
        const [totalCustomers, newCustomersThisWeek] = await Promise.all([
            this.prisma.user.count({ where: { role: client_1.Role.CUSTOMER, isActive: true, deletedAt: null } }),
            this.prisma.user.count({
                where: { role: client_1.Role.CUSTOMER, createdAt: { gte: startOfWeek }, deletedAt: null },
            }),
        ]);
        const [totalProducts, outOfStockProducts] = await Promise.all([
            this.prisma.product.count({ where: { isActive: true, deletedAt: null } }),
            this.prisma.product.count({
                where: { isActive: true, deletedAt: null, stockQuantity: 0 },
            }),
        ]);
        const lowStockCount = await this.prisma.$queryRaw `
      SELECT COUNT(*)::text as count FROM products
      WHERE "isActive" = true
      AND "deletedAt" IS NULL
      AND "stockQuantity" > 0
      AND "stockQuantity" <= "minStockThreshold"
    `;
        return {
            revenue: {
                today: Number(revenueToday._sum.totalAmount || 0),
                thisWeek: Number(revenueThisWeek._sum.totalAmount || 0),
                thisMonth: thisMonthRev,
                growth: revenueGrowth,
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders,
            },
            customers: {
                total: totalCustomers,
                newThisWeek: newCustomersThisWeek,
            },
            products: {
                total: totalProducts,
                lowStock: parseInt(lowStockCount[0]?.count || '0', 10),
                outOfStock: outOfStockProducts,
            },
        };
    }
    async getRevenueChartData(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const orders = await this.prisma.order.findMany({
            where: {
                status: client_1.OrderStatus.DELIVERED,
                createdAt: { gte: startDate },
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const revenueByDate = {};
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const key = date.toISOString().split('T')[0];
            revenueByDate[key] = 0;
        }
        orders.forEach((order) => {
            const key = order.createdAt.toISOString().split('T')[0];
            if (revenueByDate[key] !== undefined) {
                revenueByDate[key] += Number(order.totalAmount);
            }
        });
        return Object.entries(revenueByDate).map(([date, revenue]) => ({
            date,
            revenue: Math.round(revenue * 100) / 100,
        }));
    }
    async getRecentOrders(limit = 10) {
        return this.prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                items: { select: { id: true, productName: true, quantity: true, totalPrice: true } },
            },
        });
    }
    async getCustomers(query) {
        const { page = 1, limit = 20, search } = query;
        const skip = (page - 1) * limit;
        const where = {
            role: client_1.Role.CUSTOMER,
            deletedAt: null,
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                ],
            }),
        };
        const [customers, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    isActive: true,
                    isEmailVerified: true,
                    avatarUrl: true,
                    createdAt: true,
                    _count: { select: { orders: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: customers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getCustomerById(customerId) {
        const customer = await this.prisma.user.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: true,
                avatarUrl: true,
                createdAt: true,
                addresses: {
                    orderBy: { isDefault: 'desc' },
                },
                orders: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: { select: { id: true, productName: true, quantity: true, totalPrice: true } },
                    },
                },
                _count: { select: { orders: true, reviews: true } },
            },
        });
        if (!customer) {
            return null;
        }
        const totalSpent = await this.prisma.order.aggregate({
            where: { userId: customerId, status: client_1.OrderStatus.DELIVERED },
            _sum: { totalAmount: true },
        });
        return {
            ...customer,
            totalSpent: Number(totalSpent._sum.totalAmount || 0),
        };
    }
    async toggleCustomerStatus(customerId) {
        const customer = await this.prisma.user.findUnique({
            where: { id: customerId },
            select: { isActive: true },
        });
        if (!customer) {
            return null;
        }
        return this.prisma.user.update({
            where: { id: customerId },
            data: { isActive: !customer.isActive },
            select: { id: true, isActive: true },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map