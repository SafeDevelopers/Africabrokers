import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../tenancy/roles.guard';
import { PaymentProviderType, SubscriptionStatus } from '@prisma/client';

export class CreateGlobalProviderDto {
  tenantId!: string;
  providerId!: string;
  type!: PaymentProviderType;
  audience?: string;
  name!: string;
  config!: Record<string, any>;
  isDefault?: boolean;
}

export class CreateAgencyPlanDto {
  tenantId!: string;
  providerId!: string;
  audience?: string;
  planId!: string;
  name!: string;
  description?: string;
  amount!: number;
  currency!: string;
  interval!: string;
  intervalCount?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, any>;
}

@Controller('superadmin/billing')
@Roles('SUPER_ADMIN')
export class SuperAdminBillingController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /v1/superadmin/billing/providers
   * Get global payment provider registry
   */
  @Get('providers')
  async getProviders(
    @Query('tenantId') tenantId?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [providers, total] = await Promise.all([
      this.prisma.paymentProvider.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.paymentProvider.count({ where }),
    ]);

    return {
      providers,
      total,
      limit,
      offset,
    };
  }

  /**
   * POST /v1/superadmin/billing/providers
   * Create global payment provider (for specific tenant)
   */
  @Post('providers')
  async createProvider(@Body() dto: CreateGlobalProviderDto) {
    const { tenantId } = dto;

    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    // Check if provider already exists
    const existing = await this.prisma.paymentProvider.findFirst({
      where: {
        tenantId,
        providerId: dto.providerId,
      },
    });

    if (existing) {
      throw new BadRequestException(`Provider ${dto.providerId} already exists for tenant ${tenantId}`);
    }

    // If this is set as default, unset other defaults for this tenant
    if (dto.isDefault) {
      await this.prisma.paymentProvider.updateMany({
        where: {
          tenantId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const provider = await this.prisma.paymentProvider.create({
      data: {
        tenantId,
        providerId: dto.providerId,
        type: dto.type,
        audience: dto.audience,
        name: dto.name,
        config: dto.config,
        isDefault: dto.isDefault || false,
      },
      include: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return {
      provider,
    };
  }

  /**
   * POST /v1/superadmin/billing/plans
   * Create agency plan (tenant plans)
   */
  @Post('plans')
  async createAgencyPlan(@Body() dto: CreateAgencyPlanDto) {
    const { tenantId } = dto;

    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    // Get provider
    const provider = await this.prisma.paymentProvider.findFirst({
      where: {
        tenantId,
        providerId: dto.providerId,
        isActive: true,
      },
    });

    if (!provider) {
      throw new NotFoundException(`Payment provider ${dto.providerId} not found or inactive`);
    }

    // Check if plan already exists
    const existing = await this.prisma.plan.findFirst({
      where: {
        tenantId,
        planId: dto.planId,
      },
    });

    if (existing) {
      throw new BadRequestException(`Plan ${dto.planId} already exists for tenant ${tenantId}`);
    }

    const plan = await this.prisma.plan.create({
      data: {
        tenantId,
        providerId: provider.id,
        audience: dto.audience || 'tenant',
        planId: dto.planId,
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency,
        interval: dto.interval,
        intervalCount: dto.intervalCount || 1,
        trialPeriodDays: dto.trialPeriodDays,
        metadata: dto.metadata || {},
      },
      include: {
        provider: true,
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return {
      plan,
    };
  }

  /**
   * GET /v1/superadmin/billing/subscriptions
   * Get all subscriptions across tenants
   */
  @Get('subscriptions')
  async getSubscriptions(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: SubscriptionStatus,
    @Query('audience') audience?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (status) {
      where.status = status;
    }
    if (audience) {
      where.audience = audience;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          plan: {
            include: {
              provider: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      total,
      limit,
      offset,
    };
  }
}

