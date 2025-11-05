import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceService } from './services/invoice.service';
import { PaymentIntentService } from './services/payment-intent.service';
import { ProviderRegistry } from './services/provider-registry.service';
import { Roles } from '../tenancy/roles.guard';
import { RequireTenant } from '../tenancy/tenant.guard';
import { RequireIdorProtection, IdorGuard } from '../security/idor.guard';
import { PaymentProviderType } from '@prisma/client';

export class CreateProviderDto {
  providerId!: string;
  type!: PaymentProviderType;
  audience?: string;
  name!: string;
  config!: Record<string, any>;
  isDefault?: boolean;
}

export class TestProviderDto {
  amount?: number;
  currency?: string;
}

export class CreatePlanDto {
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

@Controller('admin/billing')
@Roles('TENANT_ADMIN', 'AGENT')
@RequireTenant()
export class AdminBillingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
    private readonly paymentIntentService: PaymentIntentService,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  /**
   * GET /v1/admin/billing/providers
   * Get tenant-scoped payment providers
   */
  @Get('providers')
  async getProviders(@Request() req: any) {
    const tenantId = req.tenantId;

    const providers = await this.prisma.paymentProvider.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });

    return {
      providers,
    };
  }

  /**
   * POST /v1/admin/billing/providers
   * Create tenant-scoped payment provider
   */
  @Post('providers')
  async createProvider(@Body() dto: CreateProviderDto, @Request() req: any) {
    const tenantId = req.tenantId;

    // Check if provider already exists
    const existing = await this.prisma.paymentProvider.findFirst({
      where: {
        tenantId,
        providerId: dto.providerId,
      },
    });

    if (existing) {
      throw new BadRequestException(`Provider ${dto.providerId} already exists for this tenant`);
    }

    // If this is set as default, unset other defaults
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
    });

    return {
      provider,
    };
  }

  /**
   * POST /v1/admin/billing/providers/:id/test
   * Test payment provider
   */
  @Post('providers/:id/test')
  @UseGuards(IdorGuard)
  @RequireIdorProtection('PaymentProvider')
  async testProvider(@Param('id') id: string, @Body() dto: TestProviderDto, @Request() req: any) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { id },
    });

    if (!provider || provider.tenantId !== req.tenantId) {
      throw new NotFoundException('Provider not found');
    }

    // Get adapter
    const adapter = this.providerRegistry.getAdapter(provider.type);

    // Test create intent
    try {
      const result = await adapter.createIntent({
        amount: dto.amount || 100,
        currency: dto.currency || 'ETB',
        description: 'Test payment',
      });

      return {
        success: true,
        testResult: {
          intentId: result.intentId,
          status: result.status,
          message: 'Provider test successful',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Provider test failed',
      };
    }
  }

  /**
   * POST /v1/admin/billing/providers/:id/toggle
   * Toggle provider active status
   */
  @Post('providers/:id/toggle')
  @UseGuards(IdorGuard)
  @RequireIdorProtection('PaymentProvider')
  async toggleProvider(@Param('id') id: string, @Request() req: any) {
    const provider = await this.prisma.paymentProvider.findUnique({
      where: { id },
    });

    if (!provider || provider.tenantId !== req.tenantId) {
      throw new NotFoundException('Provider not found');
    }

    const updated = await this.prisma.paymentProvider.update({
      where: { id },
      data: {
        isActive: !provider.isActive,
      },
    });

    return {
      provider: updated,
    };
  }

  /**
   * GET /v1/admin/billing/plans
   * Get tenant-scoped plans (broker plans)
   */
  @Get('plans')
  async getPlans(@Request() req: any) {
    const tenantId = req.tenantId;

    const plans = await this.prisma.plan.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        provider: true,
      },
      orderBy: {
        amount: 'asc',
      },
    });

    return {
      plans,
    };
  }

  /**
   * POST /v1/admin/billing/plans
   * Create broker plan for this tenant
   */
  @Post('plans')
  async createPlan(@Body() dto: CreatePlanDto, @Request() req: any) {
    const tenantId = req.tenantId;

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
      throw new BadRequestException(`Plan ${dto.planId} already exists for this tenant`);
    }

    const plan = await this.prisma.plan.create({
      data: {
        tenantId,
        providerId: provider.id,
        audience: dto.audience || 'broker',
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
      },
    });

    return {
      plan,
    };
  }

  /**
   * POST /v1/admin/billing/invoices/:id/cash/mark-paid
   * Mark cash invoice as paid
   */
  @Post('invoices/:id/cash/mark-paid')
  @UseGuards(IdorGuard)
  @RequireIdorProtection('Invoice')
  async markCashInvoicePaid(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        provider: true,
        paymentIntents: true,
      },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.provider.type !== PaymentProviderType.CASH) {
      throw new BadRequestException('This endpoint is only for cash invoices');
    }

    if (invoice.status === 'paid') {
      return { invoice };
    }

    // Create a cash payment intent if one doesn't exist
    let paymentIntent = invoice.paymentIntents.find(
      (pi: any) => pi.status === 'requires_confirmation' || pi.status === 'requires_capture',
    );

    if (!paymentIntent) {
      // Create payment intent for cash
      paymentIntent = await this.paymentIntentService.create({
        tenantId,
        providerId: invoice.provider.providerId,
        invoiceId: invoice.id,
        audience: invoice.audience,
        customerId: invoice.customerId,
        customerType: invoice.customerType,
        amount: Number(invoice.amount),
        currency: invoice.currency,
        metadata: {
          paymentMethod: 'cash',
          markedPaidBy: req.user?.id,
        },
      });
    }

    // Capture the payment intent
    await this.paymentIntentService.capture({
      intentId: paymentIntent.id,
    });

    // Mark invoice as paid
    const updatedInvoice = await this.invoiceService.pay({
      invoiceId: invoice.id,
      paymentIntentId: paymentIntent.id,
    });

    return {
      invoice: updatedInvoice,
      paymentIntent,
    };
  }
}

