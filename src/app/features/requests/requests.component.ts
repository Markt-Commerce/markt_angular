import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSort, 
  faPlus, 
  faEye,
  faHeart,
  faTimesCircle,
  faUser,
  faMapMarkerAlt,
  faClock,
  faTag,
  faDollarSign,
  faThumbsUp,
  faThumbsDown,
  faFlag,
  faTrash,
  faEdit,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faStar,
  faStore,
  faFileText,
  faCalendar,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { MarketplaceService } from '../../core/services/marketplace.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Buyer Requests</h1>
          <p class="text-gray-500">Find and respond to buyer requests</p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button 
            routerLink="/app/requests/create"
            class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            <fa-icon [icon]="faPlus" class="w-4 h-4 mr-2"></fa-icon>
            Create Request
          </button>
        </div>
      </div>

      <!-- Request Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <fa-icon [icon]="faFileText" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Requests</p>
              <p class="text-2xl font-semibold text-gray-900">{{ requestStats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <fa-icon [icon]="faCheck" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Open</p>
              <p class="text-2xl font-semibold text-gray-900">{{ requestStats.open }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <fa-icon [icon]="faStar" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Fulfilled</p>
              <p class="text-2xl font-semibold text-gray-900">{{ requestStats.fulfilled }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-gray-100 text-gray-600">
              <fa-icon [icon]="faClock" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Expired</p>
              <p class="text-2xl font-semibold text-gray-900">{{ requestStats.expired }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
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
                placeholder="Search requests..."
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
              >
            </div>
          </div>

          <!-- Category Filter -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Category:</label>
            <select 
              [(ngModel)]="categoryFilter"
              (change)="onCategoryFilterChange()"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-markt-primary focus:border-markt-primary sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Status:</label>
            <select 
              [(ngModel)]="statusFilter"
              (change)="onStatusFilterChange()"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-markt-primary focus:border-markt-primary sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CLOSED">Closed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <!-- Budget Filter -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Budget:</label>
            <select 
              [(ngModel)]="budgetFilter"
              (change)="onBudgetFilterChange()"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-markt-primary focus:border-markt-primary sm:text-sm rounded-md"
            >
              <option value="">Any Budget</option>
              <option value="0-1000">Under ₦1,000</option>
              <option value="1000-5000">₦1,000 - ₦5,000</option>
              <option value="5000-10000">₦5,000 - ₦10,000</option>
              <option value="10000-50000">₦10,000 - ₦50,000</option>
              <option value="50000+">Over ₦50,000</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Sort by:</label>
            <select 
              [(ngModel)]="sortBy"
              (change)="onSortChange()"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-markt-primary focus:border-markt-primary sm:text-sm rounded-md"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="budget_desc">Highest Budget</option>
              <option value="budget_asc">Lowest Budget</option>
              <option value="expires_at_asc">Expiring Soon</option>
              <option value="upvotes_desc">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Requests List -->
      <div class="space-y-4">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && requests.length === 0" class="text-center py-12">
          <fa-icon [icon]="faFileText" class="w-16 h-16 text-gray-400 mx-auto mb-4"></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No requests found</h2>
          <p class="text-gray-500 mb-6">No buyer requests match your current filters.</p>
          <button 
            (click)="clearFilters()"
            class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>

        <!-- Requests -->
        <div *ngFor="let request of requests" class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Request Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img 
                  [src]="request.buyer?.profile_picture_url || '/assets/images/default-avatar.png'" 
                  [alt]="request.buyer?.username"
                  class="w-10 h-10 rounded-full object-cover"
                >
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="font-medium text-gray-900">{{ request.buyer?.username }}</h3>
                    <span *ngIf="request.buyer?.verified" class="text-blue-500">
                      <fa-icon [icon]="faStar" class="w-4 h-4"></fa-icon>
                    </span>
                  </div>
                  <div class="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{{ formatTimestamp(request.created_at) }}</span>
                    <span>•</span>
                    <span class="flex items-center">
                      <fa-icon [icon]="faMapMarkerAlt" class="w-3 h-3 mr-1"></fa-icon>
                      {{ request.buyer?.location || 'Location not specified' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="getRequestStatusClasses(request.status)"
                >
                  {{ getRequestStatusDisplay(request.status) }}
                </span>
                <button 
                  [routerLink]="['/app/requests', request.id]"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="View Details"
                >
                  <fa-icon [icon]="faEye" class="w-4 h-4"></fa-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Request Content -->
          <div class="px-6 py-4">
            <h4 class="text-lg font-medium text-gray-900 mb-2">{{ request.title }}</h4>
            <p class="text-gray-600 mb-4">{{ request.description }}</p>
            
            <!-- Request Details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="flex items-center space-x-2">
                <fa-icon [icon]="faDollarSign" class="w-4 h-4 text-gray-400"></fa-icon>
                <span class="text-sm text-gray-600">
                  Budget: <span class="font-medium text-gray-900">{{ request.budget | currency:'NGN' }}</span>
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <fa-icon [icon]="faCalendar" class="w-4 h-4 text-gray-400"></fa-icon>
                <span class="text-sm text-gray-600">
                  Expires: <span class="font-medium text-gray-900">{{ formatDate(request.expires_at) }}</span>
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <fa-icon [icon]="faMessageCircle" class="w-4 h-4 text-gray-400"></fa-icon>
                <span class="text-sm text-gray-600">
                  Offers: <span class="font-medium text-gray-900">{{ request.offers?.length || 0 }}</span>
                </span>
              </div>
            </div>

            <!-- Categories -->
            <div *ngIf="request.categories && request.categories.length > 0" class="mb-4">
              <div class="flex flex-wrap gap-2">
                <span 
                  *ngFor="let category of request.categories"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {{ category.name }}
                </span>
              </div>
            </div>

            <!-- Request Images -->
            <div *ngIf="request.images && request.images.length > 0" class="mb-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <img 
                  *ngFor="let image of request.images.slice(0, 4)"
                  [src]="image.url" 
                  [alt]="request.title"
                  class="w-full h-24 object-cover rounded-lg"
                >
              </div>
            </div>
          </div>

          <!-- Request Actions -->
          <div class="px-6 py-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-6">
                <button 
                  (click)="upvoteRequest(request)"
                  class="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                  [class.text-blue-500]="request.is_upvoted"
                >
                  <fa-icon [icon]="faThumbsUp" class="w-4 h-4"></fa-icon>
                  <span class="text-sm">{{ request.upvotes }}</span>
                </button>
                
                <button 
                  (click)="viewOffers(request)"
                  class="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                >
                  <fa-icon [icon]="faMessageCircle" class="w-4 h-4"></fa-icon>
                  <span class="text-sm">{{ request.offers?.length || 0 }} offers</span>
                </button>
              </div>
              
              <div class="flex items-center space-x-3">
                <button 
                  *ngIf="isSeller && request.status === 'OPEN'"
                  (click)="makeOffer(request)"
                  class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors text-sm font-medium"
                >
                  Make Offer
                </button>
                <button 
                  [routerLink]="['/app/requests', request.id]"
                  class="text-markt-primary hover:text-markt-secondary font-medium text-sm"
                >
                  View Details
                  <fa-icon [icon]="faArrowRight" class="w-3 h-3 ml-1"></fa-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="flex items-center justify-center">
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
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RequestsComponent implements OnInit {
  private requestService = inject(RequestService);
  private authService = inject(AuthService);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);

  // Icons
  faSearch = faSearch;
  faFilter = faFilter;
  faSort = faSort;
  faPlus = faPlus;
  faEye = faEye;
  faHeart = faHeart;
  faMessageCircle = faTimesCircle;
  faUser = faUser;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faTag = faTag;
  faDollarSign = faDollarSign;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faFlag = faFlag;
  faTrash = faTrash;
  faEdit = faEdit;
  faCheck = faCheck;
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle;
  faStar = faStar;
  faStore = faStore;
  faFileText = faFileText;
  faCalendar = faCalendar;
  faArrowRight = faArrowRight;

  // Data
  requests: any[] = [];
  categories: any[] = [];
  user: any = null;
  isLoading = false;
  
  // Filters and pagination
  searchQuery = '';
  categoryFilter = '';
  statusFilter = '';
  budgetFilter = '';
  sortBy = 'created_at_desc';
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  
  // Statistics
  requestStats = {
    total: 0,
    open: 0,
    fulfilled: 0,
    expired: 0
  };

  ngOnInit(): void {
    this.loadUserData();
    this.loadRequests();
    this.loadCategories();
    this.loadRequestStatistics();
  }

  private loadUserData(): void {
    this.authService.authState$.subscribe(authState => {
      this.user = authState.user;
    });
  }

  private loadRequests(): void {
    this.isLoading = true;
    
    const params = {
      page: this.currentPage,
      search: this.searchQuery,
      category_ids: this.categoryFilter ? [this.categoryFilter] : undefined,
      status: this.statusFilter,
      budget_range: this.budgetFilter,
      sort_by: this.sortBy
    };

    this.requestService.getRequests(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.requests = response.data.items;
          this.totalResults = response.data.pagination.total_items;
          this.totalPages = response.data.pagination.total_pages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
      }
    });
  }

  private loadCategories(): void {
    this.marketplaceService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadRequestStatistics(): void {
    this.requestService.getRequestStatistics().subscribe({
      next: (stats: any) => {
        this.requestStats = stats;
      },
      error: (error) => {
        console.error('Error loading request statistics:', error);
      }
    });
  }

  onSearchInput(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onCategoryFilterChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onBudgetFilterChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.budgetFilter = '';
    this.sortBy = 'created_at_desc';
    this.currentPage = 1;
    this.loadRequests();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRequests();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRequests();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadRequests();
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

  getRequestStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'OPEN': 'Open',
      'FULFILLED': 'Fulfilled',
      'CLOSED': 'Closed',
      'EXPIRED': 'Expired'
    };
    return statusMap[status] || status;
  }

  getRequestStatusClasses(status: string): string {
    const classMap: Record<string, string> = {
      'OPEN': 'bg-green-100 text-green-800',
      'FULFILLED': 'bg-blue-100 text-blue-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
      'EXPIRED': 'bg-red-100 text-red-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  upvoteRequest(request: any): void {
    this.requestService.upvoteRequest(request.id).subscribe({
      next: (response) => {
        if (response.success) {
          request.is_upvoted = !request.is_upvoted;
          request.upvotes = response.data.upvotes;
        }
      },
      error: (error) => {
        console.error('Error upvoting request:', error);
      }
    });
  }

  viewOffers(request: any): void {
    this.router.navigate(['/app/requests', request.id, 'offers']);
  }

  makeOffer(request: any): void {
    this.router.navigate(['/app/requests', request.id, 'offer']);
  }

  get isSeller(): boolean {
    return this.user?.current_role === 'seller';
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
} 