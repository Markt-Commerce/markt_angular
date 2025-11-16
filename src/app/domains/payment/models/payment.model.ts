import type {
  PaymentDto,
  PaymentMethodDto,
  PaymentStatusDto,
} from './payment.dto';

/**
 * Payment Domain Models
 *
 * Domain entities and value objects for payment processing.
 */

export type PaymentStatus = PaymentStatusDto;

export type PaymentMethod = PaymentMethodDto;

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
    public readonly transactionId: string | null,
    public readonly gatewayResponse: Record<string, unknown> | null,
    public readonly paidAt: string | null
  ) {}

  static fromDto(dto: PaymentDto): Payment {
    return new Payment(
      dto.id,
      dto.order_id,
      dto.amount,
      dto.currency,
      dto.method,
      dto.status,
      dto.created_at,
      dto.updated_at,
      dto.transaction_id ?? null,
      dto.gateway_response ?? null,
      dto.paid_at ?? null
    );
  }

  isSuccessful(): boolean {
    return this.status === 'completed';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isPartiallyRefunded(): boolean {
    return this.status === 'partially_refunded';
  }

  hasFailed(): boolean {
    return this.status === 'failed';
  }

  isRefunded(): boolean {
    return this.status === 'refunded' || this.isPartiallyRefunded();
  }

  canRefund(): boolean {
    return this.status === 'completed';
  }

  canRetry(): boolean {
    return this.status === 'failed';
  }

  isVerified(): boolean {
    return Boolean(this.transactionId) && this.isSuccessful();
  }

  withStatus(status: PaymentStatus): Payment {
    return new Payment(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      this.method,
      status,
      this.createdAt,
      this.updatedAt,
      this.transactionId,
      this.gatewayResponse,
      this.paidAt
    );
  }

  markAsCompleted(): Payment {
    return new Payment(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      this.method,
      'completed',
      this.createdAt,
      this.updatedAt,
      this.transactionId,
      this.gatewayResponse,
      this.paidAt
    );
  }

  markAsFailed(): Payment {
    return new Payment(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      this.method,
      'failed',
      this.createdAt,
      this.updatedAt,
      this.transactionId,
      this.gatewayResponse,
      this.paidAt
    );
  }

  markAsPending(): Payment {
    return new Payment(
      this.id,
      this.orderId,
      this.amount,
      this.currency,
      this.method,
      'pending',
      this.createdAt,
      this.updatedAt,
      this.transactionId,
      this.gatewayResponse,
      this.paidAt
    );
  }

  getFormattedAmount(locale = 'en-NG'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency || 'NGN',
    }).format(this.amount);
  }
}

export class PaymentMethodInfo {
  constructor(
    public readonly id: PaymentMethod,
    public readonly name: string,
    public readonly type: 'card' | 'bank' | 'wallet' | 'mobile_money',
    public readonly icon: string,
    public readonly isAvailable: boolean
  ) {}

  isAvailableMethod(): boolean {
    return this.isAvailable;
  }

  isCardBased(): boolean {
    return this.type === 'card';
  }
}
