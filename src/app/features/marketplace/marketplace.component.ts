import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSort, 
  faThLarge, 
  faList,
  faHeart,
  faShoppingCart,
  faStar,
  faEye,
  faTimes,
  faChevronDown,
  faChevronUp,
  faSlidersH,
  faTags,
  faMapMarkerAlt,
  faClock,
  faUser,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { CartService } from '../../core/services/cart.service';
import { SearchService } from '../../core/services/search.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { MediaOptimizationService } from '../../core/services/media-optimization.service';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="container mx-auto px-4 lg:px-8 space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-black text-markt-dark">Marketplace</h1>
          <p class="mt-1 text-sm text-markt-muted">
            Discover amazing products from trusted sellers
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            (click)="toggleViewMode()"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            [title]="viewMode === 'grid' ? 'List View' : 'Grid View'"
          >
            <fa-icon [icon]="viewMode === 'grid' ? faList : faGrid3" class="w-5 h-5"></fa-icon>
          </button>
          <button 
            (click)="toggleFilters()"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Filters"
          >
            <fa-icon [icon]="faFilter" class="w-5 h-5"></fa-icon>
          </button>
        </div>
      </div>

      <!-- Search and Filters Bar -->
      <div class="bg-white rounded-2xl border border-markt-border/30 shadow-sm p-4 lg:p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <fa-icon [icon]="faSearch" class="w-5 h-5 text-gray-400"></fa-icon>
              </div>
              <input 
                type="text" 
                placeholder="Search products..."
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
              >
            </div>
          </div>

          <!-- Sort -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-markt-dark">Sort by:</label>
            <select 
              [(ngModel)]="sortBy"
              (change)="onSortChange()"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-markt-primary focus:border-markt-primary sm:text-sm rounded-md"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <!-- Results Count -->
          <div class="text-sm text-markt-muted">
            {{ totalResults }} products found
          </div>
        </div>
      </div>

      <!-- Filters Sidebar -->
      <div class="lg:flex lg:space-x-6">
        <!-- Filters -->
        <div 
          class="lg:w-64 lg:flex-shrink-0"
          [class.hidden]="!showFilters"
        >
          <div class="bg-gradient-to-br from-markt-light/50 to-white rounded-2xl border border-markt-border/30 p-6 space-y-6">
            <!-- Categories -->
            <div>
              <h3 class="text-lg font-bold text-markt-dark mb-4">Categories</h3>
              <div class="space-y-2">
                <label 
                  *ngFor="let category of categories" 
                  class="flex items-center"
                >
                  <input 
                    type="checkbox" 
                    [value]="category.id"
                    [(ngModel)]="selectedCategories"
                    (change)="onCategoryChange()"
                    class="h-4 w-4 text-markt-primary focus:ring-markt-primary border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-markt-dark">{{ category.name }}</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <h3 class="text-lg font-bold text-markt-dark mb-4">Price Range</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm text-markt-dark">Min Price</label>
                  <input 
                    type="number" 
                    [(ngModel)]="priceRange.min"
                    (input)="onPriceChange()"
                    placeholder="0"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm text-markt-dark">Max Price</label>
                  <input 
                    type="number" 
                    [(ngModel)]="priceRange.max"
                    (input)="onPriceChange()"
                    placeholder="100000"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
                  >
                </div>
              </div>
            </div>

            <!-- Rating -->
            <div>
              <h3 class="text-lg font-bold text-markt-dark mb-4">Rating</h3>
              <div class="space-y-2">
                <label 
                  *ngFor="let rating of [4, 3, 2, 1]" 
                  class="flex items-center"
                >
                  <input 
                    type="radio" 
                    [value]="rating"
                    [(ngModel)]="selectedRating"
                    (change)="onRatingChange()"
                    name="rating"
                    class="h-4 w-4 text-markt-primary focus:ring-markt-primary border-gray-300"
                  >
                  <span class="ml-2 text-sm text-markt-dark">
                    <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400"></fa-icon>
                    {{ rating }}+ stars
                  </span>
                </label>
              </div>
            </div>

            <!-- Location -->
            <div>
              <h3 class="text-lg font-bold text-markt-dark mb-4">Location</h3>
              <div class="space-y-2">
                <label 
                  *ngFor="let location of locations" 
                  class="flex items-center"
                >
                  <input 
                    type="checkbox" 
                    [value]="location"
                    [(ngModel)]="selectedLocations"
                    (change)="onLocationChange()"
                    class="h-4 w-4 text-markt-primary focus:ring-markt-primary border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-markt-dark">{{ location }}</span>
                </label>
              </div>
            </div>

            <!-- Clear Filters -->
            <button 
              (click)="clearFilters()"
              class="w-full px-4 py-2 text-sm font-semibold text-markt-dark bg-white border border-markt-border rounded-xl hover:border-markt-primary transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let item of [1,2,3,4,5,6,8]" class="bg-white rounded-3xl border border-markt-border/30 shadow-sm animate-pulse">
              <div class="h-48 bg-gray-200 rounded-t-lg"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>

          <!-- Products -->
          <div 
            *ngIf="!isLoading && products.length > 0"
                         [ngClass]="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 'space-y-4'"
          >
            <div 
              *ngFor="let product of products"
              [ngClass]="viewMode === 'grid' ? 'group bg-white rounded-3xl border border-markt-border/30 overflow-hidden shadow-lg hover:shadow-xl hover:border-markt-primary/40 transition-all h-full flex flex-col' : 'group bg-white rounded-3xl border border-markt-border/30 p-4 shadow-lg hover:shadow-xl hover:border-markt-primary/40 transition-all'"
            >
              <!-- Grid View -->
              <div *ngIf="viewMode === 'grid'" class="relative">
                <img 
                  [src]="media.getPrimaryUrl(product?.images?.[0])"
                  [attr.srcset]="media.getSrcSet(product?.images?.[0])"
                  [attr.sizes]="media.gridSizes()"
                  [alt]="product.name"
                  loading="lazy"
                  decoding="async"
                  class="w-full aspect-[4/3] object-cover"
                >
                <!-- Badges -->
                <div class="absolute top-2 left-2 flex gap-2">
                  <span *ngIf="(product.compare_at_price ?? 0) > (product.price ?? 0)" class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                    -{{ getDiscountPercent(product) }}%
                  </span>
                  <span *ngIf="product.stock === 0" class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Out of stock</span>
                </div>
                <div class="absolute top-2 right-2">
                  <button 
                    (click)="toggleWishlist(product)"
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    [class.text-red-500]="isInWishlist(product)"
                    [class.text-gray-400]="!isInWishlist(product)"
                    aria-label="Toggle wishlist"
                  >
                    <fa-icon [icon]="faHeart" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
                                                   <div class="p-5 flex-1 flex flex-col">
                   <h3 class="text-base font-semibold text-markt-dark mb-1 line-clamp-2 group-hover:text-markt-primary transition-colors">{{ product.name }}</h3>
                   <p class="text-sm text-markt-muted mb-3 line-clamp-2">{{ product.description }}</p>
                   <div class="mt-auto pt-2">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-xl font-extrabold text-markt-dark">{{ product.price | currency:(product.currency || 'NGN') }}</span>
                      <span *ngIf="product.compare_at_price && product.compare_at_price > product.price" class="text-sm text-gray-400 line-through">{{ product.compare_at_price | currency:(product.currency || 'NGN') }}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400"></fa-icon>
                      <span class="ml-1">{{ product.rating || 0 | number:'1.1-1' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between mb-3" *ngIf="product.seller as s">
                    <div class="flex items-center gap-2 text-sm">
                      <img [src]="s.profile_picture_url || '/markt-text-logo.png'" [alt]="s.shop_name" class="w-6 h-6 rounded-full object-cover">
                      <span class="text-gray-700 truncate max-w-[10rem] flex items-center gap-1">
                        {{ s.shop_name }}
                        <span *ngIf="s.is_verified" class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 text-[10px]">✓</span>
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">{{ s.location }}</div>
                  </div>
                                      <div class="flex gap-2">
                      <a [routerLink]="['/app/marketplace/product', product.id]" class="flex-1 inline-flex items-center justify-center h-10 rounded-xl border border-markt-border/40 px-3 text-sm font-semibold text-markt-dark hover:bg-markt-light/50 transition-colors" aria-label="View details">
                        View
                      </a>
                  <button 
                        *ngIf="access.canCheckout() && product.stock > 0"
                    (click)="addToCart(product)"
                        class="flex-1 inline-flex items-center justify-center h-10 rounded-xl bg-markt-primary text-white px-3 text-sm font-semibold hover:bg-markt-secondary transition-colors shadow-sm hover:shadow-md"
                        aria-label="Add to cart"
                  >
                    <fa-icon [icon]="faShoppingCart" class="w-4 h-4 mr-2"></fa-icon>
                        Add
                  </button>
                    </div>
                   </div>
                </div>
              </div>

              <!-- List View -->
              <div *ngIf="viewMode === 'list'" class="flex space-x-4">
                <img 
                  [src]="media.getPrimaryUrl(product?.images?.[0])" 
                  [attr.srcset]="media.getSrcSet(product?.images?.[0])"
                  [attr.sizes]="media.listThumbSizes()"
                  [alt]="product.name"
                  loading="lazy"
                  decoding="async"
                  class="w-28 h-28 object-cover rounded-lg"
                >
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-markt-dark mb-1">{{ product.name }}</h3>
                      <p class="text-sm text-markt-muted mb-2 line-clamp-2">{{ product.description }}</p>
                      <div class="flex items-center space-x-4 text-sm text-markt-muted">
                        <span class="flex items-center">
                          <fa-icon [icon]="faStore" class="w-4 h-4 mr-1"></fa-icon>
                          <span class="flex items-center gap-1">
                            {{ product.seller?.shop_name }}
                            <span *ngIf="product.seller?.is_verified" class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 text-[10px]">✓</span>
                          </span>
                        </span>
                        <span class="flex items-center">
                          <fa-icon [icon]="faMapMarkerAlt" class="w-4 h-4 mr-1"></fa-icon>
                          {{ product.seller?.location }}
                        </span>
                        <span class="flex items-center">
                          <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400 mr-1"></fa-icon>
                          {{ product.rating }}
                        </span>
                      </div>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span *ngIf="product.seller?.policies?.shipping" class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-markt-dark text-xs">Shipping: {{ product.seller?.policies?.shipping }}</span>
                        <span *ngIf="product.seller?.policies?.returns" class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-markt-dark text-xs">Returns: {{ product.seller?.policies?.returns }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xl font-extrabold text-markt-dark">
                        {{ product.price | currency:(product.currency || 'NGN') }}
                      </div>
                      <div *ngIf="product.compare_at_price && product.compare_at_price > product.price" class="text-sm text-gray-400 line-through">
                        {{ product.compare_at_price | currency:(product.currency || 'NGN') }}
                      </div>
                      <div class="flex items-center space-x-2 mt-2">
                        <button 
                          (click)="toggleWishlist(product)"
                          class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          [class.text-red-500]="isInWishlist(product)"
                        >
                          <fa-icon [icon]="faHeart" class="w-4 h-4"></fa-icon>
                        </button>
                        <button 
                          *ngIf="access.canCheckout()"
                          (click)="addToCart(product)"
                          class="bg-gradient-to-r from-markt-primary to-markt-secondary text-white py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition"
                        >
                          <fa-icon [icon]="faShoppingCart" class="w-4 h-4 mr-2"></fa-icon>
                          Add to Cart
                        </button>
                        <a *ngIf="product.seller?.id" [routerLink]="['/app/chat']" [queryParams]="{ user: product.seller.id, product: product.id }" class="text-markt-primary text-sm underline ml-2">Message seller</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && products.length === 0" class="text-center py-12">
            <fa-icon [icon]="faSearch" class="w-12 h-12 text-gray-400 mx-auto mb-4"></fa-icon>
            <h3 class="text-lg font-bold text-markt-dark mb-2">No products found</h3>
            <p class="text-markt-muted mb-4">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              (click)="clearFilters()"
              class="bg-gradient-to-r from-markt-primary to-markt-secondary text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition"
            >
              Clear Filters
            </button>
          </div>

          <!-- Pagination -->
          <div *ngIf="totalPages > 1" class="mt-8 flex items-center justify-center">
            <nav class="flex items-center space-x-2">
              <button 
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-markt-dark bg-white border border-markt-border rounded-md hover:border-markt-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button 
                *ngFor="let page of getPageNumbers()"
                (click)="goToPage(page)"
                [class.bg-markt-primary]="page === currentPage"
                [class.text-white]="page === currentPage"
                [class.text-markt-dark]="page !== currentPage"
                class="px-3 py-2 text-sm font-semibold bg-white border border-markt-border rounded-md hover:border-markt-primary"
              >
                {{ page }}
              </button>
              
              <button 
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-markt-dark bg-white border border-markt-border rounded-md hover:border-markt-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
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
export class MarketplaceComponent implements OnInit {
  private marketplaceService = inject(MarketplaceService);
  private cartService = inject(CartService);
  private searchService = inject(SearchService);
  private appStateService = inject(AppStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  authService = inject(AuthService);
  access = inject(AccessControlService);
  media = inject(MediaOptimizationService);

  // Icons
  faSearch = faSearch;
  faFilter = faFilter;
  faSort = faSort;
  faGrid3 = faThLarge;
  faList = faList;
  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faStar = faStar;
  faEye = faEye;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faSlidersH = faSlidersH;
  faTags = faTags;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faUser = faUser;
  faStore = faStore;

  // State
  products: any[] = [];
  categories: any[] = [];
  isLoading = false;
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  
  // Search and filters
  searchQuery = '';
  sortBy = 'relevance';
  selectedCategories: string[] = [];
  priceRange = { min: null, max: null };
  selectedRating: number | null = null;
  selectedLocations: string[] = [];
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  
  // Mock data
  locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'];
  recommendedProducts: any[] = [];
  trendingProducts: any[] = [];

  ngOnInit(): void {
    this.loadMarketplaceData();
    // Apply seller filter from query param if provided
    this.route.queryParamMap.subscribe(params => {
      const seller = params.get('seller');
      if (seller) {
        this.selectedCategories = [];
        this.selectedLocations = [];
        this.searchQuery = '';
        this.sortBy = 'relevance';
        this.currentPage = 1;
        this.loadProductsForSeller(seller);
      }
    });
    this.setupSubscriptions();
  }

  private loadMarketplaceData(): void {
    this.isLoading = true;
    
    // Load marketplace products (public marketplace feed)
    this.apiService.getMarketplaceProducts().subscribe({
      next: (response) => {
        const res: any = response as any;
        const data: any = res?.data ?? res ?? {};
        const items: any = data?.items ?? data?.results ?? [];
        this.products = Array.isArray(items) ? items : [];
        const pagination: any = data?.pagination ?? data?.meta ?? {};
        this.totalResults = pagination?.total_items ?? pagination?.total ?? this.products.length ?? 0;
        this.totalPages = pagination?.total_pages ?? (this.totalResults ? Math.max(1, Math.ceil(this.totalResults / 20)) : 1);
        this.isLoading = false;
      },
      error: (error) => {
        // Fallback: some environments may not expose /products/marketplace; use generic /products
        this.apiService.getProducts({ page: this.currentPage, per_page: 20, status: 'active' }).subscribe({
          next: (fallbackRes) => {
            const res: any = fallbackRes as any;
            const data: any = res?.data ?? res ?? {};
            const items: any = data?.items ?? data?.results ?? [];
            this.products = Array.isArray(items) ? items : [];
            const pagination: any = data?.pagination ?? data?.meta ?? {};
            this.totalResults = pagination?.total_items ?? pagination?.total ?? this.products.length ?? 0;
            this.totalPages = pagination?.total_pages ?? (this.totalResults ? Math.max(1, Math.ceil(this.totalResults / 20)) : 1);
            this.isLoading = false;
          },
          error: (fallbackErr) => {
            console.error('Error loading products (fallback):', fallbackErr);
            this.products = [];
            this.isLoading = false;
          }
        });
      }
    });

    // Load categories
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = (response as any)?.data ?? response ?? [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to search query changes
    this.searchService.getSearchQuery$().subscribe(query => {
      this.searchQuery = query;
    });
  }

  onSearchInput(): void {
    this.searchService.setSearchQuery(this.searchQuery);
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPriceChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onRatingChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onLocationChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  private loadProducts(): void {
    const params = {
      page: this.currentPage,
      search: this.searchQuery || undefined,
      sort_by: this.sortBy as 'price' | 'rating' | 'created_at' | 'name',
      category_ids: (this.selectedCategories || []).filter(Boolean),
      price_min: this.priceRange.min || undefined,
      price_max: this.priceRange.max || undefined,
      rating_min: this.selectedRating ?? undefined,
      locations: this.selectedLocations
    };

    this.marketplaceService.getProducts(params).subscribe({
      next: (response) => {
        const res: any = response as any;
        const data: any = res?.data ?? res ?? {};
        const items: any = data?.items ?? data?.results ?? [];
        this.products = Array.isArray(items) ? items : [];
        const pagination: any = data?.pagination ?? data?.meta ?? {};
        this.totalResults = pagination?.total_items ?? pagination?.total ?? this.products.length ?? 0;
        this.totalPages = pagination?.total_pages ?? (this.totalResults ? Math.max(1, Math.ceil(this.totalResults / 20)) : 1);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  private loadProductsForSeller(sellerId: string): void {
    this.isLoading = true;
    const params = {
      page: 1,
      per_page: 20,
      seller_id: sellerId,
      status: 'active'
    } as any;
    this.marketplaceService.getProducts(params).subscribe({
      next: (response) => {
        const res: any = response as any;
        const data: any = res?.data ?? res ?? {};
        const items: any = data?.items ?? data?.results ?? [];
        this.products = Array.isArray(items) ? items : [];
        const pagination: any = data?.pagination ?? data?.meta ?? {};
        this.totalResults = pagination?.total_items ?? pagination?.total ?? this.products.length ?? 0;
        this.totalPages = pagination?.total_pages ?? (this.totalResults ? Math.max(1, Math.ceil(this.totalResults / 20)) : 1);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading seller products:', error);
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.priceRange = { min: null, max: null };
    this.selectedRating = null;
    this.selectedLocations = [];
    this.currentPage = 1;
    this.loadProducts();
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product.id, 1).subscribe({
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

  toggleWishlist(product: any): void {
    // This would typically call a wishlist service
    
  }

  isInWishlist(product: any): boolean {
    // This would typically check against wishlist state
    return false;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // image helpers centralized in MediaOptimizationService

  getDiscountPercent(product: any): number {
    const price = Number(product?.price ?? 0);
    const compare = Number(product?.compare_at_price ?? 0);
    if (!compare || compare <= price) return 0;
    return Math.round(((compare - price) / compare) * 100);
  }

  // Additional marketplace endpoint integrations
  getProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data?.items || [];
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
      }
    });
  }

  getRecommendedProducts(): void {
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

  getTrendingProducts(): void {
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

  trackProductView(productId: string): void {
    this.apiService.trackProductView(productId).subscribe({
      next: (response) => {
        console.log('Product view tracked:', response.data);
      },
      error: (error) => {
        console.error('Error tracking product view:', error);
      }
    });
  }

  upvoteReview(reviewId: string): void {
    this.apiService.upvoteReview(reviewId).subscribe({
      next: (response) => {
        console.log('Review upvoted:', response.data);
      },
      error: (error) => {
        console.error('Error upvoting review:', error);
      }
    });
  }
}