import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { Product } from './marketplace.service';
import { ShippingAddress } from './cart.service';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total_price: number;
  seller_id: number;
  seller_name: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user_name: string;
  items: OrderItem[];
  total_items: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  shipping_method: string;
  tracking_number?: string;
  estimated_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  shipping_method_id: string;
  payment_method: string;
  coupon_code?: string;
  notes?: string;
}

export interface OrderStatus {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

export interface OrderTracking {
  order_id: number;
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery: string;
  events: OrderStatus[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'paystack';
  name: string;
  description: string;
  is_available: boolean;
  processing_fee?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  client_secret?: string;
  redirect_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiService = inject(ApiService);
  
  // BehaviorSubjects for state management
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public orders$ = this.ordersSubject.asObservable();
  public currentOrder$ = this.currentOrderSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Get all orders for current user
   */
  getOrders(page = 1, perPage = 20): Observable<PaginatedResponse<Order>> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<PaginatedResponse<Order>>('/orders', { page, per_page: perPage }).pipe(
      tap(response => {
        if (response.data) {
          this.ordersSubject.next(response.data.data || []);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: number): Observable<Order> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<Order>(`/orders/${orderId}`).pipe(
      tap(response => {
        if (response.data) {
          this.currentOrderSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get order by order number
   */
  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.apiService.get<Order>(`/orders/number/${orderNumber}`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Create new order
   */
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Order>('/orders', orderData).pipe(
      tap(response => {
        if (response.data) {
          const currentOrders = this.ordersSubject.value;
          this.ordersSubject.next([response.data, ...currentOrders]);
          this.currentOrderSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: number, reason?: string): Observable<Order> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Order>(`/orders/${orderId}/cancel`, { reason }).pipe(
      tap(response => {
        if (response.data) {
          this.updateOrderInList(response.data);
          this.currentOrderSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Request refund
   */
  requestRefund(orderId: number, reason: string, items?: number[]): Observable<Order> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Order>(`/orders/${orderId}/refund`, { reason, items }).pipe(
      tap(response => {
        if (response.data) {
          this.updateOrderInList(response.data);
          this.currentOrderSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get order tracking
   */
  getOrderTracking(orderId: number): Observable<OrderTracking> {
    return this.apiService.get<OrderTracking>(`/orders/${orderId}/tracking`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Get available payment methods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.apiService.get<PaymentMethod[]>('/orders/payment-methods').pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Create payment intent
   */
  createPaymentIntent(orderId: number, paymentMethodId: string): Observable<PaymentIntent> {
    return this.apiService.post<PaymentIntent>(`/orders/${orderId}/payment-intent`, {
      payment_method_id: paymentMethodId
    }).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Confirm payment
   */
  confirmPayment(orderId: number, paymentIntentId: string): Observable<Order> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Order>(`/orders/${orderId}/confirm-payment`, {
      payment_intent_id: paymentIntentId
    }).pipe(
      tap(response => {
        if (response.data) {
          this.updateOrderInList(response.data);
          this.currentOrderSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: string, page = 1, perPage = 20): Observable<PaginatedResponse<Order>> {
    return this.getOrders(page, perPage).pipe(
      map(response => ({
        ...response,
        data: response.data?.filter(order => order.status === status) || []
      }))
    );
  }

  /**
   * Get pending orders
   */
  getPendingOrders(page = 1, perPage = 20): Observable<PaginatedResponse<Order>> {
    return this.getOrdersByStatus('pending', page, perPage);
  }

  /**
   * Get active orders (confirmed, processing, shipped)
   */
  getActiveOrders(page = 1, perPage = 20): Observable<PaginatedResponse<Order>> {
    return this.getOrders(page, perPage).pipe(
      map(response => ({
        ...response,
        data: response.data?.filter(order => 
          ['confirmed', 'processing', 'shipped'].includes(order.status)
        ) || []
      }))
    );
  }

  /**
   * Get completed orders
   */
  getCompletedOrders(page = 1, perPage = 20): Observable<PaginatedResponse<Order>> {
    return this.getOrdersByStatus('delivered', page, perPage);
  }

  /**
   * Get cancelled orders
   */
  getCancelledOrders(page = 1, perPage = 20): Observable<PaginatedResponse<Order>> {
    return this.getOrdersByStatus('cancelled', page, perPage);
  }

  /**
   * Update order in list
   */
  private updateOrderInList(updatedOrder: Order): void {
    const currentOrders = this.ordersSubject.value;
    const updatedOrders = currentOrders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    this.ordersSubject.next(updatedOrders);
  }

  /**
   * Get current orders
   */
  get currentOrders(): Order[] {
    return this.ordersSubject.value;
  }

  /**
   * Get current order
   */
  get currentOrder(): Order | null {
    return this.currentOrderSubject.value;
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get orders count by status
   */
  getOrdersCountByStatus(status: string): number {
    return this.currentOrders.filter(order => order.status === status).length;
  }

  /**
   * Get total orders count
   */
  get totalOrdersCount(): number {
    return this.currentOrders.length;
  }

  /**
   * Get pending orders count
   */
  get pendingOrdersCount(): number {
    return this.getOrdersCountByStatus('pending');
  }

  /**
   * Get active orders count
   */
  get activeOrdersCount(): number {
    return this.currentOrders.filter(order => 
      ['confirmed', 'processing', 'shipped'].includes(order.status)
    ).length;
  }

  /**
   * Clear orders data (on logout)
   */
  clearOrdersData(): void {
    this.ordersSubject.next([]);
    this.currentOrderSubject.next(null);
  }

  /**
   * Refresh orders data
   */
  refreshOrders(): void {
    this.getOrders().subscribe();
  }
} 