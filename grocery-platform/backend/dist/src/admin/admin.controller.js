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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const client_1 = require("@prisma/client");
class CustomerQueryDto extends pagination_dto_1.PaginationQueryDto {
}
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async getRevenueChart(days) {
        return this.adminService.getRevenueChartData(days || 30);
    }
    async getRecentOrders(limit) {
        return this.adminService.getRecentOrders(limit || 10);
    }
    async getCustomers(query) {
        return this.adminService.getCustomers(query);
    }
    async getCustomerById(id) {
        const customer = await this.adminService.getCustomerById(id);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return customer;
    }
    async toggleCustomerStatus(id) {
        const result = await this.adminService.toggleCustomerStatus(id);
        if (!result) {
            throw new common_1.NotFoundException('Customer not found');
        }
        return result;
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue chart data for last N days' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days (default 30)' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('recent-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get most recent orders for dashboard' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of orders (default 10)' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRecentOrders", null);
__decorate([
    (0, common_1.Get)('customers'),
    (0, swagger_1.ApiOperation)({ summary: 'List all customers with pagination and search' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CustomerQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer details with orders and addresses' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCustomerById", null);
__decorate([
    (0, common_1.Patch)('customers/:id/toggle-status'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer UUID' }),
    (0, swagger_1.ApiOperation)({ summary: 'Enable/disable customer account' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleCustomerStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STORE_MANAGER),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map