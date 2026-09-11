import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { OrdersService } from './orders.service';
import { OrderTrackingService } from './tracking/order-tracking.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, CancelOrderDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateDriverLocationDto } from './tracking/dto/driver-location.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderTrackingService: OrderTrackingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Customer: Place a new grocery order' })
  async create(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Customer: Get my order history' })
  async getMyOrders(@GetUser('id') userId: string, @Query() query: QueryOrdersDto) {
    return this.ordersService.getUserOrders(userId, query);
  }

  @Get('admin/all')
  @Roles('ADMIN', 'SUPER_ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Admin/Dispatcher: List all orders with filters' })
  async getAllOrders(@Query() query: QueryOrdersDto) {
    return this.ordersService.getAllOrders(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({ summary: 'Get order details by UUID' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: Role,
  ) {
    return this.ordersService.getOrderById(id, userId, role);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN', 'DISPATCHER')
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({ summary: 'Admin/Dispatcher: Transition order status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') adminUserId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto, adminUserId);
  }

  @Post(':id/cancel')
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({ summary: 'Customer: Cancel pending order' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrderByCustomer(id, userId, dto);
  }

  @Sse(':id/live-tracking')
  @Public()
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({ summary: 'Customer/Driver: Real-time SSE order tracking and telemetry stream' })
  liveTracking(@Param('id', ParseUUIDPipe) id: string): Observable<{ data: any }> {
    return this.orderTrackingService.getTrackingStream(id);
  }

  @Post(':id/driver-location')
  @Roles('DISPATCHER', 'ADMIN', 'SUPER_ADMIN')
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiOperation({ summary: 'Dispatcher/Driver: Update live GPS coordinates during delivery' })
  async updateDriverLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverLocationDto,
  ) {
    this.orderTrackingService.publishDriverLocation(id, dto);
    return { success: true, message: 'Driver telemetry updated' };
  }
}
