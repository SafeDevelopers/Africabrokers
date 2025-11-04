import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

/**
 * Decorator to mark routes that require IDOR protection
 * Automatically validates that resources belong to the user's tenant
 */
export const RequireIdorProtection = (entityType: string) =>
  SetMetadata('idorProtection', entityType);

@Injectable()
export class IdorGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const entityType = this.reflector.get<string>('idorProtection', context.getHandler());

    // If no IDOR protection required, allow access
    if (!entityType) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userRole = ReqContext.userRole;
    const tenantId = ReqContext.tenantId;

    // SUPER_ADMIN bypasses IDOR checks (can access all tenants)
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    // For tenant admins/agents, verify resource belongs to their tenant
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Get resource ID from route params
    const resourceId = request.params?.id || request.params?.entityId;

    if (!resourceId) {
      // No resource ID in path, allow (list operations are handled by Prisma extension)
      return true;
    }

    // Verify resource belongs to tenant
    const resource = await this.verifyResourceTenant(entityType, resourceId, tenantId);

    if (!resource) {
      throw new ForbiddenException(`Resource not found or does not belong to your tenant`);
    }

    return true;
  }

  private async verifyResourceTenant(
    entityType: string,
    resourceId: string,
    tenantId: string,
  ): Promise<boolean> {
    try {
      // Map entity types to Prisma models
      const modelMap: Record<string, string> = {
        QrCode: 'qrCode',
        Listing: 'listing',
        BrokerApplication: 'brokerApplication',
        License: 'license',
        User: 'user',
        AgentOffice: 'agentOffice',
        Inspection: 'inspection',
        Broker: 'broker',
        Inquiry: 'inquiry',
      };

      const modelName = modelMap[entityType];
      if (!modelName) {
        // Unknown entity type, skip verification
        return true;
      }

      // Check if resource exists and belongs to tenant
      // The Prisma extension will automatically filter by tenantId,
      // so if it returns null, the resource either doesn't exist or doesn't belong to tenant
      const resource = await (this.prisma as any)[modelName].findUnique({
        where: { id: resourceId },
        select: { id: true, tenantId: true },
      });

      return resource !== null && resource.tenantId === tenantId;
    } catch (error) {
      // If verification fails, deny access
      console.error('IDOR verification failed:', error);
      return false;
    }
  }
}
