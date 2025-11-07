import { Injectable } from '@nestjs/common';
import {
  PaymentAdapter,
  CreateIntentParams,
  CreateIntentResult,
  CaptureResult,
  VoidResult,
  RefundResult,
} from '../interfaces/payment-adapter.interface';

/**
 * Cash Payment Adapter
 * Implements PaymentAdapter interface for cash/offline payments
 * This adapter handles payments that are completed offline or manually
 */
@Injectable()
export class CashAdapter implements PaymentAdapter {
  private config: any;

  constructor() {
    this.config = {};
  }

  getProviderId(): string {
    return 'cash';
  }

  async createIntent(params: CreateIntentParams): Promise<CreateIntentResult> {
    // Cash payments are typically created and marked as pending manual confirmation
    // The payment is completed when manually confirmed by an admin
    
    return {
      intentId: `pi_cash_${Date.now()}`,
      status: 'requires_confirmation', // Requires manual confirmation
      metadata: {
        ...params.metadata,
        paymentMethod: 'cash',
        requiresManualConfirmation: true,
      },
    };
  }

  async capture(intentId: string, amount?: number): Promise<CaptureResult> {
    // Cash payments are captured when manually confirmed
    // This would typically be called by an admin after verifying cash receipt
    
    return {
      success: true,
      intentId,
      status: 'succeeded',
      capturedAmount: amount || 0,
      metadata: {
        capturedAt: new Date().toISOString(),
        capturedBy: 'manual', // Or admin user ID
      },
    };
  }

  async void(intentId: string): Promise<VoidResult> {
    // Cash payments can be voided if not yet confirmed
    
    return {
      success: true,
      intentId,
      status: 'canceled',
      metadata: {
        voidedAt: new Date().toISOString(),
      },
    };
  }

  async refund(intentId: string, amount?: number): Promise<RefundResult> {
    // Cash refunds are handled manually
    // This creates a refund record that needs to be processed offline
    
    return {
      success: true,
      refundId: `re_cash_${Date.now()}`,
      amount: amount || 0,
      status: 'succeeded',
      metadata: {
        refundedAt: new Date().toISOString(),
        requiresManualProcessing: true,
      },
    };
  }

  verifySignature(payload: string | Buffer, signature: string, secret?: string): boolean {
    // Cash payments don't have webhooks, so this is typically not used
    // For cash payments, verification is done manually
    // Return true to allow manual processing paths
    
    return true;
  }
}
