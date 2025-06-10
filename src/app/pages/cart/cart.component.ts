import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../ui/header/header.component';
import { CartListItemComponent } from '../../ui/cart-list-item/cart-list-item.component';

import { MockCartService as CartService } from '../../../app/services/http/mock-cart.service'; // Mock service till backend is ready
// import { CartService } from ../../../app/services/http/cart.service''; // to uncomment this when backend is ready
import { Cart } from '../../api/models';

// Interface for the product data that our cart-list-item expects
interface CartProduct {
  name: string;
  price: number;
  quantity: number;
  image: string;
  cartId?: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  discountPrice?: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, CartListItemComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);

  cartItems: CartProduct[] = [];
  isLoading = true;
  error: string | null = null;

  // Current user ID - this would come from the auth service
  currentBuyerId = 'buyer-123';

  // Coupon code
  couponCode = '';

  // Mock product data - this would come from the product service
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

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.error = null;

    this.cartService.getBuyerCart(this.currentBuyerId).subscribe({
      next: (carts: Cart[]) => {
        this.cartItems = this.transformCartData(carts);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.error = 'Failed to load cart items';
        this.isLoading = false;
      },
    });
  }

  private transformCartData(carts: Cart[]): CartProduct[] {
    return carts.map((cart) => {
      const productInfo = this.productData[cart.product_id] || {
        name: `Product ${cart.product_id}`,
        price: 100,
        image: 'default',
      };

      return {
        name: productInfo.name,
        price: productInfo.price,
        quantity: cart.quantity,
        image: productInfo.image,
        cartId: cart.cart_id,
        hasDiscount: cart.has_discount,
        discountPercent: cart.discount_percent,
        discountPrice: cart.discount_price,
      };
    });
  }

  removeItem(cartId: string) {
    this.cartService.removeCart(cartId).subscribe({
      next: () => {
        this.loadCart(); // Reload cart after removal
      },
      error: (error: any) => {
        console.error('Error removing item:', error as any);
        this.error = 'Failed to remove item';
      },
    });
  }

  updateCart() {
    // we can implement cart update logic here
    console.log('Update cart clicked');
    this.loadCart();
  }

  applyCoupon() {
    if (this.couponCode.trim()) {
      console.log('Applying coupon:', this.couponCode);
      // we can implement coupon logic here
    }
  }

  returnToShop() {
    // Navigate to shop page
    console.log('Return to shop clicked');
  }

  proceedToCheckout() {
    // Navigate to checkout page
    console.log('Proceed to checkout clicked');
  }

  get subtotal(): number {
    return this.cartItems.reduce((total, item) => {
      const itemPrice =
        item.hasDiscount && item.discountPrice
          ? item.price - item.discountPrice
          : item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  }

  get total(): number {
    // we can add shipping, taxes, etc. here if needed
    return this.subtotal;
  }

  get shipping(): string {
    return 'Free';
  }

  // TrackBy function for ngFor performance optimization
  trackByCartId(index: number, item: CartProduct): string {
    return item.cartId || index.toString();
  }
}
