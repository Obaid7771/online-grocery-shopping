import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('search')
  async search(@Query() searchDto: SearchProductsDto) {
    return this.productsService.search(searchDto.q, searchDto.limit);
  }

  @Public()
  @Get('featured')
  async findFeatured(@Query('limit') limit?: number) {
    return this.productsService.findFeatured(limit ? Number(limit) : 10);
  }

  @Public()
  @Get('popular')
  async findPopular(@Query('limit') limit?: number) {
    return this.productsService.findPopular(limit ? Number(limit) : 10);
  }

  @Public()
  @Get('recommended')
  async findRecommended(@Query('limit') limit?: number) {
    return this.productsService.findRecommended(limit ? Number(limit) : 10);
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STORE_MANAGER, Role.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto, @GetUser('id') adminUserId: string) {
    return this.productsService.create(dto, adminUserId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STORE_MANAGER, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @GetUser('id') adminUserId: string,
  ) {
    return this.productsService.update(id, dto, adminUserId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
