import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

/**
 * Tenant-scoped Prisma service that automatically adds tenantId to all queries.
 * 
 * This service wraps Prisma operations to ensure all database queries
 * are scoped to the current tenant. In development, it will throw an error
 * if tenantId is missing from the where clause.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantScopedPrismaService {
  private readonly tenantId: string;

  constructor(
    private readonly prisma: PrismaClient,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    this.tenantId = this.request.tenantId || 'et-addis';
  }

  /**
   * Assert that tenantId is included in where clause (dev-time check)
   */
  private assertTenantScoped(where: any, operation: string): void {
    if (process.env.NODE_ENV === 'development') {
      if (!where || !where.tenantId) {
        throw new Error(
          `Missing tenantId in ${operation}. All queries must include { where: { tenantId: '${this.tenantId}', ... } }`,
        );
      }
    }
  }

  /**
   * Automatically add tenantId to where clause
   */
  private addTenantId(where: any): any {
    if (!where) {
      return { tenantId: this.tenantId };
    }
    return {
      ...where,
      tenantId: this.tenantId,
    };
  }

  // Tenant model operations
  get tenant() {
    return this.prisma.tenant;
  }

  // AgentOffice model operations
  get agentOffice() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'agentOffice.findMany');
        }
        return this.prisma.agentOffice.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'agentOffice.findFirst');
        }
        return this.prisma.agentOffice.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.agentOffice.findUnique(args),
      create: (args: any) =>
        this.prisma.agentOffice.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'agentOffice.update');
        }
        return this.prisma.agentOffice.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'agentOffice.delete');
        }
        return this.prisma.agentOffice.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // User model operations
  get user() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'user.findMany');
        }
        return this.prisma.user.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'user.findFirst');
        }
        return this.prisma.user.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.user.findUnique(args),
      create: (args: any) =>
        this.prisma.user.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'user.update');
        }
        return this.prisma.user.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'user.delete');
        }
        return this.prisma.user.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // BrokerApplication model operations
  get brokerApplication() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'brokerApplication.findMany');
        }
        return this.prisma.brokerApplication.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'brokerApplication.findFirst');
        }
        return this.prisma.brokerApplication.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.brokerApplication.findUnique(args),
      create: (args: any) =>
        this.prisma.brokerApplication.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'brokerApplication.update');
        }
        return this.prisma.brokerApplication.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'brokerApplication.delete');
        }
        return this.prisma.brokerApplication.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // License model operations
  get license() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'license.findMany');
        }
        return this.prisma.license.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'license.findFirst');
        }
        return this.prisma.license.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.license.findUnique(args),
      create: (args: any) =>
        this.prisma.license.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'license.update');
        }
        return this.prisma.license.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'license.delete');
        }
        return this.prisma.license.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // Listing model operations
  get listing() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'listing.findMany');
        }
        return this.prisma.listing.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'listing.findFirst');
        }
        return this.prisma.listing.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.listing.findUnique(args),
      create: (args: any) =>
        this.prisma.listing.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'listing.update');
        }
        return this.prisma.listing.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'listing.delete');
        }
        return this.prisma.listing.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // QrCode model operations
  get qrCode() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'qrCode.findMany');
        }
        return this.prisma.qrCode.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'qrCode.findFirst');
        }
        return this.prisma.qrCode.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.qrCode.findUnique(args),
      create: (args: any) =>
        this.prisma.qrCode.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'qrCode.update');
        }
        return this.prisma.qrCode.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'qrCode.delete');
        }
        return this.prisma.qrCode.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // InspectionEvent model operations
  get inspectionEvent() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'inspectionEvent.findMany');
        }
        return this.prisma.inspectionEvent.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'inspectionEvent.findFirst');
        }
        return this.prisma.inspectionEvent.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.inspectionEvent.findUnique(args),
      create: (args: any) =>
        this.prisma.inspectionEvent.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'inspectionEvent.update');
        }
        return this.prisma.inspectionEvent.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'inspectionEvent.delete');
        }
        return this.prisma.inspectionEvent.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // AuditLog model operations
  get auditLog() {
    return {
      findMany: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'auditLog.findMany');
        }
        return this.prisma.auditLog.findMany({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findFirst: (args?: any) => {
        if (args?.where) {
          this.assertTenantScoped(args.where, 'auditLog.findFirst');
        }
        return this.prisma.auditLog.findFirst({
          ...args,
          where: this.addTenantId(args?.where || {}),
        });
      },
      findUnique: (args: any) => this.prisma.auditLog.findUnique(args),
      create: (args: any) =>
        this.prisma.auditLog.create({
          ...args,
          data: { ...args.data, tenantId: this.tenantId },
        }),
      update: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'auditLog.update');
        }
        return this.prisma.auditLog.update({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
      delete: (args: any) => {
        if (args.where) {
          this.assertTenantScoped(args.where, 'auditLog.delete');
        }
        return this.prisma.auditLog.delete({
          ...args,
          where: this.addTenantId(args.where || {}),
        });
      },
    };
  }

  // Expose raw Prisma client for transactions and special cases
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}

