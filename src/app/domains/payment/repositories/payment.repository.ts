/**
 * Payment Repository
 * 
 * Handles all payment-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse, Pagination } from '../../../core/infrastructure/http/api-response.types';
import { Payment } from '../models/payment.model';
import {
  PaymentDto,
  PaymentCreateDto,
  PaymentInitializeRequestDto,
  PaymentInitializeResponseDto,
  PaymentListDto,
  PaymentProcessDto,
  PaymentStatsDto,
  PaymentVerifyResponseDto,
} from '../models/payment.dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/payments';

  /**
   * Convert PaymentDto to Payment domain model
   */
  private toDomain(dto: PaymentDto): Payment {
    return Payment.fromDto(dto);
  }

  /**
   * Convert pagination payload to shared pagination contract
   */
  private toPagination(dto: PaymentListDto): Pagination {
    return {
      page: dto.page,
      per_page: dto.per_page,
      total_items: dto.total,
      total_pages: dto.pages,
      first_page: 1,
      last_page: dto.pages,
      previous_page: dto.page > 1 ? dto.page - 1 : null,
      next_page: dto.page < dto.pages ? dto.page + 1 : null,
      has_next: dto.page < dto.pages,
      has_prev: dto.page > 1
    };
  }

  /**
   * List payments for the authenticated user (paginated)
   */
  listUserPayments(params?: Record<string, unknown>): Observable<PaginatedResponse<Payment>> {
    return this.apiClient.get<PaymentListDto>(this.baseEndpoint, params).pipe(
      map((response) => ({
        items: response.data.payments.map((dto) => this.toDomain(dto)),
        pagination: this.toPagination(response.data)
      }))
    );
  }

  /**
   * Get payment by ID
   */
  findById(id: string): Observable<Payment> {
    return this.apiClient.get<PaymentDto>(`${this.baseEndpoint}/${id}`).pipe(
      map((response) => this.toDomain(response.data))
    );
  }

  /**
   * Create payment record (buyer flow)
   */
  create(data: PaymentCreateDto): Observable<Payment> {
    return this.apiClient.post<PaymentDto>(`${this.baseEndpoint}/create`, data).pipe(
      map((response) => this.toDomain(response.data))
    );
  }

  /**
   * Initialize a Paystack transaction (returns redirect URL)
   */
  initialize(data: PaymentInitializeRequestDto): Observable<PaymentInitializeResponseDto> {
    return this.apiClient.post<PaymentInitializeResponseDto>(
      `${this.baseEndpoint}/initialize`,
      data
    ).pipe(map((response) => response.data));
  }

  /**
   * Process payment (charge authorization)
   */
  process(id: string, paymentData: PaymentProcessDto): Observable<Payment> {
    return this.apiClient
      .post<PaymentDto>(`${this.baseEndpoint}/${id}/process`, paymentData)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Verify payment status with gateway
   */
  verify(id: string): Observable<PaymentVerifyResponseDto> {
    return this.apiClient
      .get<PaymentVerifyResponseDto>(`${this.baseEndpoint}/${id}/verify`)
      .pipe(map((response) => response.data));
  }

  /**
   * Fetch payments tied to an order
   */
  findByOrder(orderId: string, params?: Record<string, unknown>): Observable<Payment[]> {
    const query = { ...params, order_id: orderId };
    return this.apiClient
      .get<PaymentListDto>(this.baseEndpoint, query)
      .pipe(map((response) => response.data.payments.map((dto) => this.toDomain(dto))));
  }

  /**
   * Get seller-facing payment statistics
   */
  getStats(): Observable<PaymentStatsDto> {
    return this.apiClient
      .get<PaymentStatsDto>(`${this.baseEndpoint}/admin/stats`)
      .pipe(map((response) => response.data));
  }

  /**
   * Retrieve the latest payment snapshot without pagination
   */
  listRecent(limit = 5): Observable<Payment[]> {
    const params = { page: 1, per_page: limit };
    return this.listUserPayments(params).pipe(
      map((response) => response.items)
    );
  }
}

