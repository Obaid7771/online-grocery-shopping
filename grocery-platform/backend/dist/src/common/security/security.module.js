"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            name: 'short',
                            ttl: config.get('THROTTLE_SHORT_TTL', 1000),
                            limit: config.get('THROTTLE_SHORT_LIMIT', 10),
                        },
                        {
                            name: 'medium',
                            ttl: config.get('THROTTLE_MEDIUM_TTL', 10000),
                            limit: config.get('THROTTLE_MEDIUM_LIMIT', 50),
                        },
                        {
                            name: 'long',
                            ttl: config.get('THROTTLE_LONG_TTL', 60000),
                            limit: config.get('THROTTLE_LONG_LIMIT', 200),
                        },
                    ],
                }),
            }),
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
        exports: [throttler_1.ThrottlerModule],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map