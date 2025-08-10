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
import { CartItem, Product, SellerAccount, Address } from '../../core/models';
import { AccessControlService } from '../../core/services/access-control.service';
import { MediaOptimizationService } from '../../core/services/media-optimization.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <!-- Buyer mode gate -->
      <div *ngIf="!canCheckout" class="rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center justify-between">
        <div>
          Cart and checkout are available in Buyer mode. Switch to continue.
        </div>
        <button (click)="switchToBuyer()" class="ml-4 bg-markt-primary text-white px-3 py-1.5 rounded-md hover:bg-markt-secondary transition-colors">Switch to Buyer</button>
      </div>
      
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
                      [src]="media.getPrimaryUrl(item.product?.images?.[0])" 
                      [srcset]="media.getSrcSet(item.product?.images?.[0])"
                      [sizes]="media.listThumbSizes()"
                      loading="lazy"
                      decoding="async"
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
                            [routerLink]="['/app/marketplace/product', item.product?.id]"
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
                        </div>
                      </div>

                      <!-- Price -->
                      <div class="text-right">
                        <p class="text-lg font-bold text-gray-900">{{ item.product_price | currency:'NGN' }}</p>
                        <p *ngIf="item.product && item.product.compare_at_price && item.product.compare_at_price > item.product_price" class="text-sm text-gray-500 line-through">
                          {{ item.product?.compare_at_price | currency:'NGN' }}
                        </p>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="mt-4 flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-gray-700">Quantity:</span>
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
        </div>
      </div>

      <!-- Shipping Info -->
      <div class="mt-6 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="font-medium text-gray-900">Shipping Information</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <fa-icon [icon]="faTruck" class="w-5 h-5 text-gray-400"></fa-icon>
              <div>
                <p class="font-medium text-gray-900">Free shipping on orders over ₦10,000</p>
                <p class="text-sm text-gray-500">Standard delivery: 3-5 business days</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <fa-icon [icon]="faShieldAlt" class="w-5 h-5 text-gray-400"></fa-icon>
              <div>
                <p class="font-medium text-gray-900">Secure packaging</p>
                <p class="text-sm text-gray-500">All items are carefully packaged for safe delivery</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <fa-icon [icon]="faCheck" class="w-5 h-5 text-gray-400"></fa-icon>
              <div>
                <p class="font-medium text-gray-900">Easy returns</p>
                <p class="text-sm text-gray-500">30-day return policy for most items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently Viewed Section -->
      <div class="mt-12">
        <h3 class="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let product of recentlyViewed" class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              [src]="media.getPrimaryUrl(product.images?.[0])" 
              [srcset]="media.getSrcSet(product.images?.[0])"
              [sizes]="media.gridSizes()"
              loading="lazy"
              decoding="async"
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
  public access = inject(AccessControlService);
  public media = inject(MediaOptimizationService);

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
  cartItems: CartItem[] = [];
  cartItemCount = 0;
  cartSubtotal = 0;
  cartShipping = 0;
  cartDiscount = 0;
  cartTax = 0;
  cartTotal = 0;
  recentlyViewed: Product[] = [];
  canCheckout = true;
  errorMessage = '';
  loading = false;
  selectedAddress: Address | null = null;
  selectedPaymentMethod = '';
  orderNotes = '';

  ngOnInit(): void {
    this.canCheckout = this.access.canCheckout();
    this.authService.authState$.subscribe(() => {
      this.canCheckout = this.access.canCheckout();
    });

    this.loadCart();
    this.loadRecentlyViewed();
  }

  private loadCart(): void {
    this.loading = true;
    
    this.cartService.getCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems = response.data.items || [];
          this.cartItemCount = response.data.total_items || 0;
          this.calculateTotals();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.errorMessage = 'Error loading cart. Please try again.';
        this.loading = false;
      }
    });
  }

  private loadRecentlyViewed(): void {
    // Load recently viewed products - implement when service is available
    this.recentlyViewed = [];
  }

  private calculateTotals(): void {
    this.cartSubtotal = this.cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0);
    this.cartShipping = this.calculateShipping();
    this.cartTax = this.cartSubtotal * 0.075; // 7.5% tax
    this.cartTotal = this.cartSubtotal + this.cartShipping + this.cartTax - this.cartDiscount;
  }

  private calculateShipping(): number {
    // Calculate shipping based on seller groups
    const sellerGroups = this.cartSummaryBySeller;
    return sellerGroups.reduce((total, group) => total + group.shipping, 0);
  }

  get cartSummaryBySeller(): Array<{ seller: SellerAccount; items: CartItem[]; subtotal: number; shipping: number; itemCount: number }> {
    const sellerMap = new Map<string, { seller: SellerAccount; items: CartItem[]; subtotal: number; shipping: number; itemCount: number }>();
    
    this.cartItems.forEach(item => {
      const sellerId = item.product?.seller?.id;
      if (sellerId) {
        const existing = sellerMap.get(sellerId);
        
        if (existing) {
          existing.items.push(item);
          existing.subtotal += item.product_price * item.quantity;
          existing.itemCount += item.quantity;
        } else {
          sellerMap.set(sellerId, {
            seller: item.product.seller,
            items: [item],
            subtotal: item.product_price * item.quantity,
            shipping: this.calculateShippingForSeller({ seller: item.product.seller, items: [item], subtotal: item.product_price * item.quantity, shipping: 0 }),
            itemCount: item.quantity
          });
        }
      }
    });
    
    return Array.from(sellerMap.values());
  }

  private calculateShippingForSeller(sellerGroup: { seller: SellerAccount; items: CartItem[]; subtotal: number; shipping: number }): number {
    // Simple shipping calculation - can be enhanced based on business logic
    return sellerGroup.subtotal > 10000 ? 0 : 1000; // Free shipping over 10k, 1k otherwise
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.cartService.updateCartItem(itemId, newQuantity).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart(); // Refresh cart data
        }
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        this.errorMessage = 'Error updating quantity. Please try again.';
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeCartItem(itemId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart(); // Refresh cart data
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
        this.errorMessage = 'Error removing item. Please try again.';
      }
    });
  }

  moveToWishlist(item: CartItem): void {
    // Add to wishlist - implement when service is available
    this.removeItem(item.id);
  }

  addToCart(productId: string, quantity = 1): void {
    const cartData = {
      product_id: productId,
      quantity: quantity
    };

    this.apiService.addToCart(cartData).subscribe({
      next: (response) => {
        this.loadCart(); // Refresh cart data
      },
      error: (error) => {
        this.errorMessage = 'Error adding item to cart. Please try again.';
        console.error('Error adding item to cart:', error);
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.canCheckout) {
      return;
    }
    if (!this.selectedAddress) {
      this.errorMessage = 'Please select a shipping address';
      return;
    }

    if (!this.selectedPaymentMethod) {
      this.errorMessage = 'Please select a payment method';
      return;
    }

    const checkoutData = {
      shipping_address: {
        latitude: this.selectedAddress.latitude,
        longitude: this.selectedAddress.longitude,
        street: this.selectedAddress.street,
        house_number: this.selectedAddress.house_number,
        city: this.selectedAddress.city,
        state: this.selectedAddress.state,
        country: this.selectedAddress.country,
        postal_code: this.selectedAddress.postal_code
      },
      payment_method: this.selectedPaymentMethod,
      notes: this.orderNotes
    };

    this.router.navigate(['/app/checkout'], { 
      state: { checkoutData } 
    });
  }

  removeCartItem(itemId: string): void {
    this.apiService.removeCartItem(itemId).subscribe({
      next: (response) => {
        this.loadCart(); // Refresh cart data
      },
      error: (error) => {
        this.errorMessage = 'Error removing item from cart. Please try again.';
        console.error('Error removing item from cart:', error);
      }
    });
  }

  toggleWishlist(productId: string): void {
    this.apiService.toggleWishlist(productId).subscribe({
      next: (response) => {
        // Wishlist updated successfully
      },
      error: (error) => {
        this.errorMessage = 'Error updating wishlist. Please try again.';
        console.error('Error toggling wishlist:', error);
      }
    });
  }

  validateCart(): void {
    const validation = this.cartService.validateCartForCheckout();
    if (validation.isValid) {
      this.router.navigate(['/app/checkout']);
    } else {
      this.errorMessage = validation.errors.join(', ');
    }
  }

  switchToBuyer(): void {
    this.authService.switchRole().subscribe({
      next: () => {
        this.canCheckout = this.access.canCheckout();
        this.loadCart();
      },
      error: () => {}
    });
  }
} 