import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

// Decorator to specify required roles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      // In development, allow requests without auth for testing
      // In production, require authentication
      if (process.env.NODE_ENV === 'production') {
        throw new ForbiddenException('User not authenticated');
      }
      // In development, allow access but log a warning
      console.warn('⚠️  Development mode: Allowing request without authentication');
      return true;
    }

    // Super admin has access to everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // For admin routes, check for 'admin' role (normalized from TENANT_ADMIN/AGENT)
    // Also allow original roles for backward compatibility
    const normalizedRole = user.role === 'admin' ? 'admin' : user.role;
    const allowedRoles = requiredRoles.map(r => {
      // Map TENANT_ADMIN and AGENT to 'admin' for comparison
      if (r === 'TENANT_ADMIN' || r === 'AGENT') {
        return ['admin', 'TENANT_ADMIN', 'AGENT'];
      }
      return [r];
    }).flat();

    // Check if user has required role
    if (!allowedRoles.includes(normalizedRole) && !allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}

