import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ReqContext } from '../tenancy/req-scope.interceptor';

// Create extended client factory that applies tenant scoping
const createTenantScopedClient = (baseClient: PrismaClient) => {
  return baseClient.$extends({
    query: {
      $allOperations: async ({ operation, model, args, query }) => {
        // Read context dynamically per request (set by ReqScopeInterceptor)
        const tenantId = ReqContext.tenantId;
        const userRole = ReqContext.userRole;

        // Skip tenant scoping for SUPER_ADMIN
        if (userRole === 'SUPER_ADMIN') {
          return query(args);
        }

        // Skip if no tenantId
        if (!tenantId) {
          return query(args);
        }

        // Models that have tenantId field
        const tenantScopedModels = [
          'User',
          'AgentOffice',
          'BrokerApplication',
          'License',
          'Listing',
          'QrCode',
          'InspectionEvent',
          'AuditLog',
        ];

        // Skip tenant scoping for Tenant model and models without tenantId
        if (!model || model === 'Tenant' || !tenantScopedModels.includes(model)) {
          return query(args);
        }

        // For create operations, ensure tenantId is in the data
        if (operation === 'create' || operation === 'createMany') {
          if (args?.data) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                tenantId: item.tenantId || tenantId,
              }));
            } else if (typeof args.data === 'object') {
              args.data = {
                ...args.data,
                tenantId: (args.data as any).tenantId || tenantId,
              };
            }
          }
          return query(args);
        }

        // For findUnique operations, Prisma requires only unique fields in where clause
        // We'll execute the query and then verify tenantId matches
        if (operation === 'findUnique') {
          const result = await query(args);
          // If result exists, verify it belongs to this tenant
          if (result && (result as any).tenantId !== tenantId) {
            // Record exists but belongs to different tenant - return null (404)
            return null;
          }
          return result;
        }

        // For all other operations (findMany, findFirst, update, delete, etc.), inject tenantId into where clause
        if (args?.where) {
          args.where = {
            ...args.where,
            tenantId: tenantId,
          };
        } else {
          args = {
            ...args,
            where: {
              tenantId: tenantId,
            },
          };
        }

        return query(args);
      },
    },
  });
};

// Tenant-scoped Prisma client using $extends
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly extendedClient: any;

  constructor() {
    super();
    // Create extended client once (it reads ReqContext dynamically per request)
    this.extendedClient = createTenantScopedClient(this);
  }

  async onModuleInit() {
    // Connect the base client first, then extended client will work
    await super.$connect();
  }

  async onModuleDestroy() {
    // Disconnect the base client
    await super.$disconnect();
  }

  // Proxy all model accessors to use the extended client
  // This ensures all queries automatically include tenant filtering
  get user() {
    return this.extendedClient.user;
  }

  get listing() {
    return this.extendedClient.listing;
  }

  get qrCode() {
    return this.extendedClient.qrCode;
  }

  get brokerApplication() {
    return this.extendedClient.brokerApplication;
  }

  get license() {
    return this.extendedClient.license;
  }

  get agentOffice() {
    return this.extendedClient.agentOffice;
  }

  get inspectionEvent() {
    return this.extendedClient.inspectionEvent;
  }

  get auditLog() {
    return this.extendedClient.auditLog;
  }

  get tenant() {
    return this.extendedClient.tenant;
  }

  // Proxy $transaction to use extended client
  get $transaction() {
    return this.extendedClient.$transaction.bind(this.extendedClient);
  }

  // Keep base $connect and $disconnect for module lifecycle
  // (they're called in onModuleInit/onModuleDestroy)

  get $use() {
    return this.extendedClient.$use.bind(this.extendedClient);
  }

  get $on() {
    return this.extendedClient.$on.bind(this.extendedClient);
  }
}