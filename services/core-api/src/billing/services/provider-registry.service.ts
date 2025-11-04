import { Injectable } from '@nestjs/common';
import { PaymentAdapter } from '../interfaces/payment-adapter.interface';
import { PaymentProviderType } from '@prisma/client';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { TelebirrAdapter } from '../adapters/telebirr.adapter';
import { MpesaAdapter } from '../adapters/mpesa.adapter';
import { CashAdapter } from '../adapters/cash.adapter';

/**
 * Provider Registry Service
 * Resolves payment adapters by provider type
 */
@Injectable()
export class ProviderRegistry {
  private adapters: Map<PaymentProviderType, PaymentAdapter>;

  constructor(
    private readonly stripeAdapter: StripeAdapter,
    private readonly telebirrAdapter: TelebirrAdapter,
    private readonly mpesaAdapter: MpesaAdapter,
    private readonly cashAdapter: CashAdapter,
  ) {
    this.adapters = new Map();
    this.initializeAdapters();
  }

  /**
   * Initialize all adapters
   */
  private initializeAdapters() {
    // Use injected adapters (they will be instantiated by NestJS DI)
    this.adapters.set(PaymentProviderType.STRIPE, this.stripeAdapter);
    this.adapters.set(PaymentProviderType.TELEBIRR, this.telebirrAdapter);
    this.adapters.set(PaymentProviderType.MPESA, this.mpesaAdapter);
    this.adapters.set(PaymentProviderType.CASH, this.cashAdapter);
  }

  /**
   * Get adapter by provider type
   */
  getAdapter(providerType: PaymentProviderType): PaymentAdapter {
    const adapter = this.adapters.get(providerType);
    
    if (!adapter) {
      throw new Error(`No adapter found for provider type: ${providerType}`);
    }

    return adapter;
  }

  /**
   * Register a custom adapter
   */
  registerAdapter(providerType: PaymentProviderType, adapter: PaymentAdapter) {
    this.adapters.set(providerType, adapter);
  }
}

