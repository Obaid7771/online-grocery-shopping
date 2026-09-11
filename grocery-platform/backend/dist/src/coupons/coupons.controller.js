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
exports.CouponsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coupons_service_1 = require("./coupons.service");
const coupon_dto_1 = require("./dto/coupon.dto");
const create_coupon_dto_1 = require("./dto/create-coupon.dto");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let CouponsController = class CouponsController {
    constructor(couponsService) {
        this.couponsService = couponsService;
    }
    async validate(dto, userId) {
        return this.couponsService.validateCoupon(dto, userId);
    }
    async findAll() {
        return this.couponsService.findAll();
    }
    async findById(id) {
        return this.couponsService.findById(id);
    }
    async create(dto) {
        return this.couponsService.create({
            code: dto.code,
            description: dto.description,
            discountType: dto.discountType,
            discountValue: dto.discountValue,
            minOrderAmount: dto.minOrderAmount,
            maxDiscountAmount: dto.maxDiscountAmount,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            usageLimitTotal: dto.usageLimitTotal,
            usageLimitPerUser: dto.usageLimitPerUser,
        });
    }
    async update(id, dto) {
        return this.couponsService.update(id, {
            description: dto.description,
            discountType: dto.discountType,
            discountValue: dto.discountValue,
            minOrderAmount: dto.minOrderAmount,
            maxDiscountAmount: dto.maxDiscountAmount,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            usageLimitTotal: dto.usageLimitTotal,
            usageLimitPerUser: dto.usageLimitPerUser,
            isActive: dto.isActive,
        });
    }
    async delete(id) {
        return this.couponsService.delete(id);
    }
};
exports.CouponsController = CouponsController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a coupon code against cart subtotal' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.ValidateCouponDto, String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STORE_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: List all coupons' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STORE_MANAGER),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Coupon UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get coupon details with usage history' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Create a new coupon' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Coupon UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update a coupon' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Coupon UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Delete a coupon (or deactivate if used)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "delete", null);
exports.CouponsController = CouponsController = __decorate([
    (0, swagger_1.ApiTags)('Coupons'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('coupons'),
    __metadata("design:paramtypes", [coupons_service_1.CouponsService])
], CouponsController);
//# sourceMappingURL=coupons.controller.js.map