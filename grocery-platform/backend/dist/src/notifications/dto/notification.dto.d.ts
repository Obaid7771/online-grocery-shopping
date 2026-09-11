export declare class RegisterFcmTokenDto {
    fcmToken: string;
    deviceType?: string;
}
export declare class SendNotificationDto {
    userId: string;
    title: string;
    body: string;
    type?: string;
    data?: Record<string, any>;
}
