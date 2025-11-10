import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';
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
  faClock,
  faChevronRight,
  faStar,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { CartService, Cart, CartItem } from '../../domains/orders';
import { MarketplaceService } from '../../domains/marketplace';
import { AuthService } from '../../domains/authentication';
import { ApiService } from '../../core/services/api.service'; // Still needed for toggleWishlist (wishlist operations not yet migrated to domain service)
import { Address } from '../../core/shared/value-objects/address.value-object';
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
    <div class="bg-gray-50">
      <!-- Buyer mode gate -->
      @if (!canCheckout) {
      <div
        class="rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center justify-between"
      >
        <div>
          Cart and checkout are available in Buyer mode. Switch to continue.
        </div>
        <button
          (click)="switchToBuyer()"
          class="ml-4 bg-primary text-white px-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
        >
          Switch to Buyer
        </button>
      </div>
      }

      <!-- Main Content -->
      <main class="mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
        <!-- Cart Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p class="text-gray-600">{{ cartItemCount }} items in your cart</p>
        </div>

        <!-- Error Message -->
        @if (errorMessage) {
        <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex items-center">
            <fa-icon
              [icon]="faExclamationTriangle"
              class="w-5 h-5 text-red-400 mr-2"
            ></fa-icon>
            <span class="text-sm text-red-800">{{ errorMessage }}</span>
            <button
              (click)="errorMessage = ''"
              class="ml-auto text-red-400 hover:text-red-600"
            >
              <fa-icon [icon]="faTimes" class="w-4 h-4"></fa-icon>
            </button>
          </div>
        </div>
        }

        <!-- Loading State -->
        @if (loadingCart) {
        <div class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
          ></div>
          <p class="mt-2 text-gray-600">Loading cart...</p>
        </div>
        }

        <!-- Empty Cart -->
        @if (!loadingCart && cartItemCount === 0 && !errorMessage) {
        <div class="text-center py-12">
          <fa-icon
            [icon]="faShoppingBag"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          ></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p class="text-gray-500 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <button
            [routerLink]="[ROUTES_ABSOLUTE.APP.MARKETPLACE]"
            class="bg-primary text-white px-6 py-3 rounded-md hover:bg-secondary transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
        }

        <!-- Cart Content -->
        @if (cartItemCount > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-6">
            @for (item of cartItems; track item.id) {
            <div class="bg-white rounded-lg border border-border p-6">
              <div class="flex items-start space-x-4">
                <img
                  [src]="
                    getProductImageUrl(
                      item.productDto?.images?.[0]
                    )
                  "
                  [alt]="item.productDto?.name || item.product.name"
                  class="w-24 h-24 rounded-lg object-cover"
                  loading="lazy"
                />
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 mb-1">
                        <a
                          [routerLink]="[
                            ROUTES_ABSOLUTE.APP.MARKETPLACE,
                            'product',
                            item.product.id
                          ]"
                          class="hover:text-primary transition-colors"
                        >
                          {{ item.productDto?.name || item.product.name }}
                        </a>
                      </h3>
                      <p class="text-sm text-gray-600 mb-2">
                        {{ item.productDto?.description || '' }}
                      </p>
                      <div class="flex items-center space-x-2 mb-3">
                        <img
                          [src]="
                            item.productDto?.seller?.profile_picture_url || ''
                          "
                          [alt]="item.productDto?.seller?.shop_name || ''"
                          class="w-6 h-6 rounded-full"
                        />
                        <span class="text-sm text-gray-700">{{
                          item.productDto?.seller?.shop_name || ''
                        }}</span>
                        <div class="flex items-center">
                          <fa-icon
                            [icon]="faStar"
                            class="text-yellow-400 text-xs"
                          ></fa-icon>
                          <span class="text-sm text-gray-600 ml-1">{{
                            item.productDto?.average_rating?.toFixed(1) || '4.8'
                          }}</span>
                        </div>
                        <span
                          class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                          >Verified</span
                        >
                      </div>
                      <div
                        class="flex items-center space-x-4 text-sm text-gray-600"
                      >
                        <span>Condition: Like New</span>
                        <span>Free Shipping</span>
                      </div>
                    </div>
                    <button
                      (click)="removeItem(item.id)"
                      [disabled]="removingItem"
                      class="text-gray-400 hover:text-red-500"
                    >
                      <fa-icon [icon]="faTrash" class="w-4 h-4"></fa-icon>
                    </button>
                  </div>
                  <div class="flex items-center justify-between mt-4">
                    <div class="flex items-center space-x-3">
                      <button
                        (click)="
                          updateQuantity(item.id, item.getQuantity() - 1)
                        "
                        [disabled]="item.getQuantity() <= 1 || updatingQuantity"
                        class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                      >
                        <fa-icon [icon]="faMinus" class="text-xs"></fa-icon>
                      </button>
                      <span class="text-lg font-medium">{{
                        item.getQuantity()
                      }}</span>
                      <button
                        (click)="
                          updateQuantity(item.id, item.getQuantity() + 1)
                        "
                        [disabled]="
                          item.getQuantity() >= 99 || updatingQuantity
                        "
                        class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                      >
                        <fa-icon [icon]="faPlus" class="text-xs"></fa-icon>
                      </button>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-gray-900">
                        {{ item.product.getPrice() / 100 | currency : 'USD' }}
                      </div>
                      @if (item.productDto && item.productDto.compare_at_price
                      && item.productDto.compare_at_price >
                      item.product.getPrice()) {
                      <div class="text-sm text-gray-500 line-through">
                        {{
                          item.productDto.compare_at_price / 100
                            | currency : 'USD'
                        }}
                      </div>
                      }
                    </div>
                  </div>
                  <div class="flex items-center space-x-4 mt-3">
                    <button
                      (click)="moveToWishlist(item)"
                      class="text-sm text-primary hover:underline"
                    >
                      Save for later
                    </button>
                    <button
                      [routerLink]="[
                        ROUTES_ABSOLUTE.APP.MARKETPLACE,
                        'product',
                        item.product.id
                      ]"
                      class="text-sm text-gray-600 hover:text-gray-900"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            </div>
            }

            <!-- Cart Actions -->
            <div class="bg-white rounded-lg border border-border p-6">
              <div class="flex items-center justify-between">
                <button
                  [routerLink]="[ROUTES_ABSOLUTE.APP.MARKETPLACE]"
                  class="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
                >
                  <fa-icon [icon]="faArrowLeft"></fa-icon>
                  <span>Continue Shopping</span>
                </button>
                <button
                  (click)="clearCart()"
                  class="text-red-600 hover:text-red-700 flex items-center space-x-2"
                >
                  <fa-icon [icon]="faTrash"></fa-icon>
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div
              class="bg-white rounded-lg border border-border p-6 sticky top-24"
            >
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <!-- Promo Code -->
              <div class="mb-6">
                <div class="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    class="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    [(ngModel)]="promoCode"
                  />
                  <button
                    (click)="applyPromoCode()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal ({{ cartItemCount }} items)</span>
                  <span>{{ cartSubtotal / 100 | currency : 'USD' }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{{ cartShipping / 100 | currency : 'USD' }}</span>
                </div>
                @if (cartDiscount > 0) {
                <div class="flex justify-between text-green-600">
                  <span>Student Discount</span>
                  <span>-{{ cartDiscount / 100 | currency : 'USD' }}</span>
                </div>
                }
                <div class="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{{ cartTax / 100 | currency : 'USD' }}</span>
                </div>
                <hr class="border-border" />
                <div
                  class="flex justify-between text-lg font-semibold text-gray-900"
                >
                  <span>Total</span>
                  <span>{{ cartTotal / 100 | currency : 'USD' }}</span>
                </div>
              </div>

              <!-- Savings -->
              @if (getTotalSavings() > 0) {
              <div
                class="bg-green-50 border border-green-200 rounded-lg p-3 mb-6"
              >
                <div class="flex items-center space-x-2">
                  <fa-icon [icon]="faTag" class="text-green-600"></fa-icon>
                  <span class="text-sm text-green-800"
                    >You're saving
                    {{ getTotalSavings() / 100 | currency : 'USD' }} on this
                    order!</span
                  >
                </div>
              </div>
              }

              <!-- Delivery Info -->
              <div class="mb-6">
                <div
                  class="flex items-center space-x-2 text-sm text-gray-600 mb-2"
                >
                  <fa-icon [icon]="faTruck"></fa-icon>
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                  <fa-icon [icon]="faShieldAlt"></fa-icon>
                  <span>Buyer protection included</span>
                </div>
              </div>

              <!-- Checkout Button -->
              <button
                (click)="proceedToCheckout()"
                [disabled]="!canCheckout"
                class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <!-- Payment Methods -->
              <div class="text-center">
                <p class="text-xs text-gray-500 mb-2">Secure payment with</p>
                <div class="flex items-center justify-center space-x-2">
                  <i class="fa-brands fa-cc-visa text-2xl text-blue-600"></i>
                  <i
                    class="fa-brands fa-cc-mastercard text-2xl text-red-500"
                  ></i>
                  <i class="fa-brands fa-cc-paypal text-2xl text-blue-500"></i>
                  <i class="fa-brands fa-apple-pay text-2xl text-gray-800"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class CartComponent implements OnInit {
  // Expose routes for template access
  protected readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;

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
  faChevronRight = faChevronRight;
  faStar = faStar;
  faTag = faTag;

  // Data - Using domain models
  cart: Cart | null = null;
  cartItems: CartItem[] = [];
  cartItemCount = 0;
  cartSubtotal = 0;
  cartShipping = 0;
  cartDiscount = 0;
  cartTax = 0;
  cartTotal = 0;
  recentlyViewed: any[] = []; // TODO: Migrate to domain models when available
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
  promoCode = '';

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

    // Using domain CartService.getCart() - returns Observable<Cart> directly
    this.cartService.getCart().subscribe({
      next: (cart: Cart) => {
        // Domain service returns Cart domain model
        this.cart = cart;
        if (cart) {
          // Use domain model methods
          this.cartItems = [...cart.getItems()]; // Get immutable copy
          this.cartItemCount = cart.getTotalItems();
          // Use domain model method for subtotal calculation
          this.cartSubtotal = cart.calculateSubtotal();
          this.calculateTotals();
        } else {
          this.cartItems = [];
          this.cartItemCount = 0;
          this.cartSubtotal = 0;
        }
        this.loadingCart = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        // Fallback to mock data for demo (remove in production)
        this.loadMockCartData();
        this.loadingCart = false;
      },
    });
  }

  private loadMockCartData(): void {
    // Mock cart data from Figma design - using any type to avoid interface issues
    this.cartItems = [
      {
        id: 'cart-item-1',
        product_id: 'sony-wh-1000xm4',
        quantity: 1,
        product_price: 24999, // $249.99 in cents
        product: {
          id: 'sony-wh-1000xm4',
          name: 'Sony WH-1000XM4 Wireless Headphones',
          description: 'Noise-canceling, premium audio quality',
          condition: 'Like New',
          price: 24999,
          compare_at_price: 34999, // $349.99 original price
          images: [
            {
              id: '1',
              product_id: 'sony-wh-1000xm4',
              media_id: 'media-1',
              sort_order: 1,
              is_featured: true,
              alt_text: 'Sony WH-1000XM4 Headphones',
              media: {
                id: 'media-1',
                original_url: '/assets/images/products/sony-headphones.png',
                thumbnail_url: '/assets/images/products/sony-headphones.png',
                alt_text: 'Sony WH-1000XM4 Headphones',
              } as any,
            },
          ],
          seller: {
            id: 'seller-1',
            shop_name: 'TechStore Campus',
            profile_picture_url: '/assets/images/techstore-seller.png',
          } as any,
        },
      },
      {
        id: 'cart-item-2',
        product_id: 'calculus-textbook',
        quantity: 1,
        product_price: 8950, // $89.50 in cents
        product: {
          id: 'calculus-textbook',
          name: 'Calculus: Early Transcendentals 8th Edition',
          description: 'James Stewart - Mathematics Textbook',
          condition: 'Good',
          price: 8950,
          compare_at_price: 29995, // $299.95 original price
          images: [
            {
              id: '2',
              product_id: 'calculus-textbook',
              media_id: 'media-2',
              sort_order: 1,
              is_featured: true,
              alt_text: 'Calculus Textbook',
              media: {
                id: 'media-2',
                original_url: '/assets/images/products/calculus-textbook.png',
                thumbnail_url: '/assets/images/products/calculus-textbook.png',
                alt_text: 'Calculus Textbook',
              } as any,
            },
          ],
          seller: {
            id: 'seller-2',
            shop_name: 'Sarah M.',
            profile_picture_url: '/assets/images/sarah-seller.png',
          } as any,
        },
      },
      {
        id: 'cart-item-3',
        product_id: 'vintage-jacket',
        quantity: 1,
        product_price: 3500, // $35.00 in cents
        product: {
          id: 'vintage-jacket',
          name: 'Vintage Denim Jacket',
          description: 'Size M - Classic blue denim',
          condition: 'Excellent',
          price: 3500,
          images: [
            {
              id: '3',
              product_id: 'vintage-jacket',
              media_id: 'media-3',
              sort_order: 1,
              is_featured: true,
              alt_text: 'Vintage Denim Jacket',
              media: {
                id: 'media-3',
                original_url: '/assets/images/products/vintage-jacket.png',
                thumbnail_url: '/assets/images/products/vintage-jacket.png',
                alt_text: 'Vintage Denim Jacket',
              } as any,
            },
          ],
          seller: {
            id: 'seller-3',
            shop_name: "Mike's Thrift",
            profile_picture_url: '/assets/images/mike-seller.png',
          } as any,
        },
      },
    ] as any;
    // Mock data uses old format - calculate count manually
    this.cartItemCount = this.cartItems.reduce(
      (total, item: any) => total + (item.quantity || 0),
      0
    );
    this.calculateTotals();
    this.errorMessage = '';
  }

  private loadRecentlyViewed(): void {
    // Load recently viewed products - implement when service is available
    this.recentlyViewed = [];
  }

  private calculateTotals(): void {
    // Use domain model method for subtotal if cart is available
    if (this.cart) {
      this.cartSubtotal = this.cart.calculateSubtotal();
    } else {
      // Fallback: calculate from items using domain model methods
      this.cartSubtotal = this.cartItems.reduce(
        (total, item) => total + item.calculateSubtotal(),
        0
      );
    }
    this.cartShipping = this.calculateShipping();
    this.cartTax = this.cartSubtotal * 0.075; // 7.5% tax
    this.cartTotal =
      this.cartSubtotal + this.cartShipping + this.cartTax - this.cartDiscount;
  }

  private calculateShipping(): number {
    // Calculate shipping based on seller groups
    const sellerGroups = this.cartSummaryBySeller;
    return sellerGroups.reduce((total, group) => total + group.shipping, 0);
  }

  get cartSummaryBySeller(): Array<{
    seller: any; // Using ProductDto.seller type
    items: CartItem[];
    subtotal: number;
    shipping: number;
    itemCount: number;
  }> {
    const sellerMap = new Map<
      string,
      {
        seller: any;
        items: CartItem[];
        subtotal: number;
        shipping: number;
        itemCount: number;
      }
    >();

    this.cartItems.forEach((item) => {
      // Access seller from productDto (display data) or product domain model
      const sellerId = item.productDto?.seller?.id || item.product.sellerId;
      const seller = item.productDto?.seller;

      if (sellerId && seller) {
        const existing = sellerMap.get(sellerId);

        if (existing) {
          existing.items.push(item);
          existing.subtotal += item.calculateSubtotal();
          existing.itemCount += item.getQuantity();
        } else {
          const group = {
            seller: seller,
            items: [item],
            subtotal: item.calculateSubtotal(),
            shipping: 0,
            itemCount: item.getQuantity(),
          };
          group.shipping = this.calculateShippingForSeller(group);
          sellerMap.set(sellerId, group);
        }
      }
    });

    return Array.from(sellerMap.values());
  }

  private calculateShippingForSeller(sellerGroup: {
    seller: any;
    items: CartItem[];
    subtotal: number;
    shipping: number;
  }): number {
    // Simple shipping calculation - can be enhanced based on business logic
    // Free shipping over $100 (10000 cents), $10 (1000 cents) otherwise
    return sellerGroup.subtotal > 10000 ? 0 : 1000;
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
      successHandler: (cartItem: CartItem) => {
        // Domain service returns CartItem directly
        // Reload cart to get updated state with all items
        this.loadCart();
        this.errorMessage = '';
      },
      errorSetter: (error: string | null) => {
        console.error('Error updating quantity:', error);
        this.errorMessage =
          error || 'Error updating quantity. Please try again.';
      },
      loadingSetter: (loading: boolean) => (this.updatingQuantity = loading),
    });
  }

  removeItem(itemId: string): void {
    this.removingItem = true;
    this.errorMessage = '';

    this.observableUtils.createSafeObservable({
      source: this.cartService.removeCartItem(itemId),
      successHandler: () => {
        // Domain service returns void - reload cart to get updated state
        this.loadCart();
        this.errorMessage = '';
      },
      errorSetter: (error: string | null) => {
        console.error('Error removing item:', error);
        this.errorMessage = error || 'Error removing item. Please try again.';
      },
      loadingSetter: (loading: boolean) => (this.removingItem = loading),
    });
  }

  moveToWishlist(item: CartItem): void {
    if (!item || !item.product) {
      this.errorMessage = 'Invalid item data';
      return;
    }

    // Move to wishlist (local implementation - API integration pending)
    // For now, just remove from cart and show notification
    this.removeItem(item.id);
    // TODO: Add to wishlist via domain service when available
  }

  addToCart(productId: string, quantity = 1): void {
    // Using domain CartService - returns Observable<CartItem> directly
    this.cartService.addToCart(productId, quantity).subscribe({
      next: (cartItem: CartItem) => {
        // Domain service returns CartItem directly
        this.loadCart(); // Refresh cart data to get updated state
      },
      error: (error) => {
        this.errorMessage = 'Error adding item to cart. Please try again.';
        console.error('Error adding item to cart:', error);
      },
    });
  }

  proceedToCheckout(): void {
    const navigate = () => {
      const checkoutData = {
        shipping_address: this.selectedAddress
          ? this.selectedAddress.toDto() // Use value object's toDto() method
          : undefined,
        payment_method: this.selectedPaymentMethod || undefined,
        notes: this.orderNotes,
      };
      this.router.navigate([ROUTES_ABSOLUTE.APP.CHECKOUT], {
        state: { checkoutData },
      });
    };

    this.roleIntent.ensureRoleAndExecute('buyer', () => {
      // Allow proceeding; shipping and payment can be completed on the checkout page
      this.errorMessage = '';
      navigate();
    });
  }

  removeCartItem(itemId: string): void {
    // Using domain CartService - returns Observable<void> directly
    this.cartService.removeCartItem(itemId).subscribe({
      next: () => {
        // Domain service returns void - reload cart to get updated state
        this.loadCart();
      },
      error: (error) => {
        this.errorMessage = 'Error removing item from cart. Please try again.';
        console.error('Error removing item from cart:', error);
      },
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
      },
    });
  }

  validateCart(): void {
    // TODO: validateCartForCheckout() not yet in domain service - using simple validation
    // Check if cart has items and user is buyer
    if (this.cartItemCount > 0 && this.canCheckout) {
      this.router.navigate([ROUTES_ABSOLUTE.APP.CHECKOUT]);
    } else {
      this.errorMessage =
        this.cartItemCount === 0
          ? 'Cart is empty'
          : 'Please switch to buyer mode';
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
      return '';
    }

    // If imageData has a media property with URLs, use those
    if (imageData.media && imageData.media.original_url) {
      return imageData.media.original_url;
    }

    // If imageData is a string URL, use it directly
    if (typeof imageData === 'string') {
      return imageData;
    }

    // No fallback - return empty string
    return '';
  }

  applyPromoCode(): void {
    if (this.promoCode.trim()) {
      // Apply promo code logic here
      // For demo purposes, apply a student discount
      if (this.promoCode.toLowerCase().includes('student')) {
        this.cartDiscount = this.cartSubtotal * 0.1; // 10% student discount
        this.calculateTotals();
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Invalid promo code';
      }
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.observableUtils.createSafeObservable({
        source: this.cartService.clearCart(),
        successHandler: () => {
          // Domain service returns void - reset cart state
          this.cart = null;
          this.cartItems = [];
          this.cartItemCount = 0;
          this.cartSubtotal = 0;
          this.calculateTotals();
          this.errorMessage = '';
        },
        errorSetter: (error: string | null) => {
          this.errorMessage = error || 'Error clearing cart. Please try again.';
        },
      });
    }
  }

  getTotalSavings(): number {
    return this.cartItems.reduce((total, item) => {
      // Access compare_at_price from productDto (display data)
      const compareAtPrice = item.productDto?.compare_at_price;
      const productPrice = item.product.getPrice();

      if (compareAtPrice && compareAtPrice > productPrice) {
        const savingsPerItem = compareAtPrice - productPrice;
        return total + savingsPerItem * item.getQuantity();
      }
      return total;
    }, 0);
  }
}
