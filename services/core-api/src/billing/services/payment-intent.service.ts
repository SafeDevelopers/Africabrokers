import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderRegistry } from './provider-registry.service';
import { PaymentIntentStatus, PaymentProviderType } from '@prisma/client';

export interface CreatePaymentIntentDto {
  tenantId: string;
  providerId: string;
  invoiceId?: string;
  audience?: string;
  customerId: string;
  customerType: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  description?: string;
}

export interface CapturePaymentIntentDto {
  intentId: string;
  amount?: number;
}

export interface VoidPaymentIntentDto {
  intentId: string;
}

export interface RefundPaymentIntentDto {
  intentId: string;
  amount?: number;
}

@Injectable()
export class PaymentIntentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  /**
   * Create a payment intent
   */
  async create(dto: CreatePaymentIntentDto) {
    const { tenantId, providerId, invoiceId, audience, customerId, customerType, amount, currency, metadata, description } = dto;

    // Get provider
    const provider = await this.prisma.paymentProvider.findFirst({
      where: {
        tenantId,
        providerId,
        isActive: true,
      },
    });

    if (!provider) {
      throw new NotFoundException(`Payment provider ${providerId} not found or inactive`);
    }

    // Get adapter
    const adapter = this.providerRegistry.getAdapter(provider.type as PaymentProviderType);

    // Create intent with provider
    const result = await adapter.createIntent({
      amount,
      currency,
      customerId,
      metadata,
      description,
    });

    // Create payment intent record
    const paymentIntent = await this.prisma.paymentIntent.create({
      data: {
        tenantId,
        providerId: provider.id,
        invoiceId,
        audience,
        customerId,
        customerType,
        intentId: result.intentId,
        status: result.status as PaymentIntentStatus,
        amount,
        currency,
        metadata: metadata || {},
      },
    });

    return {
      ...paymentIntent,
      clientSecret: result.clientSecret,
      redirectUrl: result.redirectUrl,
    };
  }

  /**
   * Capture a payment intent
   */
  async capture(dto: CapturePaymentIntentDto) {
    const { intentId, amount } = dto;

    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id: intentId },
      include: { provider: true },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent ${intentId} not found`);
    }

    if (paymentIntent.status !== PaymentIntentStatus.requires_capture) {
      throw new BadRequestException(`Payment intent status is ${paymentIntent.status}, cannot capture`);
    }

    // Get adapter
    const adapter = this.providerRegistry.getAdapter(paymentIntent.provider.type);

    // Capture with provider
    const result = await adapter.capture(paymentIntent.intentId || '', amount ? Number(amount) : undefined);

    // Update payment intent
    const updated = await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: {
        status: result.status as PaymentIntentStatus,
        capturedAmount: result.capturedAmount,
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          ...(result.metadata || {}),
        },
      },
    });

    return updated;
  }

  /**
   * Void a payment intent
   */
  async void(dto: VoidPaymentIntentDto) {
    const { intentId } = dto;

    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id: intentId },
      include: { provider: true },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent ${intentId} not found`);
    }

    if (paymentIntent.status === PaymentIntentStatus.succeeded) {
      throw new BadRequestException('Cannot void a succeeded payment intent. Use refund instead.');
    }

    // Get adapter
    const adapter = this.providerRegistry.getAdapter(paymentIntent.provider.type);

    // Void with provider
    const result = await adapter.void(paymentIntent.intentId || '');

    // Update payment intent
    const updated = await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: {
        status: PaymentIntentStatus.canceled,
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          ...(result.metadata || {}),
          voidedAt: new Date().toISOString(),
        },
      },
    });

    return updated;
  }

  /**
   * Refund a payment intent
   */
  async refund(dto: RefundPaymentIntentDto) {
    const { intentId, amount } = dto;

    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id: intentId },
      include: { provider: true },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent ${intentId} not found`);
    }

    if (paymentIntent.status !== PaymentIntentStatus.succeeded) {
      throw new BadRequestException(`Payment intent status is ${paymentIntent.status}, cannot refund`);
    }

    const refundAmount = amount ? Number(amount) : Number(paymentIntent.capturedAmount || paymentIntent.amount);
    const currentRefunded = Number(paymentIntent.refundedAmount || 0);
    const captured = Number(paymentIntent.capturedAmount || paymentIntent.amount);

    if (currentRefunded + refundAmount > captured) {
      throw new BadRequestException('Refund amount exceeds captured amount');
    }

    // Get adapter
    const adapter = this.providerRegistry.getAdapter(paymentIntent.provider.type);

    // Refund with provider
    const result = await adapter.refund(paymentIntent.intentId || '', refundAmount);

    // Update payment intent
    const updated = await this.prisma.paymentIntent.update({
      where: { id: intentId },
      data: {
        refundedAmount: currentRefunded + refundAmount,
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          refunds: [
            ...((paymentIntent.metadata as Record<string, any> || {}).refunds || []),
            {
              refundId: result.refundId,
              amount: refundAmount,
              status: result.status,
              refundedAt: new Date().toISOString(),
            },
          ],
        },
      },
    });

    return updated;
  }

  /**
   * Get payment intent by ID
   */
  async findById(id: string) {
    return this.prisma.paymentIntent.findUnique({
      where: { id },
      include: {
        provider: true,
        invoice: true,
      },
    });
  }

  /**
   * Get payment intents by customer
   */
  async findByCustomer(tenantId: string, customerId: string, customerType: string) {
    return this.prisma.paymentIntent.findMany({
      where: {
        tenantId,
        customerId,
        customerType,
      },
      include: {
        provider: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

