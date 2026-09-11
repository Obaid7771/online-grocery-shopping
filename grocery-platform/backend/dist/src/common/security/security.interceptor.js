"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogInterceptor = exports.SecurityInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let SecurityInterceptor = class SecurityInterceptor {
    constructor() {
        this.logger = new common_1.Logger('SecurityInterceptor');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        response.removeHeader('X-Powered-By');
        const suspiciousPatterns = [
            /(<script|javascript:|data:)/i,
            /(union\s+select|insert\s+into|drop\s+table)/i,
            /(\.\.\/|\.\.\\)/,
        ];
        const bodyStr = JSON.stringify(request.body);
        const queryStr = JSON.stringify(request.query);
        const paramsStr = JSON.stringify(request.params);
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(bodyStr) ||
                pattern.test(queryStr) ||
                pattern.test(paramsStr)) {
                this.logger.warn(`Suspicious request detected - IP: ${request.ip}, Path: ${request.path}, Method: ${request.method}`);
                break;
            }
        }
        return next.handle();
    }
};
exports.SecurityInterceptor = SecurityInterceptor;
exports.SecurityInterceptor = SecurityInterceptor = __decorate([
    (0, common_1.Injectable)()
], SecurityInterceptor);
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor() {
        this.logger = new common_1.Logger('AuditLog');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
        const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (!writeMethods.includes(request.method)) {
            return next.handle();
        }
        const user = request.user;
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                this.logger.log(JSON.stringify({
                    type: 'AUDIT',
                    timestamp: new Date().toISOString(),
                    userId: user?.sub || 'anonymous',
                    email: user?.email || 'unknown',
                    role: user?.role || 'unknown',
                    method: request.method,
                    path: request.path,
                    ip: request.ip,
                    userAgent: request.get('user-agent'),
                    duration: `${duration}ms`,
                    status: 'SUCCESS',
                }));
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.warn(JSON.stringify({
                    type: 'AUDIT',
                    timestamp: new Date().toISOString(),
                    userId: user?.sub || 'anonymous',
                    email: user?.email || 'unknown',
                    role: user?.role || 'unknown',
                    method: request.method,
                    path: request.path,
                    ip: request.ip,
                    userAgent: request.get('user-agent'),
                    duration: `${duration}ms`,
                    status: 'ERROR',
                    errorMessage: error.message,
                }));
            },
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)()
], AuditLogInterceptor);
//# sourceMappingURL=security.interceptor.js.map