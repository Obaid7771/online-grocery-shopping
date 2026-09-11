import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterFcmTokenDto, SendNotificationDto } from './dto/notification.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { OrderStatus } from '@prisma/client';
export declare class NotificationsService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    private userFcmTokens;
    constructor(prisma: PrismaService, configService: ConfigService);
    registerFcmToken(userId: string, dto: RegisterFcmTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendNotification(dto: SendNotificationDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    notifyOrderStatusChanged(userId: string, orderId: string, orderNumber: string, status: OrderStatus): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    notifyPaymentReceived(userId: string, orderNumber: string, amount: number): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    getUserNotifications(userId: string, query: PaginationQueryDto): Promise<{
        data: {
            type: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            title: string;
            body: string;
            isRead: boolean;
        }[];
        unreadCount: number;
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
    markAsRead(id: string, userId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private dispatchFcmPush;
    private formatOrderNotificationMessage;
}
