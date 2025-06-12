import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../ui/header/header.component';
import { CartListItemComponent } from '../../ui/cart-list-item/cart-list-item.component';

import { AuthService } from '../../services/services';
import { CartStore } from '../../stores/cart.store';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, CartListItemComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private authService = inject(AuthService);
  private cartStore = inject(CartStore);

  // Signals
  readonly cartItems = this.cartStore.cartItems;
  readonly isLoading = this.cartStore.isLoading;
  readonly error = this.cartStore.error;

  // Coupon code
  couponCode = '';

  ngOnInit() {
    const buyerId = this.authService.getCurrentUserId();
    console.log('👤 Buyer ID:', buyerId);

    if (!buyerId) {
      console.warn('❌ No buyer ID available. Cart will not load.');
      return;
    }

    this.cartStore.loadCart(buyerId);
  }

  get currentBuyerId(): string {
    return this.authService.getCurrentUserId() ?? '';
  }

  removeItem(cartId: string) {
    this.cartStore.removeItem(cartId, this.currentBuyerId);
  }

  updateCart() {
    this.cartStore.loadCart(this.currentBuyerId);
  }

  applyCoupon() {
    if (this.couponCode.trim()) {
      console.log('Applying coupon:', this.couponCode);
      // we can implement coupon logic here
    }
  }

  returnToShop() {
    console.log('Return to shop clicked');
    // implement navigation logic
  }

  proceedToCheckout() {
    console.log('Proceed to checkout clicked');
    // we can  implement checkout logic
  }

  // Totals
  readonly subtotal = computed(() => {
    return this.cartItems().reduce((total, item) => {
      const itemPrice =
        item.hasDiscount && item.discountPrice
          ? item.price - item.discountPrice
          : item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  });

  readonly total = computed(() => this.subtotal());

  get shipping(): string {
    return 'Free';
  }

  trackByCartId(index: number, item: any): string {
    return item.cartId || index.toString();
  }
}
