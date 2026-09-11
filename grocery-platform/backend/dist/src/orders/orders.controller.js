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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const orders_service_1 = require("./orders.service");
const order_tracking_service_1 = require("./tracking/order-tracking.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const query_orders_dto_1 = require("./dto/query-orders.dto");
const driver_location_dto_1 = require("./tracking/dto/driver-location.dto");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const client_1 = require("@prisma/client");
let OrdersController = class OrdersController {
    constructor(ordersService, orderTrackingService) {
        this.ordersService = ordersService;
        this.orderTrackingService = orderTrackingService;
    }
    async create(userId, dto) {
        return this.ordersService.createOrder(userId, dto);
    }
    async getMyOrders(userId, query) {
        return this.ordersService.getUserOrders(userId, query);
    }
    async getAllOrders(query) {
        return this.ordersService.getAllOrders(query);
    }
    async getById(id, userId, role) {
        return this.ordersService.getOrderById(id, userId, role);
    }
    async updateStatus(id, adminUserId, dto) {
        return this.ordersService.updateOrderStatus(id, dto, adminUserId);
    }
    async cancel(id, userId, dto) {
        return this.ordersService.cancelOrderByCustomer(id, userId, dto);
    }
    liveTracking(id) {
        return this.orderTrackingService.getTrackingStream(id);
    }
    async updateDriverLocation(id, dto) {
        this.orderTrackingService.publishDriverLocation(id, dto);
        return { success: true, message: 'Driver telemetry updated' };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Customer: Place a new grocery order' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Customer: Get my order history' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_orders_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN', 'DISPATCHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin/Dispatcher: List all orders with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_orders_dto_1.QueryOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details by UUID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN', 'DISPATCHER'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin/Dispatcher: Transition order status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Customer: Cancel pending order' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_order_status_dto_1.CancelOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, common_1.Sse)(':id/live-tracking'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Customer/Driver: Real-time SSE order tracking and telemetry stream' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], OrdersController.prototype, "liveTracking", null);
__decorate([
    (0, common_1.Post)(':id/driver-location'),
    (0, roles_decorator_1.Roles)('DISPATCHER', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Dispatcher/Driver: Update live GPS coordinates during delivery' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, driver_location_dto_1.UpdateDriverLocationDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateDriverLocation", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        order_tracking_service_1.OrderTrackingService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map