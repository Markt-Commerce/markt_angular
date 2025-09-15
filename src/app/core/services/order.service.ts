import { Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Order, 
  BuyerOrder, 
  OrderCreate, 
  SellerOrderItem,
  OrderItem,
  OrderStatus,
  OrderItemStatus
} from '../models';
import { tap, map } from 'rxjs/operators';
import { RealtimeService } from './realtime.service';

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  sellerOrders: SellerOrderItem[];
  isLoading: boolean;
  error: string | null;
}

export interface OrderFilters {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: 'created_at' | 'total' | 'status';
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private typeSafety = inject(TypeSafetyService);
  private apiService = inject(ApiService);
  private realtime = inject(RealtimeService);
  
  private orderStateSubject = new BehaviorSubject<OrderState>({
    orders: [],
    currentOrder: null,
    sellerOrders: [],
    isLoading: false,
    error: null
  });

  public orderState$ = this.orderStateSubject.asObservable();

  constructor() {
    this.setupRealtime();
  }

  // ============================================================================
  // ORDER OPERATIONS (BUYER)
  // ============================================================================

  /**
   * Get buyer orders
   */
  getOrders(): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.getOrders().pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateOrderState({
              orders: response.data,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching orders:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Create new order
   */
  createOrder(orderData: OrderCreate): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.createOrder(orderData).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            const newOrder = response.data;
            const currentOrders = this.getOrderState().orders;
            this.updateOrderState({
              orders: [newOrder, ...currentOrders],
              currentOrder: newOrder,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: any) => {
          console.error('Error creating order:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get single order
   */
  getOrder(orderId: string): Observable<any> {
    return this.apiService.getOrder(orderId).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateOrderState({
              currentOrder: response.data
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching order:', error);
        }
      })
    );
  }

  /**
   * Pay for order
   */
  payOrder(orderId: string, paymentData: any): Observable<any> {
    return this.apiService.payOrder(orderId, paymentData).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            // Update order status
            this.updateOrderStatus(orderId, response.data.status);
          }
        },
        error: (error: any) => {
          console.error('Error paying order:', error);
        }
      })
    );
  }

  /**
   * Track order
   */
  trackOrder(orderId: string): Observable<any> {
    return this.apiService.trackOrder(orderId);
  }

  /**
   * Review order
   */
  reviewOrder(orderId: string, reviewData: any): Observable<any> {
    return this.apiService.reviewOrder(orderId, reviewData);
  }

  // ============================================================================
  // ORDER OPERATIONS (SELLER)
  // ============================================================================

  /**
   * Get seller orders
   */
  getSellerOrders(params?: any): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.getSellerOrders(params).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateOrderState({
              sellerOrders: response.data.items,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching seller orders:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get seller order statistics
   */
  getSellerOrderStats(): Observable<any> {
    return this.apiService.getSellerOrderStats();
  }

  /**
   * Update order item status
   */
  updateOrderItemStatus(orderItemId: string, status: OrderItemStatus): Observable<any> {
    const statusData = { status };
    return this.apiService.updateOrderItemStatus(parseInt(orderItemId), statusData).pipe(
      tap({
        next: () => {
          const currentOrders = this.getOrderState().orders;
          const updatedOrders = currentOrders.map(order => ({
            ...order,
            items: order.items.map(item =>
              item.id === orderItemId ? { ...item, status } : item
            )
          }));
          this.updateOrderState({ orders: updatedOrders });
        },
        error: (error: any) => {
          console.error('Error updating order item status:', error);
        }
      })
    );
  }

  // ============================================================================
  // ORDER UTILITIES
  // ============================================================================

  /**
   * Get current order state
   */
  getOrderState(): OrderState {
    return this.orderStateSubject.value;
  }

  /**
   * Get current order
   */
  getCurrentOrder(): Order | null {
    return this.getOrderState().currentOrder;
  }

  /**
   * Get orders observable
   */
  getOrders$(): Observable<Order[]> {
    return this.orderState$.pipe(
      map(state => state.orders)
    );
  }

  /**
   * Get current order observable
   */
  getCurrentOrder$(): Observable<Order | null> {
    return this.orderState$.pipe(
      map(state => state.currentOrder)
    );
  }

  /**
   * Get seller orders observable
   */
  getSellerOrders$(): Observable<SellerOrderItem[]> {
    return this.orderState$.pipe(
      map(state => state.sellerOrders)
    );
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.orderState$.pipe(
      map(state => state.isLoading)
    );
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.orderState$.pipe(
      map(state => state.error)
    );
  }

  /**
   * Update order state
   */
  private updateOrderState(partial: Partial<OrderState>): void {
    const currentState = this.getOrderState();
    const newState = { ...currentState, ...partial };
    this.orderStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateOrderState({ isLoading });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updateOrderState({ error });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updateOrderState({ error: null });
  }

  /**
   * Update order status
   */
  private updateOrderStatus(orderId: string, status: OrderStatus): void {
    const currentOrders = this.getOrderState().orders;
    const updatedOrders = currentOrders.map(order => 
      order.id === orderId 
        ? { ...order, status }
        : order
    );
    
    this.updateOrderState({ orders: updatedOrders });
    
    // Update current order if it matches
    const currentOrder = this.getCurrentOrder();
    if (currentOrder && currentOrder.id === orderId) {
      this.updateOrderState({ currentOrder: { ...currentOrder, status } });
    }
  }

  /**
   * Update order item status in state
   */
  private updateOrderItemStatusInState(orderItemId: string, status: OrderItemStatus): void {
    const currentOrder = this.getCurrentOrder();
    if (currentOrder) {
      const updatedItems = currentOrder.items.map(item => 
        item.id === orderItemId 
          ? { ...item, status }
          : item
      );
      
      this.updateOrderState({
        currentOrder: { ...currentOrder, items: updatedItems }
      });
    }
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | null {
    const orders = this.getOrderState().orders;
    return orders.find(o => o.id === orderId) || null;
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderStatus): Order[] {
    const orders = this.getOrderState().orders;
    return orders.filter(o => o.status === status);
  }

  /**
   * Get seller order by ID
   */
  getSellerOrderById(orderItemId: string): SellerOrderItem | null {
    const sellerOrders = this.getOrderState().sellerOrders;
    return sellerOrders.find(o => o.id === orderItemId) || null;
  }

  /**
   * Get seller orders by status
   */
  getSellerOrdersByStatus(status: OrderItemStatus): SellerOrderItem[] {
    const sellerOrders = this.getOrderState().sellerOrders;
    return sellerOrders.filter(o => o.status === status);
  }

  /**
   * Format order number
   */
  formatOrderNumber(orderNumber: string): string {
    return `#${orderNumber}`;
  }

  /**
   * Format order total
   */
  formatOrderTotal(total: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(total);
  }

  /**
   * Get order status display
   */
  getOrderStatusDisplay(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    
    return statusMap[status] || 'Unknown';
  }

  /**
   * Get order status color
   */
  getOrderStatusColor(status: OrderStatus): string {
    const colorMap: Record<OrderStatus, string> = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-blue-600',
      'shipped': 'text-purple-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600',
      'refunded': 'text-gray-600'
    };
    
    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Get order status icon
   */
  getOrderStatusIcon(status: OrderStatus): string {
    const iconMap: Record<OrderStatus, string> = {
      'pending': 'clock',
      'confirmed': 'check-circle',
      'shipped': 'truck',
      'delivered': 'package',
      'cancelled': 'x-circle',
      'refunded': 'refresh-cw'
    };
    
    return iconMap[status] || 'help-circle';
  }

  /**
   * Get order item status display
   */
  getOrderItemStatusDisplay(status: OrderItemStatus): string {
    const statusMap: Record<OrderItemStatus, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    
    return statusMap[status] || 'Unknown';
  }

  /**
   * Get order item status color
   */
  getOrderItemStatusColor(status: OrderItemStatus): string {
    const colorMap: Record<OrderItemStatus, string> = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-blue-600',
      'shipped': 'text-purple-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600',
      'refunded': 'text-gray-600'
    };
    
    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Check if order is completed
   */
  isOrderCompleted(order: Order): boolean {
    return order.status === 'delivered';
  }

  /**
   * Check if order is cancelled
   */
  isOrderCancelled(order: Order): boolean {
    return order.status === 'cancelled' || order.status === 'refunded';
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  /**
   * Check if order can be reviewed
   */
  canReviewOrder(order: Order): boolean {
    return order.status === 'delivered';
  }

  /**
   * Calculate order statistics
   */
  getOrderStatistics(): Observable<any> {
    return this.apiService.getSellerOrderStats().pipe(
      map(response => response.data)
    );
  }

  /**
   * Update request status
   */
  updateRequestStatus(requestId: string, statusData: any): Observable<any> {
    return this.apiService.put<any>(`/requests/${requestId}/status`, statusData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Calculate seller order statistics
   */
  getSellerOrderStatistics(): {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalValue: number;
  } {
    const sellerOrders = this.getOrderState().sellerOrders;
    
    const total = sellerOrders.length;
    const pending = sellerOrders.filter(o => o.status === 'pending').length;
    const confirmed = sellerOrders.filter(o => o.status === 'confirmed').length;
    const shipped = sellerOrders.filter(o => o.status === 'shipped').length;
    const delivered = sellerOrders.filter(o => o.status === 'delivered').length;
    const cancelled = sellerOrders.filter(o => o.status === 'cancelled').length;
    const totalValue = sellerOrders.reduce((sum, o) => sum + (o.price * o.quantity), 0);
    
    return {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalValue
    };
  }

  /**
   * Validate order data
   */
  validateOrderData(orderData: OrderCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!orderData.cart_id) {
      errors.push('Cart ID is required');
    }
    
    if (!orderData.shipping_address) {
      errors.push('Shipping address is required');
    }
    
    if (!orderData.payment_method) {
      errors.push('Payment method is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get order timeline
   */
  getOrderTimeline(order: Order): Array<{
    status: OrderStatus;
    date: string;
    description: string;
    completed: boolean;
  }> {
    const timeline = [
      {
        status: 'pending' as OrderStatus,
        date: order.created_at,
        description: 'Order placed',
        completed: true
      },
      {
        status: 'confirmed' as OrderStatus,
        date: order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? order.created_at : '',
        description: 'Order confirmed',
        completed: ['confirmed', 'shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'shipped' as OrderStatus,
        date: order.status === 'shipped' || order.status === 'delivered' ? order.created_at : '',
        description: 'Order shipped',
        completed: ['shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'delivered' as OrderStatus,
        date: order.status === 'delivered' ? order.created_at : '',
        description: 'Order delivered',
        completed: order.status === 'delivered'
      }
    ];
    
    return timeline;
  }

  /**
   * Clear current order
   */
  clearCurrentOrder(): void {
    this.updateOrderState({ currentOrder: null });
  }

  /**
   * Refresh orders
   */
  refreshOrders(): void {
    this.getOrders().subscribe();
  }

  /**
   * Refresh seller orders
   */
  refreshSellerOrders(): void {
    this.getSellerOrders().subscribe();
  }

  getOrderItem(orderItemId: string): Observable<OrderItem | null> {
    return this.getOrders().pipe(
      map(orders => {
        for (const order of orders) {
          const item = order.items.find((item: OrderItem) => item.id === orderItemId);
          if (item) return item;
        }
        return null;
      })
    );
  }

  getSellerOrderItem(orderItemId: string): OrderItem | null {
    const orders = this.getOrderState().orders;
    for (const order of orders) {
      const item = order.items.find(item => item.id === orderItemId);
      if (item) return item;
    }
    return null;
  }

  getOrderItemById(orderItemId: string): OrderItem | null {
    const orders = this.getOrderState().orders;
    for (const order of orders) {
      const item = order.items.find(item => item.id === orderItemId);
      if (item) return item;
    }
    return null;
  }

  private setupRealtime(): void {
    this.realtime.connect('/orders');
    this.realtime.orders$.subscribe(({ event, data }) => {
      switch (event) {
        case 'order_status_updated':
          if (data?.order_id && data?.status) {
            this.updateOrderStatus(String(this.typeSafety.getProperty(data, 'order_id')), this.typeSafety.getProperty(data, 'status') as OrderStatus);
          }
          break;
        case 'payment_confirmed':
          if (data?.order_id) {
            // Refresh specific order or stats as needed
            this.getOrder(String(this.typeSafety.getProperty(data, 'order_id'))).subscribe();
          }
          break;
        default:
          break;
      }
    });
  }
} 