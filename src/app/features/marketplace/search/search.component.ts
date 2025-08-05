import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService, SearchFilters } from '../../../core/services/marketplace.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>Search Results</h1>
        <p *ngIf="searchQuery">Showing results for "{{ searchQuery }}"</p>
      </div>

      <div class="search-content">
        <!-- Search Filters -->
        <aside class="search-filters">
          <div class="filter-section">
            <h3>Filters</h3>
            
            <div class="filter-group">
              <label for="category">Category:</label>
              <select id="category" [(ngModel)]="selectedCategory" (change)="applyFilters()">
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="books">Books</option>
                <option value="automotive">Automotive</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="priceRange">Price Range:</label>
              <select id="priceRange" [(ngModel)]="selectedPriceRange" (change)="applyFilters()">
                <option value="">Any Price</option>
                <option value="0-1000">Under ₦1,000</option>
                <option value="1000-5000">₦1,000 - ₦5,000</option>
                <option value="5000-10000">₦5,000 - ₦10,000</option>
                <option value="10000-50000">₦10,000 - ₦50,000</option>
                <option value="50000+">Over ₦50,000</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="condition">Condition:</label>
              <select id="condition" [(ngModel)]="selectedCondition" (change)="applyFilters()">
                <option value="">Any Condition</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="sortBy">Sort By:</label>
              <select id="sortBy" [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <app-button 
              variant="secondary" 
              size="sm" 
              (clicked)="clearFilters()"
              [fullWidth]="true"
            >
              Clear Filters
            </app-button>
          </div>
        </aside>

        <!-- Search Results -->
        <main class="search-results">
          <div class="results-header">
            <div class="results-count">
              <span *ngIf="loading$ | async">Searching...</span>
              <span *ngIf="(loading$ | async) === false">
                {{ totalResults$ | async }} results found
              </span>
            </div>
          </div>

          <!-- Loading State -->
          <div class="loading-state" *ngIf="loading$ | async">
            <div class="loading-spinner"></div>
            <p>Searching for products...</p>
          </div>

          <!-- Results Grid -->
          <div class="results-grid" *ngIf="(loading$ | async) === false">
            <div 
              class="product-card" 
              *ngFor="let product of searchResults$ | async"
              [routerLink]="['/marketplace/product', product.id]"
            >
              <div class="product-image">
                <img 
                  [src]="product.images[0] || '/assets/placeholder-product.jpg'" 
                  [alt]="product.title"
                >
                <div class="product-badges">
                  <span class="badge condition" *ngIf="product.condition">{{ product.condition }}</span>
                  <span class="badge featured" *ngIf="product.is_featured">Featured</span>
                </div>
              </div>

              <div class="product-info">
                <h3 class="product-title">{{ product.title }}</h3>
                <p class="product-description">{{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}</p>
                
                <div class="product-meta">
                  <div class="seller-info">
                    <span class="seller-name">{{ product.seller_name }}</span>
                    <span class="location">{{ product.location }}</span>
                  </div>
                  
                  <div class="product-stats">
                    <span class="stat">{{ product.views_count }} views</span>
                    <span class="stat">{{ product.favorites_count }} favorites</span>
                  </div>
                </div>

                <div class="product-footer">
                  <div class="price">{{ product.price | currency:product.currency:'symbol':'1.0-0' }}</div>
                  <app-button 
                    variant="primary" 
                    size="sm"
                    (clicked)="addToCart($event, product)"
                  >
                    Add to Cart
                  </app-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="(loading$ | async) === false && (searchResults$ | async)?.length === 0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>No results found</h3>
            <p>Try adjusting your search terms or filters</p>
            <app-button variant="primary" (clicked)="clearFilters()">
              Clear Filters
            </app-button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .search-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .search-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .search-header p {
      font-size: 1.125rem;
      color: #6b7280;
    }

    .search-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
    }

    /* Search Filters */
    .search-filters {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filter-section h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .filter-group {
      margin-bottom: 1.5rem;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
    }

    .filter-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
      font-size: 0.875rem;
    }

    /* Search Results */
    .search-results {
      min-height: 600px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .results-count {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Results Grid */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      display: flex;
      gap: 0.25rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.condition {
      background: #10b981;
      color: white;
    }

    .badge.featured {
      background: #f59e0b;
      color: white;
    }

    .product-info {
      padding: 1rem;
    }

    .product-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .product-description {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .seller-info {
      display: flex;
      flex-direction: column;
    }

    .seller-name {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .location {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .product-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: #6b7280;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .search-content {
        grid-template-columns: 1fr;
      }

      .search-filters {
        order: 2;
      }

      .search-results {
        order: 1;
      }
    }

    @media (max-width: 768px) {
      .search-header h1 {
        font-size: 2rem;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  private marketplaceService = inject(MarketplaceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Observables
  searchResults$ = this.marketplaceService.products$;
  loading$ = this.marketplaceService.loading$;
  totalResults$ = this.marketplaceService.totalProducts$;

  // Search state
  searchQuery = '';
  selectedCategory = '';
  selectedPriceRange = '';
  selectedCondition = '';
  sortBy = 'relevance';

  ngOnInit(): void {
    // Get search query from route
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.performSearch();
    });
  }

  performSearch(): void {
    const filters: SearchFilters = {
      query: this.searchQuery,
      category_id: this.selectedCategory ? parseInt(this.selectedCategory) : undefined,
      condition: this.selectedCondition as 'new' | 'used' | 'refurbished' | undefined,
      sort_by: this.sortBy as 'relevance' | 'price_low' | 'price_high' | 'newest' | 'oldest' | 'popular'
    };

    // Add price range filter
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-');
      if (min) filters.min_price = parseInt(min);
      if (max && max !== '+') filters.max_price = parseInt(max);
    }

    this.marketplaceService.searchProducts(filters);
  }

  applyFilters(): void {
    this.performSearch();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedPriceRange = '';
    this.selectedCondition = '';
    this.sortBy = 'relevance';
    this.performSearch();
  }

  addToCart(event: Event, product: any): void {
    event.preventDefault();
    event.stopPropagation();
    // Add to cart logic would be implemented here
    console.log('Add to cart:', product);
  }
}