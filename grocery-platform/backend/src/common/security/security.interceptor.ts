import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SecurityInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Add security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );

    // Remove server identification headers
    response.removeHeader('X-Powered-By');

    // Log suspicious activity
    const suspiciousPatterns = [
      /(<script|javascript:|data:)/i,
      /(union\s+select|insert\s+into|drop\s+table)/i,
      /(\.\.\/|\.\.\\)/,
    ];

    const bodyStr = JSON.stringify(request.body);
    const queryStr = JSON.stringify(request.query);
    const paramsStr = JSON.stringify(request.params);

    for (const pattern of suspiciousPatterns) {
      if (
        pattern.test(bodyStr) ||
        pattern.test(queryStr) ||
        pattern.test(paramsStr)
      ) {
        this.logger.warn(
          `Suspicious request detected - IP: ${request.ip}, Path: ${request.path}, Method: ${request.method}`,
        );
        break;
      }
    }

    return next.handle();
  }
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Only log write operations
    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!writeMethods.includes(request.method)) {
      return next.handle();
    }

    const user = (request as any).user;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            JSON.stringify({
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
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            JSON.stringify({
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
            }),
          );
        },
      }),
    );
  }
}
