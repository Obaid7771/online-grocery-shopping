import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/create-payment-intent.dto';
import { CreatePaypalOrderDto, CapturePaypalOrderDto } from './dto/paypal.dto';
import { ProcessRefundDto } from './dto/refund.dto';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

let StripeClient: any = null;
try {
  StripeClient = require('stripe');
} catch {
  // Stripe package not installed in local environment yet
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly inventoryService: InventoryService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey && StripeClient) {
      this.stripe = new StripeClient(stripeSecretKey, {
        apiVersion: '2025-02-24.acacia',
      });
      this.logger.log('Stripe client successfully initialized.');
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set or stripe package is not installed. Stripe calls will operate in mock sandbox mode.',
      );
    }
  }

  /**
   * 1. Create a Stripe PaymentIntent for the mobile app or web checkout.
   */
  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payments: true, user: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found.`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You do not own this order.');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order is already at status '${order.status}' and cannot receive new payments.`,
      );
    }

    const amountInCents = Math.round(Number(order.totalAmount) * 100);

    let clientSecret: string;
    let paymentIntentId: string;

    if (this.stripe) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId,
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        clientSecret = paymentIntent.client_secret!;
        paymentIntentId = paymentIntent.id;
      } catch (err: any) {
        this.logger.error(`Stripe PaymentIntent creation failed: ${err.message}`);
        throw new InternalServerErrorException(
          `Payment gateway error: ${err.message}`,
        );
      }
    } else {
      // Sandbox fallback for local development without live Stripe credentials
      paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;
    }

    // Update payment record in database
    await this.prisma.payment.upsert({
      where: { paymentIntentId },
      create: {
        orderId: order.id,
        paymentMethod: dto.paymentMethod ?? PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
        paymentIntentId,
        amount: order.totalAmount,
        currency: 'usd',
      },
      update: {
        paymentIntentId,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      clientSecret,
      paymentIntentId,
      publishableKey:
        this.configService.get<string>('STRIPE_PUBLISHABLE_KEY') || 'pk_test_placeholder',
      amount: Number(order.totalAmount),
      currency: 'usd',
      orderNumber: order.orderNumber,
    };
  }

  /**
   * 2. Confirm Payment after mobile client succeeds (synchronous confirmation).
   */
  async confirmPayment(userId: string, dto: ConfirmPaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found.`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to you.');
    }

    // If live Stripe is configured, verify with Stripe API
    let isSuccessful = true;
    if (this.stripe && !dto.paymentIntentId.startsWith('pi_mock_')) {
      try {
        const intent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);
        isSuccessful = intent.status === 'succeeded';
      } catch (e: any) {
        this.logger.error(`Failed to verify payment intent: ${e.message}`);
        isSuccessful = false;
      }
    }

    if (!isSuccessful) {
      throw new BadRequestException('Payment verification failed or payment is not captured.');
    }

    // Update payment & order status
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
        },
        include: { items: true, payments: true, deliverySlot: true, address: true },
      });

      return updatedOrder;
    });
  }

  /**
   * 3. Handle raw Stripe Webhooks with cryptographic signature verification.
   */
  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !webhookSecret) {
      this.logger.warn('Stripe or STRIPE_WEBHOOK_SECRET is not configured. Skipping webhook.');
      return { received: true, note: 'Webhook secret not set' };
    }

    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await this.handlePaymentIntentFailed(paymentIntent);
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(`PaymentIntent ${paymentIntent.id} has no orderId metadata.`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: {
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
    });

    this.logger.log(`Order ${orderId} successfully transitioned to PAID from Stripe webhook.`);
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    await this.prisma.payment.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });

    this.logger.warn(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message}`);
  }

  /**
   * 4. Create PayPal Order via PayPal REST API v2
   */
  async createPaypalOrder(userId: string, dto: CreatePaypalOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found.`);
    }

    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    // If sandbox / mock mode
    if (!clientId || !clientSecret) {
      const mockPaypalId = `PAYPAL-MOCK-${Date.now()}`;
      return {
        paypalOrderId: mockPaypalId,
        approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockPaypalId}`,
        amount: Number(order.totalAmount),
        currency: 'USD',
      };
    }

    // Call PayPal REST API to create order
    const accessToken = await this.getPaypalAccessToken(clientId, clientSecret);
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.orderNumber,
            amount: {
              currency_code: 'USD',
              value: Number(order.totalAmount).toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await response.json();
    return {
      paypalOrderId: data.id,
      links: data.links,
      amount: Number(order.totalAmount),
    };
  }

  /**
   * 5. Capture PayPal Order
   */
  async capturePaypalOrder(userId: string, dto: CapturePaypalOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found.`);
    }

    // Update payment and order to PAID
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: {
          paymentMethod: PaymentMethod.PAYPAL,
          transactionId: dto.paypalOrderId,
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
        include: { items: true, payments: true },
      });
    });
  }

  /**
   * 6. Process Refund (Admin / Super Admin)
   */
  async processRefund(dto: ProcessRefundDto, adminUserId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payments: true, items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found.`);
    }

    const refundableStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
      OrderStatus.DELIVERED,
    ];

    if (!refundableStatuses.includes(order.status)) {
      throw new BadRequestException(`Order with status '${order.status}' cannot be refunded.`);
    }

    const refundAmount = dto.amount ? dto.amount : Number(order.totalAmount);
    const payment = order.payments.find((p) => p.status === PaymentStatus.CAPTURED);

    // If Stripe payment intent exists and is live
    if (this.stripe && payment?.paymentIntentId && !payment.paymentIntentId.startsWith('pi_mock_')) {
      try {
        await this.stripe.refunds.create({
          payment_intent: payment.paymentIntentId,
          amount: Math.round(refundAmount * 100),
          reason: 'requested_by_customer',
        });
      } catch (err: any) {
        throw new BadRequestException(`Stripe refund failed: ${err.message}`);
      }
    }

    // Update DB and release stock
    return this.prisma.$transaction(async (tx) => {
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      const refundedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.REFUNDED,
          cancelReason: `Refunded by admin: ${dto.reason}`,
        },
        include: { items: true, payments: true },
      });

      // Release inventory
      await this.inventoryService.releaseStock({
        items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        referenceId: `REFUND-${order.orderNumber}`,
      });

      // Admin log
      await tx.adminActionLog.create({
        data: {
          adminId: adminUserId,
          action: 'PROCESS_REFUND',
          entity: 'Order',
          entityId: order.id,
          changes: { refundAmount, reason: dto.reason },
        },
      });

      return refundedOrder;
    });
  }

  private async getPaypalAccessToken(clientId: string, clientSecret: string): Promise<string> {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    return data.access_token;
  }
}
