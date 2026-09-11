"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const security_1 = require("./common/security");
async function bootstrap() {
    const logger = new common_1.Logger('FreshCart-Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 4000);
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    const corsOrigins = configService
        .get('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001')
        .split(',');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
    }));
    app.use(cookieParser());
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (corsOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            return callback(new Error(`CORS origin not allowed: ${origin}`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalInterceptors(new security_1.SecurityInterceptor());
    if (process.env.NODE_ENV === 'production') {
        app.useGlobalInterceptors(new security_1.AuditLogInterceptor());
    }
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FreshCart Enterprise API')
        .setDescription('Production-grade RESTful API for online grocery shopping and logistics')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    await app.listen(port);
    logger.log(`🚀 FreshCart Backend API running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📚 Swagger Documentation available at: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map