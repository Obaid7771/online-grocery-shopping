import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import { SecurityInterceptor, AuditLogInterceptor } from './common/security';

async function bootstrap() {
  const logger = new Logger('FreshCart-Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 4000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001')
    .split(',');

  // 1. Security Headers (Helmet)
  app.use(
    helmet({
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
    }),
  );

  // 2. Cookie Parser for secure JWT refresh tokens in Admin Web
  app.use(cookieParser());

  // 3. CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      if (corsOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 4. Serve static uploads for development
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 5. Global API Prefix
  app.setGlobalPrefix(apiPrefix);

  // 5. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5.1 Global Security Interceptors
  app.useGlobalInterceptors(new SecurityInterceptor());
  if (process.env.NODE_ENV === 'production') {
    app.useGlobalInterceptors(new AuditLogInterceptor());
  }

  // 6. OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('FreshCart Enterprise API')
    .setDescription('Production-grade RESTful API for online grocery shopping and logistics')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // 7. Start HTTP Server
  await app.listen(port);
  logger.log(`🚀 FreshCart Backend API running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger Documentation available at: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
