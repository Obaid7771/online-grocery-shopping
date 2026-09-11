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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuerySlotsAdminDto = exports.UpdateDeliverySlotDto = exports.CreateDeliverySlotsDto = exports.UpdateDeliveryZoneDto = exports.CreateDeliveryZoneDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateDeliveryZoneDto {
}
exports.CreateDeliveryZoneDto = CreateDeliveryZoneDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Downtown' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDeliveryZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['10001', '10002', '10003'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDeliveryZoneDto.prototype, "postalCodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.99 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryZoneDto.prototype, "baseFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 15.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryZoneDto.prototype, "minOrderAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDeliveryZoneDto.prototype, "freeDeliveryThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 45 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateDeliveryZoneDto.prototype, "estimatedMinutes", void 0);
class UpdateDeliveryZoneDto {
}
exports.UpdateDeliveryZoneDto = UpdateDeliveryZoneDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeliveryZoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateDeliveryZoneDto.prototype, "postalCodes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliveryZoneDto.prototype, "baseFee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateDeliveryZoneDto.prototype, "minOrderAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateDeliveryZoneDto.prototype, "freeDeliveryThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateDeliveryZoneDto.prototype, "estimatedMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeliveryZoneDto.prototype, "isActive", void 0);
class TimeSlotDefinition {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TimeSlotDefinition.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '11:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TimeSlotDefinition.prototype, "endTime", void 0);
class CreateDeliverySlotsDto {
}
exports.CreateDeliverySlotsDto = CreateDeliverySlotsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDeliverySlotsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-21' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDeliverySlotsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [TimeSlotDefinition],
        example: [
            { startTime: '09:00', endTime: '11:00' },
            { startTime: '11:00', endTime: '13:00' },
            { startTime: '13:00', endTime: '15:00' },
            { startTime: '15:00', endTime: '17:00' },
            { startTime: '17:00', endTime: '19:00' },
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TimeSlotDefinition),
    __metadata("design:type", Array)
], CreateDeliverySlotsDto.prototype, "timeSlots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateDeliverySlotsDto.prototype, "maxCapacity", void 0);
class UpdateDeliverySlotDto {
}
exports.UpdateDeliverySlotDto = UpdateDeliverySlotDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateDeliverySlotDto.prototype, "maxCapacity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeliverySlotDto.prototype, "isActive", void 0);
class QuerySlotsAdminDto {
}
exports.QuerySlotsAdminDto = QuerySlotsAdminDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-01' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuerySlotsAdminDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-31' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuerySlotsAdminDto.prototype, "endDate", void 0);
//# sourceMappingURL=admin-delivery.dto.js.map