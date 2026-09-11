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
exports.AdjustStockDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class AdjustStockDto {
}
exports.AdjustStockDto = AdjustStockDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'Valid product UUID is required' }),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Quantity change must be an integer' }),
    (0, class_validator_1.NotEquals)(0, { message: 'Quantity change cannot be zero' }),
    __metadata("design:type", Number)
], AdjustStockDto.prototype, "quantityChanged", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.InventoryChangeType, { message: 'Invalid inventory change type' }),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "changeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Reason for inventory adjustment is required' }),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustStockDto.prototype, "referenceId", void 0);
//# sourceMappingURL=adjust-stock.dto.js.map