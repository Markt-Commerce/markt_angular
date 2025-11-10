/**
 * Payment DTOs
 * 
 * API request/response types for payments.
 */

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'flutterwave' | 'bank_transfer' | 'wallet' | 'crypto';

export interface PaymentDto {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  gateway_response?: Record<string, unknown>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreateDto {
  order_id: string;
  amount: number;
  currency?: string;
  method?: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface PaymentListDto {
  payments: PaymentDto[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

export interface PaymentInitializeDto {
  amount: number;
  email: string;
  currency?: string;
  method?: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitializeResponseDto {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerifyDto {
  reference: string;
}

export interface PaymentVerifyResponseDto {
  status: PaymentStatus;
  amount: number;
  currency: string;
  transaction_id: string;
  paid_at: string;
}

