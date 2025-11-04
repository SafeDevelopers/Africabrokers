import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderRegistry } from './provider-registry.service';
import { SubscriptionStatus, PaymentProviderType } from '@prisma/client';

export interface CreateSubscriptionDto {
  tenantId: string;
  providerId: string;
  planId: string;
  audience?: string;
  subscriberId: string;
  subscriberType: string;
  metadata?: Record<string, any>;
}

export interface RenewSubscriptionDto {
  subscriptionId: string;
}

export interface CancelSubscriptionDto {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  /**
   * Create a subscription
   */
  async create(dto: CreateSubscriptionDto) {
    const { tenantId, providerId, planId, audience, subscriberId, subscriberType, metadata } = dto;

    // Get plan
    const plan = await this.prisma.plan.findFirst({
      where: {
        tenantId,
        planId,
        isActive: true,
      },
      include: { provider: true },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found or inactive`);
    }

    // Check if subscription already exists
    const existing = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        subscriberId,
        subscriberType,
        status: {
          in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Active subscription already exists for this subscriber');
    }

    // Get adapter
    const adapter = this.providerRegistry.getAdapter(plan.provider.type as PaymentProviderType);

    // Calculate period dates
    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now);
    
    if (plan.interval === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + plan.intervalCount);
    } else if (plan.interval === 'year') {
      periodEnd.setFullYear(periodEnd.getFullYear() + plan.intervalCount);
    }

    // Create subscription with provider (if supported)
    let externalSubscriptionId: string | undefined;
    try {
      // Note: This is a placeholder - actual implementation depends on provider capabilities
      // Some providers may not support direct subscription creation
      externalSubscriptionId = undefined;
    } catch (error) {
      // Provider may not support direct subscription creation
      console.warn('Provider does not support direct subscription creation:', error);
    }

    // Create subscription record
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        providerId: plan.providerId,
        planId: plan.id,
        audience,
        subscriberId,
        subscriberType,
        subscriptionId: externalSubscriptionId,
        status: SubscriptionStatus.active,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialStart: plan.trialPeriodDays ? periodStart : null,
        trialEnd: plan.trialPeriodDays ? new Date(periodStart.getTime() + plan.trialPeriodDays * 24 * 60 * 60 * 1000) : null,
        metadata: metadata || {},
      },
      include: {
        plan: true,
        provider: true,
      },
    });

    return subscription;
  }

  /**
   * Start a subscription (activate after creation)
   */
  async start(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { provider: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    if (subscription.status === SubscriptionStatus.active) {
      return subscription;
    }

    // Update status to active
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.active,
      },
      include: {
        plan: true,
        provider: true,
      },
    });

    return updated;
  }

  /**
   * Renew a subscription
   */
  async renew(dto: RenewSubscriptionDto) {
    const { subscriptionId } = dto;

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, provider: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    if (subscription.status !== SubscriptionStatus.active) {
      throw new BadRequestException(`Subscription status is ${subscription.status}, cannot renew`);
    }

    // Calculate new period
    const periodStart = subscription.currentPeriodEnd;
    const periodEnd = new Date(periodStart);
    
    if (subscription.plan.interval === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + subscription.plan.intervalCount);
    } else if (subscription.plan.interval === 'year') {
      periodEnd.setFullYear(periodEnd.getFullYear() + subscription.plan.intervalCount);
    }

    // Update subscription
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: SubscriptionStatus.active,
      },
      include: {
        plan: true,
        provider: true,
      },
    });

    return updated;
  }

  /**
   * Cancel a subscription
   */
  async cancel(dto: CancelSubscriptionDto) {
    const { subscriptionId, cancelAtPeriodEnd = false } = dto;

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { provider: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    if (subscription.status === SubscriptionStatus.canceled) {
      return subscription;
    }

    // Update subscription
    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        status: cancelAtPeriodEnd ? subscription.status : SubscriptionStatus.canceled,
      },
      include: {
        plan: true,
        provider: true,
      },
    });

    return updated;
  }

  /**
   * Handle webhook event
   */
  async handleWebhook(providerId: string, event: string, payload: any) {
    // This would be implemented based on provider-specific webhook handling
    // For now, it's a placeholder that can be extended per provider
    
    switch (event) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.deleted':
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        // Handle subscription-related webhooks
        return this.processWebhookEvent(providerId, event, payload);
      default:
        console.log(`Unhandled webhook event: ${event}`);
        return null;
    }
  }

  private async processWebhookEvent(providerId: string, event: string, payload: any) {
    // Implementation depends on provider-specific webhook payload structure
    // This is a placeholder for provider-specific webhook processing
    return { processed: true, event, providerId };
  }

  /**
   * Get subscription by ID
   */
  async findById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        provider: true,
        invoices: true,
      },
    });
  }

  /**
   * Get subscriptions by subscriber
   */
  async findBySubscriber(tenantId: string, subscriberId: string, subscriberType: string) {
    return this.prisma.subscription.findMany({
      where: {
        tenantId,
        subscriberId,
        subscriberType,
      },
      include: {
        plan: true,
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

