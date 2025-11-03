import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

// Decorator to mark routes that require tenant context
export const RequireTenant = () => SetMetadata('requireTenant', true);

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireTenant = this.reflector.getAllAndOverride<boolean>('requireTenant', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route doesn't explicitly require tenant, allow access
    if (!requireTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Additional validation: check if tenant exists (optional)
    // This can be expanded to verify tenant exists in database

    return true;
  }
}

