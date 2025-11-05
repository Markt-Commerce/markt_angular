import { Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { OrderRepository } from '../../domains/orders/repositories/order.repository';
import { Order as DomainOrder } from '../../domains/orders/models/order.model';
import { OrderCreateDto } from '../../domains/orders/models/order.dto';
import {
  Order,
  BuyerOrder,
  OrderCreate,
  SellerOrderItem,
  OrderItem,
  OrderStatus,
  OrderItemStatus,
} from '../models';
import { tap, map } from 'rxjs/operators';
import { RealtimeService } from './realtime.service';
import {
  ApiResponse,
  PaginatedResponse,
} from '../infrastructure/http/api-response.types';

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
  providedIn: 'root',
})
export class OrderService {
  private typeSafety = inject(TypeSafetyService);
  private orderRepository = inject(OrderRepository);
  private realtime = inject(RealtimeService);

  private orderStateSubject = new BehaviorSubject<OrderState>({
    orders: [],
    currentOrder: null,
    sellerOrders: [],
    isLoading: false,
    error: null,
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
   * Uses OrderRepository (DDD pattern)
   */
  getOrders(): Observable<ApiResponse<Order[]>> {
    this.setLoading(true);

    return this.orderRepository.findAll().pipe(
      map((domainOrders: DomainOrder[]) => {
        const orders = domainOrders.map((o) => this.domainToOldFormat(o));
        this.updateOrderState({
          orders,
          isLoading: false,
          error: null,
        });
        return {
          success: true,
          data: orders,
        };
      }),
      tap({
        error: (error: any) => {
          console.error('Error fetching orders:', error);
          this.setError(error.message || 'Failed to fetch orders');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Create new order
   * Uses OrderRepository (DDD pattern)
   */
  createOrder(orderData: OrderCreate): Observable<ApiResponse<Order>> {
    this.setLoading(true);

    const createDto: OrderCreateDto = {
      cart_id: orderData.cart_id,
      shipping_address: orderData.shipping_address,
      payment_method: orderData.payment_method,
      customer_note: orderData.customer_note,
    };

    return this.orderRepository.create(createDto).pipe(
      map((domainOrder: DomainOrder) => {
        const newOrder = this.domainToOldFormat(domainOrder);
        const currentOrders = this.getOrderState().orders;
        this.updateOrderState({
          orders: [newOrder, ...currentOrders],
          currentOrder: newOrder,
          isLoading: false,
          error: null,
        });
        return {
          success: true,
          data: newOrder,
        };
      }),
      tap({
        error: (error: any) => {
          console.error('Error creating order:', error);
          this.setError(error.message || 'Failed to create order');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Get single order
   * Uses OrderRepository (DDD pattern)
   */
  getOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.orderRepository.findById(orderId).pipe(
      map((domainOrder: DomainOrder) => {
        const order = this.domainToOldFormat(domainOrder);
        this.updateOrderState({
          currentOrder: order,
        });
        return {
          success: true,
          data: order,
        };
      }),
      tap({
        error: (error: any) => {
          console.error('Error fetching order:', error);
        },
      })
    );
  }

  /**
   * Pay for order
   * TODO: Use PaymentRepository when payment domain is integrated
   */
  payOrder(orderId: string, paymentData: any): Observable<ApiResponse<Order>> {
    // TODO: Use PaymentRepository to process payment
    // For now, return empty
    return of({
      success: false,
      data: null as any,
      message: 'Payment not implemented yet',
    });
  }

  /**
   * Track order
   * TODO: Create tracking service if needed
   */
  trackOrder(orderId: string): Observable<ApiResponse<any>> {
    // Can use OrderRepository.findById for tracking
    return this.getOrder(orderId).pipe(
      map((response) => ({
        success: response.success,
        data: response.data ? { tracking_info: 'Order tracking info' } : null,
      }))
    );
  }

  /**
   * Review order
   * TODO: Create ReviewRepository if reviews become a domain
   */
  reviewOrder(orderId: string, reviewData: any): Observable<ApiResponse<any>> {
    return of({ success: true, data: null });
  }

  // ============================================================================
  // ORDER OPERATIONS (SELLER)
  // ============================================================================

  /**
   * Get seller orders
   * Uses OrderRepository (DDD pattern)
   */
  getSellerOrders(
    params?: any
  ): Observable<ApiResponse<PaginatedResponse<SellerOrderItem>>> {
    this.setLoading(true);

    return this.orderRepository.findPaginated(params).pipe(
      map((paginatedResponse: PaginatedResponse<DomainOrder>) => {
        // Convert to seller order items format
        const sellerOrders: SellerOrderItem[] = [];
        paginatedResponse.items.forEach((order) => {
          order.items.forEach((item) => {
            sellerOrders.push({
              id: item.id,
              order_id: order.id,
              product_id: item.product.id,
              quantity: item.quantity,
              price: item.price,
              status: item.status as OrderItemStatus,
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.getPrice(),
                stock: item.product.getStock(),
                status: item.product.status,
                seller_id: item.product.sellerId,
                category_ids: item.product.categoryIds,
                average_rating: item.product.averageRating,
                review_count: item.product.reviewCount,
                created_at: item.product.createdAt,
                updated_at: item.product.updatedAt,
                description: item.product.description || '',
                compare_at_price: item.product.compareAtPrice,
                images: item.product.images || [],
                variants: item.product.variants || [],
                tag_ids: item.product.tagIds || [],
                media_ids: item.product.mediaIds || [],
                seller: {} as any,
                view_count: 0,
              },
            });
          });
        });

        this.updateOrderState({
          sellerOrders,
          isLoading: false,
          error: null,
        });

        return {
          success: true,
          data: {
            items: sellerOrders,
            pagination: paginatedResponse.pagination,
          },
        };
      }),
      tap({
        error: (error: any) => {
          console.error('Error fetching seller orders:', error);
          this.setError(error.message || 'Failed to fetch seller orders');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Get seller order statistics
   * TODO: Create statistics endpoint in repository if needed
   */
  getSellerOrderStats(): Observable<ApiResponse<any>> {
    return of({ success: true, data: { total: 0, pending: 0, confirmed: 0 } });
  }

  /**
   * Update order item status
   * Uses OrderRepository (DDD pattern)
   */
  updateOrderItemStatus(
    orderItemId: string,
    status: OrderItemStatus
  ): Observable<ApiResponse<Order>> {
    // TODO: Add updateOrderItemStatus method to OrderRepository
    // For now, get order, update locally, then update via repository
    return of({ success: true, data: null as any }).pipe(
      tap(() => {
        const currentOrders = this.getOrderState().orders;
        const updatedOrders = currentOrders.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            item.id === orderItemId ? { ...item, status } : item
          ),
        }));
        this.updateOrderState({ orders: updatedOrders });
      }),
      tap({
        error: (error: any) => {
          console.error('Error updating order item status:', error);
        },
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
    return this.orderState$.pipe(map((state) => state.orders));
  }

  /**
   * Get current order observable
   */
  getCurrentOrder$(): Observable<Order | null> {
    return this.orderState$.pipe(map((state) => state.currentOrder));
  }

  /**
   * Get seller orders observable
   */
  getSellerOrders$(): Observable<SellerOrderItem[]> {
    return this.orderState$.pipe(map((state) => state.sellerOrders));
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.orderState$.pipe(map((state) => state.isLoading));
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.orderState$.pipe(map((state) => state.error));
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
    const updatedOrders = currentOrders.map((order) =>
      order.id === orderId ? { ...order, status } : order
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
  private updateOrderItemStatusInState(
    orderItemId: string,
    status: OrderItemStatus
  ): void {
    const currentOrder = this.getCurrentOrder();
    if (currentOrder) {
      const updatedItems = currentOrder.items.map((item) =>
        item.id === orderItemId ? { ...item, status } : item
      );

      this.updateOrderState({
        currentOrder: { ...currentOrder, items: updatedItems },
      });
    }
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | null {
    const orders = this.getOrderState().orders;
    return orders.find((o) => o.id === orderId) || null;
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderStatus): Order[] {
    const orders = this.getOrderState().orders;
    return orders.filter((o) => o.status === status);
  }

  /**
   * Get seller order by ID
   */
  getSellerOrderById(orderItemId: string): SellerOrderItem | null {
    const sellerOrders = this.getOrderState().sellerOrders;
    return sellerOrders.find((o) => o.id === orderItemId) || null;
  }

  /**
   * Get seller orders by status
   */
  getSellerOrdersByStatus(status: OrderItemStatus): SellerOrderItem[] {
    const sellerOrders = this.getOrderState().sellerOrders;
    return sellerOrders.filter((o) => o.status === status);
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
      currency: currency,
    }).format(total);
  }

  /**
   * Get order status display
   */
  getOrderStatusDisplay(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };

    return statusMap[status] || 'Unknown';
  }

  /**
   * Get order status color
   */
  getOrderStatusColor(status: OrderStatus): string {
    const colorMap: Record<OrderStatus, string> = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      shipped: 'text-purple-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
      refunded: 'text-gray-600',
    };

    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Get order status icon
   */
  getOrderStatusIcon(status: OrderStatus): string {
    const iconMap: Record<OrderStatus, string> = {
      pending: 'clock',
      confirmed: 'check-circle',
      shipped: 'truck',
      delivered: 'package',
      cancelled: 'x-circle',
      refunded: 'refresh-cw',
    };

    return iconMap[status] || 'help-circle';
  }

  /**
   * Get order item status display
   */
  getOrderItemStatusDisplay(status: OrderItemStatus): string {
    const statusMap: Record<OrderItemStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };

    return statusMap[status] || 'Unknown';
  }

  /**
   * Get order item status color
   */
  getOrderItemStatusColor(status: OrderItemStatus): string {
    const colorMap: Record<OrderItemStatus, string> = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      shipped: 'text-purple-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
      refunded: 'text-gray-600',
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
  getOrderStatistics(): Observable<ApiResponse<any>> {
    return this.getSellerOrderStats();
  }

  /**
   * Update request status
   * TODO: Use RequestRepository if requests become a domain
   */
  updateRequestStatus(requestId: string, statusData: any): Observable<any> {
    return of({ success: true, data: null });
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
    const pending = sellerOrders.filter((o) => o.status === 'pending').length;
    const confirmed = sellerOrders.filter(
      (o) => o.status === 'confirmed'
    ).length;
    const shipped = sellerOrders.filter((o) => o.status === 'shipped').length;
    const delivered = sellerOrders.filter(
      (o) => o.status === 'delivered'
    ).length;
    const cancelled = sellerOrders.filter(
      (o) => o.status === 'cancelled'
    ).length;
    const totalValue = sellerOrders.reduce(
      (sum, o) => sum + o.price * o.quantity,
      0
    );

    return {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalValue,
    };
  }

  /**
   * Convert domain order to old format for backward compatibility
   */
  private domainToOldFormat(domainOrder: DomainOrder): Order {
    const addressDto = domainOrder.shippingAddress.toDto();
    return {
      id: domainOrder.id,
      order_number: domainOrder.orderNumber,
      buyer_id: domainOrder.buyerId,
      seller_id: domainOrder.sellerId,
      cart_id: '', // Not available in domain model
      shipping_address: {
        latitude: addressDto.latitude,
        longitude: addressDto.longitude,
        street: addressDto.street,
        house_number: addressDto.house_number,
        city: addressDto.city,
        state: addressDto.state,
        country: addressDto.country,
        postal_code: addressDto.postal_code,
      },
      payment_method: domainOrder.paymentMethod,
      subtotal: domainOrder.subtotal,
      shipping_fee: domainOrder.shippingFee,
      tax: domainOrder.tax,
      discount: domainOrder.discount,
      total: domainOrder.total,
      status: domainOrder.status as OrderStatus,
      created_at: domainOrder.createdAt,
      items: domainOrder.items.map((item) => ({
        id: item.id,
        order_id: domainOrder.id,
        product_id: item.product.id,
        seller_id: item.product.sellerId,
        variant_id: undefined,
        quantity: item.quantity,
        price: item.price,
        status: item.status as OrderItemStatus,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.getPrice(),
          stock: item.product.getStock(),
          status: item.product.status,
          seller_id: item.product.sellerId,
          category_ids: item.product.categoryIds,
          average_rating: item.product.averageRating,
          review_count: item.product.reviewCount,
          created_at: item.product.createdAt,
          updated_at: item.product.updatedAt,
          description: '', // Domain model doesn't have description
          compare_at_price: undefined,
          images: [],
          variants: [],
          tag_ids: [],
          media_ids: [],
          seller: {} as any,
          view_count: 0,
        },
        variant: undefined,
      })),
      customer_note: domainOrder.customerNote,
      buyer: {
        id: domainOrder.buyerId,
        buyername: '',
        profile_picture_url: undefined,
      },
    };
  }

  /**
   * Validate order data
   */
  validateOrderData(orderData: OrderCreate): {
    isValid: boolean;
    errors: string[];
  } {
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
      errors,
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
        completed: true,
      },
      {
        status: 'confirmed' as OrderStatus,
        date:
          order.status === 'confirmed' ||
          order.status === 'shipped' ||
          order.status === 'delivered'
            ? order.created_at
            : '',
        description: 'Order confirmed',
        completed: ['confirmed', 'shipped', 'delivered'].includes(order.status),
      },
      {
        status: 'shipped' as OrderStatus,
        date:
          order.status === 'shipped' || order.status === 'delivered'
            ? order.created_at
            : '',
        description: 'Order shipped',
        completed: ['shipped', 'delivered'].includes(order.status),
      },
      {
        status: 'delivered' as OrderStatus,
        date: order.status === 'delivered' ? order.created_at : '',
        description: 'Order delivered',
        completed: order.status === 'delivered',
      },
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
      map((response) => {
        const orders = response.data || [];
        for (const order of orders) {
          const item = order.items.find(
            (item: OrderItem) => item.id === orderItemId
          );
          if (item) return item;
        }
        return null;
      })
    );
  }

  getSellerOrderItem(orderItemId: string): OrderItem | null {
    const orders = this.getOrderState().orders;
    for (const order of orders) {
      const item = order.items.find((item) => item.id === orderItemId);
      if (item) return item;
    }
    return null;
  }

  getOrderItemById(orderItemId: string): OrderItem | null {
    const orders = this.getOrderState().orders;
    for (const order of orders) {
      const item = order.items.find((item) => item.id === orderItemId);
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
            this.updateOrderStatus(
              String(this.typeSafety.getProperty(data, 'order_id')),
              this.typeSafety.getProperty(data, 'status') as OrderStatus
            );
          }
          break;
        case 'payment_confirmed':
          if (data?.order_id) {
            // Refresh specific order or stats as needed
            this.getOrder(
              String(this.typeSafety.getProperty(data, 'order_id'))
            ).subscribe();
          }
          break;
        default:
          break;
      }
    });
  }
}
