import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role, OrderStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Revenue stats
    const [revenueToday, revenueThisWeek, revenueThisMonth, revenueLastMonth] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED, createdAt: { gte: startOfToday } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED, createdAt: { gte: startOfWeek } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.DELIVERED, createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: OrderStatus.DELIVERED,
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

    // Order stats
    const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.PREPARING] } },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    // Customer stats
    const [totalCustomers, newCustomersThisWeek] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.CUSTOMER, isActive: true, deletedAt: null } }),
      this.prisma.user.count({
        where: { role: Role.CUSTOMER, createdAt: { gte: startOfWeek }, deletedAt: null },
      }),
    ]);

    // Product stats
    const [totalProducts, outOfStockProducts] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.product.count({
        where: { isActive: true, deletedAt: null, stockQuantity: 0 },
      }),
    ]);

    // Low stock count (manual comparison)
    const lowStockCount = await this.prisma.$queryRaw<[{ count: string }]>`
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

  async getRevenueChartData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        createdAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const revenueByDate: Record<string, number> = {};
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

  async getRecentOrders(limit: number = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { select: { id: true, productName: true, quantity: true, totalPrice: true } },
      },
    });
  }

  async getCustomers(query: PaginationQueryDto & { search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      role: Role.CUSTOMER,
      deletedAt: null,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
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

  async getCustomerById(customerId: string) {
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

    // Calculate total spent
    const totalSpent = await this.prisma.order.aggregate({
      where: { userId: customerId, status: OrderStatus.DELIVERED },
      _sum: { totalAmount: true },
    });

    return {
      ...customer,
      totalSpent: Number(totalSpent._sum.totalAmount || 0),
    };
  }

  async toggleCustomerStatus(customerId: string) {
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
}
