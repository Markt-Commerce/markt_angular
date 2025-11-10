/**
 * Order Repository
 * 
 * Handles all order-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse, PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Order, OrderItem } from '../models/order.model';
import { Product } from '../../marketplace/models/product.model';
import { OrderDto, OrderItemDto, OrderCreateDto } from '../models/order.dto';
import { Address } from '../../../core/shared/value-objects/address.value-object';

@Injectable({
  providedIn: 'root'
})
export class OrderRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/orders';

  /**
   * Convert OrderItemDto to OrderItem domain model
   */
  private orderItemToDomain(dto: OrderItemDto, product: Product): OrderItem {
    return new OrderItem(
      dto.id,
      dto.order_id,
      product,
      dto.quantity,
      dto.price,
      dto.status,
      dto.variant_id
    );
  }

  /**
   * Convert OrderDto to Order domain model
   */
  private toDomain(dto: OrderDto): Order {
    // Convert product DTOs to domain models
    const items = dto.items.map(itemDto => {
      // Convert product DTO to domain model
      const product = new Product(
        itemDto.product.id,
        itemDto.product.name,
        itemDto.product.price,
        itemDto.product.stock,
        itemDto.product.status,
        itemDto.product.seller_id,
        itemDto.product.category_ids,
        itemDto.product.average_rating,
        itemDto.product.review_count,
        itemDto.product.created_at,
        itemDto.product.updated_at
      );

      return this.orderItemToDomain(itemDto, product);
    });

    // Convert Address DTO to value object
    const shippingAddress = Address.fromDto(dto.shipping_address);

    return new Order(
      dto.id,
      dto.order_number,
      dto.buyer_id,
      dto.seller_id,
      shippingAddress,
      dto.payment_method,
      dto.subtotal,
      dto.shipping_fee,
      dto.tax,
      dto.discount,
      dto.total,
      dto.status,
      dto.created_at,
      items,
      dto.customer_note
    );
  }

  /**
   * Get all orders
   */
  findAll(params?: Record<string, unknown>): Observable<Order[]> {
    return this.apiClient.get<OrderDto[]>(this.baseEndpoint, params).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  /**
   * Get orders with pagination
   */
  findPaginated(params?: Record<string, unknown>): Observable<PaginatedResponse<Order>> {
    return this.apiClient.get<{ items: OrderDto[]; pagination: any }>(this.baseEndpoint, params).pipe(
      map(response => ({
        items: response.data.items.map(dto => this.toDomain(dto)),
        pagination: response.data.pagination
      }))
    );
  }

  /**
   * Get order by ID
   */
  findById(id: string): Observable<Order> {
    return this.apiClient.get<OrderDto>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Create new order
   */
  create(data: OrderCreateDto): Observable<Order> {
    return this.apiClient.post<OrderDto>(this.baseEndpoint, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Cancel order
   */
  cancel(id: string): Observable<Order> {
    return this.apiClient.post<OrderDto>(`${this.baseEndpoint}/${id}/cancel`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Pay for order
   */
  pay(id: string, paymentData: Record<string, unknown>): Observable<Order> {
    return this.apiClient.post<OrderDto>(`${this.baseEndpoint}/${id}/pay`, paymentData).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Get seller orders
   */
  findBySeller(sellerId: string, params?: Record<string, unknown>): Observable<Order[]> {
    const searchParams = { ...params, seller_id: sellerId };
    return this.findAll(searchParams);
  }

  /**
   * Get buyer orders
   */
  findByBuyer(buyerId: string, params?: Record<string, unknown>): Observable<Order[]> {
    const searchParams = { ...params, buyer_id: buyerId };
    return this.findAll(searchParams);
  }
}

