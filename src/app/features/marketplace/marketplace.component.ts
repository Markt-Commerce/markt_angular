import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule,  FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p class="mt-1 text-sm text-gray-500">
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
      <div class="bg-white rounded-lg shadow p-4">
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
            <label class="text-sm font-medium text-gray-700">Sort by:</label>
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
          <div class="text-sm text-gray-500">
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
          <div class="bg-white rounded-lg shadow p-6 space-y-6">
            <!-- Categories -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Categories</h3>
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
                  <span class="ml-2 text-sm text-gray-700">{{ category.name }}</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm text-gray-700">Min Price</label>
                  <input 
                    type="number" 
                    [(ngModel)]="priceRange.min"
                    (input)="onPriceChange()"
                    placeholder="0"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-700">Max Price</label>
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
              <h3 class="text-lg font-medium text-gray-900 mb-4">Rating</h3>
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
                  <span class="ml-2 text-sm text-gray-700">
                    <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400"></fa-icon>
                    {{ rating }}+ stars
                  </span>
                </label>
              </div>
            </div>

            <!-- Location -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Location</h3>
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
                  <span class="ml-2 text-sm text-gray-700">{{ location }}</span>
                </label>
              </div>
            </div>

            <!-- Clear Filters -->
            <button 
              (click)="clearFilters()"
              class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-markt-primary"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let item of [1,2,3,4,5,6,8]" class="bg-white rounded-lg shadow animate-pulse">
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
            [ngClass]="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'"
          >
            <div 
              *ngFor="let product of products"
              [ngClass]="viewMode === 'grid' ? 'bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow' : 'bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow'"
            >
              <!-- Grid View -->
              <div *ngIf="viewMode === 'grid'" class="relative">
                <img 
                  [src]="product.images[0]?.url || '/markt-text-logo.png'" 
                  [alt]="product.name"
                  class="w-full h-48 object-cover"
                >
                <div class="absolute top-2 right-2">
                  <button 
                    (click)="toggleWishlist(product)"
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    [class.text-red-500]="isInWishlist(product)"
                    [class.text-gray-400]="!isInWishlist(product)"
                  >
                    <fa-icon [icon]="faHeart" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-medium text-gray-900 mb-2">{{ product.name }}</h3>
                  <p class="text-sm text-gray-500 mb-2">{{ product.description }}</p>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xl font-bold text-gray-900">{{ product.price | currency:'NGN' }}</span>
                    <div class="flex items-center">
                      <fa-icon [icon]="faStar" class="w-4 h-4 text-yellow-400"></fa-icon>
                      <span class="ml-1 text-sm text-gray-600">{{ product.rating }}</span>
                    </div>
                  </div>
                  <button 
                    (click)="addToCart(product)"
                    class="w-full bg-markt-primary text-white py-2 px-4 rounded-md hover:bg-markt-secondary transition-colors"
                  >
                    <fa-icon [icon]="faShoppingCart" class="w-4 h-4 mr-2"></fa-icon>
                    Add to Cart
                  </button>
                </div>
              </div>

              <!-- List View -->
              <div *ngIf="viewMode === 'list'" class="flex space-x-4">
                <img 
                  [src]="product.images[0]?.url || '/markt-text-logo.png'" 
                  [alt]="product.name"
                  class="w-24 h-24 object-cover rounded-lg"
                >
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-medium text-gray-900 mb-1">{{ product.name }}</h3>
                      <p class="text-sm text-gray-500 mb-2">{{ product.description }}</p>
                      <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span class="flex items-center">
                          <fa-icon [icon]="faStore" class="w-4 h-4 mr-1"></fa-icon>
                          {{ product.seller?.shop_name }}
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
                    </div>
                    <div class="text-right">
                      <div class="text-xl font-bold text-gray-900 mb-2">{{ product.price | currency:'NGN' }}</div>
                      <div class="flex items-center space-x-2">
                        <button 
                          (click)="toggleWishlist(product)"
                          class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          [class.text-red-500]="isInWishlist(product)"
                        >
                          <fa-icon [icon]="faHeart" class="w-4 h-4"></fa-icon>
                        </button>
                        <button 
                          (click)="addToCart(product)"
                          class="bg-markt-primary text-white py-2 px-4 rounded-md hover:bg-markt-secondary transition-colors"
                        >
                          <fa-icon [icon]="faShoppingCart" class="w-4 h-4 mr-2"></fa-icon>
                          Add to Cart
                        </button>
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
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p class="text-gray-500 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              (click)="clearFilters()"
              class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors"
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
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button 
                *ngFor="let page of getPageNumbers()"
                (click)="goToPage(page)"
                [class.bg-markt-primary]="page === currentPage"
                [class.text-white]="page === currentPage"
                [class.text-gray-700]="page !== currentPage"
                class="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {{ page }}
              </button>
              
              <button 
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    }
  `]
})
export class MarketplaceComponent implements OnInit {
  private marketplaceService = inject(MarketplaceService);
  private cartService = inject(CartService);
  private searchService = inject(SearchService);
  private appStateService = inject(AppStateService);
  private router = inject(Router);
  private apiService = inject(ApiService);

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
    this.setupSubscriptions();
  }

  private loadMarketplaceData(): void {
    this.isLoading = true;
    
    // Load marketplace products
    this.apiService.getMarketplaceProducts().subscribe({
      next: (response) => {
        this.products = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total_items || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading marketplace products:', error);
        this.products = [];
        this.isLoading = false;
      }
    });

    // Load categories
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data || [];
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
      search: this.searchQuery,
      sort_by: this.sortBy as 'price' | 'rating' | 'created_at' | 'name',
      category_ids: this.selectedCategories,
      price_min: this.priceRange.min || undefined,
      price_max: this.priceRange.max || undefined,
      rating_min: this.selectedRating || undefined,
      locations: this.selectedLocations
    };

    this.marketplaceService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.items || [];
        this.totalResults = response.pagination?.total || 0;
        this.totalPages = response.pagination?.total_pages || 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
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