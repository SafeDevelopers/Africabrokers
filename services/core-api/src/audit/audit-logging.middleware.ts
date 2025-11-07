import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLoggingMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const method = req.method;
    const path = req.path;
    const user = req.user;
    const tenantId = req.tenantId;

    // Only log admin routes
    const isAdminRoute = path.startsWith('/v1/admin') || path.startsWith('/admin');
    if (!isAdminRoute) {
      return next();
    }

    // Capture response
    const originalSend = res.send;
    let statusCode = 200;
    let responseBody: any = null;

    res.send = function (body: any) {
      statusCode = res.statusCode;
      responseBody = body;
      return originalSend.call(this, body);
    };

    try {
      await next();
    } finally {
      const durationMs = Date.now() - startTime;
      const result = statusCode >= 200 && statusCode < 300 ? 'success' : 'error';

      // Log audit entry
      if (user && tenantId) {
        try {
          await this.prisma.auditLog.create({
            data: {
              tenantId: tenantId,
              actorUserId: user.id,
              entityType: 'API_REQUEST',
              entityId: null,
              action: `${method} ${path}`,
              before: null,
              after: {
                statusCode,
                durationMs,
                result,
              },
              createdAt: new Date(),
            },
          });
        } catch (error) {
          // Don't fail the request if audit logging fails
          console.error('Failed to create audit log:', error);
        }
      }
    }
  }
}

