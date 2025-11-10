import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../authentication/services/auth.service';
import { CartRepository } from '../repositories/cart.repository';
import { Cart, CartItem } from '../models/cart.model';
import {
  AddToCartDto,
  ApplyCouponResponseDto,
  CartSummaryDto,
  CheckoutDto,
  CheckoutResponseDto,
  UpdateCartItemDto
} from '../models/cart.dto';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartRepository = inject(CartRepository);
  private readonly authService = inject(AuthService);

  private readonly cartSubject = new BehaviorSubject<Cart | null>(null);
  readonly cart$ = this.cartSubject.asObservable();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const role = this.authService.getCurrentRole();
    if (role === 'buyer') {
      this.loadCart();
    } else {
      this.cartSubject.next(null);
    }

    this.authService.authState$?.subscribe(state => {
      const currentRole = state?.user?.currentRole;
      if (currentRole === 'buyer') {
        this.loadCart();
      } else {
        this.cartSubject.next(null);
      }
    });
  }

  getCart(): Observable<Cart | null> {
    const role = this.authService.getCurrentRole();
    if (role !== 'buyer') {
      return throwError(() => new Error('Only buyers can access cart resources'));
    }

    return this.cartRepository.getCart().pipe(
      tap(cart => {
        this.cartSubject.next(cart);
      })
    );
  }

  private loadCart(): void {
    this.cartRepository.getCart().subscribe({
      next: cart => this.cartSubject.next(cart),
      error: () => {
        this.cartSubject.next(null);
      }
    });
  }

  addToCart(productId: string, quantity = 1, variantId?: number | null): Observable<CartItem> {
    if (quantity <= 0) {
      return throwError(() => new Error('Quantity must be greater than 0'));
    }

    const role = this.authService.getCurrentRole();
    if (role !== 'buyer') {
      return throwError(() => new Error('Only buyers can add items to cart'));
    }

    const payload: AddToCartDto = {
      product_id: productId,
      quantity,
      variant_id: variantId === 0 ? null : variantId
    };

    return this.cartRepository.addItem(payload).pipe(
      tap(() => this.loadCart())
    );
  }

  updateCartItem(itemId: number | string, quantity: number): Observable<CartItem | null> {
    if (quantity < 0) {
      return throwError(() => new Error('Quantity cannot be negative'));
    }

    const numericId = this.toNumericId(itemId);
    const payload: UpdateCartItemDto = { quantity };

    return this.cartRepository.updateItem(numericId, payload).pipe(
      tap(() => this.loadCart())
    );
  }

  removeCartItem(itemId: number | string): Observable<void> {
    const numericId = this.toNumericId(itemId);
    return this.cartRepository.removeItem(numericId).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart(): Observable<void> {
    return this.cartRepository.clear().pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  getCartSummary(): Observable<CartSummaryDto> {
    return this.cartRepository.getSummary();
  }

  applyCoupon(couponCode: string): Observable<ApplyCouponResponseDto> {
    if (!couponCode || couponCode.trim().length === 0) {
      return throwError(() => new Error('Coupon code is required'));
    }

    return this.cartRepository.applyCoupon(couponCode.trim()).pipe(
      tap(() => this.loadCart())
    );
  }

  checkout(checkoutData: CheckoutDto): Observable<CheckoutResponseDto> {
    return this.cartRepository.checkout(checkoutData).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  getCartItemCount(): number {
    return this.getCurrentCart()?.getTotalItems() ?? 0;
  }

  getCartTotal(): number {
    return this.getCurrentCart()?.calculateSubtotal() ?? 0;
  }

  isCartEmpty(): boolean {
    return this.getCartItemCount() === 0;
  }

  isProductInCart(productId: string, variantId?: number | string | null): boolean {
    const cart = this.getCurrentCart();
    if (!cart) {
      return false;
    }

    return cart.items.some(item => {
      const matchesProduct = item.product.id === productId;
      const matchesVariant =
        variantId === undefined ||
        variantId === null ||
        String(item.variantId ?? '') === String(variantId ?? '');
      return matchesProduct && matchesVariant;
    });
  }

  getItemQuantity(productId: string, variantId?: number | string | null): number {
    const cart = this.getCurrentCart();
    if (!cart) {
      return 0;
    }

    const item = cart.items.find(cartItem => {
      const matchesProduct = cartItem.product.id === productId;
      const matchesVariant =
        variantId === undefined ||
        variantId === null ||
        String(cartItem.variantId ?? '') === String(variantId ?? '');
      return matchesProduct && matchesVariant;
    });

    return item?.quantity ?? 0;
  }

  validateCartForCheckout(): { isValid: boolean; errors: string[] } {
    const cart = this.getCurrentCart();
    const errors: string[] = [];

    if (!cart || cart.isEmpty()) {
      errors.push('Cart is empty');
      return { isValid: false, errors };
    }

    cart.items.forEach(item => {
      if (!item.product.isAvailable()) {
        errors.push(`${item.productDto?.name ?? item.product.id} is not available`);
      }

      if (!item.product.canPurchase(item.quantity)) {
        errors.push(
          `${item.productDto?.name ?? item.product.id} - only ${item.product.getStock()} available`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  reset(): void {
    this.cartSubject.next(null);
  }

  private toNumericId(id: number | string): number {
    if (typeof id === 'number') {
      return id;
    }

    const parsed = Number(id);
    if (Number.isNaN(parsed)) {
      throw new Error('Invalid cart item identifier');
    }

    return parsed;
  }
}


