import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faHeart, 
  faArrowLeft,
  faShoppingBag,
  faTruck,
  faCreditCard,
  faShieldAlt,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faUser,
  faMapMarkerAlt,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { CartService } from '../../core/services/cart.service';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            routerLink="/app/marketplace"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <fa-icon [icon]="faArrowLeft" class="w-5 h-5"></fa-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p class="text-gray-500">{{ cartItemCount }} items</p>
          </div>
        </div>
        <button 
          routerLink="/app/marketplace"
          class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <!-- Empty Cart -->
      <div *ngIf="cartItemCount === 0" class="text-center py-12">
        <fa-icon [icon]="faShoppingBag" class="w-16 h-16 text-gray-400 mx-auto mb-4"></fa-icon>
        <h2 class="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
        <p class="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
        <button 
          routerLink="/app/marketplace"
          class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
        >
          Start Shopping
        </button>
      </div>

      <!-- Cart Content -->
      <div *ngIf="cartItemCount > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Cart Items List -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Cart Items</h2>
            </div>
            <div class="divide-y divide-gray-200">
              <div *ngFor="let item of cartItems" class="p-6">
                <div class="flex items-center space-x-4">
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img 
                      [src]="item.product?.images[0]?.url || '/markt-text-logo.png'" 
                      [alt]="item.product?.name"
                      class="w-20 h-20 object-cover rounded-lg"
                    >
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900 mb-1">
                          <a 
                            [routerLink]="['/app/marketplace/products', item.product?.id]"
                            class="hover:text-markt-primary transition-colors"
                          >
                            {{ item.product?.name }}
                          </a>
                        </h3>
                        <p class="text-sm text-gray-500 mb-2">{{ item.product?.description }}</p>
                        
                        <!-- Seller Info -->
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                          <span class="flex items-center">
                            <fa-icon [icon]="faUser" class="w-4 h-4 mr-1"></fa-icon>
                            {{ item.product?.seller?.shop_name }}
                          </span>
                          <span class="flex items-center">
                            <fa-icon [icon]="faMapMarkerAlt" class="w-4 h-4 mr-1"></fa-icon>
                            {{ item.product?.seller?.location }}
                          </span>
                        </div>

                        <!-- Product Options -->
                        <div *ngIf="item.options && item.options.length > 0" class="mt-2">
                          <div *ngFor="let option of item.options" class="text-sm text-gray-500">
                            {{ option.name }}: {{ option.value }}
                          </div>
                        </div>
                      </div>

                      <!-- Price -->
                      <div class="text-right">
                        <p class="text-lg font-bold text-gray-900">{{ item.price | currency:'NGN' }}</p>
                        <p *ngIf="item.original_price && item.original_price > item.price" class="text-sm text-gray-500 line-through">
                          {{ item.original_price | currency:'NGN' }}
                        </p>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="mt-4 flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <label class="text-sm font-medium text-gray-700">Quantity:</label>
                        <div class="flex items-center border border-gray-300 rounded-md">
                          <button 
                            (click)="updateQuantity(item.id, item.quantity - 1)"
                            [disabled]="item.quantity <= 1"
                            class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <fa-icon [icon]="faMinus" class="w-4 h-4"></fa-icon>
                          </button>
                          <span class="px-4 py-2 text-sm font-medium">{{ item.quantity }}</span>
                          <button 
                            (click)="updateQuantity(item.id, item.quantity + 1)"
                            [disabled]="item.quantity >= 99"
                            class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
                          </button>
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="flex items-center space-x-3">
                        <button 
                          (click)="moveToWishlist(item)"
                          class="text-gray-400 hover:text-red-500 transition-colors"
                          title="Move to Wishlist"
                        >
                          <fa-icon [icon]="faHeart" class="w-5 h-5"></fa-icon>
                        </button>
                        <button 
                          (click)="removeItem(item.id)"
                          class="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Item"
                        >
                          <fa-icon [icon]="faTrash" class="w-5 h-5"></fa-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cart Summary by Seller -->
          <div *ngFor="let sellerGroup of cartSummaryBySeller" class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <img 
                    [src]="sellerGroup.seller?.profile_picture_url || '/markt-text-logo.png'" 
                    [alt]="sellerGroup.seller?.shop_name"
                    class="w-8 h-8 rounded-full object-cover"
                  >
                  <div>
                    <h3 class="font-medium text-gray-900">{{ sellerGroup.seller?.shop_name }}</h3>
                    <p class="text-sm text-gray-500">{{ sellerGroup.itemCount }} items</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900">{{ sellerGroup.subtotal | currency:'NGN' }}</p>
                  <p class="text-sm text-gray-500">Shipping: {{ sellerGroup.shipping | currency:'NGN' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow sticky top-6">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Order Summary</h2>
            </div>
            <div class="p-6 space-y-4">
              <!-- Subtotal -->
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal ({{ cartItemCount }} items)</span>
                <span class="font-medium">{{ cartSubtotal | currency:'NGN' }}</span>
              </div>

              <!-- Shipping -->
              <div class="flex justify-between">
                <span class="text-gray-600">Shipping</span>
                <span class="font-medium">{{ cartShipping | currency:'NGN' }}</span>
              </div>

              <!-- Discount -->
              <div *ngIf="cartDiscount > 0" class="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{{ cartDiscount | currency:'NGN' }}</span>
              </div>

              <!-- Tax -->
              <div class="flex justify-between">
                <span class="text-gray-600">Tax</span>
                <span class="font-medium">{{ cartTax | currency:'NGN' }}</span>
              </div>

              <!-- Total -->
              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between">
                  <span class="text-lg font-medium text-gray-900">Total</span>
                  <span class="text-lg font-bold text-gray-900">{{ cartTotal | currency:'NGN' }}</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">Including all taxes and shipping</p>
              </div>

              <!-- Checkout Button -->
              <button 
                (click)="proceedToCheckout()"
                [disabled]="!canCheckout"
                class="w-full bg-markt-primary text-white py-3 px-4 rounded-md hover:bg-markt-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              <!-- Security Notice -->
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <fa-icon [icon]="faShieldAlt" class="w-4 h-4"></fa-icon>
                <span>Secure checkout with SSL encryption</span>
              </div>

              <!-- Payment Methods -->
              <div class="border-t border-gray-200 pt-4">
                <h3 class="text-sm font-medium text-gray-900 mb-2">Accepted Payment Methods</h3>
                <div class="flex items-center space-x-2">
                  <div class="flex items-center space-x-1 text-xs text-gray-500">
                    <fa-icon [icon]="faCreditCard" class="w-4 h-4"></fa-icon>
                    <span>Cards</span>
                  </div>
                  <span class="text-gray-300">•</span>
                  <span class="text-xs text-gray-500">Bank Transfer</span>
                  <span class="text-gray-300">•</span>
                  <span class="text-xs text-gray-500">Digital Wallets</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Info -->
          <div class="mt-6 bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="font-medium text-gray-900">Shipping Information</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faTruck" class="w-5 h-5 text-green-600"></fa-icon>
                <div>
                  <p class="font-medium text-gray-900">Free Shipping</p>
                  <p class="text-sm text-gray-500">On orders over ₦5,000</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faClock" class="w-5 h-5 text-blue-600"></fa-icon>
                <div>
                  <p class="font-medium text-gray-900">Fast Delivery</p>
                  <p class="text-sm text-gray-500">2-5 business days</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faCheck" class="w-5 h-5 text-green-600"></fa-icon>
                <div>
                  <p class="font-medium text-gray-900">Easy Returns</p>
                  <p class="text-sm text-gray-500">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently Viewed -->
      <div *ngIf="recentlyViewed.length > 0" class="border-t border-gray-200 pt-8">
        <h3 class="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let product of recentlyViewed" class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              [src]="product.images[0]?.url || '/markt-text-logo.png'" 
              [alt]="product.name"
              class="w-full h-48 object-cover"
            >
            <div class="p-4">
              <h4 class="font-medium text-gray-900 mb-2">{{ product.name }}</h4>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-gray-900">{{ product.price | currency:'NGN' }}</span>
                <button 
                  (click)="addToCart(product.id, 1)"
                  class="bg-markt-primary text-white px-3 py-1 rounded-md hover:bg-markt-secondary transition-colors text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private marketplaceService = inject(MarketplaceService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Icons
  faTrash = faTrash;
  faPlus = faPlus;
  faMinus = faMinus;
  faHeart = faHeart;
  faArrowLeft = faArrowLeft;
  faShoppingBag = faShoppingBag;
  faTruck = faTruck;
  faCreditCard = faCreditCard;
  faShieldAlt = faShieldAlt;
  faCheck = faCheck;
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle;
  faUser = faUser;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;

  // Data
  cartItems: any[] = [];
  cartItemCount = 0;
  cartSubtotal = 0;
  cartShipping = 0;
  cartDiscount = 0;
  cartTax = 0;
  cartTotal = 0;
  recentlyViewed: any[] = [];
  canCheckout = true;
  errorMessage: string = '';
  loading = false;
  selectedAddress: any = null;
  selectedPaymentMethod: string = '';
  orderNotes: string = '';

  ngOnInit(): void {
    this.loadCart();
    this.loadRecentlyViewed();
  }

  private loadCart(): void {
    this.loading = true;
    
    this.apiService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.data?.items || [];
        this.cartItemCount = response.data?.total_items || 0;
        this.calculateTotals();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartItems = [];
        this.loading = false;
      }
    });
  }

  private loadRecentlyViewed(): void {
    // This would typically load from a recently viewed service
    this.recentlyViewed = [];
  }

  private calculateTotals(): void {
    this.cartSubtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.cartShipping = this.calculateShipping();
    this.cartTax = this.cartSubtotal * 0.075; // 7.5% tax
    this.cartTotal = this.cartSubtotal + this.cartShipping + this.cartTax - this.cartDiscount;
    
    // Check if cart can be checked out
    this.canCheckout = this.cartItems.length > 0 && this.cartTotal > 0;
  }

  private calculateShipping(): number {
    if (this.cartSubtotal >= 5000) {
      return 0; // Free shipping
    }
    
    // Calculate shipping based on seller groups
    const sellerGroups = this.cartSummaryBySeller;
    return sellerGroups.reduce((total: number, group: any) => total + group.shipping, 0);
  }

  get cartSummaryBySeller(): any[] {
    const sellerMap = new Map();
    
    this.cartItems.forEach(item => {
      const sellerId = item.product?.seller?.id;
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          seller: item.product?.seller,
          items: [],
          itemCount: 0,
          subtotal: 0,
          shipping: 0
        });
      }
      
      const group = sellerMap.get(sellerId);
      group.items.push(item);
      group.itemCount += item.quantity;
      group.subtotal += item.price * item.quantity;
      group.shipping = this.calculateShippingForSeller(group);
    });
    
    return Array.from(sellerMap.values());
  }

  private calculateShippingForSeller(sellerGroup: any): number {
    const subtotal = sellerGroup.subtotal;
    if (subtotal >= 5000) {
      return 0; // Free shipping
    }
    return 500; // Standard shipping cost
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > 99) {
      return;
    }

    this.apiService.updateCartItem(itemId, { quantity: newQuantity }).subscribe({
      next: (response) => {
        this.loadCart(); // Reload cart to get updated totals
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeItem(itemId: string): void {
    this.apiService.removeFromCart(itemId).subscribe({
      next: (response) => {
        this.loadCart(); // Reload cart
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  moveToWishlist(item: any): void {
    // This would typically call a wishlist service
    
    
    // Remove from cart after moving to wishlist
    this.removeItem(item.id);
  }

  // Additional cart endpoint integrations
  addToCart(productId: string, quantity: number = 1): void {
    const cartData = {
      product_id: productId,
      quantity: quantity
    };

    this.apiService.addToCart(cartData).subscribe({
      next: (response) => {
        console.log('Item added to cart:', response.data);
        this.loadCart(); // Refresh cart data
      },
      error: (error) => {
        console.error('Error adding item to cart:', error);
      }
    });
  }

  checkoutCart(): void {
    const checkoutData = {
      shipping_address: this.selectedAddress,
      payment_method: this.selectedPaymentMethod,
      notes: this.orderNotes
    };

    this.apiService.checkoutCart(checkoutData).subscribe({
      next: (response) => {
        console.log('Cart checked out:', response.data);
        // Navigate to order confirmation
        this.router.navigate(['/app/orders', response.data.id]);
      },
      error: (error) => {
        console.error('Error checking out cart:', error);
      }
    });
  }

  removeCartItem(itemId: string): void {
    this.apiService.removeCartItem(itemId).subscribe({
      next: (response) => {
        console.log('Item removed from cart:', response.data);
        this.loadCart(); // Refresh cart data
      },
      error: (error) => {
        console.error('Error removing item from cart:', error);
      }
    });
  }

  toggleWishlist(productId: string): void {
    this.apiService.toggleWishlist(productId).subscribe({
      next: (response) => {
        console.log('Wishlist toggled:', response.data);
      },
      error: (error) => {
        console.error('Error toggling wishlist:', error);
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.canCheckout) {
      return;
    }

    this.validateCart();
  }

  clearCart(): void {
    this.apiService.clearCart().subscribe({
      next: (response) => {
        this.cartItems = [];
        this.cartItemCount = 0;
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  applyCoupon(couponCode: string): void {
    this.cartService.applyCoupon(couponCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.cartDiscount = response.data.discount_amount;
          this.calculateTotals();
          
        }
      },
      error: (error) => {
        console.error('Error applying coupon:', error);
      }
    });
  }

  getTotalShipping(): number {
    const sellerGroups = this.cartSummaryBySeller;
    return sellerGroups.reduce((total: number, group: any) => total + group.shipping, 0);
  }

  validateCart(): void {
    const validation = this.cartService.validateCartForCheckout();
    if (validation.isValid) {
      this.router.navigate(['/checkout']);
    } else {
      this.errorMessage = validation.errors.join(', ');
    }
  }
} 