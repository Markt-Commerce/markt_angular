/**
 * Cart Repository
 * 
 * Handles all cart-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse } from '../../../core/infrastructure/http/api-response.types';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../../marketplace/models/product.model';
import {
  CartDto,
  CartItemDto,
  AddToCartDto,
  UpdateCartItemDto,
  CartSummaryDto
} from '../models/order.dto';

@Injectable({
  providedIn: 'root'
})
export class CartRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/cart';

  /**
   * Convert CartItemDto to CartItem domain model
   * Preserves the full ProductDto for display purposes (images, seller info, etc.)
   */
  private cartItemToDomain(dto: CartItemDto): CartItem {
    // Convert product DTO to domain model for business logic
    const product = new Product(
      dto.product.id,
      dto.product.name,
      dto.product.price,
      dto.product.stock,
      dto.product.status,
      dto.product.seller_id,
      dto.product.category_ids,
      dto.product.average_rating,
      dto.product.review_count,
      dto.product.created_at,
      dto.product.updated_at
    );

    // Preserve full ProductDto for display purposes (images, seller, description, etc.)
    return new CartItem(
      dto.id,
      product,
      dto.quantity,
      dto.product // Pass full ProductDto for display
    );
  }

  /**
   * Convert CartDto to Cart domain model
   */
  private toDomain(dto: CartDto): Cart {
    const items = dto.items.map(itemDto => this.cartItemToDomain(itemDto));
    
    return new Cart(
      dto.id,
      dto.buyer_id,
      items,
      dto.expires_at,
      dto.coupon_code
    );
  }

  /**
   * Get current cart
   */
  getCart(): Observable<Cart> {
    return this.apiClient.get<CartDto>(this.baseEndpoint).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Add item to cart
   */
  addItem(data: AddToCartDto): Observable<CartItem> {
    return this.apiClient.post<CartItemDto>(`${this.baseEndpoint}/items`, data).pipe(
      map(response => this.cartItemToDomain(response.data))
    );
  }

  /**
   * Update cart item quantity
   */
  updateItem(itemId: string, data: UpdateCartItemDto): Observable<CartItem> {
    return this.apiClient.patch<CartItemDto>(`${this.baseEndpoint}/items/${itemId}`, data).pipe(
      map(response => this.cartItemToDomain(response.data))
    );
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/items/${itemId}`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Clear cart
   */
  clear(): Observable<void> {
    return this.apiClient.delete<void>(this.baseEndpoint).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get cart summary
   */
  getSummary(): Observable<CartSummaryDto> {
    return this.apiClient.get<CartSummaryDto>(`${this.baseEndpoint}/summary`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Apply coupon
   */
  applyCoupon(couponCode: string): Observable<{ discount_amount: number; message: string }> {
    return this.apiClient.post<{ discount_amount: number; message: string }>(
      `${this.baseEndpoint}/coupon`,
      { code: couponCode }
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove coupon
   */
  removeCoupon(): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/coupon`).pipe(
      map(() => undefined)
    );
  }
}

