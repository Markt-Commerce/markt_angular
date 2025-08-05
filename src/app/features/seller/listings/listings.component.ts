import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  sales: number;
  rating: number;
}

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="listings-container">
      <div class="listings-header">
        <div class="header-content">
          <h1>Product Listings</h1>
          <p>Manage your products and inventory</p>
        </div>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/seller/listings/create']"
        >
          ➕ Add New Product
        </app-button>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search products..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input"
          >
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="statusFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          <select [(ngModel)]="categoryFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
            <option value="sports">Sports</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="onSort()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="sales">Best Selling</option>
          </select>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="bulk-actions" *ngIf="selectedProducts.length > 0">
        <div class="bulk-info">
          <span>{{ selectedProducts.length }} products selected</span>
        </div>
        <div class="bulk-buttons">
          <app-button variant="secondary" size="sm" (clicked)="bulkActivate()">
            Activate
          </app-button>
          <app-button variant="secondary" size="sm" (clicked)="bulkDeactivate()">
            Deactivate
          </app-button>
          <app-button variant="danger" size="sm" (clicked)="bulkDelete()">
            Delete
          </app-button>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        <div class="product-card" *ngFor="let product of filteredProducts">
          <div class="product-checkbox">
            <input 
              type="checkbox" 
              [checked]="isSelected(product.id)"
              (change)="toggleSelection(product.id)"
            >
          </div>

          <div class="product-image">
            <img [src]="product.imageUrl" [alt]="product.name">
            <div class="product-status" [class]="product.status">
              {{ product.status }}
            </div>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-meta">
              <span class="product-category">{{ product.category }}</span>
              <span class="product-stock" [class]="getStockClass(product.stock)">
                Stock: {{ product.stock }}
              </span>
            </div>
            <div class="product-stats">
              <span class="product-sales">{{ product.sales }} sales</span>
              <span class="product-rating">⭐ {{ product.rating.toFixed(1) }}</span>
            </div>
          </div>

          <div class="product-price">
            <span class="price">₦{{ product.price.toLocaleString() }}</span>
          </div>

          <div class="product-actions">
            <app-button 
              variant="secondary" 
              size="sm"
              [outline]="true"
              [routerLink]="['/app/seller/listings/edit', product.id]"
            >
              Edit
            </app-button>
            <app-button 
              variant="secondary" 
              size="sm"
              [outline]="true"
              [routerLink]="['/app/marketplace/product', product.id]"
            >
              View
            </app-button>
            <app-button 
              variant="danger" 
              size="sm"
              [outline]="true"
              (clicked)="deleteProduct(product.id)"
            >
              Delete
            </app-button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredProducts.length === 0">
        <div class="empty-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/seller/listings/create']"
        >
          Add Your First Product
        </app-button>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="filteredProducts.length > 0">
        <app-button 
          variant="secondary" 
          size="sm"
          [outline]="true"
          [disabled]="currentPage === 1"
          (clicked)="previousPage()"
        >
          Previous
        </app-button>
        
        <div class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        
        <app-button 
          variant="secondary" 
          size="sm"
          [outline]="true"
          [disabled]="currentPage === totalPages"
          (clicked)="nextPage()"
        >
          Next
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .listings-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .listings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .header-content p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      flex: 1;
      min-width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: #007bff;
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      background: white;
      min-width: 150px;
    }

    .bulk-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .bulk-info {
      font-weight: 500;
      color: #495057;
    }

    .bulk-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .product-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .product-checkbox {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .product-image {
      position: relative;
      margin-bottom: 1rem;
    }

    .product-image img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-status {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .product-status.active {
      background: #d4edda;
      color: #155724;
    }

    .product-status.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .product-status.draft {
      background: #fff3cd;
      color: #856404;
    }

    .product-info {
      margin-bottom: 1rem;
    }

    .product-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .product-description {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .product-category {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      color: #495057;
    }

    .product-stock {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .product-stock.low {
      color: #dc3545;
    }

    .product-stock.medium {
      color: #ffc107;
    }

    .product-stock.high {
      color: #28a745;
    }

    .product-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .product-price {
      margin-bottom: 1rem;
    }

    .price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #28a745;
    }

    .product-actions {
      display: flex;
      gap: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-info {
      font-weight: 500;
      color: #495057;
    }

    @media (max-width: 768px) {
      .listings-container {
        padding: 1rem;
      }

      .listings-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: auto;
      }

      .filter-controls {
        justify-content: stretch;
      }

      .filter-select {
        min-width: auto;
        flex: 1;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .bulk-actions {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .bulk-buttons {
        justify-content: center;
      }
    }
  `]
})
export class ListingsComponent implements OnInit {
  products: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and long battery life.',
      price: 15000,
      stock: 25,
      status: 'active',
      category: 'electronics',
      imageUrl: 'https://via.placeholder.com/300x200?text=Headphones',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-03T15:30:00Z',
      sales: 45,
      rating: 4.7
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      description: 'Advanced fitness tracking with heart rate monitor and GPS.',
      price: 25000,
      stock: 12,
      status: 'active',
      category: 'electronics',
      imageUrl: 'https://via.placeholder.com/300x200?text=Smart+Watch',
      createdAt: '2025-01-02T09:00:00Z',
      updatedAt: '2025-01-03T14:20:00Z',
      sales: 32,
      rating: 4.5
    },
    {
      id: '3',
      name: 'Ergonomic Laptop Stand',
      description: 'Adjustable laptop stand for better posture and comfort.',
      price: 5000,
      stock: 8,
      status: 'active',
      category: 'home',
      imageUrl: 'https://via.placeholder.com/300x200?text=Laptop+Stand',
      createdAt: '2025-01-01T11:00:00Z',
      updatedAt: '2025-01-02T16:45:00Z',
      sales: 28,
      rating: 4.8
    },
    {
      id: '4',
      name: 'Premium Phone Case',
      description: 'Durable phone case with shock absorption and stylish design.',
      price: 3000,
      stock: 50,
      status: 'active',
      category: 'electronics',
      imageUrl: 'https://via.placeholder.com/300x200?text=Phone+Case',
      createdAt: '2025-01-01T12:00:00Z',
      updatedAt: '2025-01-03T10:15:00Z',
      sales: 25,
      rating: 4.3
    },
    {
      id: '5',
      name: 'USB-C Fast Charging Cable',
      description: 'High-speed charging cable compatible with all USB-C devices.',
      price: 1500,
      stock: 3,
      status: 'active',
      category: 'electronics',
      imageUrl: 'https://via.placeholder.com/300x200?text=USB+Cable',
      createdAt: '2025-01-02T08:00:00Z',
      updatedAt: '2025-01-03T09:30:00Z',
      sales: 22,
      rating: 4.6
    }
  ];

  filteredProducts: Product[] = [];
  selectedProducts: string[] = [];
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';
  sortBy = 'newest';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  ngOnInit(): void {
    this.loadProducts();
    this.applyFilters();
  }

  private loadProducts(): void {
    // TODO: Load products from API
    console.log('Loading products...');
    this.filteredProducts = [...this.products];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  onSort(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(product => product.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(product => product.category === this.categoryFilter);
    }

    // Sort
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'sales':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
    }

    this.filteredProducts = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  toggleSelection(productId: string): void {
    const index = this.selectedProducts.indexOf(productId);
    if (index > -1) {
      this.selectedProducts.splice(index, 1);
    } else {
      this.selectedProducts.push(productId);
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts.includes(productId);
  }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'low';
    if (stock <= 15) return 'medium';
    return 'high';
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      // TODO: Delete product via API
      this.products = this.products.filter(p => p.id !== productId);
      this.applyFilters();
    }
  }

  bulkActivate(): void {
    // TODO: Bulk activate products via API
    console.log('Activating products:', this.selectedProducts);
    this.selectedProducts = [];
  }

  bulkDeactivate(): void {
    // TODO: Bulk deactivate products via API
    console.log('Deactivating products:', this.selectedProducts);
    this.selectedProducts = [];
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selectedProducts.length} products?`)) {
      // TODO: Bulk delete products via API
      this.products = this.products.filter(p => !this.selectedProducts.includes(p.id));
      this.selectedProducts = [];
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
} 