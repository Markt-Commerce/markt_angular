import { Injectable, computed, inject, signal } from '@angular/core';
import { Cart } from '../api/models';
import { CartProduct } from '../api/models/cart.model';

// import { CartService } from '../services/services'; To uncomment when using real CartService
import { MockCartService } from '../services/http/mock-cart.service';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private cartService = inject(MockCartService);

  private _cartItems = signal<CartProduct[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly cartItems = computed(() => this._cartItems());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  // Mock product data (to be replaced with backend product service later)
  private productData: {
    [key: string]: { name: string; price: number; image: string };
  } = {
    'prod-001': { name: 'LCD Monitor', price: 650, image: 'lcd-tv' },
    'prod-002': { name: 'H1 Gamepad', price: 550, image: 'gamepad' },
    'prod-003': {
      name: 'Wireless Headphones',
      price: 200,
      image: 'headphones',
    },
    'prod-004': { name: 'Gaming Keyboard', price: 150, image: 'keyboard' },
  };

  private transform(carts: Cart[]): CartProduct[] {
    return carts.map((cart) => {
      const product = this.productData[cart.product_id] || {
        name: `Product ${cart.product_id}`,
        price: 100,
        image: 'default',
      };

      return {
        name: product.name,
        price: product.price,
        quantity: cart.quantity,
        image: product.image,
        cartId: cart.cart_id,
        hasDiscount: cart.has_discount,
        discountPercent: cart.discount_percent,
        discountPrice: cart.discount_price,
      };
    });
  }

  loadCart(buyerId: string) {
    this._isLoading.set(true);
    this._error.set(null);

    this.cartService.getBuyerCart(buyerId).subscribe({
      next: (carts: Cart[]) => {
        const transformed = this.transform(carts);
        this._cartItems.set(transformed);
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Load cart failed:', err);
        this._error.set('Failed to load cart');
        this._isLoading.set(false);
      },
    });
  }

  removeItem(cartId: string, buyerId: string) {
    this.cartService.removeCart(cartId).subscribe({
      next: () => this.loadCart(buyerId),
      error: (err) => {
        console.error('Remove failed:', err);
        this._error.set('Failed to remove item');
      },
    });
  }
}
