import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    dailyCount: number;
    dailyResetTime: number;
  };
}

/**
 * Rate limiter for public inquiries endpoint
 * 10 requests per minute, 100 requests per day per IP + tenant
 */
@Injectable()
export class InquiryRateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequestsPerMin = 10;
  private readonly maxRequestsPerDay = 100;
  private readonly dayMs = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Cleanup old entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to POST /v1/public/inquiries
    if (req.method !== 'POST' || !req.path.includes('/public/inquiries')) {
      return next();
    }

    const tenantId = (req as any).tenantId || 'et-addis';
    const clientId = this.getClientId(req, tenantId);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = this.store[clientId];

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
        dailyCount: entry?.dailyCount || 0,
        dailyResetTime: entry?.dailyResetTime || now + this.dayMs,
      };
      
      // Reset daily count if day has passed
      if (now > (entry.dailyResetTime || now + this.dayMs)) {
        entry.dailyCount = 0;
        entry.dailyResetTime = now + this.dayMs;
      }
      
      this.store[clientId] = entry;
    }

    // Increment request counts
    entry.count++;
    entry.dailyCount++;

    // Check if minute limit exceeded
    if (entry.count > this.maxRequestsPerMin) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests per minute. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check if daily limit exceeded
    if (entry.dailyCount > this.maxRequestsPerDay) {
      const retryAfter = Math.ceil((entry.dailyResetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily request limit exceeded. Please try again tomorrow.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit-PerMin', this.maxRequestsPerMin.toString());
    res.setHeader('X-RateLimit-Remaining-PerMin', (this.maxRequestsPerMin - entry.count).toString());
    res.setHeader('X-RateLimit-Limit-PerDay', this.maxRequestsPerDay.toString());
    res.setHeader('X-RateLimit-Remaining-PerDay', (this.maxRequestsPerDay - entry.dailyCount).toString());

    next();
  }

  private getClientId(req: Request, tenantId: string): string {
    // Use IP address + tenant ID for rate limiting
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : req.ip || req.socket.remoteAddress || 'unknown';
    
    return `inquiry:${tenantId}:${ip}`;
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      const entry = this.store[key];
      if (now > entry.resetTime && now > entry.dailyResetTime) {
        delete this.store[key];
      }
    });
  }
}

