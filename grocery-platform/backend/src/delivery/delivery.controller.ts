import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { LookupZoneDto, QuerySlotsDto } from './dto/delivery.dto';
import {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
  CreateDeliverySlotsDto,
  UpdateDeliverySlotDto,
  QuerySlotsAdminDto,
} from './dto/admin-delivery.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ─────────────────────────────────────────────────────────────
  // PUBLIC / CUSTOMER ENDPOINTS
  // ─────────────────────────────────────────────────────────────

  @Post('zones/lookup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find delivery zone by postal code' })
  async lookupZone(@Body() dto: LookupZoneDto) {
    return this.deliveryService.findZoneByPostalCode(dto.postalCode);
  }

  @Get('zones')
  @Public()
  @ApiOperation({ summary: 'List all active delivery zones' })
  async findAllZones() {
    return this.deliveryService.findAllZones();
  }

  @Get('slots')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available delivery slots (optionally by date)' })
  async getSlots(@Query() query: QuerySlotsDto) {
    return this.deliveryService.getAvailableSlots(query.date);
  }

  // ─────────────────────────────────────────────────────────────
  // ADMIN: ZONE MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  @Get('admin/zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STORE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all delivery zones (including inactive)' })
  async getAllZonesAdmin() {
    return this.deliveryService.getAllZonesAdmin();
  }

  @Post('admin/zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a delivery zone' })
  async createZone(@Body() dto: CreateDeliveryZoneDto) {
    return this.deliveryService.createZone(dto);
  }

  @Put('admin/zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Zone UUID' })
  @ApiOperation({ summary: 'Admin: Update a delivery zone' })
  async updateZone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryService.updateZone(id, dto);
  }

  @Delete('admin/zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Zone UUID' })
  @ApiOperation({ summary: 'Admin: Delete a delivery zone' })
  async deleteZone(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryService.deleteZone(id);
  }

  // ─────────────────────────────────────────────────────────────
  // ADMIN: SLOT MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  @Get('admin/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STORE_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: List all delivery slots' })
  async getAllSlotsAdmin(@Query() query: QuerySlotsAdminDto) {
    return this.deliveryService.getAllSlotsAdmin(query.startDate, query.endDate);
  }

  @Post('admin/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create delivery slots for a date range' })
  async createSlots(@Body() dto: CreateDeliverySlotsDto) {
    return this.deliveryService.createSlots(dto);
  }

  @Put('admin/slots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiOperation({ summary: 'Admin: Update a delivery slot' })
  async updateSlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliverySlotDto,
  ) {
    return this.deliveryService.updateSlot(id, dto);
  }

  @Delete('admin/slots/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiOperation({ summary: 'Admin: Delete a delivery slot (only if no bookings)' })
  async deleteSlot(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryService.deleteSlot(id);
  }
}
