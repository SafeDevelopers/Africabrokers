import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  before?: any;
  after?: any;
  notes?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an action, especially for SUPER_ADMIN actions that affect tenants
   */
  async log(entry: AuditLogEntry): Promise<void> {
    const tenantId = ReqContext.tenantId;
    const userId = ReqContext.userId;
    const userRole = ReqContext.userRole;

    // Skip logging if no context
    if (!userId || !tenantId) {
      return;
    }

    // Always log SUPER_ADMIN actions
    // Also log significant tenant admin actions
    if (userRole === 'SUPER_ADMIN' || userRole === 'TENANT_ADMIN') {
      try {
        await this.prisma.auditLog.create({
          data: {
            tenantId: tenantId,
            actorUserId: userId,
            entityType: entry.entityType,
            entityId: entry.entityId || null,
            action: entry.action,
            before: entry.before || null,
            after: entry.after || null,
            createdAt: new Date(),
          },
        });
      } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('Failed to create audit log:', error);
      }
    }
  }

  /**
   * Log SUPER_ADMIN actions that affect tenants
   */
  async logSuperAdminAction(
    action: string,
    entityType: string,
    entityId?: string,
    details?: { before?: any; after?: any; notes?: string },
  ): Promise<void> {
    const userRole = ReqContext.userRole;
    
    // Only log if user is SUPER_ADMIN
    if (userRole !== 'SUPER_ADMIN') {
      return;
    }

    await this.log({
      action: `SUPER_ADMIN:${action}`,
      entityType,
      entityId,
      before: details?.before,
      after: details?.after,
      notes: details?.notes,
    });
  }

  /**
   * Log tenant-related actions by SUPER_ADMIN
   */
  async logTenantAction(
    targetTenantId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: { before?: any; after?: any },
  ): Promise<void> {
    const userRole = ReqContext.userRole;
    
    if (userRole !== 'SUPER_ADMIN') {
      return;
    }

    // Log with target tenant context
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: targetTenantId, // Target tenant (not the admin's tenant)
          actorUserId: ReqContext.userId || 'unknown',
          entityType,
          entityId: entityId || null,
          action: `SUPER_ADMIN:${action}`,
          before: details?.before || null,
          after: details?.after || null,
          notes: `Super admin action on tenant ${targetTenantId}`,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to create tenant audit log:', error);
    }
  }
}

