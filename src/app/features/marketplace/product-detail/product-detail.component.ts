import { Component, OnInit, inject } from '@angular/core';
import { TypeSafetyService } from '../../../core/services/type-safety.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHeart, 
  faShoppingCart, 
  faStar, 
  faShare, 
  faEye,
  faMapMarkerAlt,
  faClock,
  faUser,
  faStore,
  faCheck,
  faTruck,
  faShieldAlt,
  faArrowLeft,
  faPlus,
  faMinus,
  faImages,
  faThumbsUp,
  faThumbsDown,
  faTimesCircle,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import { MarketplaceService } from '../../../core/services/marketplace.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SocialService } from '../../../core/services/social.service';
import { ApiService } from '../../../core/services/api.service';
import { finalize } from 'rxjs/operators';
import { AccessControlService } from '../../../core/services/access-control.service';
import { TitleMetaService } from '../../../core/services/title-meta.service';
import { MediaOptimizationService } from '../../../core/services/media-optimization.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="container mx-auto px-4 lg:px-8 space-y-8 animate-fade-in-up" *ngIf="product">
      <!-- Breadcrumb -->
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <a routerLink="/app/marketplace" class="text-markt-muted hover:text-markt-primary">
              Marketplace
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <fa-icon [icon]="faArrowLeft" class="w-4 h-4 text-markt-muted"></fa-icon>
              <span class="ml-4 text-markt-muted">{{ product.category?.name }}</span>
            </div>
          </li>
          <li>
            <span class="text-markt-dark">{{ product.name }}</span>
          </li>
        </ol>
      </nav>

      <!-- Product Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Product Images -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="relative">
            <img 
              [src]="(selectedImage?.media?.desktop_url || selectedImage?.media?.mobile_url || selectedImage?.media?.original_url || product.images?.[0]?.media?.desktop_url || product.images?.[0]?.media?.mobile_url || product.images?.[0]?.media?.original_url) || '/markt-text-logo.png'" 
              [alt]="product.name"
              class="w-full h-96 object-cover rounded-2xl shadow-xl border border-markt-border/30"
            >
            <div class="absolute top-4 right-4 flex space-x-2">
              <button 
                (click)="toggleWishlist()"
                class="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                [class.text-red-500]="isInWishlist"
                [class.text-gray-400]="!isInWishlist"
              >
                <fa-icon [icon]="faHeart" class="w-5 h-5"></fa-icon>
              </button>
              <button 
                (click)="shareProduct()"
                class="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors text-gray-400"
              >
                <fa-icon [icon]="faShare" class="w-5 h-5"></fa-icon>
              </button>
            </div>
          </div>

          <!-- Thumbnail Images -->
          <div *ngIf="product.images?.length > 1" class="flex space-x-2 overflow-x-auto">
            <button 
              *ngFor="let image of product.images"
              (click)="selectImage(image)"
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
              [class.border-markt-primary]="selectedImage?.id === image.id"
              [class.border-gray-200]="selectedImage?.id !== image.id"
            >
              <img 
                [src]="media.getPrimaryUrl(image)"
                [attr.srcset]="media.getSrcSet(image)"
                [attr.sizes]="media.listThumbSizes()"
                [alt]="product.name"
                class="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Product Header -->
          <div>
            <h1 class="text-4xl font-black text-markt-dark mb-2">{{ product.name }}</h1>
            <div class="flex items-center space-x-4 mb-2">
              <div class="flex items-center">
                <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                <span class="ml-1 text-lg font-semibold text-markt-dark">{{ product.rating }}</span>
                <span class="ml-1 text-markt-muted">({{ product.review_count }} reviews)</span>
              </div>
              <span class="text-markt-muted">•</span>
              <span class="text-markt-muted">{{ product.sold_count }} sold</span>
            </div>
            <!-- Trust chips -->
            <div class="flex flex-wrap gap-2 mb-4 text-xs">
              <span *ngIf="product.seller?.is_verified" class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">Verified seller</span>
              <span *ngIf="product.seller?.policies?.returns" class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">Returns: {{ product.seller?.policies?.returns }}</span>
              <span *ngIf="product.seller?.policies?.shipping" class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">Shipping: {{ product.seller?.policies?.shipping }}</span>
            </div>
            <div class="text-3xl font-black text-markt-dark mb-4">
              {{ product.price | currency:(product.currency || 'NGN') }}
              <span *ngIf="product.compare_at_price && product.compare_at_price > product.price" class="text-lg text-gray-500 line-through ml-2">
                {{ product.compare_at_price | currency:(product.currency || 'NGN') }}
              </span>
            </div>
          </div>

          <!-- Product Description -->
          <div>
            <h3 class="text-lg font-bold text-markt-dark mb-2">Description</h3>
            <p class="text-markt-muted leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Product Details -->
          <div *ngIf="product.details" class="space-y-3">
            <h3 class="text-lg font-bold text-markt-dark">Details</h3>
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let detail of product.details" class="flex justify-between">
                <span class="text-markt-muted">{{ detail.key }}:</span>
                <span class="text-markt-dark">{{ detail.value }}</span>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div>
            <label class="block text-sm font-medium text-markt-dark mb-2">Quantity</label>
            <div class="flex items-center space-x-3">
              <button 
                (click)="decreaseQuantity()"
                [disabled]="quantity <= 1"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <fa-icon [icon]="faMinus" class="w-4 h-4"></fa-icon>
              </button>
              <input 
                type="number" 
                [(ngModel)]="quantity"
                min="1"
                max="99"
                class="w-20 text-center border border-gray-300 rounded-md py-2"
              >
              <button 
                (click)="increaseQuantity()"
                [disabled]="quantity >= 99"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
              </button>
            </div>
          </div>

          <!-- Action Buttons (hidden for sellers) -->
          <div class="flex space-x-4" *ngIf="accessControl.isBuyer">
            <button 
              (click)="addToCart()"
              class="flex-1 bg-gradient-to-r from-markt-primary to-markt-secondary text-white py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all font-bold"
            >
              <fa-icon [icon]="faShoppingCart" class="w-5 h-5 mr-2"></fa-icon>
              Add to Cart
            </button>
            <button 
              (click)="buyNow()"
              class="flex-1 bg-white text-markt-primary py-3 px-6 rounded-xl border-2 border-markt-border hover:border-markt-primary shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all font-bold"
            >
              Buy Now
            </button>
          </div>

          <!-- Seller Info -->
          <div class="bg-white rounded-2xl p-6 border border-markt-border/30 shadow-sm">
            <h3 class="text-lg font-bold text-markt-dark mb-4">Seller Information</h3>
            <div class="flex items-center space-x-4">
              <img 
                [src]="product.seller?.profile_picture_url || '/markt-text-logo.png'" 
                [alt]="product.seller?.shop_name"
                class="w-12 h-12 rounded-full object-cover"
              >
              <div class="flex-1">
                <h4 class="font-semibold text-markt-dark">{{ product.seller?.shop_name }}</h4>
                <div class="flex items-center space-x-4 text-sm text-markt-muted">
                  <span class="flex items-center">
                    <fa-icon [icon]="faMapMarkerAlt" class="w-4 h-4 mr-1"></fa-icon>
                    {{ product.seller?.location }}
                  </span>
                  <span class="flex items-center">
                    <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400 mr-1"></fa-icon>
                    {{ product.seller?.rating }}
                  </span>
                </div>
              </div>
              <button 
                [routerLink]="['/app/marketplace']"
                [queryParams]="{ seller: product.seller?.id }"
                class="text-markt-primary hover:text-markt-secondary font-medium"
              >
                View Shop
              </button>
              <a *ngIf="product.seller?.id" [routerLink]="['/app/chat']" [queryParams]="{ user: product.seller.id, product: product.id }" class="text-markt-primary underline">Message seller</a>
            </div>
          </div>

          <!-- Shipping & Returns -->
          <div class="bg-white rounded-2xl p-6 border border-markt-border/30 shadow-sm">
            <h3 class="text-lg font-bold text-markt-dark mb-4">Shipping & Returns</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faShieldAlt" class="w-5 h-5 text-green-600"></fa-icon>
                <div>
                  <p class="font-medium text-markt-dark">Buyer Protection</p>
                  <p class="text-sm text-markt-muted">Refunds for items not received or not as described</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faTruck" class="w-5 h-5 text-green-600"></fa-icon>
                <div>
                  <p class="font-medium text-markt-dark">Free Shipping</p>
                  <p class="text-sm text-markt-muted">On orders over ₦5,000</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faCheck" class="w-5 h-5 text-green-600"></fa-icon>
                <div>
                  <p class="font-medium text-markt-dark">Easy Returns</p>
                  <p class="text-sm text-markt-muted">30-day return policy</p>
                </div>
              </div>
            </div>
            <div class="mt-4 text-sm text-markt-muted">
              <div *ngIf="product.seller?.policies?.shipping">Shipping policy: {{ product.seller?.policies?.shipping }}</div>
              <div *ngIf="product.seller?.policies?.returns">Return policy: {{ product.seller?.policies?.returns }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- As seen in posts -->
      <div *ngIf="product.posts?.length" class="border-t border-gray-200 pt-8">
        <h3 class="text-2xl font-bold text-markt-dark mb-4">As seen in posts</h3>
        <div class="flex gap-3 overflow-x-auto">
          <a *ngFor="let p of product.posts" [routerLink]="['/app/community/feed']" class="flex-shrink-0 w-40 h-28 bg-gradient-to-br from-markt-light/50 to-white rounded-lg relative overflow-hidden">
            <img *ngIf="p.media?.[0]?.thumbnail_url" [src]="p.media[0].thumbnail_url" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/10"></div>
          </a>
        </div>
      </div>
 
      <!-- Product Tabs -->
      <div class="border-t border-gray-200 pt-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button 
              (click)="activeTab = 'description'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              [class.border-markt-primary]="activeTab === 'description'"
              [class.text-markt-primary]="activeTab === 'description'"
              [class.border-transparent]="activeTab !== 'description'"
              [class.text-gray-500]="activeTab !== 'description'"
            >
              Description
            </button>
            <button 
              (click)="activeTab = 'reviews'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              [class.border-markt-primary]="activeTab === 'reviews'"
              [class.text-markt-primary]="activeTab === 'reviews'"
              [class.border-transparent]="activeTab !== 'reviews'"
              [class.text-gray-500]="activeTab !== 'reviews'"
            >
              Reviews ({{ product.review_count }})
            </button>
            <button 
              (click)="activeTab = 'specifications'"
              class="py-2 px-1 border-b-2 font-medium text-sm"
              [class.border-markt-primary]="activeTab === 'specifications'"
              [class.text-markt-primary]="activeTab === 'specifications'"
              [class.border-transparent]="activeTab !== 'specifications'"
              [class.text-gray-500]="activeTab !== 'specifications'"
            >
              Specifications
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="py-6">
          <!-- Description Tab -->
          <div *ngIf="activeTab === 'description'" class="prose max-w-none">
            <div [innerHTML]="product.full_description"></div>
          </div>

          <!-- Reviews Tab -->
          <div *ngIf="activeTab === 'reviews'" class="space-y-6">
            <!-- Review Summary -->
            <div class="bg-gradient-to-br from-markt-light/50 to-white rounded-2xl p-6 border border-markt-border/30">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold text-markt-dark">Customer Reviews</h3>
                  <div class="flex items-center mt-2">
                    <div class="flex items-center">
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <span class="ml-1 text-lg font-semibold text-markt-dark">{{ product.rating }}</span>
                    </div>
                    <span class="ml-2 text-markt-muted">out of 5</span>
                  </div>
                  <p class="text-sm text-markt-muted mt-1">{{ product.review_count }} reviews</p>
                </div>
                <button 
                  (click)="showReviewForm = true"
                  class="bg-gradient-to-r from-markt-primary to-markt-secondary text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Write a Review
                </button>
              </div>
            </div>

            <!-- Review Form -->
            <div *ngIf="showReviewForm" class="bg-white border border-markt-border/30 rounded-2xl p-6 shadow-sm">
              <h4 class="text-lg font-bold text-markt-dark mb-4">Write a Review</h4>
              <form (ngSubmit)="submitReview()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-markt-dark mb-2">Rating</label>
                  <div class="flex items-center space-x-2">
                    <button 
                      *ngFor="let star of [1,2,3,4,5]"
                      type="button"
                      (click)="reviewRating = star"
                      class="text-2xl"
                      [class.text-yellow-400]="star <= reviewRating"
                      [class.text-gray-300]="star > reviewRating"
                    >
                      ★
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-markt-dark mb-2">Title</label>
                  <input 
                    type="text" 
                    [(ngModel)]="reviewTitle"
                    name="title"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Summary of your experience"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-markt-dark mb-2">Review</label>
                  <textarea 
                    [(ngModel)]="reviewContent"
                    name="content"
                    rows="4"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Share your experience with this product"
                  ></textarea>
                </div>
                <div class="flex space-x-3">
                  <button 
                    type="submit"
                    class="bg-gradient-to-r from-markt-primary to-markt-secondary text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Submit Review
                  </button>
                  <button 
                    type="button"
                    (click)="showReviewForm = false"
                    class="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Reviews List -->
            <div class="space-y-6">
              <div *ngFor="let review of reviews" class="bg-gradient-to-br from-markt-light/50 to-white border border-markt-border/30 rounded-2xl p-6">
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-3">
                    <img 
                      [src]="review.user?.profile_picture_url || '/markt-text-logo.png'" 
                      [alt]="review.user?.username"
                      class="w-10 h-10 rounded-full object-cover"
                    >
                    <div>
                      <p class="font-medium text-markt-dark">{{ review.user?.username }}</p>
                      <div class="flex items-center">
                        <div class="flex items-center">
                          <fa-icon 
                            *ngFor="let star of [1,2,3,4,5]"
                            [icon]="faStar" 
                            class="w-4 h-4"
                            [class.text-yellow-400]="star <= review.rating"
                            [class.text-gray-300]="star > review.rating"
                          ></fa-icon>
                        </div>
                        <span class="ml-2 text-sm text-markt-muted">{{ review.created_at | date }}</span>
                      </div>
                    </div>
                  </div>
                  <button class="text-gray-400 hover:text-gray-600">
                    <fa-icon [icon]="faFlag" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
                <div class="mt-4">
                  <h4 class="font-medium text-markt-dark mb-2">{{ review.title }}</h4>
                  <p class="text-markt-muted">{{ review.content }}</p>
                </div>
                <div class="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <button class="flex items-center space-x-1 hover:text-gray-700">
                    <fa-icon [icon]="faThumbsUp" class="w-4 h-4"></fa-icon>
                    <span>Helpful ({{ review.helpful_count }})</span>
                  </button>
                  <button class="flex items-center space-x-1 hover:text-gray-700">
                    <fa-icon [icon]="faMessageCircle" class="w-4 h-4"></fa-icon>
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Specifications Tab -->
                     <div *ngIf="activeTab === 'specifications'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.sku">
                <span class="font-medium text-markt-dark">SKU</span>
                <span class="text-markt-muted">{{ product.sku }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.barcode">
                <span class="font-medium text-markt-dark">Barcode</span>
                <span class="text-markt-muted">{{ product.barcode }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.weight">
                <span class="font-medium text-markt-dark">Weight</span>
                <span class="text-markt-muted">{{ product.weight }} kg</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.brand">
                <span class="font-medium text-markt-dark">Brand</span>
                <span class="text-markt-muted">{{ product.product_metadata.brand }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.model">
                <span class="font-medium text-markt-dark">Model</span>
                <span class="text-markt-muted">{{ product.product_metadata.model }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.color">
                <span class="font-medium text-markt-dark">Color</span>
                <span class="text-markt-muted">{{ product.product_metadata.color }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.warranty">
                <span class="font-medium text-markt-dark">Warranty</span>
                <span class="text-markt-muted">{{ product.product_metadata.warranty }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="border-t border-gray-200 pt-8">
        <h3 class="text-2xl font-bold text-markt-dark mb-6">Related Products</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let relatedProduct of relatedProducts" class="bg-white rounded-2xl border border-markt-border/30 shadow-sm overflow-hidden hover:shadow-xl transition-shadow">
            <img 
              [src]="media.getPrimaryUrl(relatedProduct?.images?.[0])" 
              [attr.srcset]="media.getSrcSet(relatedProduct?.images?.[0])"
              [attr.sizes]="media.gridSizes()"
              [alt]="relatedProduct.name"
              class="w-full h-48 object-cover"
              loading="lazy"
              decoding="async"
            >
            <div class="p-4">
              <h4 class="font-medium text-markt-dark mb-2">{{ relatedProduct.name }}</h4>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-markt-dark">{{ relatedProduct.price | currency:'NGN' }}</span>
                <div class="flex items-center">
                  <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400"></fa-icon>
                  <span class="ml-1 text-sm text-gray-600">{{ relatedProduct.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!product && isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"></div>
    </div>

    <!-- Not Found -->
    <div *ngIf="!product && !isLoading" class="text-center py-16 text-gray-600">
      <p>Product not found.</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-image: linear-gradient(135deg, rgba(244, 241, 240, 0.6) 0%, rgba(255,255,255, 0.9) 50%, rgba(224, 117, 117, 0.08) 100%);
      background-attachment: fixed;
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private marketplaceService = inject(MarketplaceService);
  private cartService = inject(CartService);
  public authService = inject(AuthService);
  private socialService = inject(SocialService);
  private apiService = inject(ApiService);
  public accessControl = inject(AccessControlService);
  private titleMeta = inject(TitleMetaService);
  public media = inject(MediaOptimizationService);
  private typeSafety = inject(TypeSafetyService);
  

  // Icons
  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faStar = faStar;
  faShare = faShare;
  faEye = faEye;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faUser = faUser;
  faStore = faStore;
  faCheck = faCheck;
  faTruck = faTruck;
  faShieldAlt = faShieldAlt;
  faArrowLeft = faArrowLeft;
  faPlus = faPlus;
  faMinus = faMinus;
  faImages = faImages;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faMessageCircle = faTimesCircle;
  faFlag = faFlag;

  // Data
  product: any = null;
  relatedProducts: any[] = [];
  reviews: any[] = [];
  selectedImage: any = null;
  isLoading = false;
  recommendedProducts: any[] = [];
  trendingProducts: any[] = [];
  
  // State
  quantity = 1;
  isInWishlist = false;
  activeTab: 'description' | 'reviews' | 'specifications' = 'description';
  showReviewForm = false;
  
  // Review form
  reviewRating = 0;
  reviewTitle = '';
  reviewContent = '';

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (productId) {
      this.isLoading = true;
      
      this.apiService.getProduct(productId)
        .pipe(finalize(() => { this.isLoading = false; }))
        .subscribe({
          next: (response) => {
            const data = this.typeSafety.getProperty(response, 'data.item') || this.typeSafety.getProperty(response, 'data.product') || this.typeSafety.getProperty(response, 'data') || this.typeSafety.getProperty(response, 'item') || this.typeSafety.getProperty(response, 'product') || response || null;
            if (!data || !(this.typeSafety.getProperty(data, 'id') || this.typeSafety.getProperty(data, 'product_id') || this.typeSafety.getProperty(data, 'slug'))) {
              this.product = null;
              return;
            }
            this.product = data;
            this.selectedImage = this.product?.images?.[0] || null;
            this.titleMeta.setTitle([this.product.name, 'Markt']);
            this.titleMeta.setMeta(this.product.description);
            this.loadRelatedProducts();
            this.loadReviews();
            this.checkWishlistStatus();
            this.trackProductView();
          },
          error: () => { this.product = null; }
        });

      // Load product reviews
      this.apiService.getProductReviews(productId).subscribe({
        next: (response) => {
          this.reviews = response.data?.items || [];
        },
        error: (error) => {
          console.error('Error loading product reviews:', error);
          this.reviews = [];
        }
      });
 
      // Similar products endpoint not available; relying on loadRelatedProducts() (category-based)
    }
  }

  private loadRelatedProducts(): void {
    if (!this.product) return;

    const params = {
      category_ids: this.product.category_id ? [this.product.category_id] : [],
      exclude_id: this.product.id || undefined,
      limit: 4
    };

    this.marketplaceService.getProducts(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.relatedProducts = response.data.items;
        }
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  private loadReviews(): void {
    if (!this.product) return;

    this.marketplaceService.getProductReviews(this.product.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.reviews = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  private checkWishlistStatus(): void {
    // This would typically check against wishlist state
    this.isInWishlist = false;
  }

  // Additional product endpoint integrations
  createProductReview(reviewData: any): void {
    this.apiService.addProductReview(this.product.id, reviewData).subscribe({
      next: (response: any) => {
        console.log('Product review created:', response.data);
        this.loadReviews(); // Refresh reviews
      },
      error: (error: any) => {
        console.error('Error creating product review:', error);
      }
    });
  }

  upvoteReview(reviewId: string): void {
    this.apiService.upvoteReview(reviewId).subscribe({
      next: (response) => {
        console.log('Review upvoted:', response.data);
        this.loadReviews(); // Refresh reviews
      },
      error: (error) => {
        console.error('Error upvoting review:', error);
      }
    });
  }

  trackProductView(): void {
    this.apiService.trackProductView(this.product.id).subscribe({
      next: (response) => {
        console.log('Product view tracked:', response.data);
      },
      error: (error) => {
        console.error('Error tracking product view:', error);
      }
    });
  }

  loadRecommendedProducts(): void {
    this.apiService.getRecommendedProducts().subscribe({
      next: (response) => {
        this.recommendedProducts = response.data || [];
      },
      error: (error) => {
        console.error('Error loading recommended products:', error);
        this.recommendedProducts = [];
      }
    });
  }

  loadTrendingProducts(): void {
    this.apiService.getTrendingProducts().subscribe({
      next: (response) => {
        this.trendingProducts = response.data || [];
      },
      error: (error) => {
        console.error('Error loading trending products:', error);
        this.trendingProducts = [];
      }
    });
  }

  // Image helpers centralized in MediaOptimizationService
  selectImage(image: any): void {
    this.selectedImage = image;
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;

    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/app/cart'], { queryParams: { source: 'product', productId: this.product.id } });
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  buyNow(): void {
    if (!this.product) return;

    this.cartService.addToCart(this.product.id, this.quantity).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/app/checkout'], { queryParams: { source: 'buynow', productId: this.product.id } });
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  toggleWishlist(): void {
  if (!this.product) return;

    this.apiService.toggleWishlist(this.product.id).subscribe({
      next: (response) => {
        // Optimistically toggle on success
        this.isInWishlist = !this.isInWishlist;
      },
      error: (error) => {
        console.error('Error toggling wishlist:', error);
      }
    });
  }

  shareProduct(): void {
    if (!this.product) return;

    this.apiService.shareProduct(this.product.id).subscribe({
      next: (response) => {
        const shareUrl = this.typeSafety.toString(this.typeSafety.getProperty(response, 'share_url') || this.typeSafety.getNestedProperty(response, 'data.share_url'), window.location.href);
        navigator.clipboard.writeText(shareUrl);
      },
      error: (error) => {
        console.error('Error sharing product:', error);
      }
    });
  }

  submitReview(): void {
    if (!this.product || !this.reviewRating || !this.reviewTitle || !this.reviewContent) {
      return;
    }

    const reviewData = {
      rating: this.reviewRating,
      title: this.reviewTitle,
      content: this.reviewContent
    };

    this.marketplaceService.createProductReview(this.product.id, reviewData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showReviewForm = false;
          this.reviewRating = 0;
          this.reviewTitle = '';
          this.reviewContent = '';
          this.loadReviews();
        }
      },
      error: (error) => {
        console.error('Error submitting review:', error);
      }
    });
  }
} 