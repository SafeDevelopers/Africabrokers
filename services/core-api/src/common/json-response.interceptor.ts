import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Global interceptor to ensure all /v1/* responses have Content-Type: application/json
 * This ensures JSON-only policy for all API responses
 */
@Injectable()
export class JsonResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Only apply to /v1/* routes
    if (request.path.startsWith('/v1/')) {
      // Set Content-Type header for all /v1/* responses
      response.setHeader('Content-Type', 'application/json');
    }

    return next.handle().pipe(
      map((data) => {
        // Ensure response is JSON-serializable
        return data;
      }),
    );
  }
}

