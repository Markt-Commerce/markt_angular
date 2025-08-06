import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Cart, CartItem, AddToCart, UpdateCartItem, Checkout, Order } from '../models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiService = inject(ApiService);
  
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  /**
   * Get current cart
   */
  getCart(): Observable<any> {
    return this.apiService.getCart().pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.cartSubject.next(response.data);
          }
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
   * Add item to cart with quantity
   */
  addToCart(productId: string, quantity: number = 1): Observable<any> {
    const cartData = {
      product_id: productId,
      quantity: quantity
    };
    
    return this.apiService.addToCart(cartData).pipe(
      tap(response => {
        if (response.success) {
          this.loadCart();
        }
      })
    );
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(itemId: string, quantity: number): Observable<any> {
    const updateData = { quantity };
    return this.apiService.updateCartItem(itemId, updateData).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.loadCart(); // Reload cart to get updated state
          }
        },
        error: (error) => {
          console.error('Error updating cart item:', error);
        }
      })
    );
  }

  /**
   * Remove item from cart
   */
  removeCartItem(itemId: string): Observable<any> {
    return this.apiService.removeCartItem(itemId).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.loadCart(); // Reload cart to get updated state
          }
        },
        error: (error) => {
          console.error('Error removing cart item:', error);
        }
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<any> {
    return this.apiService.clearCart().pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.cartSubject.next(null);
          }
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
        }
      })
    );
  }

  /**
   * Get cart summary
   */
  getCartSummary(): Observable<any> {
    return this.apiService.getCartSummary();
  }

  /**
   * Apply coupon to cart
   */
  applyCoupon(couponCode: string): Observable<any> {
    return this.apiService.applyCoupon({ coupon_code: couponCode }).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.loadCart(); // Reload cart to get updated state
          }
        },
        error: (error) => {
          console.error('Error applying coupon:', error);
        }
      })
    );
  }

  /**
   * Checkout cart
   */
  checkout(checkoutData: Checkout): Observable<any> {
    return this.apiService.checkoutCart(checkoutData).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            // Clear cart after successful checkout
            this.cartSubject.next(null);
          }
        },
        error: (error) => {
          console.error('Error during checkout:', error);
        }
      })
    );
  }

  // ============================================================================
  // CART UTILITIES
  // ============================================================================

  /**
   * Get current cart value
   */
  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    const cart = this.getCurrentCart();
    return cart?.total_items || 0;
  }

  /**
   * Get cart total
   */
  getCartTotal(): number {
    const cart = this.getCurrentCart();
    return cart?.subtotal || 0;
  }

  /**
   * Check if cart is empty
   */
  isCartEmpty(): boolean {
    const cart = this.getCurrentCart();
    return !cart || cart.total_items === 0;
  }

  /**
   * Check if item exists in cart
   */
  isItemInCart(productId: string, variantId?: string): boolean {
    const cart = this.getCurrentCart();
    if (!cart) return false;
    
    return cart.items.some(item => 
      item.product_id === productId && 
      (!variantId || item.variant_id === variantId)
    );
  }

  /**
   * Get item quantity in cart
   */
  getItemQuantity(productId: string, variantId?: string): number {
    const cart = this.getCurrentCart();
    if (!cart) return 0;
    
    const item = cart.items.find(item => 
      item.product_id === productId && 
      (!variantId || item.variant_id === variantId)
    );
    
    return item ? item.quantity : 0;
  }

  /**
   * Get cart items
   */
  getCartItems(): CartItem[] {
    const cart = this.getCurrentCart();
    return cart?.items || [];
  }

  /**
   * Get unique seller count in cart
   */
  getUniqueSellerCount(): number {
    const cart = this.getCurrentCart();
    if (!cart) return 0;
    
    const sellerIds = new Set(cart.items.map(item => item.product.seller.id));
    return sellerIds.size;
  }

  /**
   * Get items by seller
   */
  getItemsBySeller(sellerId: string): CartItem[] {
    const cart = this.getCurrentCart();
    if (!cart) return [];
    
    return cart.items.filter(item => item.product.seller.id === sellerId);
  }

  /**
   * Calculate shipping cost for seller
   */
  calculateShippingForSeller(sellerId: string): number {
    // This would typically call an API to calculate shipping
    // For now, return a placeholder value
    const items = this.getItemsBySeller(sellerId);
    return items.length > 0 ? 5.99 : 0; // $5.99 base shipping
  }

  /**
   * Get cart summary by seller
   */
  getCartSummaryBySeller(): Array<{ sellerId: string; items: CartItem[]; subtotal: number; shipping: number }> {
    const cart = this.getCurrentCart();
    if (!cart) return [];
    
    const sellerGroups = new Map<string, CartItem[]>();
    
    cart.items.forEach(item => {
      const sellerId = item.product.seller.id;
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, []);
      }
      sellerGroups.get(sellerId)!.push(item);
    });
    
    return Array.from(sellerGroups.entries()).map(([sellerId, items]) => ({
      sellerId,
      items,
      subtotal: items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0),
      shipping: this.calculateShippingForSeller(sellerId)
    }));
  }

  /**
   * Validate cart for checkout
   */
  validateCartForCheckout(): { isValid: boolean; errors: string[] } {
    const cart = this.getCurrentCart();
    const errors: string[] = [];
    
    if (!cart || cart.total_items === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors };
    }
    
    // Check if all items are still available
    cart.items.forEach(item => {
      if (item.quantity > item.product.stock) {
        errors.push(`${item.product.name} - Only ${item.product.stock} available`);
      }
    });
    
    // Check if all items are active
    cart.items.forEach(item => {
      if (item.product.status !== 'active') {
        errors.push(`${item.product.name} - Product is not available`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save cart to localStorage as backup
   */
  saveCartToLocalStorage(): void {
    const cart = this.getCurrentCart();
    if (cart) {
      localStorage.setItem('markt_cart_backup', JSON.stringify(cart));
    }
  }

  /**
   * Load cart from localStorage backup
   */
  loadCartFromLocalStorage(): Cart | null {
    const cartData = localStorage.getItem('markt_cart_backup');
    if (cartData) {
      try {
        return JSON.parse(cartData);
      } catch (error) {
        console.error('Error parsing cart backup:', error);
        localStorage.removeItem('markt_cart_backup');
      }
    }
    return null;
  }

  /**
   * Clear cart backup
   */
  clearCartBackup(): void {
    localStorage.removeItem('markt_cart_backup');
  }

  // ============================================================================
  // CART OBSERVABLES
  // ============================================================================

  /**
   * Get cart item count observable
   */
  getCartItemCount$(): Observable<number> {
    return this.cartSubject.pipe(
      map(cart => cart?.items.reduce((total, item) => total + item.quantity, 0) || 0)
    );
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: string): boolean {
    const cart = this.getCurrentCart();
    return cart?.items.some((item: any) => item.product_id === productId) || false;
  }
} 