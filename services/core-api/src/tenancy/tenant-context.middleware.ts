import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include tenantId (already declared in jwt-auth.middleware.ts)
// This declaration is for TypeScript type checking

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const tenantHeader = req.headers['x-tenant'] || req.headers['x-tenant-id'];

    let tenantId: string;

    if (user) {
      // Authenticated request
      if (user.role === 'SUPER_ADMIN') {
        // Super admin can override tenant via X-Tenant header
        tenantId = typeof tenantHeader === 'string' ? tenantHeader : user.tenantId;
      } else {
        // Non-super-admin must use their own tenantId from JWT claim
        // They cannot override via X-Tenant header
        if (tenantHeader && typeof tenantHeader === 'string' && tenantHeader !== user.tenantId) {
          throw new ForbiddenException(
            'Cannot access tenant different from your assigned tenant',
          );
        }
        tenantId = user.tenantId;
      }
    } else {
      // Unauthenticated request (public routes) - use header or default
      tenantId = typeof tenantHeader === 'string' ? tenantHeader : 'et-addis';
    }

    // Set tenantId on request object
    req.tenantId = tenantId;

    next();
  }
}

