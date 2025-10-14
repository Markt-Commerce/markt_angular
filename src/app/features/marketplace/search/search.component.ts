import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROUTES_ABSOLUTE, buildPath } from '../../../../core-next/config/routes.config';
import { MarketplaceService } from '../../../core/services/marketplace.service';
import { SearchService } from '../../../core/services/search.service';
import { Product } from '../../../core/models';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AppStateService } from '../../../core/services/app-state.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, IconComponent, RouterLink],
  template: `
    <div class="font-sans min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Search Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Search Results</h1>
          <p class="text-gray-600 mt-1" *ngIf="searchQuery">
            Showing results for "<strong>{{ searchQuery }}</strong>"
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading$ | async" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Searching...</p>
        </div>

        <!-- Search Results -->
        <div *ngIf="(loading$ | async) === false">
          <!-- Results Summary -->
          <div class="mb-6 text-sm text-gray-600" *ngIf="totalResults > 0">
            {{ totalResults }} product{{ totalResults !== 1 ? 's' : '' }} found
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" *ngIf="products.length > 0">
            <div 
              *ngFor="let product of products; trackBy: trackByProductId"
              class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
            >
              <!-- Product Image -->
              <div class="relative aspect-square bg-gray-100">
                <img 
                  [src]="getProductImageUrl(product)"
                  [alt]="product.name"
                  loading="lazy"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  [routerLink]="[buildPath(ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', product.id)]"
                >
                
                <!-- Badges -->
                <div class="absolute top-2 left-2 flex flex-col gap-1">
                  <span class="badge verified" *ngIf="product.is_verified">
                    <app-icon name="checkmark" size="12"></app-icon>
                    Verified
                  </span>
                  <span class="badge featured" *ngIf="product.is_featured">Featured</span>
                  <span 
                    class="badge condition"
                    [class]="getConditionColor(product.condition)"
                  >
                    {{ product.condition | titlecase }}
                  </span>
                </div>

                <!-- Favorite Button -->
                <button
                  (click)="toggleFavorite(product)"
                  class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  [class.text-red-500]="isProductFavorited(product.id)"
                  [class.text-gray-400]="!isProductFavorited(product.id)"
                >
                  <app-icon name="heart" size="16"></app-icon>
                </button>
              </div>
              
              <!-- Product Info -->
              <div class="p-4">
                <h3 class="product-title font-semibold text-gray-900 mb-2 line-clamp-2" [routerLink]="[buildPath(ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', product.id)]">
                  {{ product.name }}
                </h3>
                
                <div class="seller-info flex items-center gap-2 mb-3">
                  <img 
                    [src]="product.seller.profile_picture_url || '/markt-text-logo.png'" 
                    [alt]="getSellerDisplayName(product.seller)"
                    class="w-6 h-6 rounded-full object-cover"
                  >
                  <span class="seller-name text-sm text-gray-600">{{ getSellerDisplayName(product.seller) }}</span>
                  <span *ngIf="product.seller.verification_status === 'verified'" class="text-green-500">
                    <app-icon name="checkmark" size="12"></app-icon>
                  </span>
                </div>

                <!-- Price and Stats -->
                <div class="flex items-center justify-between mb-3">
                  <span class="price text-lg font-bold text-gray-900">
                    {{ formatPrice(product.price, product.currency) }}
                  </span>
                  <div class="flex items-center gap-3 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      <app-icon name="eye" size="14"></app-icon>
                      {{ formatNumber(product.review_count) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <app-icon name="star" size="14"></app-icon>
                      {{ product.average_rating || 0 }}
                    </span>
                  </div>
                </div>

                <!-- Location and Category -->
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span class="flex items-center gap-1">
                    <app-icon name="location" size="14"></app-icon>
                    <span class="location">{{ product.seller.shop_name || 'Store' }}</span>
                  </span>
                  <span class="category">{{ getCategoryName(product) }}</span>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <button
                    (click)="addToCart(product)"
                    [disabled]="cartService.isProductInCart(product.id)"
                    class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {{ cartService.isProductInCart(product.id) ? 'In Cart' : 'Add to Cart' }}
                  </button>
                  <button
                    [routerLink]="[buildPath(ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', product.id)]"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="products.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 text-gray-400">
              <app-icon name="search" size="64"></app-icon>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p class="text-gray-600">Try adjusting your search terms or filters</p>
            <button 
              [routerLink]="[ROUTES_ABSOLUTE.APP.MARKETPLACE]"
              class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </button>
          </div>

          <!-- Pagination -->
          <div *ngIf="products.length > 0" class="mt-8 flex justify-center">
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span class="px-4 py-2 text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              
              <button
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-title {
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    .product-title:hover {
      color: #2563eb;
    }
    
    .badge {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }
    
    .badge.verified {
      @apply bg-green-100 text-green-800 flex items-center gap-1;
    }
    
    .badge.featured {
      @apply bg-purple-100 text-purple-800;
    }
    
    .badge.condition {
      @apply text-xs;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .seller-info img {
      flex-shrink: 0;
    }
  `]
})
export class SearchComponent implements OnInit {
  private destroy$ = new Subject<void>();
  
  // Expose route constants to template
  readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;
  readonly buildPath = buildPath;
  
