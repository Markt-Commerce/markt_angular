import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopService, Shop, ShopCategory } from '../../domains/authentication';
import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shops-container">
      <div class="shops-header">
        <h1>Discover Shops</h1>
        <div class="search-filters">
          <input
            type="text"
            placeholder="Search shops..."
            [value]="searchQuery()"
            (input)="
              searchQuery.set($any($event.target).value); onSearchInput()
            "
          />
          <select
            [value]="selectedCategory()"
            (change)="
              selectedCategory.set($any($event.target).value); onFilterChange()
            "
          >
            <option value="">All Categories</option>
            <option
              *ngFor="let category of shopCategories()"
              [value]="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="trending-shops" *ngIf="trendingShops().length > 0">
        <h2>Trending Shops</h2>
        <div class="shops-grid">
          <div
            class="shop-card trending"
            *ngFor="let shop of trendingShops()"
            (click)="viewShop(shop.id)"
          >
            <img
              [src]="shop.user.profile_picture || '/Logo.png'"
              [alt]="shop.shopName"
            />
            <div class="shop-info">
              <h3>{{ shop.shopName }}</h3>
              <p>{{ shop.description }}</p>
              <div class="shop-stats">
                <span>{{ shop.stats?.product_count || 0 }} products</span>
                <span>{{ shop.stats?.follower_count || 0 }} followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="all-shops">
        <h2>All Shops</h2>
        <div class="shops-grid" *ngIf="!loading()">
          <div
            class="shop-card"
            *ngFor="let shop of shops()"
            (click)="viewShop(shop.id)"
          >
            <img
              [src]="shop.user.profile_picture || '/Logo.png'"
              [alt]="shop.shopName"
            />
            <div class="shop-info">
              <h3>{{ shop.shopName }}</h3>
              <p>{{ shop.description }}</p>
              <div class="shop-stats">
                <span>{{ shop.stats?.product_count || 0 }} products</span>
                <span>{{ shop.stats?.follower_count || 0 }} followers</span>
              </div>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="loading()">Loading shops...</div>

        <div class="empty-state" *ngIf="!loading() && shops().length === 0">
          <div class="empty-content">
            <h3>No shops found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>

        <div class="pagination" *ngIf="totalPages() > 1">
          <button
            [disabled]="currentPage() === 1"
            (click)="onPageChange(currentPage() - 1)"
          >
            Previous
          </button>
          <span>{{ currentPage() }} of {{ totalPages() }}</span>
          <button
            [disabled]="currentPage() === totalPages()"
            (click)="onPageChange(currentPage() + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .shops-container {
        padding: 20px;
      }
      .shops-header {
        margin-bottom: 30px;
      }
      .search-filters {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      .shops-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .shop-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .shop-card:hover {
        transform: translateY(-2px);
      }
      .shop-card.trending {
        border-color: #ff6b6b;
        background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
        color: white;
      }
      .shop-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 4px;
      }
      .shop-info {
        margin-top: 10px;
      }
      .shop-stats {
        display: flex;
        gap: 15px;
        margin-top: 10px;
        font-size: 0.9em;
      }
      .pagination {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 30px;
      }
      .empty-state {
        text-align: center;
        padding: 40px 20px;
      }
      .empty-content h3 {
        margin: 0 0 10px 0;
        color: #333;
      }
      .empty-content p {
        margin: 0;
        color: #666;
      }
    `,
  ],
})
export class ShopsComponent implements OnInit {
  private shopService = inject(ShopService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Signals for reactive state management
  shops = signal<Shop[]>([]);
  trendingShops = signal<Shop[]>([]);
  shopCategories = signal<ShopCategory[]>([]);
  loading = signal<boolean>(false);

  // Search and filter properties
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalResults = signal<number>(0);
  perPage = 12;

  ngOnInit(): void {
    this.loadTrendingShops();
    this.loadShopCategories();
    this.loadShops();
  }

  /**
   * Load trending shops
   */
  private loadTrendingShops(): void {
    this.shopService.getTrendingShops(10).subscribe({
      next: (shops) => {
        this.trendingShops.set(shops);
      },
      error: (error) => {
        console.error('Error loading trending shops:', error);
        this.trendingShops.set([]);
      },
    });
  }

  /**
   * Load shop categories for filtering
   */
  private loadShopCategories(): void {
    this.shopService.getShopCategories().subscribe({
      next: (categories) => {
        this.shopCategories.set(categories);
      },
      error: (error) => {
        console.error('Error loading shop categories:', error);
        this.shopCategories.set([]);
      },
    });
  }

  /**
   * Load shops with search and filters
   */
  private loadShops(): void {
    this.loading.set(true);

    const params = {
      page: this.currentPage(),
      per_page: this.perPage,
      search: this.searchQuery() || undefined,
      category: this.selectedCategory() || undefined,
    };

    this.shopService
      .searchShops(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.shops.set(response.items);
          this.totalResults.set(response.pagination.total_items);
          this.totalPages.set(response.pagination.total_pages);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading shops:', error);
          this.shops.set([]);
          this.loading.set(false);
        },
      });
  }

  /**
   * Handle search input
   */
  onSearchInput(): void {
    this.currentPage.set(1);
    this.loadShops();
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadShops();
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadShops();
  }

  viewShop(shopId: number): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SHOPS.ROOT, shopId]);
  }
}
