import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse } from '../../../core/infrastructure/http/api-response.types';
import { Product } from '../../marketplace/models/product.model';
import type { ProductDto } from '../../marketplace/models/product.dto';
import { Cart, CartItem } from '../models/cart.model';
import {
  AddToCartDto,
  ApplyCouponResponseDto,
  CartDto,
  CartItemDto,
  CartSummaryDto,
  CheckoutDto,
  CheckoutResponseDto,
  UpdateCartItemDto
} from '../models/cart.dto';

@Injectable({
  providedIn: 'root'
})
export class CartRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/cart';

  private mapCartItem(dto: CartItemDto): CartItem {
    const product = Product.fromDto(dto.product as ProductDto);
    const variantId = dto.variant_id ?? null;
    const variantName =
      dto.variant?.name ??
      dto.product?.variants?.find((variant) =>
        String((variant as any)?.id ?? '') === String(variantId ?? '')
      )?.name ??
      null;
    const variantPrice = dto.variant?.price ?? dto.product_price;

    return new CartItem(
      dto.id,
      dto.cart_id,
      product,
      variantPrice,
      variantId,
      variantName,
      dto.quantity,
      dto.product
    );
  }

  private mapCart(dto: CartDto): Cart {
    const items = dto.items?.map(item => this.mapCartItem(item)) ?? [];
    return new Cart(
      dto.id,
      dto.buyer_id,
      items,
      dto.expires_at,
      dto.coupon_code ?? null
    );
  }

  getCart(): Observable<Cart | null> {
    return this.apiClient.get<CartDto | null>(`${this.baseEndpoint}/`).pipe(
      map((response: ApiResponse<CartDto | null>) => {
        if (!response.data) {
          return null;
        }
        return this.mapCart(response.data);
      })
    );
  }

  addItem(payload: AddToCartDto): Observable<CartItem> {
    return this.apiClient.post<CartItemDto>(`${this.baseEndpoint}/add`, payload).pipe(
      map((response: ApiResponse<CartItemDto>) => this.mapCartItem(response.data))
    );
  }

  updateItem(itemId: number, payload: UpdateCartItemDto): Observable<CartItem | null> {
    return this.apiClient.put<CartItemDto | null>(
      `${this.baseEndpoint}/items/${itemId}`,
      payload
    ).pipe(
      map((response: ApiResponse<CartItemDto | null>) => {
        if (!response.data) {
          return null;
        }
        return this.mapCartItem(response.data);
      })
    );
  }

  removeItem(itemId: number): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/items/${itemId}`).pipe(
      map(() => undefined)
    );
  }

  clear(): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/`).pipe(
      map(() => undefined)
    );
  }

  getSummary(): Observable<CartSummaryDto> {
    return this.apiClient.get<CartSummaryDto>(`${this.baseEndpoint}/summary`).pipe(
      map((response: ApiResponse<CartSummaryDto>) => response.data)
    );
  }

  applyCoupon(couponCode: string): Observable<ApplyCouponResponseDto> {
    return this.apiClient.post<ApplyCouponResponseDto>(`${this.baseEndpoint}/coupon`, {
      coupon_code: couponCode
    }).pipe(
      map((response: ApiResponse<ApplyCouponResponseDto>) => response.data)
    );
  }

  checkout(payload: CheckoutDto): Observable<CheckoutResponseDto> {
    return this.apiClient.post<CheckoutResponseDto>(
      `${this.baseEndpoint}/checkout`,
      payload
    ).pipe(
      map((response: ApiResponse<CheckoutResponseDto>) => response.data)
    );
  }
}



