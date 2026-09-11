import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STORE_MANAGER, Role.SUPER_ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventoryOverview(@Query() query: PaginationQueryDto) {
    return this.inventoryService.getInventoryOverview(query);
  }

  @Get('alerts')
  async getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  async adjustStock(
    @Body() dto: AdjustStockDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.inventoryService.adjustStock(dto, adminUserId);
  }

  @Get('logs/:productId')
  async getInventoryLogs(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.inventoryService.getInventoryLogs(productId, query);
  }
}
