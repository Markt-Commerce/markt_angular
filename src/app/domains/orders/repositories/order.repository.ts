import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  OrderDto,
  OrderCreateDto,
  OrderItemDto,
  OrderPaymentDto,
  OrderShipmentDto,
  SellerOrderItemDto,
  SellerOrderResponseDto,
  SellerOrderStatsDto,
  OrderAddressDto,
  OrderItemStatusUpdateDto,
  OrderTrackingDto,
  OrderReviewRequestDto,
  BuyerSummaryDto,
} from '../models/order.dto';
import {
  Order,
  OrderItem,
  OrderPayment,
  OrderShipment,
  SellerOrderItem,
  SellerOrderSummary,
  SellerOrderStats,
  OrderAddress,
  OrderStatus,
  OrderItemStatus,
  OrderProductSummary,
  OrderVariantSummary,
  BuyerSummary,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderRepository {
  private readonly apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/orders';

  private mapAddress(dto?: OrderAddressDto | null): OrderAddress | null {
    if (!dto) {
      return null;
    }
    return {
      street: dto.street ?? null,
      houseNumber: dto.house_number ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      country: dto.country ?? null,
      postalCode: dto.postal_code ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      phoneNumber: dto.phone_number ?? null,
      recipientName: dto.recipient_name ?? null,
    };
  }

  private mapProduct(dto?: OrderItemDto['product']): OrderProductSummary | null {
    if (!dto) {
      return null;
    }
    return {
      id: dto.id,
      name: dto.name,
      price: dto.price,
      thumbnailUrl: dto.thumbnail_url ?? null,
      slug: dto.slug ?? null,
    };
  }

  private mapVariant(dto?: OrderItemDto['variant']): OrderVariantSummary | null {
    if (!dto) {
      return null;
    }
    return {
      id: dto.id,
      name: dto.name,
      sku: dto.sku ?? null,
      options: dto.options ?? null,
    };
  }

  private mapBuyer(dto?: BuyerSummaryDto | null): BuyerSummary | null {
    if (!dto) {
      return null;
    }
    return {
      id: dto.id,
      buyername: dto.buyername,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      profilePictureUrl: dto.profile_picture_url ?? null,
    };
  }

  private mapOrderItem(dto: OrderItemDto): OrderItem {
    return new OrderItem(
      dto.id,
      dto.order_id,
      dto.quantity,
      dto.price,
      dto.status as OrderItemStatus,
      dto.created_at,
      this.mapProduct(dto.product),
      this.mapVariant(dto.variant)
    );
  }

  private mapOrderPayment(dto: OrderPaymentDto): OrderPayment {
    return new OrderPayment(
      dto.id,
      dto.amount,
      dto.method,
      dto.status,
      dto.created_at,
      dto.transaction_id ?? null,
      dto.paid_at ?? null
    );
  }

  private mapOrderShipment(dto: OrderShipmentDto): OrderShipment {
    return new OrderShipment(
      dto.id,
      dto.carrier ?? null,
      dto.tracking_number ?? null,
      dto.tracking_url ?? null,
      dto.status ?? null,
      dto.shipped_at ?? null,
      dto.delivered_at ?? null
    );
  }

  private toDomain(dto: OrderDto): Order {
    const items = dto.items?.map((item) => this.mapOrderItem(item)) ?? [];
    const payments =
      dto.payments?.map((payment) => this.mapOrderPayment(payment)) ?? [];
    const shipments =
      dto.shipments?.map((shipment) => this.mapOrderShipment(shipment)) ?? [];

    return new Order(
      dto.id,
      dto.order_number,
      dto.buyer_id,
      dto.subtotal,
      dto.shipping_fee ?? 0,
      dto.tax ?? 0,
      dto.discount ?? 0,
      dto.total,
      dto.status as OrderStatus,
      dto.created_at,
      items,
      this.mapAddress(dto.shipping_address),
      this.mapAddress(dto.billing_address),
      dto.payment_method ?? null,
      dto.customer_note ?? null,
      payments,
      shipments,
      this.mapBuyer(dto.buyer),
      dto.updated_at ?? null,
      dto.metadata ?? null
    );
  }

  private mapSellerOrderItem(dto: SellerOrderItemDto): SellerOrderItem {
    return new SellerOrderItem(
      dto.id,
      dto.order_id,
      dto.quantity,
      dto.price,
      dto.status as OrderItemStatus,
      dto.created_at,
      new SellerOrderSummary(
        dto.order.id,
        dto.order.order_number,
        dto.order.created_at,
        this.mapBuyer(dto.order.buyer)
      ),
      this.mapProduct(dto.product),
      this.mapVariant(dto.variant)
    );
  }

  private mapSellerStats(dto: SellerOrderStatsDto): SellerOrderStats {
    return {
      totalOrders: dto.total_orders,
      pendingOrders: dto.pending_orders,
      monthlyEarnings: dto.monthly_earnings,
      completedOrders: dto.completed_orders,
      cancelledOrders: dto.cancelled_orders,
    };
  }

  findBuyerOrders(params?: Record<string, unknown>): Observable<Order[]> {
    return this.apiClient.get<OrderDto[]>(`${this.baseEndpoint}/`, params).pipe(
      map((response) => response.data.map((dto) => this.toDomain(dto)))
    );
  }

  findOrderById(id: string): Observable<Order> {
    return this.apiClient
      .get<OrderDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  createOrder(payload: OrderCreateDto): Observable<Order> {
    return this.apiClient.post<OrderDto>(`${this.baseEndpoint}/`, payload).pipe(
      map((response) => this.toDomain(response.data))
    );
  }

  processPayment(
    orderId: string,
    paymentData: Record<string, unknown>
  ): Observable<Order> {
    return this.apiClient
      .post<OrderDto>(`${this.baseEndpoint}/${orderId}/pay`, paymentData)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  updateOrderStatus(
    orderId: string,
    status: Record<string, unknown>
  ): Observable<Order> {
    return this.apiClient
      .patch<OrderDto>(`${this.baseEndpoint}/${orderId}`, status)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.apiClient
      .post<OrderDto>(`${this.baseEndpoint}/${orderId}/cancel`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  findSellerOrders(
    params?: Record<string, unknown>
  ): Observable<PaginatedResponse<SellerOrderItem>> {
    return this.apiClient
      .get<SellerOrderResponseDto>(`${this.baseEndpoint}/seller`, params)
      .pipe(
        map((response) => ({
          items: response.data.items.map((item) => this.mapSellerOrderItem(item)),
          pagination: response.data.pagination,
        }))
      );
  }

  getSellerStats(): Observable<SellerOrderStats> {
    return this.apiClient
      .get<SellerOrderStatsDto>(`${this.baseEndpoint}/seller/stats`)
      .pipe(map((response) => this.mapSellerStats(response.data)));
  }

  updateOrderItemStatus(
    orderItemId: number,
    payload: OrderItemStatusUpdateDto
  ): Observable<SellerOrderItem> {
    return this.apiClient
      .patch<SellerOrderItemDto>(
        `${this.baseEndpoint}/seller/items/${orderItemId}`,
        payload
      )
      .pipe(map((response) => this.mapSellerOrderItem(response.data)));
  }

  trackOrder(orderId: string): Observable<OrderTrackingDto> {
    return this.apiClient
      .get<OrderTrackingDto>(`${this.baseEndpoint}/${orderId}/track`)
      .pipe(map((response) => response.data));
  }

  reviewOrder(
    orderId: string,
    payload: OrderReviewRequestDto
  ): Observable<Record<string, unknown>> {
    return this.apiClient
      .post<Record<string, unknown>>(
        `${this.baseEndpoint}/${orderId}/review`,
        payload
      )
      .pipe(map((response) => response.data));
  }
}
