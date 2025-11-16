/**
 * Order Domain Service
 *
 * Manages orders and order-related business logic.
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { OrderRepository } from '../repositories/order.repository';
import {
  Order,
  OrderItem,
  SellerOrderItem,
  SellerOrderStats,
} from '../models/order.model';
import {
  OrderCreateDto,
  OrderItemStatusUpdateDto,
  OrderReviewRequestDto,
  OrderTrackingDto,
} from '../models/order.dto';

export interface OrderState {
  orders: Order[];
  sellerOrders: SellerOrderItem[];
  sellerPagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  } | null;
  currentOrder: Order | null;
  sellerStats: SellerOrderStats | null;
  isLoading: boolean;
  isSellerLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly orderRepository = inject(OrderRepository);

  private readonly state = signal<OrderState>({
    orders: [],
    sellerOrders: [],
    sellerPagination: null,
    currentOrder: null,
    sellerStats: null,
    isLoading: false,
    isSellerLoading: false,
    error: null,
  });

  private readonly ordersSignal = computed(() => this.state().orders);
  private readonly sellerOrdersSignal = computed(() => this.state().sellerOrders);
  private readonly sellerStatsSignal = computed(() => this.state().sellerStats);
  private readonly currentOrderSignal = computed(() => this.state().currentOrder);
  private readonly loadingSignal = computed(() => this.state().isLoading);
  private readonly sellerLoadingSignal = computed(
    () => this.state().isSellerLoading
  );
  private readonly errorSignal = computed(() => this.state().error);

  readonly orders$ = toObservable(this.ordersSignal);
  readonly sellerOrders$ = toObservable(this.sellerOrdersSignal);
  readonly sellerStats$ = toObservable(this.sellerStatsSignal);
  readonly currentOrder$ = toObservable(this.currentOrderSignal);
  readonly isLoading$ = toObservable(this.loadingSignal);
  readonly isSellerLoading$ = toObservable(this.sellerLoadingSignal);
  readonly error$ = toObservable(this.errorSignal);

  get buyerOrders(): Order[] {
    return this.state().orders;
  }

  get sellerOrderItemsSnapshot(): SellerOrderItem[] {
    return this.state().sellerOrders;
  }

  get sellerPaginationSnapshot(): OrderState['sellerPagination'] {
    return this.state().sellerPagination;
  }

  get currentOrderSnapshot(): Order | null {
    return this.state().currentOrder;
  }

  loadBuyerOrders(
    params?: Record<string, unknown>
  ): Observable<Order[]> {
    this.patchState({ isLoading: true, error: null });

    return this.orderRepository.findBuyerOrders(params).pipe(
      tap((orders) => {
        this.patchState({
          orders,
          isLoading: false,
          error: null,
        });
      }),
      finalize(() => {
        this.patchState({ isLoading: false });
      }),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  loadSellerOrders(
    params?: Record<string, unknown>
  ): Observable<SellerOrderItem[]> {
    this.patchState({ isSellerLoading: true, error: null });

    return this.orderRepository.findSellerOrders(params).pipe(
      tap((response) => {
        this.patchState({
          sellerOrders: response.items,
          sellerPagination: {
            page: response.pagination.page,
            perPage: response.pagination.per_page,
            totalItems: response.pagination.total_items,
            totalPages: response.pagination.total_pages,
          },
          isSellerLoading: false,
          error: null,
        });
      }),
      map((response) => response.items),
      finalize(() => {
        this.patchState({ isSellerLoading: false });
      }),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isSellerLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  loadOrder(orderId: string): Observable<Order> {
    this.patchState({ isLoading: true, error: null });

    return this.orderRepository.findOrderById(orderId).pipe(
      tap((order) => {
        this.patchState({
          currentOrder: order,
          isLoading: false,
          error: null,
        });
      }),
      finalize(() => {
        this.patchState({ isLoading: false });
      }),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  getOrder(orderId: string): Observable<Order> {
    return this.loadOrder(orderId);
  }

  createOrder(payload: OrderCreateDto): Observable<Order> {
    this.patchState({ isLoading: true, error: null });

    if (!payload.cart_id) {
      return throwError(() => new Error('Cart ID is required'));
    }

    if (!payload.shipping_address) {
      return throwError(() => new Error('Shipping address is required'));
    }

    if (!payload.payment_method) {
      return throwError(() => new Error('Payment method is required'));
    }

    return this.orderRepository.createOrder(payload).pipe(
      tap((order) => {
        const orders = [order, ...this.state().orders];
        this.patchState({
          orders,
            currentOrder: order,
            isLoading: false,
            error: null,
          });
      }),
      finalize(() => {
        this.patchState({ isLoading: false });
      }),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          isLoading: false,
        });
        return throwError(() => error);
      })
    );
  }

  cancelOrder(orderId: string): Observable<Order> {
    const order = this.state()
      .orders
      .find((item) => item.id === orderId) ?? this.state().currentOrder;

    if (order && !order.canCancel()) {
      return throwError(() => new Error('Order cannot be cancelled'));
        }

    this.patchState({ isLoading: true, error: null });

    return this.orderRepository.cancelOrder(orderId).pipe(
      tap((updatedOrder) => this.updateOrderInState(updatedOrder)),
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

  processPayment(
    orderId: string,
    paymentData: Record<string, unknown>
  ): Observable<Order> {
    this.patchState({ isLoading: true, error: null });

    return this.orderRepository
      .processPayment(orderId, paymentData)
      .pipe(
        tap((order) => this.updateOrderInState(order)),
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

  updateOrderItemStatus(
    orderItemId: number,
    payload: OrderItemStatusUpdateDto
  ): Observable<SellerOrderItem> {
    return this.orderRepository
      .updateOrderItemStatus(orderItemId, payload)
      .pipe(
        tap((sellerOrderItem) => {
          const sellerOrders = this.state()
            .sellerOrders
            .map((existing) =>
              existing.id === sellerOrderItem.id ? sellerOrderItem : existing
            );

          this.patchState({ sellerOrders });
        }),
        catchError((error) => {
          this.patchState({
            error: this.resolveErrorMessage(error),
          });
          return throwError(() => error);
        })
      );
  }

  loadSellerStats(): Observable<SellerOrderStats> {
    return this.orderRepository.getSellerStats().pipe(
      tap((stats) => {
        this.patchState({ sellerStats: stats });
      }),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
        });
        return throwError(() => error);
      })
    );
  }

  trackOrder(orderId: string): Observable<OrderTrackingDto> {
    return this.orderRepository.trackOrder(orderId).pipe(
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
        });
        return throwError(() => error);
      })
    );
  }

  reviewOrder(
    orderId: string,
    payload: OrderReviewRequestDto
  ): Observable<Record<string, unknown>> {
    return this.orderRepository.reviewOrder(orderId, payload).pipe(
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
        });
        return throwError(() => error);
      })
    );
  }

  resetError(): void {
    this.patchState({ error: null });
  }

  private updateOrderInState(updated: Order): void {
    const state = this.state();
    const orders = state.orders.map((order) =>
      order.id === updated.id ? updated : order
    );
    const currentOrder =
      state.currentOrder?.id === updated.id ? updated : state.currentOrder;

    this.patchState({ orders, currentOrder, isLoading: false });
  }

  private patchState(partial: Partial<OrderState>): void {
    this.state.update((current) => ({
      ...current,
      ...partial,
    }));
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unable to process order request';
  }
}