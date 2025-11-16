/**
 * Payment Domain Service
 *
 * Manages payment processing and payment-related business logic.
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import type {
  PaginatedResponse,
  Pagination,
} from '../../../core/infrastructure/http/api-response.types';
import { PaymentRepository } from '../repositories/payment.repository';
import { Payment, PaymentMethodInfo } from '../models/payment.model';
import {
  PaymentCreateDto,
  PaymentInitializeRequestDto,
  PaymentInitializeResponseDto,
  PaymentProcessDto,
  PaymentStatsDto,
  PaymentVerifyResponseDto,
} from '../models/payment.dto';

export interface PaymentState {
  items: Payment[];
  pagination: Pagination | null;
  current: Payment | null;
  isLoading: boolean;
  error: string | null;
  verification: PaymentVerifyResponseDto | null;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly paymentRepository = inject(PaymentRepository);

  private readonly state = signal<PaymentState>({
    items: [],
    pagination: null,
    current: null,
    isLoading: false,
    error: null,
    verification: null,
  });

  private readonly itemsSignal = computed(() => this.state().items);
  private readonly paginationSignal = computed(() => this.state().pagination);
  private readonly currentSignal = computed(() => this.state().current);
  private readonly loadingSignal = computed(() => this.state().isLoading);
  private readonly errorSignal = computed(() => this.state().error);
  private readonly verificationSignal = computed(
    () => this.state().verification
  );

  readonly payments$ = toObservable(this.itemsSignal);
  readonly pagination$ = toObservable(this.paginationSignal);
  readonly currentPayment$ = toObservable(this.currentSignal);
  readonly isLoading$ = toObservable(this.loadingSignal);
  readonly error$ = toObservable(this.errorSignal);
  readonly verification$ = toObservable(this.verificationSignal);

  readonly paymentMethods: PaymentMethodInfo[] = [
    new PaymentMethodInfo('card', 'Card (Paystack)', 'card', 'credit-card', true),
    new PaymentMethodInfo(
      'bank_transfer',
      'Bank Transfer',
      'bank',
      'building',
      true
    ),
    new PaymentMethodInfo(
      'mobile_money',
      'Mobile Money',
      'mobile_money',
      'mobile',
      false
    ),
    new PaymentMethodInfo('wallet', 'Markt Wallet', 'wallet', 'wallet', false),
  ];

  get snapshot(): PaymentState {
    return this.state();
  }

  get availablePaymentMethods(): PaymentMethodInfo[] {
    return this.paymentMethods.filter((method) => method.isAvailableMethod());
  }

  loadPayments(
    params?: Record<string, unknown>
  ): Observable<PaginatedResponse<Payment>> {
    this.patchState({ isLoading: true, error: null });

    return this.paymentRepository.listUserPayments(params).pipe(
      tap(({ items, pagination }) => {
        this.patchState({
          items,
          pagination,
          isLoading: false,
          error: null,
        });
      }),
      finalize(() => this.patchState({ isLoading: false })),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  loadPayment(id: string): Observable<Payment> {
    this.patchState({ isLoading: true, error: null });

    return this.paymentRepository.findById(id).pipe(
      tap((payment) => {
        this.patchState({
          current: payment,
          isLoading: false,
          error: null,
        });
      }),
      finalize(() => this.patchState({ isLoading: false })),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  createPayment(data: PaymentCreateDto): Observable<Payment> {
    this.assertCreatePayload(data);
    this.patchState({ isLoading: true, error: null });

    return this.paymentRepository.create(data).pipe(
      tap((payment) => {
        this.patchState({
          items: [payment, ...this.state().items],
          current: payment,
          isLoading: false,
          error: null,
        });
      }),
      finalize(() => this.patchState({ isLoading: false })),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  initializePayment(
    request: PaymentInitializeRequestDto
  ): Observable<PaymentInitializeResponseDto> {
    this.assertInitializePayload(request);
    this.patchState({ error: null });

    return this.paymentRepository.initialize(request).pipe(
      tap((response) => {
        if (!this.state().current) {
          void this.loadPayment(response.payment_id).subscribe({
            error: () => {
              // Swallow error - backend may not expose payment immediately
            },
          });
        }
      }),
      catchError((error) => {
        this.patchState({ error: this.resolveErrorMessage(error) });
        return throwError(() => error);
      })
    );
  }

  processPayment(
    paymentId: string,
    payload: PaymentProcessDto
  ): Observable<Payment> {
    if (!paymentId) {
      throw new Error('Payment identifier is required to process payment');
    }

    return this.paymentRepository.process(paymentId, payload).pipe(
      tap((payment) => {
        this.updatePaymentInState(payment);
      }),
      catchError((error) => {
        this.patchState({ error: this.resolveErrorMessage(error) });
        return throwError(() => error);
      })
    );
  }

  verifyPayment(paymentId: string): Observable<PaymentVerifyResponseDto> {
    if (!paymentId) {
      throw new Error('Payment identifier is required to verify payment status');
    }

    return this.paymentRepository.verify(paymentId).pipe(
      tap((verification) => {
        this.patchState({ verification });
        const currentPayment = this.state().current;
        if (currentPayment?.id === paymentId && verification.verified) {
          void this.loadPayment(paymentId).subscribe();
        }
      }),
      catchError((error) => {
        this.patchState({ error: this.resolveErrorMessage(error) });
        return throwError(() => error);
      })
    );
  }

  listPaymentsByOrder(
    orderId: string,
    params?: Record<string, unknown>
  ): Observable<Payment[]> {
    if (!orderId) {
      throw new Error('Order identifier is required to load payments');
    }

    return this.paymentRepository.findByOrder(orderId, params).pipe(
      tap((payments) => {
        if (this.state().current && this.state().current?.orderId === orderId) {
          const currentPayment = payments.find(
            (payment) => payment.id === this.state().current?.id
          );
          if (currentPayment) {
            this.patchState({ current: currentPayment });
          }
        }
      })
    );
  }

  getPaymentStats(): Observable<PaymentStatsDto> {
    return this.paymentRepository.getStats();
  }

  private assertCreatePayload(payload: PaymentCreateDto): void {
    if (!payload.order_id) {
      throw new Error('Order ID is required to create a payment');
    }

    if (!payload.amount || payload.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (
      payload.method &&
      !this.paymentMethods.some((method) => method.id === payload.method)
    ) {
      throw new Error(`Unsupported payment method: ${payload.method}`);
    }
  }

  private assertInitializePayload(
    payload: PaymentInitializeRequestDto
  ): void {
    if (!payload.order_id) {
      throw new Error('Order ID is required to initialize a payment');
    }

    if (!payload.amount || payload.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
  }

  private patchState(partial: Partial<PaymentState>): void {
    this.state.update((current) => ({
      ...current,
      ...partial,
    }));
  }

  private updatePaymentInState(payment: Payment): void {
    this.state.update((current) => {
      const items = current.items.map((item) =>
        item.id === payment.id ? payment : item
      );
      const currentPayment =
        current.current?.id === payment.id ? payment : current.current;

      return {
        ...current,
        items,
        current: currentPayment,
      };
    });
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>)['message'] === 'string'
    ) {
      const record = error as Record<string, unknown>;
      return record['message'] as string;
    }

    return 'We could not complete the payment operation';
  }
}
