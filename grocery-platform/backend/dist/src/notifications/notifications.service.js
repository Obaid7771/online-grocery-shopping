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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.userFcmTokens = new Map();
    }
    async registerFcmToken(userId, dto) {
        this.userFcmTokens.set(userId, dto.fcmToken);
        this.logger.log(`Registered FCM token for user ${userId} (${dto.deviceType || 'mobile'})`);
        return { success: true, message: 'FCM token registered successfully' };
    }
    async sendNotification(dto) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                title: dto.title,
                body: dto.body,
                type: dto.type || 'ORDER_UPDATE',
                data: dto.data ?? {},
            },
        });
        const token = this.userFcmTokens.get(dto.userId);
        if (token) {
            await this.dispatchFcmPush(token, dto.title, dto.body, dto.data);
        }
        else {
            this.logger.log(`No active FCM token for user ${dto.userId}. Stored as in-app notification.`);
        }
        return notification;
    }
    async notifyOrderStatusChanged(userId, orderId, orderNumber, status) {
        const { title, body } = this.formatOrderNotificationMessage(orderNumber, status);
        return this.sendNotification({
            userId,
            title,
            body,
            type: 'ORDER_STATUS',
            data: { orderId, orderNumber, status },
        });
    }
    async notifyPaymentReceived(userId, orderNumber, amount) {
        return this.sendNotification({
            userId,
            title: 'Payment Confirmed! 💳',
            body: `Your payment of \$${amount.toFixed(2)} for order ${orderNumber} was successfully processed.`,
            type: 'PAYMENT_SUCCESS',
            data: { orderNumber, amount },
        });
    }
    async getUserNotifications(userId, query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(50, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const [notifications, totalItems, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data: notifications,
            unreadCount,
            meta: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        };
    }
    async markAsRead(id, userId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found.');
        }
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true, message: 'All notifications marked as read' };
    }
    async dispatchFcmPush(fcmToken, title, body, data) {
        const firebaseProjectId = this.configService.get('FIREBASE_PROJECT_ID');
        if (!firebaseProjectId) {
            this.logger.log(`[FCM SANDBOX] Push sent to token ${fcmToken.substring(0, 10)}... | Title: "${title}" | Body: "${body}"`);
            return;
        }
        try {
            this.logger.log(`Dispatching FCM push to device: ${title}`);
        }
        catch (e) {
            this.logger.error(`FCM dispatch error: ${e.message}`);
        }
    }
    formatOrderNotificationMessage(orderNumber, status) {
        switch (status) {
            case client_1.OrderStatus.PAID:
                return {
                    title: 'Order Confirmed! 🛒',
                    body: `We received your order ${orderNumber}. Our team will begin packing shortly.`,
                };
            case client_1.OrderStatus.CONFIRMED:
                return {
                    title: 'Order Confirmed! 🛒',
                    body: `Your order ${orderNumber} is confirmed and scheduled for fulfillment.`,
                };
            case client_1.OrderStatus.PREPARING:
                return {
                    title: 'Packing Your Fresh Groceries! 🥬',
                    body: `Order ${orderNumber} is currently being hand-picked by our specialists.`,
                };
            case client_1.OrderStatus.READY_FOR_PICKUP:
                return {
                    title: 'Ready for Store Pickup! 🏬',
                    body: `Order ${orderNumber} is packed and waiting for you at the pickup hub.`,
                };
            case client_1.OrderStatus.OUT_FOR_DELIVERY:
                return {
                    title: 'Out for Delivery! 🚚',
                    body: `Your driver has departed with order ${orderNumber}. Track your delivery live!`,
                };
            case client_1.OrderStatus.DELIVERED:
                return {
                    title: 'Groceries Delivered! 🍏',
                    body: `Order ${orderNumber} was delivered to your door. Enjoy your fresh groceries!`,
                };
            case client_1.OrderStatus.CANCELLED:
                return {
                    title: 'Order Cancelled',
                    body: `Order ${orderNumber} has been cancelled. Any payments have been refunded.`,
                };
            case client_1.OrderStatus.REFUNDED:
                return {
                    title: 'Refund Processed 💵',
                    body: `Your refund for order ${orderNumber} has been processed successfully.`,
                };
            default:
                return {
                    title: 'Order Update',
                    body: `Order ${orderNumber} status changed to ${status}.`,
                };
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map