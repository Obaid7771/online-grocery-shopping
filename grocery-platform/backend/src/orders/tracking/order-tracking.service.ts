import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UpdateDriverLocationDto } from './dto/driver-location.dto';
import { OrderStatus } from '@prisma/client';

export interface TrackingEvent {
  orderId: string;
  type: 'STATUS_CHANGE' | 'DRIVER_LOCATION' | 'ETA_UPDATE';
  data: any;
  timestamp: string;
}

@Injectable()
export class OrderTrackingService {
  private readonly logger = new Logger(OrderTrackingService.name);
  private readonly trackingSubject = new Subject<TrackingEvent>();

  /**
   * 1. Broadcast order status update to subscribed clients.
   */
  publishStatusUpdate(orderId: string, status: OrderStatus, details?: any) {
    const event: TrackingEvent = {
      orderId,
      type: 'STATUS_CHANGE',
      data: {
        status,
        displayName: this.formatStatusDisplayName(status),
        details,
      },
      timestamp: new Date().toISOString(),
    };

    this.logger.log(`Emitting tracking update for order ${orderId}: ${status}`);
    this.trackingSubject.next(event);
  }

  /**
   * 2. Broadcast driver GPS telemetry to customer during OUT_FOR_DELIVERY.
   */
  publishDriverLocation(orderId: string, location: UpdateDriverLocationDto) {
    const event: TrackingEvent = {
      orderId,
      type: 'DRIVER_LOCATION',
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        bearing: location.bearing ?? 0,
        estimatedMinutes: location.estimatedMinutes ?? 15,
      },
      timestamp: new Date().toISOString(),
    };

    this.trackingSubject.next(event);
  }

  /**
   * 3. Stream real-time events for a specific order.
   */
  getTrackingStream(orderId: string): Observable<{ data: TrackingEvent }> {
    return this.trackingSubject.asObservable().pipe(
      filter((event) => event.orderId === orderId),
      map((event) => ({ data: event })),
    );
  }

  private formatStatusDisplayName(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return 'Pending Payment';
      case OrderStatus.PAID:
        return 'Paid';
      case OrderStatus.CONFIRMED:
        return 'Order Confirmed';
      case OrderStatus.PREPARING:
        return 'Packing Groceries';
      case OrderStatus.READY_FOR_PICKUP:
        return 'Ready for Pickup';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      case OrderStatus.REFUNDED:
        return 'Refunded';
      default:
        return status;
    }
  }
}
