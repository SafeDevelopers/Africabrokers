import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  Request,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceService } from './services/invoice.service';
import { ProviderRegistry } from './services/provider-registry.service';
import { PaymentProviderType } from '@prisma/client';

export interface NormalizedWebhookEvent {
  type: 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'REFUNDED';
  invoiceId?: string;
  intentId?: string;
  chargeId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

@Controller('payments/webhooks')
export class WebhooksController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  /**
   * POST /v1/payments/webhooks/:provider
   * Webhook endpoint for payment providers
   * Handles webhook events from different payment providers
   */
  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Request() req: RawBodyRequest<Request>,
  ) {
    // Get raw body for signature verification
    // NestJS rawBody is available as Buffer or string
    let rawBody: string | Buffer;
    if (req.rawBody) {
      rawBody = req.rawBody;
    } else {
      // Fallback: stringify body if rawBody not available
      rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    // Get signature from headers (provider-specific headers)
    const signature = headers['stripe-signature'] || 
                      headers['x-telebirr-signature'] || 
                      headers['x-mpesa-signature'] || 
                      headers['x-cash-signature'] ||
                      headers['x-signature'] ||
                      headers['signature'] ||
                      '';

    // Find provider by providerId
    const providers = await this.prisma.paymentProvider.findMany({
      where: {
        providerId: provider.toLowerCase(),
        isActive: true,
      },
    });

    if (providers.length === 0) {
      // Return 200 even if provider not found (to prevent provider retries)
      console.warn(`Webhook received for unknown provider: ${provider}`);
      return { received: true, message: 'Provider not found' };
    }

    // Process webhook for each tenant that has this provider
    // In practice, webhooks are usually tenant-specific, but we handle multiple tenants
    const results = await Promise.allSettled(
      providers.map(async (paymentProvider: any) => {
        try {
          // Get adapter
          const adapter = this.providerRegistry.getAdapter(paymentProvider.type);

          // Get webhook secret from provider config
          const config = paymentProvider.config as Record<string, any>;
          const webhookSecret = config.webhookSecret || config.secret || '';

          // Verify signature
          const isValid = adapter.verifySignature(
            rawBody,
            signature,
            webhookSecret,
          );

          if (!isValid) {
            console.warn(`Invalid webhook signature for provider ${provider} (tenant: ${paymentProvider.tenantId})`);
            throw new Error('Invalid webhook signature');
          }

          // Normalize event based on provider type
          const normalizedEvent = await this.normalizeEvent(
            paymentProvider.type,
            body,
            headers,
            paymentProvider.tenantId,
          );

          // Apply webhook event to invoice service (idempotent)
          await this.invoiceService.applyWebhook(
            paymentProvider.tenantId,
            paymentProvider.id,
            normalizedEvent,
          );

          return {
            tenantId: paymentProvider.tenantId,
            providerId: paymentProvider.id,
            processed: true,
            event: normalizedEvent.type,
          };
        } catch (error) {
          console.error(`Error processing webhook for tenant ${paymentProvider.tenantId}:`, error);
          return {
            tenantId: paymentProvider.tenantId,
            providerId: paymentProvider.id,
            processed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    // Always return 200 (after idempotent handling)
    return {
      received: true,
      provider,
      results: results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason })),
    };
  }

  /**
   * Normalize webhook event from provider-specific format to standard format
   */
  private async normalizeEvent(
    providerType: PaymentProviderType,
    body: any,
    headers: Record<string, string>,
    tenantId: string,
  ): Promise<NormalizedWebhookEvent> {
    switch (providerType) {
      case PaymentProviderType.STRIPE:
        return this.normalizeStripeEvent(body);
      case PaymentProviderType.TELEBIRR:
        return this.normalizeTelebirrEvent(body);
      case PaymentProviderType.MPESA:
        return this.normalizeMpesaEvent(body);
      case PaymentProviderType.CASH:
        return this.normalizeCashEvent(body);
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  /**
   * Normalize Stripe webhook event
   */
  private normalizeStripeEvent(body: any): NormalizedWebhookEvent {
    const event = body.data?.object || body;
    const eventType = body.type || event.type || '';

    // Map Stripe event types to normalized types
    let normalizedType: NormalizedWebhookEvent['type'];
    
    if (eventType.includes('payment_intent.succeeded') || eventType.includes('charge.succeeded')) {
      normalizedType = 'PAYMENT_SUCCEEDED';
    } else if (eventType.includes('payment_intent.payment_failed') || eventType.includes('charge.failed')) {
      normalizedType = 'PAYMENT_FAILED';
    } else if (eventType.includes('charge.refunded') || eventType.includes('refund')) {
      normalizedType = 'REFUNDED';
    } else {
      // Unknown event type - default to succeeded if it's a payment-related event
      normalizedType = 'PAYMENT_SUCCEEDED';
    }

    // Extract invoice ID from metadata or invoice field
    const invoiceId = event.metadata?.invoiceId || 
                      event.metadata?.invoice_id || 
                      event.invoice ||
                      event.invoice_id ||
                      undefined;

    return {
      type: normalizedType,
      invoiceId,
      intentId: event.id || event.payment_intent || event.payment_intent_id,
      chargeId: event.id || event.charge?.id || event.charge_id,
      amount: event.amount || event.amount_captured || event.amount_received,
      currency: event.currency?.toUpperCase() || event.currency,
      metadata: {
        ...event.metadata,
        stripeEventId: body.id,
        stripeEventType: eventType,
      },
    };
  }

  /**
   * Normalize Telebirr webhook event
   */
  private normalizeTelebirrEvent(body: any): NormalizedWebhookEvent {
    const status = body.status || body.Status || '';
    const transactionId = body.transactionId || body.TransactionId || body.id;
    
    let normalizedType: NormalizedWebhookEvent['type'];
    
    if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'success') {
      normalizedType = 'PAYMENT_SUCCEEDED';
    } else if (status === 'FAILED' || status === 'failed') {
      normalizedType = 'PAYMENT_FAILED';
    } else if (status === 'REFUNDED' || status === 'refunded') {
      normalizedType = 'REFUNDED';
    } else {
      normalizedType = 'PAYMENT_SUCCEEDED'; // Default
    }

    // Extract invoice ID from metadata
    const invoiceId = body.invoiceId || 
                      body.invoice_id || 
                      body.metadata?.invoiceId ||
                      body.metadata?.invoice_id ||
                      undefined;

    return {
      type: normalizedType,
      invoiceId,
      intentId: transactionId,
      chargeId: transactionId,
      amount: body.amount || body.Amount,
      currency: body.currency?.toUpperCase() || body.Currency?.toUpperCase() || 'ETB',
      metadata: {
        ...body,
        telebirrTransactionId: transactionId,
      },
    };
  }

  /**
   * Normalize M-Pesa webhook event
   */
  private normalizeMpesaEvent(body: any): NormalizedWebhookEvent {
    const resultCode = body.ResultCode || body.resultCode || body.Body?.stkCallback?.ResultCode;
    const resultDesc = body.ResultDesc || body.resultDesc || body.Body?.stkCallback?.ResultDesc;
    const checkoutRequestId = body.CheckoutRequestID || body.checkoutRequestId || body.Body?.stkCallback?.CheckoutRequestID;
    const mpesaReceiptNumber = body.MpesaReceiptNumber || body.mpesaReceiptNumber || body.Body?.stkCallback?.CallbackMetadata?.Item?.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
    
    let normalizedType: NormalizedWebhookEvent['type'];
    
    // M-Pesa ResultCode: 0 = success, non-zero = failure
    if (resultCode === 0 || resultCode === '0') {
      normalizedType = 'PAYMENT_SUCCEEDED';
    } else {
      normalizedType = 'PAYMENT_FAILED';
    }

    // Extract amount from callback metadata
    const metadata = body.Body?.stkCallback?.CallbackMetadata?.Item || [];
    const amountItem = metadata.find((item: any) => item.Name === 'Amount');
    const amount = amountItem?.Value || body.Amount || body.amount;

    // Extract invoice ID from metadata
    const invoiceItem = metadata.find((item: any) => item.Name === 'InvoiceId' || item.Name === 'invoiceId');
    const invoiceId = invoiceItem?.Value || 
                      body.invoiceId || 
                      body.invoice_id ||
                      body.metadata?.invoiceId ||
                      undefined;

    return {
      type: normalizedType,
      invoiceId,
      intentId: checkoutRequestId,
      chargeId: mpesaReceiptNumber,
      amount: amount ? Number(amount) : undefined,
      currency: 'KES',
      metadata: {
        ...body,
        mpesaReceiptNumber,
        mpesaResultCode: resultCode,
        mpesaResultDesc: resultDesc,
      },
    };
  }

  /**
   * Normalize Cash webhook event
   * Cash payments typically don't have webhooks, but we handle manual confirmations
   */
  private normalizeCashEvent(body: any): NormalizedWebhookEvent {
    const status = body.status || body.Status || 'SUCCEEDED';
    
    let normalizedType: NormalizedWebhookEvent['type'];
    
    if (status === 'SUCCEEDED' || status === 'success' || status === 'paid') {
      normalizedType = 'PAYMENT_SUCCEEDED';
    } else if (status === 'FAILED' || status === 'failed') {
      normalizedType = 'PAYMENT_FAILED';
    } else if (status === 'REFUNDED' || status === 'refunded') {
      normalizedType = 'REFUNDED';
    } else {
      normalizedType = 'PAYMENT_SUCCEEDED'; // Default
    }

    // Extract invoice ID from body
    const invoiceId = body.invoiceId || 
                      body.invoice_id || 
                      body.metadata?.invoiceId ||
                      body.metadata?.invoice_id ||
                      undefined;

    return {
      type: normalizedType,
      invoiceId,
      intentId: body.intentId || body.paymentIntentId,
      chargeId: body.chargeId || body.receiptId,
      amount: body.amount,
      currency: body.currency?.toUpperCase() || 'ETB',
      metadata: {
        ...body,
        paymentMethod: 'cash',
      },
    };
  }
}

