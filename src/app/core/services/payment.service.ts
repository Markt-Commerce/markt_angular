import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Payment, 
  PaymentCreate, 
  PaymentList 
} from '../models';
import { tap, map } from 'rxjs/operators';

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
  providedIn: 'root'
})
export class PaymentService {
  private apiService = inject(ApiService);
  
  private paymentStateSubject = new BehaviorSubject<PaymentState>({
    payments: [],
    currentPayment: null,
    isLoading: false,
    error: null
  });

  public paymentState$ = this.paymentStateSubject.asObservable();

  // Available payment methods
  private readonly PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'paystack',
      name: 'Paystack',
      type: 'card',
      icon: 'credit-card',
      isAvailable: true
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      type: 'card',
      icon: 'credit-card',
      isAvailable: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank',
      icon: 'building',
      isAvailable: true
    },
    {
      id: 'wallet',
      name: 'Markt Wallet',
      type: 'wallet',
      icon: 'wallet',
      isAvailable: true
    }
  ];

  constructor() {}

  // ============================================================================
  // PAYMENT OPERATIONS
  // ============================================================================

  /**
   * Get all payments
   */
  getPayments(params?: any): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.getPayments(params).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.updatePaymentState({
              payments: response.data.payments,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error) => {
          console.error('Error fetching payments:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Create payment
   */
  createPayment(paymentData: PaymentCreate): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.createPayment(paymentData).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.updatePaymentState({
              currentPayment: response.data,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Process payment
   */
  processPayment(paymentId: string, paymentData: any): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.processPayment(paymentId, paymentData).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.updatePaymentState({
              currentPayment: response.data,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error) => {
          console.error('Error processing payment:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Verify payment
   */
  verifyPayment(paymentId: string): Observable<any> {
    return this.apiService.verifyPayment(paymentId).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            // Update payment status
            this.updatePaymentStatus(paymentId, response.data);
          }
        },
        error: (error) => {
          console.error('Error verifying payment:', error);
        }
      })
    );
  }

  /**
   * Get payment details
   */
  getPayment(paymentId: string): Observable<any> {
    return this.apiService.getPayment(paymentId).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.updatePaymentState({
              currentPayment: response.data
            });
          }
        },
        error: (error) => {
          console.error('Error fetching payment:', error);
        }
      })
    );
  }

  /**
   * Initialize payment
   */
  initializePayment(paymentData: any): Observable<any> {
    return this.apiService.initializePayment(paymentData);
  }

  /**
   * Handle payment callback
   */
  handlePaymentCallback(paymentId: string): Observable<any> {
    return this.apiService.handlePaymentCallback(paymentId);
  }

  /**
   * Get payment statistics
   */
  getPaymentStats(): Observable<PaymentStatus> {
    return this.getPayments().pipe(
      map(payments => {
        const pending = payments.filter((p: Payment) => p.status === 'pending').length;
        const processing = payments.filter((p: Payment) => p.status === 'processing').length;
        const completed = payments.filter((p: Payment) => p.status === 'completed').length;
        const failed = payments.filter((p: Payment) => p.status === 'failed').length;
        const refunded = payments.filter((p: Payment) => p.status === 'refunded').length;

        return {
          pending,
          processing,
          completed,
          failed,
          refunded
        };
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
    return this.PAYMENT_METHODS.filter(method => method.isAvailable);
  }

  /**
   * Get payment method by ID
   */
  getPaymentMethod(methodId: string): PaymentMethod | null {
    return this.PAYMENT_METHODS.find(method => method.id === methodId) || null;
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
    return this.paymentState$.pipe(
      map(state => state.payments)
    );
  }

  /**
   * Get current payment observable
   */
  getCurrentPayment$(): Observable<Payment | null> {
    return this.paymentState$.pipe(
      map(state => state.currentPayment)
    );
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.paymentState$.pipe(
      map(state => state.isLoading)
    );
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.paymentState$.pipe(
      map(state => state.error)
    );
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
    const updatedPayments = currentPayments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: statusData.status, updated_at: new Date().toISOString() }
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
      currency: currency
    }).format(amount);
  }

  /**
   * Get payment status display
   */
  getPaymentStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || 'Unknown';
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': 'text-yellow-600',
      'processing': 'text-blue-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600',
      'cancelled': 'text-gray-600'
    };
    
    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Get payment status icon
   */
  getPaymentStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      'pending': 'clock',
      'processing': 'loader',
      'completed': 'check-circle',
      'failed': 'x-circle',
      'cancelled': 'x'
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
      map(payments => payments.filter((p: Payment) => p.status === 'failed'))
    );
  }

  getCancelledPayments(): Observable<Payment[]> {
    return this.getPayments().pipe(
      map(payments => payments.filter((p: Payment) => p.status === 'failed'))
    );
  }

  getFailedPaymentsCount(): Observable<number> {
    return this.getPayments().pipe(
      map(payments => payments.filter((p: Payment) => p.status === 'failed').length)
    );
  }

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: string): Payment | null {
    const payments = this.getPaymentState().payments;
    return payments.find(p => p.id === paymentId) || null;
  }

  /**
   * Get payments by status
   */
  getPaymentsByStatus(status: string): Payment[] {
    const payments = this.getPaymentState().payments;
    return payments.filter(p => p.status === status);
  }

  /**
   * Get payments by order
   */
  getPaymentsByOrder(orderId: string): Payment[] {
    const payments = this.getPaymentState().payments;
    return payments.filter(p => p.order_id === orderId);
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
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return {
      total,
      completed,
      pending,
      failed,
      totalAmount
    };
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData: PaymentCreate): { isValid: boolean; errors: string[] } {
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
      errors
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
   */
  handlePaymentWebhook(webhookData: any): Observable<any> {
    return this.apiService.handlePaystackWebhook(webhookData);
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