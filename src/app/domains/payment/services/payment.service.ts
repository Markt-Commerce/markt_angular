/**
 * Payment Domain Service
 *
 * Manages payment processing and payment-related business logic.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PaymentRepository } from '../repositories/payment.repository';
import {
  Payment,
  PaymentMethod,
  PaymentMethodInfo,
} from '../models/payment.model';
import {
  PaymentCreateDto,
  PaymentInitializeDto,
  PaymentVerifyDto,
} from '../models/payment.dto';
import { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';

export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentRepository = inject(PaymentRepository);

  private paymentStateSubject = new BehaviorSubject<PaymentState>({
    payments: [],
    currentPayment: null,
    isLoading: false,
    error: null,
  });

  public paymentState$ = this.paymentStateSubject.asObservable();

  /**
   * Available payment methods
   */
  public readonly paymentMethods: PaymentMethodInfo[] = [
    new PaymentMethodInfo('paystack', 'Paystack', 'card', 'credit-card', true),
    new PaymentMethodInfo(
      'flutterwave',
      'Flutterwave',
      'card',
      'credit-card',
      true
    ),
    new PaymentMethodInfo(
      'bank_transfer',
      'Bank Transfer',
      'bank',
      'building',
      true
    ),
    new PaymentMethodInfo('wallet', 'Markt Wallet', 'wallet', 'wallet', true),
  ];

  /**
   * Get all payments
   */
  getPayments(params?: Record<string, unknown>): Observable<Payment[]> {
    this.setLoading(true);

    return this.paymentRepository.findAll(params).pipe(
      tap({
        next: (payments) => {
          this.updateState({
            payments,
            isLoading: false,
            error: null,
          });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load payments');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Get payments with pagination
   */
  getPaymentsPaginated(
    params?: Record<string, unknown>
  ): Observable<PaginatedResponse<Payment>> {
    return this.paymentRepository.findPaginated(params);
  }

  /**
   * Get payment by ID
   */
  getPayment(id: string): Observable<Payment> {
    return this.paymentRepository.findById(id).pipe(
      tap({
        next: (payment) => {
          this.updateState({ currentPayment: payment });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load payment');
        },
      })
    );
  }

  /**
   * Create payment
   * Business logic: Validate payment before creation
   */
  createPayment(data: PaymentCreateDto): Observable<Payment> {
    this.setLoading(true);

    // Business validation
    if (!data.order_id) {
      throw new Error('Order ID is required');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (data.method && !this.isValidPaymentMethod(data.method)) {
      throw new Error('Invalid payment method');
    }

    return this.paymentRepository.create(data).pipe(
      tap({
        next: (payment) => {
          const currentPayments = this.getState().payments;
          this.updateState({
            payments: [payment, ...currentPayments],
            currentPayment: payment,
            isLoading: false,
            error: null,
          });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to create payment');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Initialize payment (for payment gateways)
   * Business logic: Validate initialization data
   */
  initializePayment(data: PaymentInitializeDto): Observable<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    return this.paymentRepository.initialize(data);
  }

  /**
   * Verify payment
   * Business logic: Verify payment reference
   */
  verifyPayment(reference: string): Observable<any> {
    if (!reference || reference.trim().length === 0) {
      throw new Error('Payment reference is required');
    }

    return this.paymentRepository.verify({ reference }).pipe(
      tap({
        next: (response) => {
          // Update payment status if we have it in state
          const currentPayment = this.getState().currentPayment;
          if (currentPayment) {
            this.getPayment(currentPayment.id).subscribe();
          }
        },
      })
    );
  }

  /**
   * Process payment
   */
  processPayment(
    id: string,
    paymentData: Record<string, unknown>
  ): Observable<Payment> {
    return this.paymentRepository.process(id, paymentData).pipe(
      tap({
        next: (payment) => {
          this.updatePaymentInState(payment);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to process payment');
        },
      })
    );
  }

  /**
   * Refund payment
   * Business logic: Check if payment can be refunded
   */
  refundPayment(id: string, reason?: string): Observable<Payment> {
    return this.getPayment(id)
      .pipe(
        tap({
          next: (payment) => {
            if (!payment.canRefund()) {
              throw new Error('Payment cannot be refunded');
            }
          },
        })
      )
      .pipe(
        // Switch to refund operation
        tap(() => {
          return this.paymentRepository.refund(id, reason);
        })
      ) as Observable<Payment>;

    // Simplified version
    return this.paymentRepository.refund(id, reason).pipe(
      tap({
        next: (payment) => {
          this.updatePaymentInState(payment);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to refund payment');
        },
      })
    );
  }

  /**
   * Get payments by order
   */
  getPaymentsByOrder(orderId: string): Observable<Payment[]> {
    return this.paymentRepository.findByOrder(orderId);
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): PaymentMethodInfo[] {
    return this.paymentMethods.filter((method) => method.isAvailableMethod());
  }

  /**
   * Check if payment method is valid
   */
  private isValidPaymentMethod(method: PaymentMethod): boolean {
    return this.paymentMethods.some(
      (m) => m.id === method && m.isAvailableMethod()
    );
  }

  /**
   * Private helper methods
   */
  private getState(): PaymentState {
    return this.paymentStateSubject.value;
  }

  private updateState(partial: Partial<PaymentState>): void {
    this.paymentStateSubject.next({
      ...this.paymentStateSubject.value,
      ...partial,
    });
  }

  private updatePaymentInState(payment: Payment): void {
    const state = this.getState();
    const payments = state.payments.map((p) =>
      p.id === payment.id ? payment : p
    );
    const currentPayment =
      state.currentPayment?.id === payment.id ? payment : state.currentPayment;

    this.updateState({ payments, currentPayment });
  }

  private setLoading(loading: boolean): void {
    this.updateState({ isLoading: loading });
  }

  private setError(error: string): void {
    this.updateState({ error, isLoading: false });
  }
}
