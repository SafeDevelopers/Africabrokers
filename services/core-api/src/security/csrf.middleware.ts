import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes, createHmac } from 'crypto';

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing operations (POST, PUT, PATCH, DELETE)
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly secret: string;

  constructor() {
    // In production, use a strong secret from environment
    this.secret = process.env.CSRF_SECRET || 'change-me-in-production';
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply CSRF protection to state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Skip CSRF for public routes
    const publicRoutes = ['/health', '/auth/callback', '/auth/password-reset', '/auth/login', '/verify'];
    if (publicRoutes.some(route => req.path.startsWith(`/v1${route}`) || req.path.startsWith(route))) {
      return next();
    }

    // Only protect admin routes
    if (!req.path.startsWith('/v1/admin') && !req.path.startsWith('/v1/superadmin')) {
      return next();
    }

    // Get CSRF token from header
    const token = req.headers['x-csrf-token'] || req.headers['csrf-token'];
    
    if (!token || typeof token !== 'string') {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'CSRF token missing',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Get session token from cookie
    const sessionToken = this.getSessionToken(req);

    if (!sessionToken) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Session token missing',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Verify CSRF token
    const expectedToken = this.generateToken(sessionToken);
    
    if (!this.secureCompare(token, expectedToken)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Invalid CSRF token',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    next();
  }

  private getSessionToken(req: Request): string | null {
    // Get session token from cookies
    const cookies = req.headers.cookie;
    if (!cookies) return null;

    const cookieMap = cookies.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    return cookieMap['afribrok-session'] || 
           cookieMap['session'] || 
           cookieMap['afribrok-token'] ||
           null;
  }

  private generateToken(sessionToken: string): string {
    const hmac = createHmac('sha256', this.secret);
    hmac.update(sessionToken);
    return hmac.digest('hex');
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Generate a CSRF token for a session (to be used by frontend)
   */
  static generateCsrfToken(sessionToken: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(sessionToken);
    return hmac.digest('hex');
  }
}

