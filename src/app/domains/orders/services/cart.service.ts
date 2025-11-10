/**
 * Cart Domain Service
 * 
 * Manages shopping cart and cart-related business logic.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartRepository } from '../repositories/cart.repository';
import { Cart, CartItem } from '../models/cart.model';
import { AddToCartDto, UpdateCartItemDto } from '../models/order.dto';
import { AuthService } from '../../authentication/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartRepository = inject(CartRepository);
  private authService = inject(AuthService);
  
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize cart service
   */
  private initialize(): void {
    // Only auto-load cart for buyers
    const role = this.authService.getCurrentRole();
    if (role === 'buyer') {
      this.loadCart();
    }
    
    // React to role changes
    this.authService.authState$.subscribe(state => {
      const currentRole = state?.user?.currentRole;
      if (currentRole === 'buyer') {
        this.loadCart();
      } else {
        this.cartSubject.next(null);
      }
    });
  }

  /**
   * Get current cart
   */
  getCart(): Observable<Cart> {
    const role = this.authService.getCurrentRole();
    if (role !== 'buyer') {
      throw new Error('Only buyers can access cart');
    }

    return this.cartRepository.getCart().pipe(
      tap({
        next: (cart) => {
          this.cartSubject.next(cart);
        },
        error: (error) => {
          console.error('Error loading cart:', error);
        }
      })
    );
  }

  /**
   * Load cart from API
   */
  private loadCart(): void {
    this.getCart().subscribe();
  }

  /**
   * Add item to cart
   * Business logic: Validate quantity and product availability
   */
  addToCart(productId: string, quantity: number = 1): Observable<CartItem> {
    const role = this.authService.getCurrentRole();
    if (role !== 'buyer') {
      throw new Error('Only buyers can add items to cart');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const data: AddToCartDto = {
      product_id: productId,
      quantity
    };

    return this.cartRepository.addItem(data).pipe(
      tap(() => {
        // Reload cart to get updated state
        this.loadCart();
      })
    );
  }

  /**
   * Update cart item quantity
   * Business logic: Validate quantity
   */
  updateCartItem(itemId: string, quantity: number): Observable<CartItem> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    const data: UpdateCartItemDto = { quantity };
    return this.cartRepository.updateItem(itemId, data).pipe(
      tap(() => {
        this.loadCart();
      })
    );
  }

  /**
   * Remove item from cart
   */
  removeCartItem(itemId: string): Observable<void> {
    return this.cartRepository.removeItem(itemId).pipe(
      tap(() => {
        this.loadCart();
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<void> {
    return this.cartRepository.clear().pipe(
      tap(() => {
        this.cartSubject.next(null);
      })
    );
  }

  /**
   * Get cart summary
   */
  getCartSummary(): Observable<{ item_count: number; subtotal: number; discount: number; total: number }> {
    return this.cartRepository.getSummary();
  }

  /**
   * Apply coupon to cart
   */
  applyCoupon(couponCode: string): Observable<{ discount_amount: number; message: string }> {
    if (!couponCode || couponCode.trim().length === 0) {
      throw new Error('Coupon code is required');
    }

    return this.cartRepository.applyCoupon(couponCode).pipe(
      tap(() => {
        this.loadCart();
      })
    );
  }

  /**
   * Remove coupon from cart
   */
  removeCoupon(): Observable<void> {
    return this.cartRepository.removeCoupon().pipe(
      tap(() => {
        this.loadCart();
      })
    );
  }
}

