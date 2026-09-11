import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@GetUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Put('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@GetUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  // Address Management Endpoints
  @Get('addresses')
  async getAddresses(@GetUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Get('addresses/:id')
  async getAddressById(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.getAddressById(userId, addressId);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @GetUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.createAddress(userId, dto);
  }

  @Put('addresses/:id')
  async updateAddress(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, dto);
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  @Patch('addresses/:id/default')
  async setDefaultAddress(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.usersService.setDefaultAddress(userId, addressId);
  }
}
