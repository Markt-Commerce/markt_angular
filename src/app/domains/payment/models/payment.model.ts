/**
 * Payment Domain Models
 * 
 * Domain entities for payment processing.
 */

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'wallet' | 'crypto';

/**
 * Payment - Domain Entity
 */
export class Payment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly method: PaymentMethod,
    public readonly status: PaymentStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly transactionId?: string,
    public readonly gatewayResponse?: Record<string, unknown>,
    public readonly paidAt?: string
  ) {}

  /**
   * Business Rule: Check if payment is successful
   */
  isSuccessful(): boolean {
    return this.status === 'completed';
  }

  /**
   * Business Rule: Check if payment is pending
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Business Rule: Check if payment is processing
   */
  isProcessing(): boolean {
    return this.status === 'processing';
  }

  /**
   * Business Rule: Check if payment failed
   */
  hasFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * Business Rule: Check if payment is refunded
   */
  isRefunded(): boolean {
    return this.status === 'refunded';
  }

  /**
   * Business Rule: Check if payment can be refunded
   */
  canRefund(): boolean {
    return this.status === 'completed' && !this.isRefunded();
  }

  /**
   * Business Rule: Check if payment can be retried
   */
  canRetry(): boolean {
    return this.status === 'failed';
  }

  /**
   * Business Rule: Check if payment is verified
   */
  isVerified(): boolean {
    return !!this.transactionId && this.isSuccessful();
  }

  /**
   * Business Rule: Get formatted amount
   */
  getFormattedAmount(): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: this.currency || 'NGN'
    }).format(this.amount);
  }
}

/**
 * Payment Method Info - Value Object
 */
export class PaymentMethodInfo {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: 'card' | 'bank' | 'wallet' | 'crypto',
    public readonly icon: string,
    public readonly isAvailable: boolean
  ) {}

  /**
   * Business Rule: Check if method is available
   */
  isAvailableMethod(): boolean {
    return this.isAvailable;
  }

  /**
   * Business Rule: Check if method is card-based
   */
  isCardBased(): boolean {
    return this.type === 'card';
  }
}

