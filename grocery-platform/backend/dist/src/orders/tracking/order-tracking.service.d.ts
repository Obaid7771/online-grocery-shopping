import { Observable } from 'rxjs';
import { UpdateDriverLocationDto } from './dto/driver-location.dto';
import { OrderStatus } from '@prisma/client';
export interface TrackingEvent {
    orderId: string;
    type: 'STATUS_CHANGE' | 'DRIVER_LOCATION' | 'ETA_UPDATE';
    data: any;
    timestamp: string;
}
export declare class OrderTrackingService {
    private readonly logger;
    private readonly trackingSubject;
    publishStatusUpdate(orderId: string, status: OrderStatus, details?: any): void;
    publishDriverLocation(orderId: string, location: UpdateDriverLocationDto): void;
    getTrackingStream(orderId: string): Observable<{
        data: TrackingEvent;
    }>;
    private formatStatusDisplayName;
}