  marketplaceService = inject(MarketplaceService);
  searchService = inject(SearchService);
  cartService = inject(CartService);
  appStateService = inject(AppStateService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  apiService = inject(ApiService);

  // Observables
  products: Product[] = [];
  loading$ = this.searchService.loading$;

  // Search state
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  perPage = 20;
  searchType = 'products';
  loading = false;
  limit = 20;
  offset = 0;
  selectedCategory = '';
  priceRange = { min: 0, max: 0 };
  sortBy = 'relevance';
  budgetRange = { min: 0, max: 0 };
  requestStatus = '';
  userRole = '';
  searchResults: any[] = [];
  shops: any[] = [];
  requests: any[] = [];
  niches: any[] = [];
  users: any[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.searchType = params['type'] || 'products';
      if (this.searchQuery) {
        this.performSearch();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) return;

    this.loading = true;
    this.updateUrl();

    switch (this.searchType) {
      case 'global':
        this.performGlobalSearch();
        break;
      case 'products':
        this.performProductSearch();
        break;
      case 'shops':
        this.performShopSearch();
        break;
      case 'requests':
        this.performRequestSearch();
        break;
      case 'niches':
        this.performNicheSearch();
        break;
      case 'users':
        this.performUserSearch();
        break;
      default:
        this.performProductSearch();
    }
  }

  private performGlobalSearch(): void {
    this.apiService.globalSearch(this.searchQuery, {
      limit: this.limit,
      offset: this.offset
    }).subscribe({
      next: (response) => {
        this.searchResults = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Global search error:', error);
        this.loading = false;
      }
    });
  }

  private performProductSearch(): void {
    this.apiService.searchProducts(this.searchQuery, {
      limit: this.limit,
      offset: this.offset,
      category: this.selectedCategory,
      price_min: this.priceRange.min,
      price_max: this.priceRange.max,
      sort: this.sortBy
    }).subscribe({
      next: (response) => {
        this.products = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Product search error:', error);
        this.loading = false;
      }
    });
  }

  private performShopSearch(): void {
    this.apiService.searchShops(this.searchQuery, {
      limit: this.limit,
      offset: this.offset,
      category: this.selectedCategory
    }).subscribe({
      next: (response) => {
        this.shops = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Shop search error:', error);
        this.loading = false;
      }
    });
  }

  private performRequestSearch(): void {
    this.apiService.searchRequests(this.searchQuery, {
      limit: this.limit,
      offset: this.offset,
      category: this.selectedCategory,
      budget_min: this.budgetRange.min,
      budget_max: this.budgetRange.max,
      status: this.requestStatus
    }).subscribe({
      next: (response) => {
        this.requests = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Request search error:', error);
        this.loading = false;
      }
    });
  }

  private performNicheSearch(): void {
    this.apiService.searchNiches(this.searchQuery, {
      limit: this.limit,
      offset: this.offset
    }).subscribe({
      next: (response) => {
        this.niches = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Niche search error:', error);
        this.loading = false;
      }
    });
  }

  private performUserSearch(): void {
    this.apiService.searchUsers(this.searchQuery, {
      limit: this.limit,
      offset: this.offset,
      role: this.userRole
    }).subscribe({
      next: (response) => {
        this.users = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('User search error:', error);
        this.loading = false;
      }
    });
  }

  onSearchTypeChange(): void {
    this.currentPage = 1;
    this.offset = 0;
    this.performSearch();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.offset = 0;
    this.performSearch();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.offset = 0;
    this.performSearch();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.performSearch();
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery,
        type: this.searchType,
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: (response) => {
        this.appStateService.showNotification({
          type: 'success',
          message: 'Added to Cart'
        });
      },
      error: (error) => {
        this.appStateService.showNotification({
          type: 'error',
          message: 'Error adding to cart'
        });
      }
    });
  }

  toggleFavorite(product: Product): void {
    if (this.isProductFavorited(product.id)) {
      this.marketplaceService.removeFromFavorites(product.id).subscribe({
        next: () => {
          this.appStateService.showNotification({
            type: 'success',
            message: 'Removed from Favorites'
          });
        },
        error: (error) => {
          this.appStateService.showNotification({
            type: 'error',
            message: 'Error removing from favorites'
          });
        }
      });
    } else {
      this.marketplaceService.addToFavorites(product.id).subscribe({
        next: () => {
          this.appStateService.showNotification({
            type: 'success',
            message: 'Added to Favorites'
          });
        },
        error: (error) => {
          this.appStateService.showNotification({
            type: 'error',
            message: 'Error adding to favorites'
          });
        }
      });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.performSearch();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.performSearch();
    }
  }

  // Utility methods
  getProductImageUrl(product: Product): string {
    return this.marketplaceService.getProductImageUrl(product, 'thumbnail');
  }

  formatPrice(price: number, currency: string | undefined): string {
    const currencySymbol = currency === 'NGN' ? '₦' : '$';
    return `${currencySymbol}${price.toLocaleString()}`;
  }

  formatNumber(num: number): string {
    return this.marketplaceService.formatNumber(num);
  }

  getConditionColor(condition: string | undefined): string {
    if (!condition) return 'text-gray-600 bg-gray-100';
    
    switch (condition.toLowerCase()) {
      case 'new': return 'text-green-600 bg-green-100';
      case 'like new': return 'text-blue-600 bg-blue-100';
      case 'good': return 'text-yellow-600 bg-yellow-100';
      case 'fair': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getSellerDisplayName(seller: Product['seller']): string {
    return this.marketplaceService.getSellerDisplayName(seller);
  }

  isProductFavorited(productId: string): boolean {
    return this.marketplaceService.isProductFavorited(productId);
  }

  getCategoryName(product: Product): string {
    return product.category?.name || 'Uncategorized';
  }

  trackByProductId(index: number, product: Product): string {
    return this.marketplaceService.trackByProductId(index, product);
  }
}