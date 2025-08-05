import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MarketplaceService, Product, SearchFilters } from '../../core/services/marketplace.service';
import { CartService } from '../../core/services/cart.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="marketplace-container">
      <!-- Header -->
      <div class="marketplace-header">
        <div class="header-content">
          <h1>Marketplace</h1>
          <p>Discover amazing products from trusted sellers</p>
        </div>
      </div>

      <div class="marketplace-content">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
          <div class="filters-header">
            <h3>Filters</h3>
            <button class="clear-filters" (click)="clearFilters()" *ngIf="hasActiveFilters">
              Clear All
            </button>
          </div>

          <!-- Search -->
          <div class="filter-section">
            <h4>Search</h4>
            <app-input
              id="search"
              name="search"
              type="text"
              placeholder="Search products..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="applyFilters()"
              [fullWidth]="true"
            ></app-input>
          </div>

          <!-- Categories -->
          <div class="filter-section">
            <h4>Categories</h4>
            <div class="category-list">
              <label class="category-item" *ngFor="let category of categories$ | async">
                <input 
                  type="checkbox" 
                  [value]="category.id"
                  [checked]="selectedCategories.includes(category.id)"
                  (change)="onCategoryChange(category.id, $event)"
                >
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">({{ category.products_count }})</span>
              </label>
            </div>
          </div>

          <!-- Price Range -->
          <div class="filter-section">
            <h4>Price Range</h4>
            <div class="price-inputs">
              <app-input
                id="minPrice"
                name="minPrice"
                type="number"
                placeholder="Min Price"
                [(ngModel)]="minPrice"
                [fullWidth]="true"
              ></app-input>
              <app-input
                id="maxPrice"
                name="maxPrice"
                type="number"
                placeholder="Max Price"
                [(ngModel)]="maxPrice"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>

          <!-- Condition -->
          <div class="filter-section">
            <h4>Condition</h4>
            <div class="condition-options">
              <label class="condition-item">
                <input 
                  type="checkbox" 
                  value="new"
                  [checked]="selectedConditions.includes('new')"
                  (change)="onConditionChange('new', $event)"
                >
                <span>New</span>
              </label>
              <label class="condition-item">
                <input 
                  type="checkbox" 
                  value="used"
                  [checked]="selectedConditions.includes('used')"
                  (change)="onConditionChange('used', $event)"
                >
                <span>Used</span>
              </label>
              <label class="condition-item">
                <input 
                  type="checkbox" 
                  value="refurbished"
                  [checked]="selectedConditions.includes('refurbished')"
                  (change)="onConditionChange('refurbished', $event)"
                >
                <span>Refurbished</span>
              </label>
            </div>
          </div>

          <!-- Location -->
          <div class="filter-section">
            <h4>Location</h4>
            <app-input
              id="location"
              name="location"
              type="text"
              placeholder="Enter location..."
              [(ngModel)]="location"
              [fullWidth]="true"
            ></app-input>
          </div>

          <!-- Apply Filters -->
          <div class="filter-actions">
            <app-button
              variant="primary"
              [fullWidth]="true"
              (clicked)="applyFilters()"
            >
              Apply Filters
            </app-button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="results-info">
              <span *ngIf="loading$ | async">Loading...</span>
              <span *ngIf="!(loading$ | async)">
                {{ totalProducts$ | async }} products found
              </span>
            </div>

            <div class="sort-controls">
              <label for="sort">Sort by:</label>
              <select id="sort" [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <div class="view-controls">
              <button 
                class="view-toggle" 
                [class.active]="viewMode === 'grid'"
                (click)="setViewMode('grid')"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                class="view-toggle" 
                [class.active]="viewMode === 'list'"
                (click)="setViewMode('list')"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="products-container" [class.list-view]="viewMode === 'list'">
            <div 
              class="product-card" 
              *ngFor="let product of products$ | async; trackBy: trackByProduct"
              [routerLink]="['/marketplace/product', product.id]"
            >
              <div class="product-image">
                <img 
                  [src]="product.images[0] || '/assets/placeholder-product.jpg'" 
                  [alt]="product.title"
                  loading="lazy"
                >
                <div class="product-badges">
                  <span class="badge condition" *ngIf="product.condition">{{ product.condition }}</span>
                  <span class="badge featured" *ngIf="product.is_featured">Featured</span>
                  <span class="badge negotiable" *ngIf="product.is_negotiable">Negotiable</span>
                </div>
              </div>

              <div class="product-info">
                <h3 class="product-title">{{ product.title }}</h3>
                <p class="product-description">{{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}</p>
                
                <div class="product-meta">
                  <div class="seller-info">
                    <img 
                      [src]="product.seller_avatar || '/assets/placeholder-avatar.jpg'" 
                      [alt]="product.seller_name"
                      class="seller-avatar"
                    >
                    <span class="seller-name">{{ product.seller_name }}</span>
                  </div>
                  
                  <div class="product-stats">
                    <span class="stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      {{ product.views_count }}
                    </span>
                    <span class="stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {{ product.favorites_count }}
                    </span>
                  </div>
                </div>

                <div class="product-footer">
                  <div class="price-info">
                    <span class="price">{{ product.price | currency:product.currency:'symbol':'1.0-0' }}</span>
                    <span class="location">{{ product.location }}</span>
                  </div>
                  
                  <div class="product-actions">
                    <app-button
                      variant="secondary"
                      size="sm"
                      (clicked)="addToCart($event, product)"
                      [disabled]="cartService.isProductInCart(product.id)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      {{ cartService.isProductInCart(product.id) ? 'In Cart' : 'Add to Cart' }}
                    </app-button>
                    
                    <button 
                      class="favorite-btn"
                      [class.favorited]="product.is_favorited"
                      (click)="toggleFavorite($event, product)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div class="loading-state" *ngIf="loading$ | async">
            <div class="loading-spinner"></div>
            <p>Loading products...</p>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!(loading$ | async) && (products$ | async) && (products$ | async)!.length === 0">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
            <app-button variant="primary" (clicked)="clearFilters()">
              Clear Filters
            </app-button>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="(products$ | async) && (products$ | async)!.length > 0">
            <button 
              class="pagination-btn"
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)"
            >
              Previous
            </button>
            
            <div class="page-numbers">
              <button 
                class="page-btn"
                *ngFor="let page of getPageNumbers()"
                [class.active]="page === currentPage"
                (click)="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              [disabled]="currentPage >= totalPages"
              (click)="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-container {
      min-height: 100vh;
      background: #f9fafb;
    }

    /* Header */
    .marketplace-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      text-align: center;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .header-content p {
      font-size: 1.125rem;
      opacity: 0.9;
    }

    /* Content Layout */
    .marketplace-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
    }

    /* Filters Sidebar */
    .filters-sidebar {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filters-header h3 {
      margin: 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .clear-filters {
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: underline;
    }

    .filter-section {
      margin-bottom: 2rem;
    }

    .filter-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1rem;
      font-weight: 600;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    }

    .category-item:hover {
      background: #f3f4f6;
    }

    .category-item input[type="checkbox"] {
      margin: 0;
    }

    .category-name {
      flex: 1;
      font-size: 0.875rem;
      color: #374151;
    }

    .category-count {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .price-inputs {
      display: flex;
      gap: 0.5rem;
    }

    .condition-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .condition-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    }

    .condition-item:hover {
      background: #f3f4f6;
    }

    .condition-item input[type="checkbox"] {
      margin: 0;
    }

    .filter-actions {
      margin-top: 2rem;
    }

    /* Main Content */
    .main-content {
      min-height: 600px;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .results-info {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-controls label {
      font-size: 0.875rem;
      color: #374151;
    }

    .sort-controls select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
    }

    .view-controls {
      display: flex;
      gap: 0.25rem;
    }

    .view-toggle {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-toggle:hover {
      background: #f3f4f6;
    }

    .view-toggle.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    /* Products Grid */
    .products-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .products-container.list-view {
      grid-template-columns: 1fr;
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

    .list-view .product-card {
      display: grid;
      grid-template-columns: 200px 1fr;
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .list-view .product-image {
      height: 100%;
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

    .badge.negotiable {
      background: #3b82f6;
      color: white;
    }

    .product-info {
      padding: 1rem;
    }

    .product-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      line-height: 1.4;
    }

    .product-description {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .seller-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }

    .seller-name {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .product-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-info {
      display: flex;
      flex-direction: column;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }

    .location {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .product-actions {
      display: flex;
      gap: 0.5rem;
    }

    .favorite-btn {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      color: #6b7280;
    }

    .favorite-btn:hover {
      background: #f3f4f6;
    }

    .favorite-btn.favorited {
      background: #fef2f2;
      border-color: #ef4444;
      color: #ef4444;
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

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .pagination-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    .page-btn {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 40px;
    }

    .page-btn:hover {
      background: #f3f4f6;
    }

    .page-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .marketplace-content {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        order: 2;
      }

      .main-content {
        order: 1;
      }
    }

    @media (max-width: 768px) {
      .toolbar {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .sort-controls {
        justify-content: space-between;
      }

      .products-container {
        grid-template-columns: 1fr;
      }

      .list-view .product-card {
        grid-template-columns: 1fr;
      }

      .list-view .product-image {
        height: 200px;
      }
    }
  `]
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  private marketplaceService = inject(MarketplaceService);
  public cartService = inject(CartService);
  private appStateService = inject(AppStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Observables
  products$ = this.marketplaceService.products$;
  categories$ = this.marketplaceService.categories$;
  loading$ = this.marketplaceService.loading$;
  totalProducts$ = this.marketplaceService.totalProducts$;

  // Filter state
  searchQuery = '';
  selectedCategories: number[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedConditions: string[] = [];
  location = '';
  sortBy = 'relevance';
  viewMode: 'grid' | 'list' = 'grid';
  currentPage = 1;
  totalPages = 1;

  // Computed properties
  get hasActiveFilters(): boolean {
    return !!this.searchQuery || 
           this.selectedCategories.length > 0 || 
           this.minPrice !== null || 
           this.maxPrice !== null || 
           this.selectedConditions.length > 0 || 
           !!this.location;
  }

  ngOnInit(): void {
    // Load initial data
    this.loadProducts();
    this.loadCategories();

    // Subscribe to route changes
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.currentPage = parseInt(params['page']) || 1;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    const filters: SearchFilters = {
      query: this.searchQuery,
      category_id: this.selectedCategories.length === 1 ? this.selectedCategories[0] : undefined,
      min_price: this.minPrice || undefined,
      max_price: this.maxPrice || undefined,
      condition: this.selectedConditions.length === 1 ? this.selectedConditions[0] as any : undefined,
      location: this.location || undefined,
      sort_by: this.sortBy as any,
      page: this.currentPage,
      per_page: 12
    };

    this.marketplaceService.searchProducts(filters).pipe(
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.totalPages = response.pagination?.total_pages || 1;
    });
  }

  loadCategories(): void {
    this.marketplaceService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onCategoryChange(categoryId: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    
    if (checked) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    }
  }

  onConditionChange(condition: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    
    if (checked) {
      this.selectedConditions.push(condition);
    } else {
      this.selectedConditions = this.selectedConditions.filter(c => c !== condition);
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
    this.updateUrl();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategories = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedConditions = [];
    this.location = '';
    this.sortBy = 'relevance';
    this.currentPage = 1;
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
    this.updateUrl();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  updateUrl(): void {
    const queryParams: any = {};
    
    if (this.searchQuery) queryParams.q = this.searchQuery;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.selectedCategories.length > 0) queryParams.categories = this.selectedCategories.join(',');
    if (this.minPrice) queryParams.minPrice = this.minPrice;
    if (this.maxPrice) queryParams.maxPrice = this.maxPrice;
    if (this.selectedConditions.length > 0) queryParams.conditions = this.selectedConditions.join(',');
    if (this.location) queryParams.location = this.location;
    if (this.sortBy !== 'relevance') queryParams.sort = this.sortBy;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  addToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();

    this.cartService.addToCart({
      product_id: product.id,
      quantity: 1
    }).subscribe({
      next: () => {
        this.appStateService.addNotification({
          type: 'success',
          title: 'Added to Cart',
          message: `${product.title} has been added to your cart.`
        });
      },
      error: (error) => {
        console.error('Add to cart error:', error);
        this.appStateService.addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to add item to cart. Please try again.'
        });
      }
    });
  }

  toggleFavorite(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();

    if (product.is_favorited) {
      this.marketplaceService.removeFromFavorites(product.id).subscribe({
        next: () => {
          product.is_favorited = false;
          product.favorites_count--;
          this.appStateService.addNotification({
            type: 'success',
            title: 'Removed from Favorites',
            message: `${product.title} has been removed from your favorites.`
          });
        },
        error: (error) => {
          console.error('Remove from favorites error:', error);
        }
      });
    } else {
      this.marketplaceService.addToFavorites(product.id).subscribe({
        next: () => {
          product.is_favorited = true;
          product.favorites_count++;
          this.appStateService.addNotification({
            type: 'success',
            title: 'Added to Favorites',
            message: `${product.title} has been added to your favorites.`
          });
        },
        error: (error) => {
          console.error('Add to favorites error:', error);
        }
      });
    }
  }

  trackByProduct(index: number, product: Product): number {
    return product.id;
  }
} 