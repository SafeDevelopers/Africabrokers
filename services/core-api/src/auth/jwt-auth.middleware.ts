import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

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
  tenantId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip auth for public routes
    const publicRoutes = ['/health', '/auth/callback'];
    if (publicRoutes.some(route => req.path.startsWith(`/v1${route}`) || req.path.startsWith(route))) {
      return next();
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, allow requests without auth but mark them
      if (process.env.NODE_ENV !== 'production') {
        req.user = undefined;
        return next();
      }
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify JWT token
      // In production, use a proper JWT secret from environment
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // Attach user info to request
      req.user = {
        id: decoded.sub,
        role: decoded.role,
        tenantId: decoded.tenantId,
      };

      next();
    } catch (error) {
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

