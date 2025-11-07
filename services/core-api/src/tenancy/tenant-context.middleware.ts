import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant context for public auth routes
    const publicAuthRoutes = ['/auth/login', '/auth/callback', '/health', '/healthz', '/readiness'];
    if (publicAuthRoutes.some(route => req.path.startsWith(`/v1${route}`) || req.path.startsWith(route))) {
      return next();
    }

    const user = req.user;
    const tenantHeader = req.headers['x-tenant'] || req.headers['x-tenant-id'];

    let tenantId: string;

    if (user) {
      // Authenticated request
      if (user.role === 'SUPER_ADMIN') {
        // Super admin can override tenant via X-Tenant header
        tenantId = typeof tenantHeader === 'string' ? tenantHeader : user.tenantId;
      } else {
        // Non-super-admin: X-Tenant header is required and must match JWT tenantId
        // Enforce X-Tenant header for non-super-admin requests
        if (!tenantHeader || typeof tenantHeader !== 'string') {
          throw new ForbiddenException(
            'X-Tenant header is required for this request',
          );
        }
        // Ensure X-Tenant header matches user's tenantId from JWT
        if (tenantHeader !== user.tenantId) {
          throw new ForbiddenException(
            'X-Tenant header must match your assigned tenant',
          );
        }
        tenantId = user.tenantId;
      }
    } else {
      // Unauthenticated request (public routes) - X-Tenant header is required
      if (!tenantHeader || typeof tenantHeader !== 'string') {
        throw new ForbiddenException(
          'X-Tenant header is required for this request',
        );
      }
      tenantId = tenantHeader;
    }

    // Set tenantId on request object
    req.tenantId = tenantId;

    next();
  }
}
