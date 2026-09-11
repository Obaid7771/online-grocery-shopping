"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OrderTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTrackingService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const client_1 = require("@prisma/client");
let OrderTrackingService = OrderTrackingService_1 = class OrderTrackingService {
    constructor() {
        this.logger = new common_1.Logger(OrderTrackingService_1.name);
        this.trackingSubject = new rxjs_1.Subject();
    }
    publishStatusUpdate(orderId, status, details) {
        const event = {
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
    publishDriverLocation(orderId, location) {
        const event = {
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
    getTrackingStream(orderId) {
        return this.trackingSubject.asObservable().pipe((0, operators_1.filter)((event) => event.orderId === orderId), (0, operators_1.map)((event) => ({ data: event })));
    }
    formatStatusDisplayName(status) {
        switch (status) {
            case client_1.OrderStatus.PENDING_PAYMENT:
                return 'Pending Payment';
            case client_1.OrderStatus.PAID:
                return 'Paid';
            case client_1.OrderStatus.CONFIRMED:
                return 'Order Confirmed';
            case client_1.OrderStatus.PREPARING:
                return 'Packing Groceries';
            case client_1.OrderStatus.READY_FOR_PICKUP:
                return 'Ready for Pickup';
            case client_1.OrderStatus.OUT_FOR_DELIVERY:
                return 'Out for Delivery';
            case client_1.OrderStatus.DELIVERED:
                return 'Delivered';
            case client_1.OrderStatus.CANCELLED:
                return 'Cancelled';
            case client_1.OrderStatus.REFUNDED:
                return 'Refunded';
            default:
                return status;
        }
    }
};
exports.OrderTrackingService = OrderTrackingService;
exports.OrderTrackingService = OrderTrackingService = OrderTrackingService_1 = __decorate([
    (0, common_1.Injectable)()
], OrderTrackingService);
//# sourceMappingURL=order-tracking.service.js.map