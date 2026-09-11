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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const paypal_dto_1 = require("./dto/paypal.dto");
const refund_dto_1 = require("./dto/refund.dto");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createIntent(userId, dto) {
        return this.paymentsService.createPaymentIntent(userId, dto);
    }
    async confirmPayment(userId, dto) {
        return this.paymentsService.confirmPayment(userId, dto);
    }
    async createPaypalOrder(userId, dto) {
        return this.paymentsService.createPaypalOrder(userId, dto);
    }
    async capturePaypalOrder(userId, dto) {
        return this.paymentsService.capturePaypalOrder(userId, dto);
    }
    async handleStripeWebhook(req, signature) {
        const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
        return this.paymentsService.handleStripeWebhook(rawBody, signature);
    }
    async processRefund(adminUserId, dto) {
        return this.paymentsService.processRefund(dto, adminUserId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Stripe PaymentIntent for an order' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm order payment status after client payment completes' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_intent_dto_1.ConfirmPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Post)('paypal/create'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate PayPal checkout order' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, paypal_dto_1.CreatePaypalOrderDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaypalOrder", null);
__decorate([
    (0, common_1.Post)('paypal/capture'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Capture PayPal order payment' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, paypal_dto_1.CapturePaypalOrderDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "capturePaypalOrder", null);
__decorate([
    (0, common_1.Post)('webhook/stripe'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Stripe Webhook handler with signature verification' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleStripeWebhook", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Process order refund & release inventory' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, refund_dto_1.ProcessRefundDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processRefund", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map