/**
 * Payment Adapter Interface
 * All payment providers must implement this interface
 */
export interface PaymentAdapter {
  /**
   * Create a payment intent
   */
  createIntent(params: CreateIntentParams): Promise<CreateIntentResult>;

  /**
   * Capture a payment intent (after it's been authorized)
   */
  capture(intentId: string, amount?: number): Promise<CaptureResult>;

  /**
   * Void/cancel a payment intent
   */
  void(intentId: string): Promise<VoidResult>;

  /**
   * Refund a payment
   */
  refund(intentId: string, amount?: number): Promise<RefundResult>;

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string | Buffer, signature: string, secret?: string): boolean;

  /**
   * Get provider name
   */
  getProviderId(): string;
}

export interface CreateIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, any>;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CreateIntentResult {
  intentId: string;
  status: string;
  clientSecret?: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export interface CaptureResult {
  success: boolean;
  intentId: string;
  status: string;
  capturedAmount: number;
  metadata?: Record<string, any>;
}

export interface VoidResult {
  success: boolean;
  intentId: string;
  status: string;
  metadata?: Record<string, any>;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
  metadata?: Record<string, any>;
}

