import { Injectable, inject, signal } from '@angular/core';
import { CartProduct } from '../api/models/cart.model';
import { MockCartService } from '../services/http/mock-cart.service';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private cartService = inject(MockCartService);

  // Cart items signal
  cartItems = signal<CartProduct[]>([]);

  // Initialize cart
  async initializeCart(): Promise<void> {
    try {
      const cart = await this.cartService.getCartItems();
      this.cartItems.set(this.transform(cart));
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      this.cartItems.set([]);
    }
  }

  // Add item to cart
  async addToCart(product: CartProduct): Promise<void> {
    try {
      await this.cartService.addToCart(product);
      const newItem: CartProduct = {
        ...product,
        quantity: 1,
      };
      this.cartItems.update((items) => [...items, newItem]);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  }

  // Remove item from cart
  async removeFromCart(productId: string): Promise<void> {
    try {
      await this.cartService.removeFromCart(productId);
      this.cartItems.update((items) =>
        items.filter((item) => item.productId !== productId)
      );
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  }

  // Update item quantity
  async updateQuantity(productId: string, quantity: number): Promise<void> {
    try {
      await this.cartService.updateQuantity(productId, quantity);
      this.cartItems.update((items) =>
        items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }

  // Clear cart
  async clearCart(): Promise<void> {
    try {
      await this.cartService.clearCart();
      this.cartItems.set([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }

  // Transform cart data
  private transform(cartData: any[]): CartProduct[] {
    return cartData.map((item) => ({
      productId: item.productId || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity || 1,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
    }));
  }
}
