/**
 * Payment DTOs
 *
 * Mirrors the backend schemas exposed by the payments service.
 */

export const PAYMENT_STATUS = [
  'pending',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
] as const;

export type PaymentStatusDto = (typeof PAYMENT_STATUS)[number];

export const PAYMENT_METHODS = [
  'card',
  'bank_transfer',
  'mobile_money',
  'wallet',
] as const;

export type PaymentMethodDto = (typeof PAYMENT_METHODS)[number];

export interface PaymentDto {
  readonly id: string;
  readonly order_id: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: PaymentMethodDto;
  readonly status: PaymentStatusDto;
  readonly transaction_id: string | null;
  readonly gateway_response: Record<string, unknown> | null;
  readonly paid_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PaymentCreateDto {
  readonly order_id: string;
  readonly amount: number;
  readonly currency?: string;
  readonly method?: PaymentMethodDto;
  readonly metadata?: Record<string, unknown> | null;
}

export interface PaymentProcessDto {
  readonly authorization_code?: string;
  readonly card_token?: string;
  readonly metadata?: Record<string, unknown> | null;
}

export interface PaymentCallbackDto {
  readonly reference: string;
  readonly status?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface PaymentVerifyResponseDto {
  readonly verified: boolean;
  readonly amount?: number;
  readonly gateway_response?: Record<string, unknown>;
}

export interface PaymentListDto {
  readonly payments: PaymentDto[];
  readonly total: number;
  readonly page: number;
  readonly per_page: number;
  readonly pages: number;
}

export interface PaymentInitializeRequestDto {
  readonly order_id: string;
  readonly amount: number;
  readonly currency?: string;
  readonly method?: PaymentMethodDto;
  readonly metadata?: Record<string, unknown> | null;
}

export interface PaymentInitializeResponseDto {
  readonly payment_id: string;
  readonly authorization_url: string;
  readonly reference: string;
  readonly access_code: string;
}

export interface PaymentStatsDto {
  readonly total_payments: number;
  readonly successful_payments: number;
  readonly failed_payments: number;
  readonly total_revenue: number;
  readonly currency: string;
}
