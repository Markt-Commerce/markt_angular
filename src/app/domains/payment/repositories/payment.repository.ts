/**
 * Payment Repository
 * 
 * Handles all payment-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse, PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Payment, PaymentMethod } from '../models/payment.model';
import {
  PaymentDto,
  PaymentCreateDto,
  PaymentListDto,
  PaymentInitializeDto,
  PaymentInitializeResponseDto,
  PaymentVerifyDto,
  PaymentVerifyResponseDto
} from '../models/payment.dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/payments';

  /**
   * Convert PaymentDto to Payment domain model
   */
  private toDomain(dto: PaymentDto): Payment {
    return new Payment(
      dto.id,
      dto.order_id,
      dto.amount,
      dto.currency,
      dto.method,
      dto.status,
      dto.created_at,
      dto.updated_at,
      dto.transaction_id,
      dto.gateway_response,
      dto.paid_at
    );
  }

  /**
   * Get all payments
   */
  findAll(params?: Record<string, unknown>): Observable<Payment[]> {
    return this.apiClient.get<PaymentDto[]>(this.baseEndpoint, params).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  /**
   * Get payments with pagination
   */
  findPaginated(params?: Record<string, unknown>): Observable<PaginatedResponse<Payment>> {
    return this.apiClient.get<PaymentListDto>(this.baseEndpoint, params).pipe(
      map(response => ({
        items: response.data.payments.map(dto => this.toDomain(dto)),
        pagination: {
          page: response.data.page,
          per_page: response.data.per_page,
          total_items: response.data.total,
          total_pages: response.data.pages,
          first_page: 1,
          last_page: response.data.pages,
          previous_page: response.data.page > 1 ? response.data.page - 1 : null,
          next_page: response.data.page < response.data.pages ? response.data.page + 1 : null,
          has_next: response.data.page < response.data.pages,
          has_prev: response.data.page > 1
        }
      }))
    );
  }

  /**
   * Get payment by ID
   */
  findById(id: string): Observable<Payment> {
    return this.apiClient.get<PaymentDto>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Create payment
   */
  create(data: PaymentCreateDto): Observable<Payment> {
    return this.apiClient.post<PaymentDto>(this.baseEndpoint, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Initialize payment (for payment gateways)
   */
  initialize(data: PaymentInitializeDto): Observable<PaymentInitializeResponseDto> {
    return this.apiClient.post<PaymentInitializeResponseDto>(
      `${this.baseEndpoint}/initialize`,
      data
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Verify payment
   */
  verify(data: PaymentVerifyDto): Observable<PaymentVerifyResponseDto> {
    return this.apiClient.post<PaymentVerifyResponseDto>(
      `${this.baseEndpoint}/verify`,
      data
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Process payment
   */
  process(id: string, paymentData: Record<string, unknown>): Observable<Payment> {
    return this.apiClient.post<PaymentDto>(`${this.baseEndpoint}/${id}/process`, paymentData).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Refund payment
   */
  refund(id: string, reason?: string): Observable<Payment> {
    const body = reason ? { reason } : {};
    return this.apiClient.post<PaymentDto>(`${this.baseEndpoint}/${id}/refund`, body).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Get payments by order
   */
  findByOrder(orderId: string): Observable<Payment[]> {
    return this.apiClient.get<PaymentDto[]>(this.baseEndpoint, { order_id: orderId }).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }
}

