import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';

class CustomerQueryDto extends PaginationQueryDto {
  search?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STORE_MANAGER)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data for last N days' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default 30)' })
  async getRevenueChart(@Query('days') days?: number) {
    return this.adminService.getRevenueChartData(days || 30);
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Get most recent orders for dashboard' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of orders (default 10)' })
  async getRecentOrders(@Query('limit') limit?: number) {
    return this.adminService.getRecentOrders(limit || 10);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List all customers with pagination and search' })
  async getCustomers(@Query() query: CustomerQueryDto) {
    return this.adminService.getCustomers(query);
  }

  @Get('customers/:id')
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiOperation({ summary: 'Get customer details with orders and addresses' })
  async getCustomerById(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.adminService.getCustomerById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  @Patch('customers/:id/toggle-status')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiOperation({ summary: 'Enable/disable customer account' })
  @HttpCode(HttpStatus.OK)
  async toggleCustomerStatus(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.adminService.toggleCustomerStatus(id);
    if (!result) {
      throw new NotFoundException('Customer not found');
    }
    return result;
  }
}
