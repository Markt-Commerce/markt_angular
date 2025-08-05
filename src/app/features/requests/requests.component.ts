import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  buyerName: string;
  buyerAvatar: string;
  createdAt: string;
  expiresAt: string;
  offersCount: number;
  viewsCount: number;
  tags: string[];
  location: string;
  urgency: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="requests-container">
      <div class="requests-header">
        <div class="header-content">
          <h1>Buyer Requests</h1>
          <p>Find and respond to buyer requests for products</p>
        </div>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/requests/create']"
        >
          ➕ Create Request
        </app-button>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search requests by title, description, or category..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input"
          >
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="statusFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select [(ngModel)]="categoryFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
            <option value="sports">Sports</option>
            <option value="books">Books</option>
            <option value="beauty">Beauty</option>
          </select>

          <select [(ngModel)]="urgencyFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="onSort()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="budget-high">Budget: High to Low</option>
            <option value="budget-low">Budget: Low to High</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <!-- Requests Grid -->
      <div class="requests-grid">
        <div class="request-card" *ngFor="let request of filteredRequests">
          <div class="request-header">
            <div class="request-meta">
              <span class="request-status" [class]="request.status">
                {{ getStatusLabel(request.status) }}
              </span>
              <span class="request-urgency" [class]="request.urgency">
                {{ getUrgencyLabel(request.urgency) }}
              </span>
            </div>
            <div class="request-stats">
              <span class="stat-item">
                <span class="stat-icon">👁️</span>
                {{ request.viewsCount }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ request.offersCount }}
              </span>
            </div>
          </div>

          <div class="request-content">
            <h3 class="request-title">{{ request.title }}</h3>
            <p class="request-description">{{ request.description }}</p>
            
            <div class="request-details">
              <div class="detail-item">
                <strong>Budget:</strong>
                <span>₦{{ request.budget.min.toLocaleString() }} - ₦{{ request.budget.max.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <strong>Category:</strong>
                <span>{{ request.category }}</span>
              </div>
              <div class="detail-item">
                <strong>Location:</strong>
                <span>{{ request.location }}</span>
              </div>
            </div>

            <div class="request-tags">
              <span class="tag" *ngFor="let tag of request.tags">{{ tag }}</span>
            </div>
          </div>

          <div class="request-footer">
            <div class="buyer-info">
              <img [src]="request.buyerAvatar" [alt]="request.buyerName" class="buyer-avatar">
              <span class="buyer-name">{{ request.buyerName }}</span>
            </div>
            
            <div class="request-actions">
              <app-button 
                variant="secondary" 
                size="sm"
                [outline]="true"
                [routerLink]="['/app/requests', request.id]"
              >
                View Details
              </app-button>
              <app-button 
                variant="primary" 
                size="sm"
                [routerLink]="['/app/offers/create', request.id]"
                *ngIf="request.status === 'open'"
              >
                Make Offer
              </app-button>
            </div>
          </div>

          <div class="request-timeline">
            <span class="created-date">Posted {{ formatDate(request.createdAt) }}</span>
            <span class="expires-date" *ngIf="request.status === 'open'">
              Expires {{ formatDate(request.expiresAt) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredRequests.length === 0">
        <div class="empty-icon">📋</div>
        <h3>No requests found</h3>
        <p>Try adjusting your search or filters</p>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/requests/create']"
        >
          Create Your First Request
        </app-button>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="filteredRequests.length > 0">
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
    .requests-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .requests-header {
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

    .requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .request-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .request-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .request-meta {
      display: flex;
      gap: 0.5rem;
    }

    .request-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .request-status.open {
      background: #d4edda;
      color: #155724;
    }

    .request-status.in_progress {
      background: #cce5ff;
      color: #004085;
    }

    .request-status.completed {
      background: #d1ecf1;
      color: #0c5460;
    }

    .request-status.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .request-urgency {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .request-urgency.low {
      background: #d4edda;
      color: #155724;
    }

    .request-urgency.medium {
      background: #fff3cd;
      color: #856404;
    }

    .request-urgency.high {
      background: #f8d7da;
      color: #721c24;
    }

    .request-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .stat-icon {
      font-size: 1rem;
    }

    .request-content {
      margin-bottom: 1.5rem;
    }

    .request-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .request-description {
      margin: 0 0 1rem 0;
      color: #6c757d;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .request-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .detail-item strong {
      color: #495057;
    }

    .request-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      background: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .request-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .buyer-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .buyer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .buyer-name {
      font-size: 0.9rem;
      color: #495057;
      font-weight: 500;
    }

    .request-actions {
      display: flex;
      gap: 0.5rem;
    }

    .request-timeline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #6c757d;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
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
      .requests-container {
        padding: 1rem;
      }

      .requests-header {
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

      .requests-grid {
        grid-template-columns: 1fr;
      }

      .request-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .request-actions {
        justify-content: center;
      }
    }
  `]
})
export class RequestsComponent implements OnInit {
  requests: BuyerRequest[] = [
    {
      id: '1',
      title: 'Looking for Wireless Bluetooth Headphones',
      description: 'I need high-quality wireless headphones with noise cancellation. Budget is flexible for the right product.',
      category: 'electronics',
      budget: { min: 10000, max: 25000 },
      status: 'open',
      buyerName: 'John Doe',
      buyerAvatar: 'https://via.placeholder.com/32x32?text=JD',
      createdAt: '2025-01-03T10:00:00Z',
      expiresAt: '2025-01-10T10:00:00Z',
      offersCount: 5,
      viewsCount: 23,
      tags: ['wireless', 'bluetooth', 'noise-cancellation'],
      location: 'Lagos, Nigeria',
      urgency: 'medium'
    },
    {
      id: '2',
      title: 'Need Smart Fitness Watch',
      description: 'Looking for a smart fitness watch with heart rate monitor and GPS tracking.',
      category: 'electronics',
      budget: { min: 15000, max: 35000 },
      status: 'in_progress',
      buyerName: 'Jane Smith',
      buyerAvatar: 'https://via.placeholder.com/32x32?text=JS',
      createdAt: '2025-01-02T14:30:00Z',
      expiresAt: '2025-01-09T14:30:00Z',
      offersCount: 8,
      viewsCount: 45,
      tags: ['fitness', 'smartwatch', 'gps'],
      location: 'Abuja, Nigeria',
      urgency: 'high'
    },
    {
      id: '3',
      title: 'Ergonomic Laptop Stand',
      description: 'Need a sturdy laptop stand for better posture while working from home.',
      category: 'home',
      budget: { min: 3000, max: 8000 },
      status: 'open',
      buyerName: 'Mike Johnson',
      buyerAvatar: 'https://via.placeholder.com/32x32?text=MJ',
      createdAt: '2025-01-03T09:15:00Z',
      expiresAt: '2025-01-10T09:15:00Z',
      offersCount: 3,
      viewsCount: 12,
      tags: ['ergonomic', 'laptop', 'work-from-home'],
      location: 'Port Harcourt, Nigeria',
      urgency: 'low'
    },
    {
      id: '4',
      title: 'Premium Phone Case for iPhone 15',
      description: 'Looking for a premium protective case with good grip and wireless charging compatibility.',
      category: 'electronics',
      budget: { min: 5000, max: 15000 },
      status: 'completed',
      buyerName: 'Sarah Wilson',
      buyerAvatar: 'https://via.placeholder.com/32x32?text=SW',
      createdAt: '2025-01-01T16:45:00Z',
      expiresAt: '2025-01-08T16:45:00Z',
      offersCount: 12,
      viewsCount: 67,
      tags: ['iphone', 'protective', 'wireless-charging'],
      location: 'Kano, Nigeria',
      urgency: 'medium'
    },
    {
      id: '5',
      title: 'USB-C Fast Charging Cable Set',
      description: 'Need a set of high-quality USB-C cables for fast charging multiple devices.',
      category: 'electronics',
      budget: { min: 2000, max: 5000 },
      status: 'open',
      buyerName: 'David Brown',
      buyerAvatar: 'https://via.placeholder.com/32x32?text=DB',
      createdAt: '2025-01-03T11:20:00Z',
      expiresAt: '2025-01-10T11:20:00Z',
      offersCount: 2,
      viewsCount: 8,
      tags: ['usb-c', 'fast-charging', 'cables'],
      location: 'Ibadan, Nigeria',
      urgency: 'low'
    }
  ];

  filteredRequests: BuyerRequest[] = [];
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';
  urgencyFilter = '';
  sortBy = 'newest';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  ngOnInit(): void {
    this.loadRequests();
    this.applyFilters();
  }

  private loadRequests(): void {
    // TODO: Load requests from API
    console.log('Loading requests...');
    this.filteredRequests = [...this.requests];
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
    let filtered = [...this.requests];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.category.toLowerCase().includes(query) ||
        request.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(request => request.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(request => request.category === this.categoryFilter);
    }

    // Urgency filter
    if (this.urgencyFilter) {
      filtered = filtered.filter(request => request.urgency === this.urgencyFilter);
    }

    // Sort
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'budget-high':
        filtered.sort((a, b) => b.budget.max - a.budget.max);
        break;
      case 'budget-low':
        filtered.sort((a, b) => a.budget.min - b.budget.min);
        break;
      case 'popular':
        filtered.sort((a, b) => b.viewsCount - a.viewsCount);
        break;
    }

    this.filteredRequests = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getUrgencyLabel(urgency: string): string {
    const urgencyMap: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };
    return urgencyMap[urgency] || urgency;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
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