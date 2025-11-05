import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Guard to check if 2FA is enabled and verified
 * For now, we'll check if the user has 2FA enabled (placeholder)
 * In production, this would check actual 2FA verification status
 */
@Injectable()
export class TwoFactorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // TODO: Implement actual 2FA check
    // For now, we'll assume 2FA is required for SUPER_ADMIN
    // In production, check user.twoFactorEnabled and user.twoFactorVerified
    if (user.role === 'SUPER_ADMIN') {
      // Placeholder: Check if 2FA is enabled (would check user.twoFactorEnabled)
      // For now, we'll allow access if user exists
      return true;
    }

    return true;
  }
}

/**
 * Guard to check IP allowlist (optional)
 * Reads from environment variable SUPER_ADMIN_IP_ALLOWLIST
 */
@Injectable()
export class IpAllowlistGuard implements CanActivate {
  private allowedIPs: string[] = [];

  constructor(private configService: ConfigService) {
    const allowlist = this.configService.get<string>('SUPER_ADMIN_IP_ALLOWLIST');
    if (allowlist) {
      this.allowedIPs = allowlist.split(',').map(ip => ip.trim()).filter(Boolean);
    }
  }

  canActivate(context: ExecutionContext): boolean {
    // If no allowlist is configured, allow all IPs
    if (this.allowedIPs.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const forwarded = request.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : request.ip || request.socket.remoteAddress || 'unknown';

    // Check if IP is in allowlist
    const isAllowed = this.allowedIPs.some(allowedIP => {
      // Support exact match and CIDR notation (basic check)
      if (allowedIP.includes('/')) {
        // TODO: Implement CIDR notation check
        return ip.startsWith(allowedIP.split('/')[0]);
      }
      return ip === allowedIP;
    });

    if (!isAllowed) {
      throw new ForbiddenException('IP address not allowed');
    }

    return true;
  }
}

