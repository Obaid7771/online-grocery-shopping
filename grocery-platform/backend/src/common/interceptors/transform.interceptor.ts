import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        // If the service returned pagination or explicit meta, preserve it
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          return {
            success: true,
            statusCode,
            data: result.data,
            meta: result.meta,
          };
        }

        return {
          success: true,
          statusCode,
          data: result,
        };
      }),
    );
  }
}
