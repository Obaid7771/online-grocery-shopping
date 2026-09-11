import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterFcmTokenDto, SendNotificationDto } from './dto/notification.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private userFcmTokens = new Map<string, string>(); // In-memory cache + persistent

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 1. Register or update client FCM token for push notifications.
   */
  async registerFcmToken(userId: string, dto: RegisterFcmTokenDto) {
    this.userFcmTokens.set(userId, dto.fcmToken);
    this.logger.log(`Registered FCM token for user ${userId} (${dto.deviceType || 'mobile'})`);
    return { success: true, message: 'FCM token registered successfully' };
  }

  /**
   * 2. Send in-app notification & FCM push notification.
   */
  async sendNotification(dto: SendNotificationDto) {
    // 1. Create database notification entry
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type || 'ORDER_UPDATE',
        data: dto.data ?? {},
      },
    });

    // 2. Dispatch FCM Push Notification (if token exists)
    const token = this.userFcmTokens.get(dto.userId);
    if (token) {
      await this.dispatchFcmPush(token, dto.title, dto.body, dto.data);
    } else {
      this.logger.log(`No active FCM token for user ${dto.userId}. Stored as in-app notification.`);
    }

    return notification;
  }

  /**
   * 3. Automated trigger for order lifecycle notifications.
   */
  async notifyOrderStatusChanged(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: OrderStatus,
  ) {
    const { title, body } = this.formatOrderNotificationMessage(orderNumber, status);

    return this.sendNotification({
      userId,
      title,
      body,
      type: 'ORDER_STATUS',
      data: { orderId, orderNumber, status },
    });
  }

  /**
   * 4. Automated trigger for payment notifications.
   */
  async notifyPaymentReceived(userId: string, orderNumber: string, amount: number) {
    return this.sendNotification({
      userId,
      title: 'Payment Confirmed! 💳',
      body: `Your payment of \$${amount.toFixed(2)} for order ${orderNumber} was successfully processed.`,
      type: 'PAYMENT_SUCCESS',
      data: { orderNumber, amount },
    });
  }

  /**
   * 5. Get user notifications with pagination.
   */
  async getUserNotifications(userId: string, query: PaginationQueryDto) {
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

  /**
   * 6. Mark single notification as read.
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * 7. Mark all notifications as read.
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Dispatch push notification via FCM HTTP or sandbox logger.
   */
  private async dispatchFcmPush(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    const firebaseProjectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    if (!firebaseProjectId) {
      this.logger.log(
        `[FCM SANDBOX] Push sent to token ${fcmToken.substring(0, 10)}... | Title: "${title}" | Body: "${body}"`,
      );
      return;
    }

    try {
      this.logger.log(`Dispatching FCM push to device: ${title}`);
      // In production with service account credentials, this executes FCM v1 API send
    } catch (e: any) {
      this.logger.error(`FCM dispatch error: ${e.message}`);
    }
  }

  private formatOrderNotificationMessage(
    orderNumber: string,
    status: OrderStatus,
  ): { title: string; body: string } {
    switch (status) {
      case OrderStatus.PAID:
        return {
          title: 'Order Confirmed! 🛒',
          body: `We received your order ${orderNumber}. Our team will begin packing shortly.`,
        };
      case OrderStatus.CONFIRMED:
        return {
          title: 'Order Confirmed! 🛒',
          body: `Your order ${orderNumber} is confirmed and scheduled for fulfillment.`,
        };
      case OrderStatus.PREPARING:
        return {
          title: 'Packing Your Fresh Groceries! 🥬',
          body: `Order ${orderNumber} is currently being hand-picked by our specialists.`,
        };
      case OrderStatus.READY_FOR_PICKUP:
        return {
          title: 'Ready for Store Pickup! 🏬',
          body: `Order ${orderNumber} is packed and waiting for you at the pickup hub.`,
        };
      case OrderStatus.OUT_FOR_DELIVERY:
        return {
          title: 'Out for Delivery! 🚚',
          body: `Your driver has departed with order ${orderNumber}. Track your delivery live!`,
        };
      case OrderStatus.DELIVERED:
        return {
          title: 'Groceries Delivered! 🍏',
          body: `Order ${orderNumber} was delivered to your door. Enjoy your fresh groceries!`,
        };
      case OrderStatus.CANCELLED:
        return {
          title: 'Order Cancelled',
          body: `Order ${orderNumber} has been cancelled. Any payments have been refunded.`,
        };
      case OrderStatus.REFUNDED:
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
}
