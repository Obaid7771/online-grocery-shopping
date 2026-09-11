"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrictSanitizePipe = exports.SanitizePipe = void 0;
const common_1 = require("@nestjs/common");
let SanitizePipe = class SanitizePipe {
    transform(value, metadata) {
        if (typeof value !== 'object' || value === null) {
            return this.sanitizeValue(value);
        }
        return this.sanitizeObject(value);
    }
    sanitizeObject(obj) {
        const sanitized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    sanitized[key] = this.sanitizeObject(value);
                }
                else if (Array.isArray(value)) {
                    sanitized[key] = value.map((item) => typeof item === 'object' && item !== null
                        ? this.sanitizeObject(item)
                        : this.sanitizeValue(item));
                }
                else {
                    sanitized[key] = this.sanitizeValue(value);
                }
            }
        }
        return sanitized;
    }
    sanitizeValue(value) {
        if (typeof value !== 'string') {
            return value;
        }
        let sanitized = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        sanitized = sanitized.trim();
        return sanitized;
    }
};
exports.SanitizePipe = SanitizePipe;
exports.SanitizePipe = SanitizePipe = __decorate([
    (0, common_1.Injectable)()
], SanitizePipe);
let StrictSanitizePipe = class StrictSanitizePipe {
    transform(value, metadata) {
        if (typeof value !== 'object' || value === null) {
            return this.sanitizeValue(value);
        }
        return this.sanitizeObject(value);
    }
    sanitizeObject(obj) {
        const sanitized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    sanitized[key] = this.sanitizeObject(value);
                }
                else if (Array.isArray(value)) {
                    sanitized[key] = value.map((item) => typeof item === 'object' && item !== null
                        ? this.sanitizeObject(item)
                        : this.sanitizeValue(item));
                }
                else {
                    sanitized[key] = this.sanitizeValue(value);
                }
            }
        }
        return sanitized;
    }
    sanitizeValue(value) {
        if (typeof value !== 'string') {
            return value;
        }
        let sanitized = value.replace(/<[^>]*>/g, '');
        sanitized = sanitized
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+=/gi, '');
        sanitized = sanitized.trim().replace(/\s+/g, ' ');
        return sanitized;
    }
};
exports.StrictSanitizePipe = StrictSanitizePipe;
exports.StrictSanitizePipe = StrictSanitizePipe = __decorate([
    (0, common_1.Injectable)()
], StrictSanitizePipe);
//# sourceMappingURL=sanitize.pipe.js.map