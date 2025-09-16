import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { combineLatest } from 'rxjs';
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
import { RoleIntentService } from '../../core/services/role-intent.service';
import { TypeSafetyService } from '../../core/services/type-safety.service';
import { ObservableUtilsService } from '../../core/services/observable-utils.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Buyer mode gate -->
      @if (!canCheckout) {
        <div class="rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center justify-between">
          <div>
            Cart and checkout are available in Buyer mode. Switch to continue.
          </div>
          <button (click)="switchToBuyer()" class="ml-4 bg-markt-primary text-white px-3 py-1.5 rounded-md hover:bg-markt-secondary transition-colors">Switch to Buyer</button>
        </div>
      }
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            [routerLink]="['/app/marketplace']"
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
          [routerLink]="['/app/marketplace']"
          class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <!-- Error Message -->
      @if (errorMessage) {
        <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex items-center">
            <fa-icon [icon]="faExclamationTriangle" class="w-5 h-5 text-red-400 mr-2"></fa-icon>
            <span class="text-sm text-red-800">{{ errorMessage }}</span>
            <button (click)="errorMessage = ''" class="ml-auto text-red-400 hover:text-red-600">
              <fa-icon [icon]="faTimes" class="w-4 h-4"></fa-icon>
            </button>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (loadingCart) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-markt-primary"></div>
          <p class="mt-2 text-gray-600">Loading cart...</p>
        </div>
      }

      <!-- Empty Cart -->
      @if (!loadingCart && cartItemCount === 0 && !errorMessage) {
        <div class="text-center py-12">
          <fa-icon [icon]="faShoppingBag" class="w-16 h-16 text-gray-400 mx-auto mb-4"></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
          <p class="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button 
            [routerLink]="['/app/marketplace']"
            class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
      }

      <!-- Cart Content -->
      @if (cartItemCount > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Cart Items List -->
            <div class="bg-white rounded-lg shadow">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Cart Items</h2>
              </div>
              <div class="divide-y divide-gray-200">
                @for (item of cartItems; track item.id) {
                  <div class="p-6">
                    <div class="flex items-center space-x-4">
                      <!-- Product Image -->
                      <div class="flex-shrink-0">
                        <img 
                          [src]="getProductImageUrl(item.product.images && item.product.images[0])" 
                          [alt]="item.product.name"
                          class="w-20 h-20 object-cover rounded-lg"
                          loading="lazy"
                        >
                      </div>

                      <!-- Product Details -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h3 class="text-lg font-medium text-gray-900 mb-1">
                              <a 
                                [routerLink]="['/app/marketplace/product', item.product.id]"
                                class="hover:text-markt-primary transition-colors"
                              >
                                {{ item.product.name }}
                              </a>
                            </h3>
                            <p class="text-sm text-gray-500 mb-2">{{ item.product.description }}</p>
                            
                            <!-- Seller Info -->
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                              <span class="flex items-center">
                                <fa-icon [icon]="faUser" class="w-4 h-4 mr-1"></fa-icon>
                                {{ item.product.seller && item.product.seller.shop_name }}
                              </span>
                            </div>
                          </div>

                          <!-- Price -->
                          <div class="text-right">
                            <p class="text-lg font-bold text-gray-900">{{ item.product_price | currency:'NGN' }}</p>
                            @if (item.product && item.product.compare_at_price && item.product.compare_at_price > item.product_price) {
                              <p class="text-sm text-gray-500 line-through">
                                {{ item.product.compare_at_price | currency:'NGN' }}
                              </p>
                            }
                          </div>
                        </div>

                        <!-- Quantity Controls -->
                        <div class="mt-4 flex items-center justify-between">
                          <div class="flex items-center space-x-3">
                            <span class="text-sm font-medium text-gray-700">Quantity:</span>
                            <div class="flex items-center border border-gray-300 rounded-md">
                              <button 
                                (click)="updateQuantity(item.id, item.quantity - 1)"
                                [disabled]="item.quantity <= 1 || updatingQuantity"
                                class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                @if (updatingQuantity) {
                                  <div class="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                } @else {
                                  <fa-icon [icon]="faMinus" class="w-4 h-4"></fa-icon>
                                }
                              </button>
                              <span class="px-4 py-2 text-sm font-medium">{{ item.quantity }}</span>
                              <button 
                                (click)="updateQuantity(item.id, item.quantity + 1)"
                                [disabled]="item.quantity >= 99 || updatingQuantity"
                                class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                @if (updatingQuantity) {
                                  <div class="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                } @else {
                                  <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
                                }
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
                              [disabled]="removingItem"
                              class="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove Item"
                            >
                              @if (removingItem) {
                                <div class="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                              } @else {
                                <fa-icon [icon]="faTrash" class="w-5 h-5"></fa-icon>
                              }
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Cart Summary by Seller -->
            @for (sellerGroup of cartSummaryBySeller; track sellerGroup.seller.id) {
              <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <img 
                        [src]="sellerGroup.seller.profile_picture_url || '/markt-text-logo.png'" 
                        [alt]="sellerGroup.seller.shop_name"
                        class="w-8 h-8 rounded-full object-cover"
                      >
                      <div>
                        <h3 class="font-medium text-gray-900">{{ sellerGroup.seller.shop_name }}</h3>
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
            }
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
                @if (cartDiscount > 0) {
                  <div class="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{{ cartDiscount | currency:'NGN' }}</span>
                  </div>
                }

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
          </div>
        </div>
      }

      <!-- Recently Viewed Section -->
      @if (recentlyViewed.length > 0) {
        <div class="mt-12">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of recentlyViewed; track product.id) {
              <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  [src]="getProductImageUrl(product.images && product.images[0])" 
                  [alt]="product.name"
                  class="w-full h-48 object-cover"
                  loading="lazy"
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
            }
          </div>
        </div>
      }
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
  private roleIntent = inject(RoleIntentService);
  private typeSafety = inject(TypeSafetyService);
  private observableUtils = inject(ObservableUtilsService);

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
  loadingCart = false;
  loadingRecentlyViewed = false;
  updatingQuantity = false;
  removingItem = false;
  selectedAddress: Address | null = null;
  selectedPaymentMethod = '';
  orderNotes = '';

  ngOnInit(): void {
    this.canCheckout = this.access.isBuyer;
    this.authService.authState$.subscribe(() => {
      this.canCheckout = this.access.isBuyer;
    });

    this.loadCart();
    this.loadRecentlyViewed();
  }

  private loadCart(): void {
    this.loadingCart = true;
    this.errorMessage = '';
    
    this.observableUtils.createSafeObservable({
      source: this.cartService.getCart(),
      loadingSetter: (loading: boolean) => this.loadingCart = loading,
      successHandler: (response: any) => {
        if (response.success) {
          this.cartItems = response.data.items || [];
          this.cartItemCount = response.data.total_items || 0;
          this.calculateTotals();
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message || 'Failed to load cart';
        }
      },
      errorSetter: (error: string | null) => {
        console.error('Error loading cart:', error);
        this.errorMessage = error || 'Error loading cart. Please try again.';
        this.cartItems = [];
        this.cartItemCount = 0;
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
          const group = {
            seller: item.product.seller,
            items: [item],
            subtotal: item.product_price * item.quantity,
            shipping: 0,
            itemCount: item.quantity
          };
          group.shipping = this.calculateShippingForSeller(group);
          sellerMap.set(sellerId, group);
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

    if (newQuantity > 99) {
      this.errorMessage = 'Maximum quantity is 99';
      return;
    }

    this.updatingQuantity = true;
    this.errorMessage = '';

    this.observableUtils.createSafeObservable({
      source: this.cartService.updateCartItem(itemId, newQuantity),
      successHandler: (response: any) => {
        if (response.success) {
          // Update the specific item in the local array instead of reloading everything
          const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
          if (itemIndex !== -1) {
            this.cartItems[itemIndex].quantity = newQuantity;
            this.calculateTotals();
          }
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message || 'Failed to update quantity';
        }
      },
      errorSetter: (error: string | null) => {
        console.error('Error updating quantity:', error);
        this.errorMessage = error || 'Error updating quantity. Please try again.';
      },
      loadingSetter: (loading: boolean) => this.updatingQuantity = loading
    });
  }

  removeItem(itemId: string): void {
    this.removingItem = true;
    this.errorMessage = '';

    this.observableUtils.createSafeObservable({
      source: this.cartService.removeCartItem(itemId),
      successHandler: (response: any) => {
        if (response.success) {
          // Remove the item from local array instead of reloading everything
          this.cartItems = this.cartItems.filter(item => item.id !== itemId);
          this.cartItemCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
          this.calculateTotals();
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message || 'Failed to remove item';
        }
      },
      errorSetter: (error: string | null) => {
        console.error('Error removing item:', error);
        this.errorMessage = error || 'Error removing item. Please try again.';
      },
      loadingSetter: (loading: boolean) => this.removingItem = loading
    });
  }

  moveToWishlist(item: CartItem): void {
    if (!item || !item.product || !item.product.id) {
      this.errorMessage = 'Invalid item data';
      return;
    }

    // Move to wishlist (local implementation - API integration pending)
    // For now, just remove from cart and show notification
    this.removeItem(item.id);
    // Show success message instead of error
    console.log(`${item.product.name} moved to wishlist`);
  }

  addToCart(productId: string, quantity = 1): void {
    const cartData = {
      product_id: productId,
      quantity: quantity
    };

    this.observableUtils.createSafeObservable({
      source: this.apiService.addToCart(cartData),
      successHandler: (response: any) => {
        this.loadCart(); // Refresh cart data
      },
      errorSetter: (error: string | null) => {
        this.errorMessage = 'Error adding item to cart. Please try again.';
        console.error('Error adding item to cart:', error);
      }
    });
  }

  proceedToCheckout(): void {
    const navigate = () => {
      const checkoutData = {
        shipping_address: this.selectedAddress ? {
          latitude: this.selectedAddress.latitude,
          longitude: this.selectedAddress.longitude,
          street: this.selectedAddress.street,
          house_number: this.selectedAddress.house_number,
          city: this.selectedAddress.city,
          state: this.selectedAddress.state,
          country: this.selectedAddress.country,
          postal_code: this.selectedAddress.postal_code
        } : undefined,
        payment_method: this.selectedPaymentMethod,
        notes: this.orderNotes
      };
      this.router.navigate(['/app/checkout'], { state: { checkoutData } });
    };

    this.roleIntent.ensureRoleAndExecute('buyer', () => {
      if (!this.selectedAddress) { 
        this.errorMessage = 'Please select a shipping address'; 
        return; 
      }
      if (!this.selectedPaymentMethod) { 
        this.errorMessage = 'Please select a payment method'; 
        return; 
      }
      navigate();
    });
  }

  removeCartItem(itemId: string): void {
    this.observableUtils.createSafeObservable({
      source: this.apiService.removeCartItem(itemId),
      successHandler: (response: any) => {
        this.loadCart(); // Refresh cart data
      },
      errorSetter: (error: string | null) => {
        this.errorMessage = 'Error removing item from cart. Please try again.';
        console.error('Error removing item from cart:', error);
      }
    });
  }

  toggleWishlist(productId: string): void {
    this.observableUtils.createSafeObservable({
      source: this.apiService.toggleWishlist(productId),
      successHandler: (response: any) => {
        // Wishlist updated successfully
      },
      errorSetter: (error: string | null) => {
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
    this.roleIntent.ensureRoleAndExecute('buyer', () => {
      this.canCheckout = this.access.isBuyer;
      this.loadCart();
    });
  }

  // Helper method for getting product image URLs
  getProductImageUrl(imageData: any): string {
    if (!imageData) {
      return '/assets/images/product-placeholder.png';
    }
    return this.media.getPrimaryUrl(imageData);
  }
}