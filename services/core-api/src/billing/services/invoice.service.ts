import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

export interface CreateInvoiceDto {
  tenantId: string;
  providerId: string;
  subscriptionId?: string;
  audience?: string;
  customerId: string;
  customerType: string;
  amount: number;
  currency: string;
  dueDate?: Date;
  metadata?: Record<string, any>;
  description?: string;
}

export interface PayInvoiceDto {
  invoiceId: string;
  paymentIntentId: string;
}

export interface RefundInvoiceDto {
  invoiceId: string;
  amount?: number;
}

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an invoice
   */
  async create(dto: CreateInvoiceDto) {
    const { tenantId, providerId, subscriptionId, audience, customerId, customerType, amount, currency, dueDate, metadata, description } = dto;

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

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        providerId: provider.id,
        subscriptionId,
        audience,
        customerId,
        customerType,
        invoiceNumber,
        status: InvoiceStatus.draft,
        amount,
        currency,
        dueDate,
        metadata: {
          ...(metadata || {}),
          description,
        },
      },
      include: {
        provider: true,
        subscription: true,
      },
    });

    return invoice;
  }

  /**
   * Open an invoice (change status from draft to open)
   */
  async open(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status !== InvoiceStatus.draft) {
      throw new BadRequestException(`Invoice status is ${invoice.status}, cannot open`);
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.open,
      },
      include: {
        provider: true,
        subscription: true,
      },
    });

    return updated;
  }

  /**
   * Pay an invoice
   */
  async pay(dto: PayInvoiceDto) {
    const { invoiceId, paymentIntentId } = dto;

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        paymentIntents: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status === InvoiceStatus.paid) {
      throw new BadRequestException('Invoice is already paid');
    }

    if (invoice.status === InvoiceStatus.void) {
      throw new BadRequestException('Cannot pay a voided invoice');
    }

    // Get payment intent
    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id: paymentIntentId },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent ${paymentIntentId} not found`);
    }

    if (paymentIntent.invoiceId !== invoiceId) {
      throw new BadRequestException('Payment intent does not belong to this invoice');
    }

    // Update invoice
    const paidAmount = Number(paymentIntent.capturedAmount || paymentIntent.amount);
    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: InvoiceStatus.paid,
        paidAmount,
        paidAt: new Date(),
      },
      include: {
        provider: true,
        subscription: true,
        paymentIntents: true,
      },
    });

    return updated;
  }

  /**
   * Refund an invoice
   */
  async refund(dto: RefundInvoiceDto) {
    const { invoiceId, amount } = dto;

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        paymentIntents: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status !== InvoiceStatus.paid) {
      throw new BadRequestException(`Invoice status is ${invoice.status}, cannot refund`);
    }

    const refundAmount = amount ? Number(amount) : Number(invoice.paidAmount || invoice.amount);
    const paidAmount = Number(invoice.paidAmount || invoice.amount);

    if (refundAmount > paidAmount) {
      throw new BadRequestException('Refund amount exceeds paid amount');
    }

    // Update invoice
    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: paidAmount - refundAmount,
        status: refundAmount === paidAmount ? InvoiceStatus.open : InvoiceStatus.paid,
        metadata: {
          ...(invoice.metadata as Record<string, any> || {}),
          refunds: [
            ...((invoice.metadata as Record<string, any> || {}).refunds || []),
            {
              amount: refundAmount,
              refundedAt: new Date().toISOString(),
            },
          ],
        },
      },
      include: {
        provider: true,
        subscription: true,
        paymentIntents: true,
      },
    });

    return updated;
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const prefix = 'INV';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    let invoiceNumber = `${prefix}-${timestamp}-${random}`;
    
    // Ensure uniqueness
    let counter = 0;
    while (await this.prisma.invoice.findUnique({
      where: {
        tenantId_invoiceNumber: {
          tenantId,
          invoiceNumber,
        },
      },
    })) {
      counter++;
      invoiceNumber = `${prefix}-${timestamp}-${random}-${counter}`;
    }

    return invoiceNumber;
  }

  /**
   * Get invoice by ID
   */
  async findById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        provider: true,
        subscription: true,
        paymentIntents: true,
      },
    });
  }

  /**
   * Get invoices by customer
   */
  async findByCustomer(tenantId: string, customerId: string, customerType: string) {
    return this.prisma.invoice.findMany({
      where: {
        tenantId,
        customerId,
        customerType,
      },
      include: {
        provider: true,
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Apply webhook event (idempotent)
   * Processes webhook events from payment providers
   */
  async applyWebhook(
    tenantId: string,
    providerId: string,
    event: {
      type: 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'REFUNDED';
      invoiceId?: string;
      intentId?: string;
      chargeId?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const { type, intentId, chargeId, amount, currency, metadata } = event;

    // Find payment intent by external intentId
    let paymentIntent = intentId
      ? await this.prisma.paymentIntent.findFirst({
          where: {
            tenantId,
            providerId,
            intentId,
          },
          include: {
            invoice: true,
          },
        })
      : null;

    // If no payment intent found, try to find by chargeId (some providers use chargeId)
    // We need to search through all payment intents and check metadata manually
    if (!paymentIntent && chargeId) {
      const allIntents = await this.prisma.paymentIntent.findMany({
        where: {
          tenantId,
          providerId,
        },
        include: {
          invoice: true,
        },
      });
      
      // Find payment intent by chargeId in metadata
      paymentIntent = allIntents.find((pi) => {
        const meta = pi.metadata as Record<string, any>;
        return meta?.chargeId === chargeId || meta?.charge_id === chargeId;
      }) || null;
    }

    // If still no payment intent found and we have invoiceId, find invoice and create intent
    if (!paymentIntent && event.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: event.invoiceId },
      });

      if (invoice && invoice.tenantId === tenantId) {
        // Create payment intent for this invoice
        // This would typically be done through PaymentIntentService, but for webhook handling
        // we create it directly here
        paymentIntent = await this.prisma.paymentIntent.create({
          data: {
            tenantId,
            providerId,
            invoiceId: invoice.id,
            audience: invoice.audience,
            customerId: invoice.customerId,
            customerType: invoice.customerType,
            intentId: intentId || chargeId || `webhook_${Date.now()}`,
            status: type === 'PAYMENT_SUCCEEDED' ? 'succeeded' : type === 'PAYMENT_FAILED' ? 'canceled' : 'succeeded',
            amount: amount ? amount : invoice.amount,
            currency: currency || invoice.currency,
            capturedAmount: type === 'PAYMENT_SUCCEEDED' ? (amount ? amount : invoice.amount) : null,
            metadata: {
              ...metadata,
              chargeId,
              webhookProcessed: true,
              webhookProcessedAt: new Date().toISOString(),
            },
          },
          include: {
            invoice: true,
          },
        });
      }
    }

    if (!paymentIntent) {
      // No payment intent found - log but don't throw (idempotent handling)
      console.warn(`Webhook event received but no matching payment intent found:`, {
        tenantId,
        providerId,
        intentId,
        chargeId,
        type,
      });
      return { processed: false, message: 'No matching payment intent found' };
    }

    // Check if already processed (idempotency check)
    const existingWebhook = (paymentIntent.metadata as Record<string, any>)?.webhooks || [];
    const webhookId = `${type}_${intentId || chargeId}_${Date.now()}`;
    
    // Check if this exact event was already processed
    const alreadyProcessed = existingWebhook.some(
      (wh: any) => wh.type === type && wh.intentId === intentId && wh.chargeId === chargeId,
    );

    if (alreadyProcessed) {
      console.log(`Webhook event already processed (idempotent):`, {
        type,
        intentId,
        chargeId,
      });
      return { processed: true, message: 'Event already processed', idempotent: true };
    }

    // Process based on event type
    switch (type) {
      case 'PAYMENT_SUCCEEDED':
        await this.processPaymentSucceeded(paymentIntent, amount, currency, metadata);
        break;
      case 'PAYMENT_FAILED':
        await this.processPaymentFailed(paymentIntent, metadata);
        break;
      case 'REFUNDED':
        await this.processRefunded(paymentIntent, amount, metadata);
        break;
    }

    // Update payment intent metadata with webhook info
    await this.prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          webhooks: [
            ...existingWebhook,
            {
              type,
              intentId,
              chargeId,
              amount,
              processedAt: new Date().toISOString(),
              webhookId,
            },
          ],
        },
      },
    });

    return { processed: true, paymentIntentId: paymentIntent.id };
  }

  /**
   * Process payment succeeded event
   */
  private async processPaymentSucceeded(
    paymentIntent: any,
    amount?: number,
    currency?: string,
    metadata?: Record<string, any>,
  ) {
    // Update payment intent status
    await this.prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'succeeded',
        capturedAmount: amount ? amount : paymentIntent.amount,
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          ...(metadata || {}),
          succeededAt: new Date().toISOString(),
        },
      },
    });

    // If payment intent is linked to an invoice, mark invoice as paid
    if (paymentIntent.invoiceId) {
      const invoice = paymentIntent.invoice;
      if (invoice && invoice.status !== 'paid') {
        const paidAmount = amount ? amount : Number(invoice.amount);
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'paid',
            paidAmount,
            paidAt: new Date(),
            metadata: {
              ...(invoice.metadata as Record<string, any> || {}),
              paidViaWebhook: true,
              paidViaWebhookAt: new Date().toISOString(),
            },
          },
        });
      }
    }
  }

  /**
   * Process payment failed event
   */
  private async processPaymentFailed(
    paymentIntent: any,
    metadata?: Record<string, any>,
  ) {
    // Update payment intent status
    await this.prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'canceled',
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          ...(metadata || {}),
          failedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Process refunded event
   */
  private async processRefunded(
    paymentIntent: any,
    amount?: number,
    metadata?: Record<string, any>,
  ) {
    const refundAmount = amount ? Number(amount) : Number(paymentIntent.capturedAmount || paymentIntent.amount);
    const currentRefunded = Number(paymentIntent.refundedAmount || 0);

    // Update payment intent
    await this.prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        refundedAmount: currentRefunded + refundAmount,
        metadata: {
          ...(paymentIntent.metadata as Record<string, any> || {}),
          refunds: [
            ...((paymentIntent.metadata as Record<string, any> || {}).refunds || []),
            {
              amount: refundAmount,
              refundedAt: new Date().toISOString(),
              ...(metadata || {}),
            },
          ],
        },
      },
    });

    // If payment intent is linked to an invoice, update invoice
    if (paymentIntent.invoiceId) {
      const invoice = paymentIntent.invoice;
      if (invoice) {
        const paidAmount = Number(invoice.paidAmount || invoice.amount);
        const newPaidAmount = paidAmount - refundAmount;

        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaidAmount > 0 ? newPaidAmount : 0,
            status: newPaidAmount <= 0 ? 'open' : 'paid',
            metadata: {
              ...(invoice.metadata as Record<string, any> || {}),
              refunds: [
                ...((invoice.metadata as Record<string, any> || {}).refunds || []),
                {
                  amount: refundAmount,
                  refundedAt: new Date().toISOString(),
                  ...(metadata || {}),
                },
              ],
            },
          },
        });
      }
    }
  }
}

