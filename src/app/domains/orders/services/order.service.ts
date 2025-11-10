/**
 * Order Domain Service
 *
 * Manages orders and order-related business logic.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { OrderRepository } from '../repositories/order.repository';
import { Order, OrderStatus } from '../models/order.model';
import { OrderCreateDto } from '../models/order.dto';
import { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { ApiService } from '../../../core/services/api.service';

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orderRepository = inject(OrderRepository);
  private apiService = inject(ApiService); // Temporary: for methods not yet migrated to repository

  private orderStateSubject = new BehaviorSubject<OrderState>({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
  });

  public orderState$ = this.orderStateSubject.asObservable();

  /**
   * Get all orders
   */
  getOrders(params?: Record<string, unknown>): Observable<Order[]> {
    this.setLoading(true);

    return this.orderRepository.findAll(params).pipe(
      tap({
        next: (orders) => {
          this.updateState({ orders, isLoading: false, error: null });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load orders');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Get orders with pagination
   */
  getOrdersPaginated(
    params?: Record<string, unknown>
  ): Observable<PaginatedResponse<Order>> {
    return this.orderRepository.findPaginated(params);
  }

  /**
   * Get order by ID
   */
  getOrder(id: string): Observable<Order> {
    return this.orderRepository.findById(id).pipe(
      tap({
        next: (order) => {
          this.updateState({ currentOrder: order });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load order');
        },
      })
    );
  }

  /**
   * Create new order
   * Business logic: Validate order before creation
   */
  createOrder(data: OrderCreateDto): Observable<Order> {
    this.setLoading(true);

    // Business validation
    if (!data.cart_id) {
      throw new Error('Cart ID is required');
    }

    if (!data.shipping_address) {
      throw new Error('Shipping address is required');
    }

    if (!data.payment_method) {
      throw new Error('Payment method is required');
    }

    return this.orderRepository.create(data).pipe(
      tap({
        next: (order) => {
          const currentOrders = this.getState().orders;
          this.updateState({
            orders: [order, ...currentOrders],
            currentOrder: order,
            isLoading: false,
            error: null,
          });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to create order');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Cancel order
   * Business logic: Check if order can be cancelled
   */
  cancelOrder(id: string): Observable<Order> {
    // First check if order can be cancelled
    return this.getOrder(id).pipe(
      switchMap((order) => {
        if (!order.canCancel()) {
          throw new Error('Order cannot be cancelled');
        }
        return this.orderRepository.cancel(id);
      }),
      tap({
        next: (order) => {
          this.updateOrderInState(order);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to cancel order');
        },
      })
    );
  }

  /**
   * Pay for order
   */
  payOrder(
    id: string,
    paymentData: Record<string, unknown>
  ): Observable<Order> {
    return this.orderRepository.pay(id, paymentData).pipe(
      tap({
        next: (order) => {
          this.updateOrderInState(order);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to process payment');
        },
      })
    );
  }

  /**
   * Get buyer orders
   */
  getBuyerOrders(
    buyerId: string,
    params?: Record<string, unknown>
  ): Observable<Order[]> {
    return this.orderRepository.findByBuyer(buyerId, params);
  }

  /**
   * Get seller orders
   */
  getSellerOrders(
    sellerIdOrParams?: string | Record<string, unknown>,
    params?: Record<string, unknown>
  ): Observable<any> {
    if (typeof sellerIdOrParams === 'string') {
      return this.orderRepository.findBySeller(sellerIdOrParams, params);
    }

    return this.apiService.getSellerOrders(sellerIdOrParams);
  }

  getSellerOrderStats(): Observable<any> {
    return this.apiService.getSellerOrderStats();
  }

  /**
   * Update order item status
   * TODO: Migrate to OrderItemRepository when created
   * Temporary: delegates to ApiService
   */
  updateOrderItemStatus(
    orderItemId: number,
    statusData: { status: string }
  ): Observable<any> {
    return this.apiService.updateOrderItemStatus(orderItemId, statusData);
  }

  /**
   * Track order
   * TODO: Migrate to OrderTrackingRepository when created
   * Temporary: delegates to ApiService
   */
  trackOrder(orderId: string): Observable<any> {
    return this.apiService.trackOrder(orderId);
  }

  reviewOrder(orderId: string, reviewData: Record<string, unknown>): Observable<any> {
    return this.apiService.reviewOrder(orderId, reviewData as any);
  }

  /**
   * Private helper methods
   */
  private getState(): OrderState {
    return this.orderStateSubject.value;
  }

  private updateState(partial: Partial<OrderState>): void {
    this.orderStateSubject.next({
      ...this.orderStateSubject.value,
      ...partial,
    });
  }

  private updateOrderInState(order: Order): void {
    const state = this.getState();
    const orders = state.orders.map((o) => (o.id === order.id ? order : o));
    const currentOrder =
      state.currentOrder?.id === order.id ? order : state.currentOrder;

    this.updateState({ orders, currentOrder });
  }

  private setLoading(loading: boolean): void {
    this.updateState({ isLoading: loading });
  }

  private setError(error: string): void {
    this.updateState({ error, isLoading: false });
  }
}
