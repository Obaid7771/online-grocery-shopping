import { NotificationsService } from './notifications.service';
import { RegisterFcmTokenDto, SendNotificationDto } from './dto/notification.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(userId: string, query: PaginationQueryDto): Promise<{
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
    registerToken(userId: string, dto: RegisterFcmTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    markRead(id: string, userId: string): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendManual(dto: SendNotificationDto): Promise<{
        type: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        body: string;
        isRead: boolean;
    }>;
}
