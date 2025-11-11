import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        tenantId: string;
      };
    }
  }
}

interface JwtPayload {
  sub: string; // user ID
  role: string;
  tenant?: string; // tenant slug (for admin users)
  tenantId?: string; // tenant ID (for backward compatibility)
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip auth for public routes
    const publicRoutes = ['/health', '/healthz', '/readiness', '/auth/callback', '/auth/password-reset', '/auth/login'];
    if (publicRoutes.some(route => req.path.startsWith(`/v1${route}`) || req.path.startsWith(route))) {
      return next();
    }

    // Extract token from Authorization header
    // Return JSON error (401) for unauthenticated requests (per RBAC-MATRIX.md)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, allow requests without auth but mark them
      if (process.env.NODE_ENV !== 'production') {
        req.user = undefined;
        return next();
      }
      // Return JSON error (401) for unauthenticated requests
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
      const jwtIssuer = process.env.JWT_ISSUER;
      const jwtAudience = process.env.JWT_AUDIENCE;
      
      // Build verification options
      const verifyOptions: jwt.VerifyOptions = {};
      if (jwtIssuer) {
        verifyOptions.issuer = jwtIssuer;
      }
      if (jwtAudience) {
        verifyOptions.audience = jwtAudience;
      }
      
      const decoded = jwt.verify(token, jwtSecret, verifyOptions) as JwtPayload;

      // For admin routes, assert role === 'admin'
      // Return JSON error (403) for forbidden requests (per RBAC-MATRIX.md)
      const isAdminRoute = req.path.startsWith('/v1/admin') || req.path.startsWith('/admin');
      if (isAdminRoute && decoded.role !== 'admin') {
        throw new ForbiddenException('Admin role required for this route');
      }

      // Map tenant slug to tenantId if needed
      let tenantId: string | null = null;
      
      if (decoded.tenant) {
        // Admin user with tenant slug - map to tenantId
        const tenant = await this.prisma.tenant.findUnique({
          where: { slug: decoded.tenant },
          select: { id: true },
        });
        
        if (!tenant) {
          throw new ForbiddenException(`Invalid tenant slug: ${decoded.tenant}`);
        }
        
        tenantId = tenant.id;
      } else if (decoded.tenantId) {
        // Backward compatibility: use tenantId directly
        tenantId = decoded.tenantId;
      }

      // Attach user info to request
      req.user = {
        id: decoded.sub,
        role: decoded.role,
        tenantId: tenantId || '',
      };

      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
}

