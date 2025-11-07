import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BrokerApplicationStatus } from '@prisma/client';

@Injectable()
export class SuperAdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // Get all agent applications (these are BrokerApplications with special flag or type)
  // For now, we'll treat all BrokerApplications as potential agent applications
  // In production, you might want a separate AgentApplication model
  async getAgentApplications(query?: {
    status?: BrokerApplicationStatus;
    tenantId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, tenantId, limit = 50, offset = 0 } = query || {};

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [applications, total] = await Promise.all([
      this.prisma.brokerApplication.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
            },
          },
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.brokerApplication.count({ where }),
    ]);

    type ApplicationWithRelations = (typeof applications)[number];

    return {
      items: applications.map((app: ApplicationWithRelations) => ({
        id: app.id,
        tenantId: app.tenantId,
        userId: app.userId,
        status: app.status,
        submittedAt: app.submittedAt.toISOString(),
        payload: app.payload,
        orgType: app.orgType,
        orgTypeNotes: app.orgTypeNotes,
        user: app.user,
        tenant: app.tenant,
      })),
      total,
      limit,
      offset,
    };
  }

  async getAgentApplicationById(id: string) {
    const application = await this.prisma.brokerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Agent application with ID ${id} not found`);
    }

    return {
      id: application.id,
      tenantId: application.tenantId,
      userId: application.userId,
      status: application.status,
      submittedAt: application.submittedAt.toISOString(),
      payload: application.payload,
      orgType: application.orgType,
      orgTypeNotes: application.orgTypeNotes,
      user: application.user,
      tenant: application.tenant,
    };
  }

  async approveAgentApplication(id: string) {
    const application = await this.prisma.brokerApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException(`Agent application with ID ${id} not found`);
    }

    if (application.status === BrokerApplicationStatus.APPROVED) {
      throw new BadRequestException('Application is already approved');
    }

    const beforeStatus = application.status;
    const beforeData = {
      status: application.status,
      tenantId: application.tenantId,
      userId: application.userId,
    };

    // Update application status
    const updated = await this.prisma.brokerApplication.update({
      where: { id },
      data: {
        status: BrokerApplicationStatus.APPROVED,
      },
    });

    // Audit log: SUPER_ADMIN action affecting tenant
    await this.auditService.logTenantAction(
      application.tenantId,
      'APPROVE_AGENT_APPLICATION',
      'BrokerApplication',
      id,
      {
        before: beforeData,
        after: {
          status: updated.status,
          tenantId: updated.tenantId,
          userId: updated.userId,
        },
      },
    );

    // Optionally, update user role to AGENT if needed
    // For now, we'll leave the user role as-is, but you might want to:
    // await this.prisma.user.update({
    //   where: { id: application.userId },
    //   data: { role: 'AGENT' },
    // });

    return {
      id: updated.id,
      status: updated.status,
      message: 'Agent application approved successfully',
    };
  }

  async rejectAgentApplication(id: string, reason?: string) {
    const application = await this.prisma.brokerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Agent application with ID ${id} not found`);
    }

    if (application.status === BrokerApplicationStatus.REJECTED) {
      throw new BadRequestException('Application is already rejected');
    }

    const beforeData = {
      status: application.status,
      tenantId: application.tenantId,
      userId: application.userId,
    };

    const updated = await this.prisma.brokerApplication.update({
      where: { id },
      data: {
        status: BrokerApplicationStatus.REJECTED,
        payload: {
          ...(application.payload as any || {}),
          rejectionReason: reason,
        },
      },
    });

    // Audit log: SUPER_ADMIN action affecting tenant
    await this.auditService.logTenantAction(
      application.tenantId,
      'REJECT_AGENT_APPLICATION',
      'BrokerApplication',
      id,
      {
        before: beforeData,
        after: {
          status: updated.status,
          tenantId: updated.tenantId,
          userId: updated.userId,
          rejectionReason: reason,
        },
      },
    );

    return {
      id: updated.id,
      status: updated.status,
      message: 'Agent application rejected',
      reason,
    };
  }

  async requestMoreInfo(id: string, infoRequest?: string) {
    const application = await this.prisma.brokerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Agent application with ID ${id} not found`);
    }

    const beforeData = {
      status: application.status,
      tenantId: application.tenantId,
      userId: application.userId,
    };

    const updated = await this.prisma.brokerApplication.update({
      where: { id },
      data: {
        status: BrokerApplicationStatus.NEEDS_INFO,
        payload: {
          ...(application.payload as any || {}),
          infoRequest: infoRequest || 'Additional information required',
        },
      },
    });

    // Audit log: SUPER_ADMIN action affecting tenant
    await this.auditService.logTenantAction(
      application.tenantId,
      'REQUEST_MORE_INFO_AGENT_APPLICATION',
      'BrokerApplication',
      id,
      {
        before: beforeData,
        after: {
          status: updated.status,
          tenantId: updated.tenantId,
          userId: updated.userId,
          infoRequest,
        },
      },
    );

    return {
      id: updated.id,
      status: updated.status,
      message: 'Application marked as needs more information',
      infoRequest,
    };
  }

  // Get all tenants
  async getTenants(query?: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = query || {};

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              brokers: true,
              listings: true,
            },
          },
        },
      }),
      this.prisma.tenant.count(),
    ]);

    return {
      items: tenants.map((tenant: any) => ({
        id: tenant.id,
        slug: tenant.slug,
        key: tenant.key,
        name: tenant.name,
        country: tenant.country,
        currency: tenant.currency,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
        stats: {
          users: tenant._count.users,
          brokers: tenant._count.brokers,
          listings: tenant._count.listings,
        },
      })),
      total,
      limit,
      offset,
    };
  }

  // Get overview statistics
  async getOverview() {
    const [tenantCount, userCount, brokerCount, listingCount, agentApplicationCount] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.broker.count(),
      this.prisma.listing.count(),
      this.prisma.brokerApplication.count({
        where: {
          status: 'SUBMITTED',
        },
      }),
    ]);

    return {
      tenants: {
        total: tenantCount,
      },
      users: {
        total: userCount,
      },
      brokers: {
        total: brokerCount,
      },
      listings: {
        total: listingCount,
      },
      agentApplications: {
        pending: agentApplicationCount,
      },
    };
  }
}
