import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { ClassicResponse, Cart } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class MockCartService {
  // Mock data storage
  private mockCarts: Cart[] = [
    {
      buyer_id: 'buyer-123',
      cart_id: 'cart-001',
      product_id: 'prod-001',
      quantity: 2,
      has_discount: true,
      discount_percent: 10,
      discount_price: 5.99,
    },
    {
      buyer_id: 'buyer-123',
      cart_id: 'cart-002',
      product_id: 'prod-002',
      quantity: 1,
      has_discount: false,
    },
    {
      buyer_id: 'buyer-456',
      cart_id: 'cart-003',
      product_id: 'prod-003',
      quantity: 3,
      has_discount: true,
      discount_percent: 15,
      discount_price: 12.5,
    },
    {
      buyer_id: 'buyer-456',
      cart_id: 'cart-004',
      product_id: 'prod-001',
      quantity: 1,
      has_discount: false,
    },
    {
      buyer_id: 'buyer-789',
      cart_id: 'cart-005',
      product_id: 'prod-004',
      quantity: 2,
      has_discount: true,
      discount_percent: 5,
      discount_price: 2.99,
    },
  ];

  createCart(cartItem: Cart): Observable<HttpResponse<ClassicResponse>> {
    // Generate a new cart ID if not provided
    const newCart = {
      ...cartItem,
      cart_id: cartItem.cart_id || `cart-${Date.now()}`,
    };

    // Add to mock storage
    this.mockCarts.push(newCart);

    const mockResponse: ClassicResponse = {
      success: true,
      message: 'Cart item created successfully',
      data: newCart,
    };

    // Simulate network delay and return HttpResponse
    return of(
      new HttpResponse({
        status: 201,
        statusText: 'Created',
        body: mockResponse,
      })
    ).pipe(delay(500));
  }

  getBuyerCart(buyerId: string): Observable<Cart[]> {
    // Filter carts by buyer ID
    const buyerCarts = this.mockCarts.filter(
      (cart) => cart.buyer_id === buyerId
    );

    // Simulate network delay
    return of(buyerCarts).pipe(delay(300));
  }

  removeCart(cartId: string): Observable<HttpResponse<ClassicResponse>> {
    // Find and remove cart
    const cartIndex = this.mockCarts.findIndex(
      (cart) => cart.cart_id === cartId
    );

    if (cartIndex === -1) {
      // Simulate 404 error
      return throwError(() => ({
        status: 404,
        message: 'Cart not found',
      })).pipe(delay(200));
    }

    // Remove cart from mock storage
    this.mockCarts.splice(cartIndex, 1);

    const mockResponse: ClassicResponse = {
      success: true,
      message: 'Cart item removed successfully',
      data: null,
    };

    // Simulate network delay and return HttpResponse
    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: mockResponse,
      })
    ).pipe(delay(400));
  }

  // Additional utility methods for testing
  getAllCarts(): Cart[] {
    return [...this.mockCarts];
  }

  clearAllCarts(): void {
    this.mockCarts = [];
  }

  updateCartQuantity(
    cartId: string,
    quantity: number
  ): Observable<HttpResponse<ClassicResponse>> {
    const cart = this.mockCarts.find((c) => c.cart_id === cartId);

    if (!cart) {
      return throwError(() => ({
        status: 404,
        message: 'Cart not found',
      })).pipe(delay(200));
    }

    cart.quantity = quantity;

    const mockResponse: ClassicResponse = {
      success: true,
      message: 'Cart quantity updated successfully',
      data: cart,
    };

    return of(
      new HttpResponse({
        status: 200,
        statusText: 'OK',
        body: mockResponse,
      })
    ).pipe(delay(300));
  }
}
