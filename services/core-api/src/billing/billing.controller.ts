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
import { PaymentIntentService } from './services/payment-intent.service';
import { SubscriptionService } from './services/subscription.service';
import { InvoiceService } from './services/invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../tenancy/roles.guard';
import { RequireTenant } from '../tenancy/tenant.guard';

export class SubscribeDto {
  planId!: string;
  providerId!: string;
  metadata?: Record<string, any>;
}

@Controller('billing')
@RequireTenant()
export class BillingController {
  constructor(
    private readonly paymentIntentService: PaymentIntentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly invoiceService: InvoiceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /v1/billing/subscribe
   * Subscribe to a plan (creates invoice + payment intent)
   * Public/Broker endpoint
   */
  @Post('subscribe')
  @Roles('BROKER', 'TENANT_ADMIN') // Allow brokers and tenant admins
  async subscribe(@Body() dto: SubscribeDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Determine subscriber type and ID based on role
    const subscriberType = userRole === 'BROKER' ? 'broker' : 'tenant';
    const subscriberId = userRole === 'BROKER' ? userId : tenantId;

    // Get plan
    const plan = await this.prisma.plan.findFirst({
      where: {
        tenantId,
        planId: dto.planId,
        isActive: true,
      },
      include: { provider: true },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${dto.planId} not found or inactive`);
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

    // Create subscription
    const subscription = await this.subscriptionService.create({
      tenantId,
      providerId: dto.providerId,
      planId: dto.planId,
      audience: plan.audience || subscriberType,
      subscriberId,
      subscriberType,
      metadata: dto.metadata,
    });

    // Create invoice for first period
    const invoice = await this.invoiceService.create({
      tenantId,
      providerId: dto.providerId,
      subscriptionId: subscription.id,
      audience: plan.audience || subscriberType,
      customerId: subscriberId,
      customerType: subscriberType,
      amount: Number(plan.amount),
      currency: plan.currency,
      metadata: dto.metadata,
    });

    // Open invoice
    const openInvoice = await this.invoiceService.open(invoice.id);

    // Create payment intent
    const paymentIntent = await this.paymentIntentService.create({
      tenantId,
      providerId: dto.providerId,
      invoiceId: invoice.id,
      audience: plan.audience || subscriberType,
      customerId: subscriberId,
      customerType: subscriberType,
      amount: Number(plan.amount),
      currency: plan.currency,
      metadata: dto.metadata,
      description: `Subscription to ${plan.name}`,
    });

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      invoice: {
        id: openInvoice.id,
        invoiceNumber: openInvoice.invoiceNumber,
        status: openInvoice.status,
        amount: openInvoice.amount,
        currency: openInvoice.currency,
      },
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent['clientSecret'],
        redirectUrl: paymentIntent['redirectUrl'],
      },
      nextAction: paymentIntent['redirectUrl'] ? 'redirect' : 'payment_method_required',
      redirectUrl: paymentIntent['redirectUrl'],
    };
  }

  /**
   * GET /v1/billing/subscriptions/me
   * Get current user's subscriptions
   * Public/Broker endpoint
   */
  @Get('subscriptions/me')
  @Roles('BROKER', 'TENANT_ADMIN')
  async getMySubscriptions(@Request() req: any) {
    const tenantId = req.tenantId;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const subscriberType = userRole === 'BROKER' ? 'broker' : 'tenant';
    const subscriberId = userRole === 'BROKER' ? userId : tenantId;

    const subscriptions = await this.subscriptionService.findBySubscriber(
      tenantId,
      subscriberId,
      subscriberType,
    );

    return {
      subscriptions,
    };
  }

  /**
   * GET /v1/billing/invoices/me
   * Get current user's invoices
   * Public/Broker endpoint
   */
  @Get('invoices/me')
  @Roles('BROKER', 'TENANT_ADMIN')
  async getMyInvoices(@Request() req: any) {
    const tenantId = req.tenantId;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const customerType = userRole === 'BROKER' ? 'broker' : 'tenant';
    const customerId = userRole === 'BROKER' ? userId : tenantId;

    const invoices = await this.invoiceService.findByCustomer(
      tenantId,
      customerId,
      customerType,
    );

    return {
      invoices,
    };
  }
}

