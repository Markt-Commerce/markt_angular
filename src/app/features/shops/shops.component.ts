import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';

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
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
          >
          <select [(ngModel)]="selectedCategory" (change)="onFilterChange()">
            <option value="">All Categories</option>
            <option *ngFor="let category of shopCategories" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="trending-shops" *ngIf="trendingShops.length > 0">
        <h2>Trending Shops</h2>
        <div class="shops-grid">
          <div 
            class="shop-card trending" 
            *ngFor="let shop of trendingShops"
            (click)="viewShop(shop.id)"
          >
            <img [src]="shop.profile_picture || '/Logo.png'" [alt]="shop.name">
            <div class="shop-info">
              <h3>{{ shop.name }}</h3>
              <p>{{ shop.description }}</p>
              <div class="shop-stats">
                <span>{{ shop.products_count }} products</span>
                <span>{{ shop.followers_count }} followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="all-shops">
        <h2>All Shops</h2>
        <div class="shops-grid" *ngIf="!loading">
          <div 
            class="shop-card" 
            *ngFor="let shop of shops"
            (click)="viewShop(shop.id)"
          >
            <img [src]="shop.profile_picture || '/Logo.png'" [alt]="shop.name">
            <div class="shop-info">
              <h3>{{ shop.name }}</h3>
              <p>{{ shop.description }}</p>
              <div class="shop-stats">
                <span>{{ shop.products_count }} products</span>
                <span>{{ shop.followers_count }} followers</span>
              </div>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="loading">
          Loading shops...
        </div>

        <div class="empty-state" *ngIf="!loading && shops.length === 0">
          <div class="empty-content">
            <h3>No shops found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>

        <div class="pagination" *ngIf="totalPages > 1">
          <button 
            [disabled]="currentPage === 1"
            (click)="onPageChange(currentPage - 1)"
          >
            Previous
          </button>
          <span>{{ currentPage }} of {{ totalPages }}</span>
          <button 
            [disabled]="currentPage === totalPages"
            (click)="onPageChange(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
  `]
})
export class ShopsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Data properties
  shops: any[] = [];
  trendingShops: any[] = [];
  shopCategories: any[] = [];
  
  // Search and filter properties
  searchQuery = '';
  selectedCategory = '';
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  limit = 12;
  offset = 0;
  
  // State properties
  loading = false;

  ngOnInit(): void {
    this.loadTrendingShops();
    this.loadShopCategories();
    this.loadShops();
  }

  private loadTrendingShops(): void {
    this.apiService.getTrendingShops().subscribe({
      next: (response) => {
        this.trendingShops = response.data || [];
      },
      error: (error) => {
        console.error('Error loading trending shops:', error);
        this.trendingShops = [];
      }
    });
  }

  private loadShopCategories(): void {
    this.apiService.getShopCategories().subscribe({
      next: (response) => {
        this.shopCategories = response.data || [];
      },
      error: (error) => {
        console.error('Error loading shop categories:', error);
        this.shopCategories = [];
      }
    });
  }

  private loadShops(): void {
    this.loading = true;
    
    const params = {
      search: this.searchQuery,
      category: this.selectedCategory,
      limit: this.limit,
      offset: this.offset
    };

    this.apiService.getShops(params).subscribe({
      next: (response) => {
        this.shops = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total_items || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shops:', error);
        this.shops = [];
        this.loading = false;
      }
    });
  }

  onSearchInput(): void {
    this.currentPage = 1;
    this.offset = 0;
    this.loadShops();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.offset = 0;
    this.loadShops();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.loadShops();
  }

  viewShop(shopId: number): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SHOPS.ROOT, shopId]);
  }
} 