import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

// Global storage for request context (for Prisma extension)
// This uses AsyncLocalStorage for request-scoped context
export class ReqContext {
  static tenantId: string | null = null;
  static userId: string | null = null;
  static userRole: string | null = null;
}

@Injectable()
export class ReqScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Set global context for Prisma extension
    ReqContext.tenantId = request.tenantId || null;
    ReqContext.userId = request.user?.id || null;
    ReqContext.userRole = request.user?.role || null;

    return next.handle();
  }
}

