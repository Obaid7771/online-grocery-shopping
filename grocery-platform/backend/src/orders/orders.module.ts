import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DeliveryModule } from '../delivery/delivery.module';
import { CouponsModule } from '../coupons/coupons.module';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderTrackingService } from './tracking/order-tracking.service';

@Module({
  imports: [DeliveryModule, CouponsModule, InventoryModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderTrackingService],
  exports: [OrdersService, OrderTrackingService],
})
export class OrdersModule {}
