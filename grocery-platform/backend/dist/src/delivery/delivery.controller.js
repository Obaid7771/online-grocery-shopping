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
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const delivery_service_1 = require("./delivery.service");
const delivery_dto_1 = require("./dto/delivery.dto");
const admin_delivery_dto_1 = require("./dto/admin-delivery.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let DeliveryController = class DeliveryController {
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    async lookupZone(dto) {
        return this.deliveryService.findZoneByPostalCode(dto.postalCode);
    }
    async findAllZones() {
        return this.deliveryService.findAllZones();
    }
    async getSlots(query) {
        return this.deliveryService.getAvailableSlots(query.date);
    }
    async getAllZonesAdmin() {
        return this.deliveryService.getAllZonesAdmin();
    }
    async createZone(dto) {
        return this.deliveryService.createZone(dto);
    }
    async updateZone(id, dto) {
        return this.deliveryService.updateZone(id, dto);
    }
    async deleteZone(id) {
        return this.deliveryService.deleteZone(id);
    }
    async getAllSlotsAdmin(query) {
        return this.deliveryService.getAllSlotsAdmin(query.startDate, query.endDate);
    }
    async createSlots(dto) {
        return this.deliveryService.createSlots(dto);
    }
    async updateSlot(id, dto) {
        return this.deliveryService.updateSlot(id, dto);
    }
    async deleteSlot(id) {
        return this.deliveryService.deleteSlot(id);
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Post)('zones/lookup'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Find delivery zone by postal code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delivery_dto_1.LookupZoneDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "lookupZone", null);
__decorate([
    (0, common_1.Get)('zones'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all active delivery zones' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "findAllZones", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get available delivery slots (optionally by date)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delivery_dto_1.QuerySlotsDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Get)('admin/zones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STORE_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: List all delivery zones (including inactive)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getAllZonesAdmin", null);
__decorate([
    (0, common_1.Post)('admin/zones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create a delivery zone' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_delivery_dto_1.CreateDeliveryZoneDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "createZone", null);
__decorate([
    (0, common_1.Put)('admin/zones/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Zone UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update a delivery zone' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_delivery_dto_1.UpdateDeliveryZoneDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "updateZone", null);
__decorate([
    (0, common_1.Delete)('admin/zones/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Zone UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a delivery zone' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "deleteZone", null);
__decorate([
    (0, common_1.Get)('admin/slots'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STORE_MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: List all delivery slots' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_delivery_dto_1.QuerySlotsAdminDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getAllSlotsAdmin", null);
__decorate([
    (0, common_1.Post)('admin/slots'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create delivery slots for a date range' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_delivery_dto_1.CreateDeliverySlotsDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "createSlots", null);
__decorate([
    (0, common_1.Put)('admin/slots/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Slot UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update a delivery slot' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_delivery_dto_1.UpdateDeliverySlotDto]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "updateSlot", null);
__decorate([
    (0, common_1.Delete)('admin/slots/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Slot UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a delivery slot (only if no bookings)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "deleteSlot", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, swagger_1.ApiTags)('Delivery'),
    (0, common_1.Controller)('delivery'),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map