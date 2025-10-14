import { Component, OnInit, inject } from '@angular/core';
import { TypeSafetyService } from '../../../core/services/type-safety.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES_ABSOLUTE } from '../../../../core-next/config/routes.config';
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
  faFlag,
  faSearch,
  faChevronRight,
  faExpand,
  faCheckCircle,
  faBolt,
  faHandshake,
  faMessage,
  faShieldAlt as faShieldCheck,
  faMedal,
  faUndo
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
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="bg-light" *ngIf="product">


      <!-- Main Content -->
      <main class=" mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Product Images & Details -->
          <div class="lg:col-span-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <!-- Image Gallery -->
        <div class="space-y-4">
          <div class="relative">
            <img 
              [src]="(selectedImage?.media?.desktop_url || selectedImage?.media?.mobile_url || selectedImage?.media?.original_url || product.images?.[0]?.media?.desktop_url || product.images?.[0]?.media?.mobile_url || product.images?.[0]?.media?.original_url) || '/markt-text-logo.png'" 
              [alt]="product.name"
                    class="w-full h-96 object-cover rounded-lg border border-border"
                  >
                  <button class="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100">
                    <fa-icon [icon]="faExpand" class="text-muted"></fa-icon>
              </button>
                  <div class="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">1 / {{ product.images?.length || 1 }}</div>
            </div>
                <div class="grid grid-cols-5 gap-2" *ngIf="product.images?.length > 1">
                  <img 
                    *ngFor="let image of product.images; let i = index"
                    (click)="selectImage(image)"
                    class="w-full h-16 object-cover rounded border-2 cursor-pointer transition-colors"
                    [class.border-primary]="selectedImage?.id === image.id || (i === 0 && !selectedImage)"
                    [class.border-border]="selectedImage?.id !== image.id && !(i === 0 && !selectedImage)"
                [src]="media.getPrimaryUrl(image)"
                [alt]="product.name"
              >
          </div>
        </div>

              <!-- Product Information -->
        <div class="space-y-6">
          <div>
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Like New</span>
                    <span class="text-muted text-sm">Posted 2 days ago</span>
                  </div>
                  <h1 class="text-3xl font-bold text-dark mb-2">{{ product.name }}</h1>
                  <p class="text-muted mb-4">8GB RAM, 256GB SSD - Space Gray</p>
                  <div class="flex items-center space-x-4 mb-4">
              <div class="flex items-center">
                      <div class="flex text-yellow-400">
                        <fa-icon [icon]="faStar" *ngFor="let star of [1,2,3,4,5]"></fa-icon>
              </div>
                      <span class="text-muted text-sm ml-2">{{ product.rating || 4.8 }} ({{ product.review_count || 124 }} reviews)</span>
            </div>
                    <span class="text-muted">•</span>
                    <span class="text-muted text-sm">{{ product.sold_count || 387 }} views</span>
            </div>
                  <div class="flex items-baseline space-x-2">
                    <span class="text-4xl font-bold text-primary">{{ product.price | currency:(product.currency || 'USD') }}</span>
                    <span *ngIf="product.compare_at_price && product.compare_at_price > product.price" class="text-lg text-muted line-through">{{ product.compare_at_price | currency:(product.currency || 'USD') }}</span>
                    <span *ngIf="product.compare_at_price && product.compare_at_price > product.price" class="bg-primary text-white px-2 py-1 rounded text-sm">13% off</span>
            </div>
          </div>

                <div class="border-t border-border pt-6">
                  <h3 class="font-semibold text-dark mb-3">Description</h3>
                  <p class="text-muted leading-relaxed">
                    {{ product.description || 'No description available for this product.' }}
                  </p>
          </div>

                <div class="border-t border-border pt-6" *ngIf="product.details && product.details.length > 0">
                  <h3 class="font-semibold text-dark mb-3">Specifications</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div *ngFor="let detail of product.details">
                      <span class="text-muted">{{ detail.key }}:</span>
                      <span class="text-dark ml-2">{{ detail.value }}</span>
                    </div>
                  </div>
                </div>

                <div class="border-t border-border pt-6">
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-2">
                      <fa-icon [icon]="faMapMarkerAlt" class="text-muted"></fa-icon>
                      <span class="text-muted">Stanford University Campus</span>
                </div>
                    <div class="flex items-center space-x-2">
                      <fa-icon [icon]="faTruck" class="text-muted"></fa-icon>
                      <span class="text-muted">Local pickup available</span>
              </div>
            </div>
          </div>
                </div>
              </div>
                </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            
            <!-- Seller Information -->
            <div class="bg-white rounded-lg border border-border p-6">
              <div class="flex items-center space-x-4 mb-4">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="Seller" class="w-12 h-12 rounded-full">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="font-semibold text-dark">{{ product.seller?.shop_name || 'Alex Chen' }}</h3>
                    <fa-icon [icon]="faCheckCircle" class="text-green-500 text-sm"></fa-icon>
              </div>
                  <div class="flex items-center space-x-2">
                    <div class="flex text-yellow-400 text-sm">
                      <fa-icon [icon]="faStar" *ngFor="let star of [1,2,3,4,5]"></fa-icon>
                </div>
                    <span class="text-muted text-sm">{{ product.seller?.rating || 4.9 }} ({{ product.seller?.review_count || 47 }} reviews)</span>
              </div>
            </div>
            </div>

              <div class="space-y-3 mb-6 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted">Member since:</span>
                  <span class="text-dark">Jan 2023</span>
          </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Response time:</span>
                  <span class="text-dark">Usually within 1 hour</span>
        </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Items sold:</span>
                  <span class="text-dark">{{ product.seller?.items_sold || 23 }} items</span>
        </div>
      </div>
 
              <div class="space-y-3">
            <button 
              (click)="addToCart()"
                  class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
            >
                  <fa-icon [icon]="faShoppingCart" class="mr-2"></fa-icon>
              Add to Cart
            </button>
            <button 
              (click)="buyNow()"
                  class="w-full bg-dark text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
                  <fa-icon [icon]="faBolt" class="mr-2"></fa-icon>
              Buy Now
            </button>
                <button 
                  (click)="makeOffer()"
                  class="w-full border border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  <fa-icon [icon]="faHandshake" class="mr-2"></fa-icon>
                  Make Offer
                </button>
                <div class="grid grid-cols-2 gap-3">
                  <button class="border border-border text-dark py-2 rounded-lg font-medium hover:bg-light transition-colors">
                    <fa-icon [icon]="faMessage" class="mr-2"></fa-icon>
                    Chat
            </button>
            <button 
                    (click)="toggleWishlist()"
                    class="border border-border text-dark py-2 rounded-lg font-medium hover:bg-light transition-colors"
                    [class.text-red-500]="isInWishlist"
                  >
                    <fa-icon [icon]="faHeart" class="mr-2"></fa-icon>
                    Save
            </button>
        </div>
            </div>
          </div>

            <!-- Trust Indicators -->
            <div class="bg-white rounded-lg border border-border p-6">
              <h3 class="font-semibold text-dark mb-4">Why buy from Alex?</h3>
              <div class="space-y-3">
              <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faShieldCheck" class="text-green-500"></fa-icon>
                  <span class="text-sm text-dark">Verified Stanford student</span>
                    </div>
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faMedal" class="text-yellow-500"></fa-icon>
                  <span class="text-sm text-dark">Top-rated seller</span>
                  </div>
              <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faClock" class="text-blue-500"></fa-icon>
                  <span class="text-sm text-dark">Fast responder</span>
                </div>
              <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faUndo" class="text-primary"></fa-icon>
                  <span class="text-sm text-dark">7-day return policy</span>
                </div>
              </div>
            </div>

            <!-- Related Products -->
            <div class="bg-white rounded-lg border border-border p-6">
              <h3 class="font-semibold text-dark mb-4">Similar Items</h3>
              <div class="space-y-4">
                <div class="flex space-x-3" *ngFor="let relatedProduct of relatedProducts.slice(0, 3)">
                  <img class="w-16 h-16 object-cover rounded border border-border" [src]="media.getPrimaryUrl(relatedProduct?.images?.[0])" [alt]="relatedProduct.name">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-dark">{{ relatedProduct.name }}</h4>
                    <p class="text-xs text-muted">8GB, 256GB</p>
                    <p class="text-sm font-semibold text-primary">{{ relatedProduct.price | currency:'USD' }}</p>
                  </div>
                </div>
                </div>
                </div>
        </div>
      </div>
 
        <!-- Reviews Section -->
        <div class="mt-12 bg-white rounded-lg border border-border p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-dark">Customer Reviews</h2>
                  <button 
              (click)="showReviewForm = true"
              class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
            >
              Write Review
                  </button>
            </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div class="text-center">
              <div class="text-4xl font-bold text-dark mb-2">{{ product.rating || 4.8 }}</div>
              <div class="flex justify-center text-yellow-400 mb-2">
                <fa-icon [icon]="faStar" *ngFor="let star of [1,2,3,4,5]"></fa-icon>
                        </div>
              <div class="text-muted text-sm">Based on {{ product.review_count || 124 }} reviews</div>
                      </div>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted w-8">5★</span>
                <div class="flex-1 bg-border rounded-full h-2">
                  <div class="bg-yellow-400 h-2 rounded-full" style="width: 85%"></div>
                    </div>
                <span class="text-sm text-muted w-8">85%</span>
                  </div>
                  <div class="flex items-center space-x-2">
                <span class="text-sm text-muted w-8">4★</span>
                <div class="flex-1 bg-border rounded-full h-2">
                  <div class="bg-yellow-400 h-2 rounded-full" style="width: 12%"></div>
                </div>
                <span class="text-sm text-muted w-8">12%</span>
                </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted w-8">3★</span>
                <div class="flex-1 bg-border rounded-full h-2">
                  <div class="bg-yellow-400 h-2 rounded-full" style="width: 2%"></div>
                </div>
                <span class="text-sm text-muted w-8">2%</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted w-8">2★</span>
                <div class="flex-1 bg-border rounded-full h-2">
                  <div class="bg-yellow-400 h-2 rounded-full" style="width: 1%"></div>
            </div>
                <span class="text-sm text-muted w-8">1%</span>
          </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-muted w-8">1★</span>
                <div class="flex-1 bg-border rounded-full h-2">
                  <div class="bg-yellow-400 h-2 rounded-full" style="width: 0%"></div>
                </div>
                <span class="text-sm text-muted w-8">0%</span>
              </div>
              </div>
            <div class="space-y-2">
              <button class="w-full text-left px-3 py-2 border border-border rounded-lg hover:bg-light transition-colors text-sm">Most Recent</button>
              <button class="w-full text-left px-3 py-2 border border-border rounded-lg hover:bg-light transition-colors text-sm">Highest Rated</button>
              <button class="w-full text-left px-3 py-2 border border-border rounded-lg hover:bg-light transition-colors text-sm">With Photos</button>
              </div>
              </div>

          <div class="space-y-6">
            <div class="border-b border-border pb-6" *ngFor="let review of reviews.slice(0, 3)">
              <div class="flex items-start space-x-4">
                <img [src]="review.user?.profile_picture_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'" alt="Reviewer" class="w-10 h-10 rounded-full">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-dark">{{ review.user?.username || 'Sarah Johnson' }}</h4>
                    <div class="flex text-yellow-400 text-sm">
                      <fa-icon [icon]="faStar" *ngFor="let star of [1,2,3,4,5]"></fa-icon>
              </div>
                    <span class="text-muted text-sm">{{ review.created_at ? (review.created_at | date:'short') : '2 days ago' }}</span>
                  </div>
                  <p class="text-muted mb-3">{{ review.content || 'Excellent condition as described! Alex was very responsive and the pickup was smooth. The laptop works perfectly for my coursework. Highly recommend!' }}</p>
                  <div class="flex space-x-2" *ngIf="review.images?.length">
                    <img class="w-16 h-16 object-cover rounded border border-border" [src]="img" [alt]="'Review photo'" *ngFor="let img of review.images.slice(0, 2)">
              </div>
            </div>
          </div>
        </div>
      </div>

          <div class="text-center mt-8">
            <button class="text-primary font-medium hover:underline">View All Reviews</button>
                </div>
              </div>
      </main>

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
    }

    ::-webkit-scrollbar { 
      display: none;
    }
    
    body { 
      font-family: 'Inter', sans-serif; 
    }
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
  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faExpand = faExpand;
  faCheckCircle = faCheckCircle;
  faBolt = faBolt;
  faHandshake = faHandshake;
  faMessage = faMessage;
  faShieldCheck = faShieldCheck;
  faMedal = faMedal;
  faUndo = faUndo;

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
          error: () => { 
            // Fallback to mock data for marketplace product IDs
            this.loadMockProduct(productId);
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
          this.router.navigate([ROUTES_ABSOLUTE.APP.CART], { queryParams: { source: 'product', productId: this.product.id } });
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
          this.router.navigate([ROUTES_ABSOLUTE.APP.CHECKOUT], { queryParams: { source: 'buynow', productId: this.product.id } });
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

  makeOffer(): void {
    if (!this.product) return;
    
    this.router.navigate([`${ROUTES_ABSOLUTE.APP.OFFERS.ROOT}/make`, this.product.id]);
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

  private loadMockProduct(productId: string): void {
    // Mock data mapping for marketplace product IDs
    const mockProducts: { [key: string]: any } = {
      'macbook-pro-13-2021': {
        id: 'macbook-pro-13-2021',
        name: 'MacBook Pro 13" 2021',
        price: 1200,
        currency: 'USD',
        compare_at_price: 1500,
        rating: 4.9,
        review_count: 24,
        sold_count: 156,
        condition: 'Like New',
        description: 'Excellent condition MacBook Pro 13" 2021 with M1 chip. Barely used, comes with original charger and box. Perfect for students and professionals.',
        details: [
          { key: 'Brand', value: 'Apple' },
          { key: 'Model', value: 'MacBook Pro 13"' },
          { key: 'Year', value: '2021' },
          { key: 'Processor', value: 'Apple M1' },
          { key: 'RAM', value: '8GB' },
          { key: 'Storage', value: '256GB SSD' },
          { key: 'Color', value: 'Space Gray' },
          { key: 'Condition', value: 'Like New' }
        ],
        images: [
          { media: { desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/9e580a234a-dfedd1ac85a893bb0f65.png' } },
          { media: { desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d2e5820307-936957b5d254a5a5cb38.png' } },
          { media: { desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/1d0a014a05-98e516dc00329c7cf656.png' } }
        ],
        seller: {
          id: 'seller1',
          shop_name: 'Mike Davis',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
          is_verified: true,
          location: 'San Francisco, CA',
          rating: 4.9,
          total_sales: 156,
          response_time: 'Usually responds within 1 hour'
        },
        category: { name: 'Electronics' },
        stock: 1,
        is_featured: true,
        trust_indicators: [
          { icon: 'faShieldCheck', text: 'Buyer Protection', description: 'Full refund if not as described' },
          { icon: 'faTruck', text: 'Fast Shipping', description: 'Free shipping within 2-3 days' },
          { icon: 'faCheckCircle', text: 'Verified Seller', description: 'Identity and payment verified' }
        ]
      },
      'calculus-textbook-bundle': {
        id: 'calculus-textbook-bundle',
        name: 'Calculus Textbook Bundle',
        price: 85,
        currency: 'USD',
        compare_at_price: 120,
        rating: 4.7,
        review_count: 18,
        sold_count: 89,
        condition: 'Good',
        description: 'Complete calculus textbook bundle for Math 101-102. Includes Stewart Calculus 8th Edition and practice workbook. Some highlighting but all pages intact.',
        details: [
          { key: 'Subject', value: 'Mathematics' },
          { key: 'Course', value: 'Math 101-102' },
          { key: 'Edition', value: '8th Edition' },
          { key: 'Author', value: 'James Stewart' },
          { key: 'Publisher', value: 'Cengage Learning' },
          { key: 'Condition', value: 'Good' },
          { key: 'Pages', value: 'All pages intact' },
          { key: 'Notes', value: 'Some highlighting' }
        ],
        images: [
          { media: { desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d2e5820307-936957b5d254a5a5cb38.png' } }
        ],
        seller: {
          id: 'seller2',
          shop_name: 'Emma Wilson',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
          is_verified: true,
          location: 'Boston, MA',
          rating: 4.7,
          total_sales: 89,
          response_time: 'Usually responds within 2 hours'
        },
        category: { name: 'Books' },
        stock: 1,
        trust_indicators: [
          { icon: 'faShieldCheck', text: 'Buyer Protection', description: 'Full refund if not as described' },
          { icon: 'faTruck', text: 'Fast Shipping', description: 'Free shipping within 1-2 days' },
          { icon: 'faCheckCircle', text: 'Verified Seller', description: 'Student verified' }
        ]
      },
      'vintage-denim-jacket': {
        id: 'vintage-denim-jacket',
        name: 'Vintage Denim Jacket',
        price: 45,
        currency: 'USD',
        compare_at_price: 65,
        rating: 5.0,
        review_count: 12,
        sold_count: 34,
        condition: 'Very Good',
        description: 'Authentic vintage denim jacket from the 90s. Size M, perfect for campus style. Light wear but no tears or stains. Great for layering.',
        details: [
          { key: 'Brand', value: 'Levi\'s' },
          { key: 'Size', value: 'Medium' },
          { key: 'Color', value: 'Blue Denim' },
          { key: 'Era', value: '1990s' },
          { key: 'Condition', value: 'Very Good' },
          { key: 'Material', value: '100% Cotton Denim' },
          { key: 'Style', value: 'Classic Trucker' },
          { key: 'Care', value: 'Machine washable' }
        ],
        images: [
          { media: { desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/1d0a014a05-98e516dc00329c7cf656.png' } }
        ],
        seller: {
          id: 'seller3',
          shop_name: 'Lisa Park',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
          is_verified: true,
          location: 'Los Angeles, CA',
          rating: 5.0,
          total_sales: 34,
          response_time: 'Usually responds within 30 minutes'
        },
        category: { name: 'Fashion' },
        stock: 1,
        trust_indicators: [
          { icon: 'faShieldCheck', text: 'Buyer Protection', description: 'Full refund if not as described' },
          { icon: 'faTruck', text: 'Fast Shipping', description: 'Free shipping within 1-2 days' },
          { icon: 'faCheckCircle', text: 'Verified Seller', description: 'Fashion enthusiast verified' }
        ]
      },
      'study-desk-with-drawers': {
        id: 'study-desk-with-drawers',
        name: 'Study Desk with Drawers',
        price: 120,
        currency: 'USD',
        compare_at_price: 180,
        rating: 4.8,
        review_count: 15,
        sold_count: 23,
        condition: 'Excellent',
        description: 'Perfect study desk for dorm room setup. Includes 3 drawers for storage. Lightweight and easy to assemble. Barely used, like new condition.',
        details: [
          { key: 'Material', value: 'Wood Composite' },
          { key: 'Dimensions', value: '48" W x 24" D x 30" H' },
          { key: 'Drawers', value: '3 Storage Drawers' },
          { key: 'Color', value: 'White' },
          { key: 'Condition', value: 'Excellent' },
          { key: 'Assembly', value: 'Required (tools included)' },
          { key: 'Weight', value: '45 lbs' },
          { key: 'Style', value: 'Modern Minimalist' }
        ],
        images: [
          { media: { desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/92f2ea4247-12d5dc88e2f1267dcf65.png' } }
        ],
        seller: {
          id: 'seller4',
          shop_name: 'Tom Rodriguez',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
          is_verified: true,
          location: 'Austin, TX',
          rating: 4.8,
          total_sales: 23,
          response_time: 'Usually responds within 1 hour'
        },
        category: { name: 'Furniture' },
        stock: 1,
        trust_indicators: [
          { icon: 'faShieldCheck', text: 'Buyer Protection', description: 'Full refund if not as described' },
          { icon: 'faTruck', text: 'Local Pickup', description: 'Available for local pickup' },
          { icon: 'faCheckCircle', text: 'Verified Seller', description: 'Furniture seller verified' }
        ]
      }
    };

    const mockProduct = mockProducts[productId];
    if (mockProduct) {
      this.product = mockProduct;
      this.selectedImage = this.product?.images?.[0] || null;
      this.loadMockReviews();
      this.loadRelatedProducts();
      this.checkWishlistStatus();
    } else {
      this.product = null;
    }
  }

  private loadMockReviews(): void {
    // Mock reviews data
    this.reviews = [
      {
        id: '1',
        user: {
          name: 'Sarah Johnson',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
          is_verified: true
        },
        rating: 5,
        comment: 'Exactly as described! Fast shipping and great communication. Highly recommend this seller.',
        created_at: new Date('2024-01-15'),
        helpful_count: 8,
        images: []
      },
      {
        id: '2',
        user: {
          name: 'Alex Chen',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
          is_verified: true
        },
        rating: 4,
        comment: 'Good quality product. Minor wear as expected for the condition. Seller was very responsive.',
        created_at: new Date('2024-01-10'),
        helpful_count: 5,
        images: []
      },
      {
        id: '3',
        user: {
          name: 'Maria Garcia',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
          is_verified: false
        },
        rating: 5,
        comment: 'Perfect! Better than expected. Will definitely buy from this seller again.',
        created_at: new Date('2024-01-08'),
        helpful_count: 12,
        images: []
      }
    ];
  }
} 