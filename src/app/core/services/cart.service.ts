import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError, combineLatest } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from './marketplace.service';

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total_price: number;
  added_at: string;
  notes?: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  notes?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
  notes?: string;
}

export interface ShippingAddress {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: string;
  is_available: boolean;
}

export interface CartSummary {
  total_items: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiService = inject(ApiService);
  
  // BehaviorSubjects for state management
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    total_items: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    currency: 'NGN'
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public cart$ = this.cartSubject.asObservable();
  public cartItems$ = this.cartItemsSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  /**
   * Load user's cart
   */
  loadCart(): void {
    this.loadingSubject.next(true);
    
    this.apiService.get<Cart>('/cart').pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    ).subscribe();
  }

  /**
   * Get cart
   */
  getCart(): Observable<Cart> {
    return this.apiService.get<Cart>('/cart').pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
      }),
      map(response => response.data!)
    );
  }

  /**
   * Add item to cart
   */
  addToCart(item: AddToCartRequest): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Cart>('/cart/items', item).pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Update cart item
   */
  updateCartItem(itemId: number, updates: UpdateCartItemRequest): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.put<Cart>(`/cart/items/${itemId}`, updates).pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(itemId: number): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.delete<Cart>(`/cart/items/${itemId}`).pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Clear cart
   */
  clearCart(): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.delete<Cart>('/cart/items').pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get shipping methods
   */
  getShippingMethods(): Observable<ShippingMethod[]> {
    return this.apiService.get<ShippingMethod[]>('/cart/shipping-methods').pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Calculate shipping
   */
  calculateShipping(shippingMethodId: string): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Cart>('/cart/calculate-shipping', { shipping_method_id: shippingMethodId }).pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Apply coupon code
   */
  applyCoupon(couponCode: string): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Cart>('/cart/apply-coupon', { coupon_code: couponCode }).pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Remove coupon code
   */
  removeCoupon(): Observable<Cart> {
    this.loadingSubject.next(true);
    
    return this.apiService.delete<Cart>('/cart/coupon').pipe(
      tap(response => {
        if (response.data) {
          this.cartSubject.next(response.data);
          this.cartItemsSubject.next(response.data.items);
          this.updateCartSummary(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get cart summary
   */
  getCartSummary(): Observable<CartSummary> {
    return this.apiService.get<CartSummary>('/cart/summary').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: number): boolean {
    const currentItems = this.cartItemsSubject.value;
    return currentItems.some(item => item.product_id === productId);
  }

  /**
   * Get cart item quantity for product
   */
  getProductQuantity(productId: number): number {
    const currentItems = this.cartItemsSubject.value;
    const item = currentItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Update cart summary
   */
  private updateCartSummary(cart: Cart): void {
    this.cartSummarySubject.next({
      total_items: cart.total_items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      currency: cart.currency
    });
  }

  /**
   * Get current cart
   */
  get currentCart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Get current cart items
   */
  get currentCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Get current cart summary
   */
  get currentCartSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get cart item count
   */
  get cartItemCount(): number {
    return this.cartSummarySubject.value.total_items;
  }

  /**
   * Get cart total
   */
  get cartTotal(): number {
    return this.cartSummarySubject.value.total;
  }

  /**
   * Check if cart is empty
   */
  get isCartEmpty(): boolean {
    return this.cartItemCount === 0;
  }

  /**
   * Clear cart data (on logout)
   */
  clearCartData(): void {
    this.cartSubject.next(null);
    this.cartItemsSubject.next([]);
    this.cartSummarySubject.next({
      total_items: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'NGN'
    });
  }

  /**
   * Refresh cart data
   */
  refreshCart(): void {
    this.loadCart();
  }
} 