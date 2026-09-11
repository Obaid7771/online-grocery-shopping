"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const inventory_service_1 = require("../inventory/inventory.service");
const client_1 = require("@prisma/client");
let StripeClient = null;
try {
    StripeClient = require('stripe');
}
catch {
}
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, configService, inventoryService) {
        this.prisma = prisma;
        this.configService = configService;
        this.inventoryService = inventoryService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.stripe = null;
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (stripeSecretKey && StripeClient) {
            this.stripe = new StripeClient(stripeSecretKey, {
                apiVersion: '2025-02-24.acacia',
            });
            this.logger.log('Stripe client successfully initialized.');
        }
        else {
            this.logger.warn('STRIPE_SECRET_KEY is not set or stripe package is not installed. Stripe calls will operate in mock sandbox mode.');
        }
    }
    async createPaymentIntent(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payments: true, user: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found.`);
        }
        if (order.userId !== userId) {
            throw new common_1.BadRequestException('You do not own this order.');
        }
        if (order.status !== client_1.OrderStatus.PENDING_PAYMENT) {
            throw new common_1.BadRequestException(`Order is already at status '${order.status}' and cannot receive new payments.`);
        }
        const amountInCents = Math.round(Number(order.totalAmount) * 100);
        let clientSecret;
        let paymentIntentId;
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
                clientSecret = paymentIntent.client_secret;
                paymentIntentId = paymentIntent.id;
            }
            catch (err) {
                this.logger.error(`Stripe PaymentIntent creation failed: ${err.message}`);
                throw new common_1.InternalServerErrorException(`Payment gateway error: ${err.message}`);
            }
        }
        else {
            paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;
        }
        await this.prisma.payment.upsert({
            where: { paymentIntentId },
            create: {
                orderId: order.id,
                paymentMethod: dto.paymentMethod ?? client_1.PaymentMethod.STRIPE,
                status: client_1.PaymentStatus.PENDING,
                paymentIntentId,
                amount: order.totalAmount,
                currency: 'usd',
            },
            update: {
                paymentIntentId,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        return {
            clientSecret,
            paymentIntentId,
            publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY') || 'pk_test_placeholder',
            amount: Number(order.totalAmount),
            currency: 'usd',
            orderNumber: order.orderNumber,
        };
    }
    async confirmPayment(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payments: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found.`);
        }
        if (order.userId !== userId) {
            throw new common_1.BadRequestException('Order does not belong to you.');
        }
        let isSuccessful = true;
        if (this.stripe && !dto.paymentIntentId.startsWith('pi_mock_')) {
            try {
                const intent = await this.stripe.paymentIntents.retrieve(dto.paymentIntentId);
                isSuccessful = intent.status === 'succeeded';
            }
            catch (e) {
                this.logger.error(`Failed to verify payment intent: ${e.message}`);
                isSuccessful = false;
            }
        }
        if (!isSuccessful) {
            throw new common_1.BadRequestException('Payment verification failed or payment is not captured.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.payment.updateMany({
                where: { orderId: order.id },
                data: {
                    status: client_1.PaymentStatus.CAPTURED,
                    paidAt: new Date(),
                },
            });
            const updatedOrder = await tx.order.update({
                where: { id: order.id },
                data: {
                    status: client_1.OrderStatus.PAID,
                },
                include: { items: true, payments: true, deliverySlot: true, address: true },
            });
            return updatedOrder;
        });
    }
    async handleStripeWebhook(rawBody, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!this.stripe || !webhookSecret) {
            this.logger.warn('Stripe or STRIPE_WEBHOOK_SECRET is not configured. Skipping webhook.');
            return { received: true, note: 'Webhook secret not set' };
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
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
    async handlePaymentIntentSucceeded(paymentIntent) {
        const orderId = paymentIntent.metadata?.orderId;
        if (!orderId) {
            this.logger.warn(`PaymentIntent ${paymentIntent.id} has no orderId metadata.`);
            return;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.updateMany({
                where: { paymentIntentId: paymentIntent.id },
                data: {
                    status: client_1.PaymentStatus.CAPTURED,
                    paidAt: new Date(),
                },
            });
            await tx.order.update({
                where: { id: orderId },
                data: { status: client_1.OrderStatus.PAID },
            });
        });
        this.logger.log(`Order ${orderId} successfully transitioned to PAID from Stripe webhook.`);
    }
    async handlePaymentIntentFailed(paymentIntent) {
        const orderId = paymentIntent.metadata?.orderId;
        if (!orderId)
            return;
        await this.prisma.payment.updateMany({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                status: client_1.PaymentStatus.FAILED,
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
            },
        });
        this.logger.warn(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message}`);
    }
    async createPaypalOrder(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payments: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found.`);
        }
        const clientId = this.configService.get('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
            const mockPaypalId = `PAYPAL-MOCK-${Date.now()}`;
            return {
                paypalOrderId: mockPaypalId,
                approveUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${mockPaypalId}`,
                amount: Number(order.totalAmount),
                currency: 'USD',
            };
        }
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
    async capturePaypalOrder(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payments: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found.`);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.payment.updateMany({
                where: { orderId: order.id },
                data: {
                    paymentMethod: client_1.PaymentMethod.PAYPAL,
                    transactionId: dto.paypalOrderId,
                    status: client_1.PaymentStatus.CAPTURED,
                    paidAt: new Date(),
                },
            });
            return tx.order.update({
                where: { id: order.id },
                data: { status: client_1.OrderStatus.PAID },
                include: { items: true, payments: true },
            });
        });
    }
    async processRefund(dto, adminUserId) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { payments: true, items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order '${dto.orderId}' not found.`);
        }
        const refundableStatuses = [
            client_1.OrderStatus.PAID,
            client_1.OrderStatus.CONFIRMED,
            client_1.OrderStatus.DELIVERED,
        ];
        if (!refundableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Order with status '${order.status}' cannot be refunded.`);
        }
        const refundAmount = dto.amount ? dto.amount : Number(order.totalAmount);
        const payment = order.payments.find((p) => p.status === client_1.PaymentStatus.CAPTURED);
        if (this.stripe && payment?.paymentIntentId && !payment.paymentIntentId.startsWith('pi_mock_')) {
            try {
                await this.stripe.refunds.create({
                    payment_intent: payment.paymentIntentId,
                    amount: Math.round(refundAmount * 100),
                    reason: 'requested_by_customer',
                });
            }
            catch (err) {
                throw new common_1.BadRequestException(`Stripe refund failed: ${err.message}`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            if (payment) {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: client_1.PaymentStatus.REFUNDED },
                });
            }
            const refundedOrder = await tx.order.update({
                where: { id: order.id },
                data: {
                    status: client_1.OrderStatus.REFUNDED,
                    cancelReason: `Refunded by admin: ${dto.reason}`,
                },
                include: { items: true, payments: true },
            });
            await this.inventoryService.releaseStock({
                items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                referenceId: `REFUND-${order.orderNumber}`,
            });
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
    async getPaypalAccessToken(clientId, clientSecret) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        inventory_service_1.InventoryService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map