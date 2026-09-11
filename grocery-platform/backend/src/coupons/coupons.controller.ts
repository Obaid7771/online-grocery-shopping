import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/coupon.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code against cart subtotal' })
  async validate(@Body() dto: ValidateCouponDto, @GetUser('id') userId: string) {
    return this.couponsService.validateCoupon(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STORE_MANAGER)
  @ApiOperation({ summary: 'Admin: List all coupons' })
  async findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STORE_MANAGER)
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiOperation({ summary: 'Admin: Get coupon details with usage history' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new coupon' })
  async create(@Body() dto: CreateCouponDto) {
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

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiOperation({ summary: 'Admin: Update a coupon' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ) {
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', description: 'Coupon UUID' })
  @ApiOperation({ summary: 'Admin: Delete a coupon (or deactivate if used)' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.delete(id);
  }
}
