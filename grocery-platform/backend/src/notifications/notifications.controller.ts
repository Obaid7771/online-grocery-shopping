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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterFcmTokenDto, SendNotificationDto } from './dto/notification.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Customer: Get notifications with unread count' })
  async getMyNotifications(
    @GetUser('id') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Post('fcm-token')
  @ApiOperation({ summary: 'Customer: Register or update mobile FCM token' })
  async registerToken(
    @GetUser('id') userId: string,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    return this.notificationsService.registerFcmToken(userId, dto);
  }

  @Patch(':id/read')
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiOperation({ summary: 'Customer: Mark notification as read' })
  async markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Customer: Mark all notifications as read' })
  async markAllRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('send')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin: Send manual promotional or operational notification' })
  async sendManual(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }
}
