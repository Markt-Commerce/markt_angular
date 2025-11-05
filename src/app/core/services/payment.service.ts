import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { PaymentRepository } from '../../domains/payment/repositories/payment.repository';
import { Payment as DomainPayment } from '../../domains/payment/models/payment.model';
import {
  PaymentCreateDto,
  PaymentInitializeDto,
  PaymentVerifyDto,
} from '../../domains/payment/models/payment.dto';
import { Payment, PaymentCreate, PaymentList } from '../models';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { ApiResponse } from '../infrastructure/http/api-response.types';

export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'wallet' | 'crypto';
  icon: string;
  isAvailable: boolean;
}

export interface PaymentStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  refunded: number;
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

  // Available payment methods
  private readonly PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'paystack',
      name: 'Paystack',
      type: 'card',
      icon: 'credit-card',
      isAvailable: true,
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'card',
      icon: 'credit-card',
      isAvailable: true,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank',
      icon: 'building',
      isAvailable: true,
    },
    {
      id: 'wallet',
      name: 'Markt Wallet',
      type: 'wallet',
      icon: 'wallet',
      isAvailable: true,
    },
  ];

  constructor() {}

  /**
   * Convert domain Payment model to old Payment interface (for backward compatibility)
   * Domain models use camelCase (orderId, createdAt), old interface uses snake_case (order_id, created_at)
   */
  private domainToOldFormat(domainPayment: DomainPayment): Payment {
    return {
      id: domainPayment.id,
      order_id: domainPayment.orderId,
      amount: domainPayment.amount,
      currency: domainPayment.currency,
      method: domainPayment.method,
      status: domainPayment.status,
      transaction_id: domainPayment.transactionId,
      gateway_response: domainPayment.gatewayResponse,
      paid_at: domainPayment.paidAt,
      created_at: domainPayment.createdAt,
      updated_at: domainPayment.updatedAt,
    };
  }

  /**
   * Convert old PaymentCreate interface to PaymentCreateDto
   */
  private oldToDomainCreate(oldCreate: PaymentCreate): PaymentCreateDto {
    return {
      order_id: oldCreate.order_id,
      amount: oldCreate.amount,
      currency: oldCreate.currency,
      method: oldCreate.method as any,
      metadata: oldCreate.metadata,
    };
  }

  // ============================================================================
  // PAYMENT OPERATIONS
  // ============================================================================

  /**
   * Get all payments
   * Uses PaymentRepository (DDD pattern)
   */
  getPayments(params?: any): Observable<any> {
    this.setLoading(true);

    return this.paymentRepository.findAll(params).pipe(
      map((domainPayments: DomainPayment[]) => {
        // Convert domain models to old format for backward compatibility
        const payments = domainPayments.map((p) => this.domainToOldFormat(p));
        this.updatePaymentState({
          payments,
          isLoading: false,
          error: null,
        });
        return payments;
      }),
      catchError((error: any) => {
        console.error('Error fetching payments:', error);
        this.setError(error.message || 'Failed to fetch payments');
        this.setLoading(false);
        return of([]);
      })
    );
  }

  /**
   * Create payment
   * Uses PaymentRepository (DDD pattern)
   */
  createPayment(paymentData: PaymentCreate): Observable<any> {
    this.setLoading(true);

    const createDto = this.oldToDomainCreate(paymentData);

    return this.paymentRepository.create(createDto).pipe(
      map((domainPayment: DomainPayment) => {
        const payment = this.domainToOldFormat(domainPayment);
        this.updatePaymentState({
          currentPayment: payment,
          isLoading: false,
          error: null,
        });
        return {
          success: true,
          data: payment,
        };
      }),
      catchError((error: any) => {
        console.error('Error creating payment:', error);
        this.setError(error.message || 'Failed to create payment');
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Process payment
   * Uses PaymentRepository (DDD pattern)
   */
  processPayment(paymentId: string, paymentData: any): Observable<any> {
    this.setLoading(true);

    return this.paymentRepository.process(paymentId, paymentData).pipe(
      map((domainPayment: DomainPayment) => {
        const payment = this.domainToOldFormat(domainPayment);
        this.updatePaymentState({
          currentPayment: payment,
          isLoading: false,
          error: null,
        });
        return {
          success: true,
          data: payment,
        };
      }),
      catchError((error: any) => {
        console.error('Error processing payment:', error);
        this.setError(error.message || 'Failed to process payment');
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Verify payment
   * Uses PaymentRepository (DDD pattern)
   * Note: Repository expects a reference string, not paymentId
   * If paymentId is provided, we'll need to fetch the payment first to get the reference
   */
  verifyPayment(paymentIdOrReference: string): Observable<any> {
    // If it looks like a reference (starts with PAY- or similar), use it directly
    // Otherwise, treat it as paymentId and fetch payment first
    if (
      paymentIdOrReference.startsWith('PAY-') ||
      paymentIdOrReference.length > 20
    ) {
      // Assume it's a reference
      const verifyDto: PaymentVerifyDto = { reference: paymentIdOrReference };
      return this.paymentRepository.verify(verifyDto).pipe(
        map((response) => {
          // Response contains verification status
          return {
            success: true,
            data: response,
          };
        }),
        catchError((error: any) => {
          console.error('Error verifying payment:', error);
          throw error;
        })
      );
    } else {
      // Treat as paymentId - fetch payment first, then verify using transaction_id
      return this.getPayment(paymentIdOrReference).pipe(
        switchMap((response: any) => {
          if (response.success && response.data.transaction_id) {
            const verifyDto: PaymentVerifyDto = {
              reference: response.data.transaction_id,
            };
            return this.paymentRepository.verify(verifyDto).pipe(
              map((verifyResponse) => ({
                success: true,
                data: verifyResponse,
              }))
            );
          }
          throw new Error('Payment transaction ID not found');
        }),
        catchError((error: any) => {
          console.error('Error verifying payment:', error);
          throw error;
        })
      );
    }
  }

  /**
   * Get payment details
   * Uses PaymentRepository (DDD pattern)
   */
  getPayment(paymentId: string): Observable<any> {
    return this.paymentRepository.findById(paymentId).pipe(
      map((domainPayment: DomainPayment) => {
        const payment = this.domainToOldFormat(domainPayment);
        this.updatePaymentState({
          currentPayment: payment,
        });
        return {
          success: true,
          data: payment,
        };
      }),
      catchError((error: any) => {
        console.error('Error fetching payment:', error);
        throw error;
      })
    );
  }

  /**
   * Initialize payment
   * Uses PaymentRepository (DDD pattern)
   * Note: Repository expects PaymentInitializeDto with email and amount
   */
  initializePayment(paymentData: any): Observable<any> {
    // Convert to PaymentInitializeDto format
    const initializeDto: PaymentInitializeDto = {
      amount: paymentData.amount,
      email: paymentData.email,
      currency: paymentData.currency || 'NGN',
      method: paymentData.method,
      metadata: paymentData.metadata,
    };

    return this.paymentRepository.initialize(initializeDto).pipe(
      map((response) => ({
        success: true,
        data: response,
      })),
      catchError((error: any) => {
        console.error('Error initializing payment:', error);
        throw error;
      })
    );
  }

  /**
   * Handle payment callback
   * Note: This method may need to be implemented in the repository or use ApiService
   * For now, we'll keep a placeholder that can be enhanced later
   */
  handlePaymentCallback(paymentId: string): Observable<any> {
    // This might need to verify the payment using the repository
    // For now, return the payment details
    return this.getPayment(paymentId);
  }

  /**
   * Get payment statistics
   * Uses PaymentRepository (DDD pattern)
   */
  getPaymentStats(): Observable<PaymentStatus> {
    return this.paymentRepository.findAll().pipe(
      map((domainPayments: DomainPayment[]) => {
        const payments = domainPayments.map((p) => this.domainToOldFormat(p));
        const pending = payments.filter(
          (p: Payment) => p.status === 'pending'
        ).length;
        const processing = payments.filter(
          (p: Payment) => p.status === 'processing'
        ).length;
        const completed = payments.filter(
          (p: Payment) => p.status === 'completed'
        ).length;
        const failed = payments.filter(
          (p: Payment) => p.status === 'failed'
        ).length;
        const refunded = payments.filter(
          (p: Payment) => p.status === 'refunded'
        ).length;

        return {
          pending,
          processing,
          completed,
          failed,
          refunded,
        };
      }),
      catchError((error: any) => {
        console.error('Error fetching payment stats:', error);
        return of({
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          refunded: 0,
        });
      })
    );
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * Get available payment methods
   */
  getPaymentMethods(): PaymentMethod[] {
    return this.PAYMENT_METHODS.filter((method) => method.isAvailable);
  }

  /**
   * Get payment method by ID
   */
  getPaymentMethod(methodId: string): PaymentMethod | null {
    return (
      this.PAYMENT_METHODS.find((method) => method.id === methodId) || null
    );
  }

  /**
   * Check if payment method is available
   */
  isPaymentMethodAvailable(methodId: string): boolean {
    const method = this.getPaymentMethod(methodId);
    return method ? method.isAvailable : false;
  }

  // ============================================================================
  // PAYMENT UTILITIES
  // ============================================================================

  /**
   * Get current payment state
   */
  getPaymentState(): PaymentState {
    return this.paymentStateSubject.value;
  }

  /**
   * Get current payment
   */
  getCurrentPayment(): Payment | null {
    return this.getPaymentState().currentPayment;
  }

  /**
   * Get payments observable
   */
  getPayments$(): Observable<Payment[]> {
    return this.paymentState$.pipe(map((state) => state.payments));
  }

  /**
   * Get current payment observable
   */
  getCurrentPayment$(): Observable<Payment | null> {
    return this.paymentState$.pipe(map((state) => state.currentPayment));
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.paymentState$.pipe(map((state) => state.isLoading));
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.paymentState$.pipe(map((state) => state.error));
  }

  /**
   * Update payment state
   */
  private updatePaymentState(partial: Partial<PaymentState>): void {
    const currentState = this.getPaymentState();
    const newState = { ...currentState, ...partial };
    this.paymentStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updatePaymentState({ isLoading });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updatePaymentState({ error });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updatePaymentState({ error: null });
  }

  /**
   * Update payment status
   */
  private updatePaymentStatus(paymentId: string, statusData: any): void {
    const currentPayments = this.getPaymentState().payments;
    const updatedPayments = currentPayments.map((payment) =>
      payment.id === paymentId
        ? {
            ...payment,
            status: statusData.status,
            updated_at: new Date().toISOString(),
          }
        : payment
    );

    this.updatePaymentState({ payments: updatedPayments });
  }

  /**
   * Format payment amount
   */
  formatPaymentAmount(amount: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get payment status display
   */
  getPaymentStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
    };

    return statusMap[status] || 'Unknown';
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600',
      cancelled: 'text-gray-600',
    };

    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Get payment status icon
   */
  getPaymentStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      pending: 'clock',
      processing: 'loader',
      completed: 'check-circle',
      failed: 'x-circle',
      cancelled: 'x',
    };

    return iconMap[status] || 'help-circle';
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(payment: Payment): boolean {
    return payment.status === 'completed';
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(payment: Payment): boolean {
    return payment.status === 'pending' || payment.status === 'processing';
  }

  /**
   * Check if payment failed
   */
  isFailedPayment(payment: Payment): boolean {
    return payment.status === 'failed' || payment.status === 'refunded';
  }

  getFailedPayments(): Observable<Payment[]> {
    return this.getPayments().pipe(
      map((payments) => payments.filter((p: Payment) => p.status === 'failed'))
    );
  }

  getCancelledPayments(): Observable<Payment[]> {
    return this.getPayments().pipe(
      map((payments) => payments.filter((p: Payment) => p.status === 'failed'))
    );
  }

  getFailedPaymentsCount(): Observable<number> {
    return this.getPayments().pipe(
      map(
        (payments) =>
          payments.filter((p: Payment) => p.status === 'failed').length
      )
    );
  }

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: string): Payment | null {
    const payments = this.getPaymentState().payments;
    return payments.find((p) => p.id === paymentId) || null;
  }

  /**
   * Get payments by status
   */
  getPaymentsByStatus(status: string): Payment[] {
    const payments = this.getPaymentState().payments;
    return payments.filter((p) => p.status === status);
  }

  /**
   * Get payments by order
   * Uses PaymentRepository (DDD pattern)
   */
  getPaymentsByOrder(orderId: string): Observable<Payment[]> {
    return this.paymentRepository.findByOrder(orderId).pipe(
      map((domainPayments: DomainPayment[]) => {
        return domainPayments.map((p) => this.domainToOldFormat(p));
      }),
      catchError((error: any) => {
        console.error('Error fetching payments by order:', error);
        return of([]);
      })
    );
  }

  /**
   * Calculate payment statistics
   */
  getPaymentStatistics(): {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalAmount: number;
  } {
    const payments = this.getPaymentState().payments;

    const total = payments.length;
    const completed = payments.filter((p) => p.status === 'completed').length;
    const pending = payments.filter(
      (p) => p.status === 'pending' || p.status === 'processing'
    ).length;
    const failed = payments.filter((p) => p.status === 'failed').length;
    const totalAmount = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      total,
      completed,
      pending,
      failed,
      totalAmount,
    };
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData: PaymentCreate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!paymentData.method) {
      errors.push('Payment method is required');
    }

    if (!paymentData.order_id) {
      errors.push('Order ID is required');
    }

    if (paymentData.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate payment reference
   */
  generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  }

  /**
   * Handle payment webhook
   * Note: Webhook handling may need to be implemented in the repository
   * For now, this is a placeholder that can be enhanced later
   * In a full implementation, this would verify the webhook signature and update payment status
   */
  handlePaymentWebhook(webhookData: any): Observable<any> {
    // Webhook handling typically needs to:
    // 1. Verify webhook signature
    // 2. Extract payment reference/ID
    // 3. Update payment status via repository
    // For now, return a basic response
    console.warn(
      'handlePaymentWebhook: Webhook handling needs repository implementation'
    );
    return of({
      success: true,
      message: 'Webhook received (implementation pending)',
    });
  }

  /**
   * Clear current payment
   */
  clearCurrentPayment(): void {
    this.updatePaymentState({ currentPayment: null });
  }

  /**
   * Refresh payments
   */
  refreshPayments(): void {
    this.getPayments().subscribe();
  }
}
