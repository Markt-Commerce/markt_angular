import { Component, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6" *ngIf="product">
      <!-- Breadcrumb -->
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <a routerLink="/app/marketplace" class="text-gray-400 hover:text-gray-500">
              Marketplace
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <fa-icon [icon]="faArrowLeft" class="w-4 h-4 text-gray-400"></fa-icon>
              <span class="ml-4 text-gray-500">{{ product.category?.name }}</span>
            </div>
          </li>
          <li>
            <span class="text-gray-900">{{ product.name }}</span>
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
              class="w-full h-96 object-cover rounded-lg shadow-lg"
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
          <div *ngIf="product.images.length > 1" class="flex space-x-2 overflow-x-auto">
            <button 
              *ngFor="let image of product.images"
              (click)="selectImage(image)"
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
              [class.border-markt-primary]="selectedImage?.id === image.id"
              [class.border-gray-200]="selectedImage?.id !== image.id"
            >
                             <img 
                [src]="(image?.media?.thumbnail_url || image?.media?.desktop_url || image?.media?.mobile_url || image?.media?.original_url)"
                [alt]="product.name"
                class="w-full h-full object-cover"
              >
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Product Header -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex items-center">
                <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                <span class="ml-1 text-lg font-semibold text-gray-900">{{ product.rating }}</span>
                <span class="ml-1 text-gray-500">({{ product.review_count }} reviews)</span>
              </div>
              <span class="text-gray-500">•</span>
              <span class="text-gray-500">{{ product.sold_count }} sold</span>
            </div>
            <div class="text-3xl font-bold text-gray-900 mb-4">
              {{ product.price | currency:(product.currency || 'NGN') }}
              <span *ngIf="product.compare_at_price && product.compare_at_price > product.price" class="text-lg text-gray-500 line-through ml-2">
                {{ product.compare_at_price | currency:(product.currency || 'NGN') }}
              </span>
            </div>
          </div>

          <!-- Product Description -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p class="text-gray-600 leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Product Details -->
          <div *ngIf="product.details" class="space-y-3">
            <h3 class="text-lg font-medium text-gray-900">Details</h3>
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let detail of product.details" class="flex justify-between">
                <span class="text-gray-500">{{ detail.key }}:</span>
                <span class="text-gray-900">{{ detail.value }}</span>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
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

          <!-- Action Buttons -->
          <div class="flex space-x-4">
            <button 
              (click)="addToCart()"
              class="flex-1 bg-markt-primary text-white py-3 px-6 rounded-md hover:bg-markt-secondary transition-colors font-medium"
            >
              <fa-icon [icon]="faShoppingCart" class="w-5 h-5 mr-2"></fa-icon>
              Add to Cart
            </button>
            <button 
              (click)="buyNow()"
              class="flex-1 bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              Buy Now
            </button>
          </div>

          <!-- Seller Info -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Seller Information</h3>
            <div class="flex items-center space-x-4">
              <img 
                [src]="product.seller?.profile_picture_url || '/markt-text-logo.png'" 
                [alt]="product.seller?.shop_name"
                class="w-12 h-12 rounded-full object-cover"
              >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ product.seller?.shop_name }}</h4>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
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
                routerLink="/app/profile/{{ product.seller?.id }}"
                class="text-markt-primary hover:text-markt-secondary font-medium"
              >
                View Shop
              </button>
            </div>
          </div>

          <!-- Shipping & Returns -->
          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Shipping & Returns</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faTruck" class="w-5 h-5 text-green-600"></fa-icon>
                <div>
                  <p class="font-medium text-gray-900">Free Shipping</p>
                  <p class="text-sm text-gray-500">On orders over ₦5,000</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faShieldAlt" class="w-5 h-5 text-blue-600"></fa-icon>
                <div>
                  <p class="font-medium text-gray-900">Secure Payment</p>
                  <p class="text-sm text-gray-500">100% secure checkout</p>
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
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <div class="flex items-center mt-2">
                    <div class="flex items-center">
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <span class="ml-1 text-lg font-semibold text-gray-900">{{ product.rating }}</span>
                    </div>
                    <span class="ml-2 text-gray-500">out of 5</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ product.review_count }} reviews</p>
                </div>
                <button 
                  (click)="showReviewForm = true"
                  class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors"
                >
                  Write a Review
                </button>
              </div>
            </div>

            <!-- Review Form -->
            <div *ngIf="showReviewForm" class="bg-white border border-gray-200 rounded-lg p-6">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>
              <form (ngSubmit)="submitReview()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input 
                    type="text" 
                    [(ngModel)]="reviewTitle"
                    name="title"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Summary of your experience"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Review</label>
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
                    class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors"
                  >
                    Submit Review
                  </button>
                  <button 
                    type="button"
                    (click)="showReviewForm = false"
                    class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Reviews List -->
            <div class="space-y-6">
              <div *ngFor="let review of reviews" class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-3">
                    <img 
                      [src]="review.user?.profile_picture_url || '/markt-text-logo.png'" 
                      [alt]="review.user?.username"
                      class="w-10 h-10 rounded-full object-cover"
                    >
                    <div>
                      <p class="font-medium text-gray-900">{{ review.user?.username }}</p>
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
                        <span class="ml-2 text-sm text-gray-500">{{ review.created_at | date }}</span>
                      </div>
                    </div>
                  </div>
                  <button class="text-gray-400 hover:text-gray-600">
                    <fa-icon [icon]="faFlag" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
                <div class="mt-4">
                  <h4 class="font-medium text-gray-900 mb-2">{{ review.title }}</h4>
                  <p class="text-gray-600">{{ review.content }}</p>
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
                <span class="font-medium text-gray-900">SKU</span>
                <span class="text-gray-600">{{ product.sku }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.barcode">
                <span class="font-medium text-gray-900">Barcode</span>
                <span class="text-gray-600">{{ product.barcode }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.weight">
                <span class="font-medium text-gray-900">Weight</span>
                <span class="text-gray-600">{{ product.weight }} kg</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.brand">
                <span class="font-medium text-gray-900">Brand</span>
                <span class="text-gray-600">{{ product.product_metadata.brand }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.model">
                <span class="font-medium text-gray-900">Model</span>
                <span class="text-gray-600">{{ product.product_metadata.model }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.color">
                <span class="font-medium text-gray-900">Color</span>
                <span class="text-gray-600">{{ product.product_metadata.color }}</span>
              </div>
              <div class="flex justify-between py-3 border-b border-gray-200" *ngIf="product.product_metadata?.warranty">
                <span class="font-medium text-gray-900">Warranty</span>
                <span class="text-gray-600">{{ product.product_metadata.warranty }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="border-t border-gray-200 pt-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let relatedProduct of relatedProducts" class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              [src]="relatedProduct.images[0]?.url || '/markt-text-logo.png'" 
              [alt]="relatedProduct.name"
              class="w-full h-48 object-cover"
            >
            <div class="p-4">
              <h4 class="font-medium text-gray-900 mb-2">{{ relatedProduct.name }}</h4>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-gray-900">{{ relatedProduct.price | currency:'NGN' }}</span>
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private marketplaceService = inject(MarketplaceService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private socialService = inject(SocialService);
  private apiService = inject(ApiService);

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
      
      this.apiService.getProduct(productId).subscribe({
        next: (response) => {
          this.product = response.data;
          this.selectedImage = this.product.images[0];
          this.loadRelatedProducts();
          this.loadReviews();
          this.checkWishlistStatus();
          this.trackProductView();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.isLoading = false;
          this.router.navigate(['/app/marketplace']);
        }
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

      // Load similar products
      this.apiService.getSimilarProducts(productId).subscribe({
        next: (response) => {
          this.relatedProducts = response.data || [];
        },
        error: (error) => {
          console.error('Error loading similar products:', error);
          this.relatedProducts = [];
        }
      });
    }
  }

  private loadRelatedProducts(): void {
    if (!this.product) return;

    const params = {
      category_ids: [this.product.category_id],
      exclude_id: this.product.id,
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
          
          // Show success message
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
          this.router.navigate(['/app/checkout']);
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  toggleWishlist(): void {
    if (!this.product) return;

    // This would typically call a wishlist service
    this.isInWishlist = !this.isInWishlist;
    
  }

  shareProduct(): void {
    if (!this.product) return;

    this.socialService.shareProduct(this.product.id).subscribe({
      next: (response) => {
        // Handle sharing (copy link, open share dialog, etc.)
        navigator.clipboard.writeText(response.share_url || window.location.href);
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