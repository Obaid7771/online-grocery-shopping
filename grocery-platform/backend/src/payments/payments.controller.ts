import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/create-payment-intent.dto';
import { CreatePaypalOrderDto, CapturePaypalOrderDto } from './dto/paypal.dto';
import { ProcessRefundDto } from './dto/refund.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent for an order' })
  async createIntent(@GetUser('id') userId: string, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(userId, dto);
  }

  @Post('confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm order payment status after client payment completes' })
  async confirmPayment(@GetUser('id') userId: string, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(userId, dto);
  }

  @Post('paypal/create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate PayPal checkout order' })
  async createPaypalOrder(@GetUser('id') userId: string, @Body() dto: CreatePaypalOrderDto) {
    return this.paymentsService.createPaypalOrder(userId, dto);
  }

  @Post('paypal/capture')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Capture PayPal order payment' })
  async capturePaypalOrder(@GetUser('id') userId: string, @Body() dto: CapturePaypalOrderDto) {
    return this.paymentsService.capturePaypalOrder(userId, dto);
  }

  @Post('webhook/stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhook handler with signature verification' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    return this.paymentsService.handleStripeWebhook(rawBody, signature);
  }

  @Post('refund')
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin: Process order refund & release inventory' })
  async processRefund(@GetUser('id') adminUserId: string, @Body() dto: ProcessRefundDto) {
    return this.paymentsService.processRefund(dto, adminUserId);
  }
}
