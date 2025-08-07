import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faFilter,
  faSort,
  faEye,
  faEdit,
  faTrash,
  faPrint,
  faStar,
  faTimesCircle,
  faMapMarkerAlt,
  faCalendar,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faArrowUp,
  faArrowDown,
  faBox,
  faCreditCard,
  faArrowRight,
  faRefresh,
  faTimes,
  faDownload,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    FontAwesomeModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Orders</h1>
          <p class="mt-1 text-sm text-gray-500">
            Track your orders and view order history
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            (click)="refreshOrders()"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh Orders"
          >
            <fa-icon [icon]="faRefresh" class="w-5 h-5"></fa-icon>
          </button>
        </div>
      </div>

      <!-- Order Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <fa-icon [icon]="faBox" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-semibold text-gray-900">{{ orderStats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <fa-icon [icon]="faClock" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-semibold text-gray-900">{{ orderStats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <fa-icon [icon]="faCheckCircle" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-semibold text-gray-900">{{ orderStats.completed }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 text-red-600">
              <fa-icon [icon]="faTimes" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Cancelled</p>
              <p class="text-2xl font-semibold text-gray-900">{{ orderStats.cancelled }}</p>
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
                placeholder="Search orders..."
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
              >
            </div>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Status:</label>
            <select
              [(ngModel)]="statusFilter"
              (change)="onStatusFilterChange()"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-markt-primary focus:border-markt-primary sm:text-sm rounded-md"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="total_desc">Highest Amount</option>
              <option value="total_asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div class="space-y-4">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && orders.length === 0" class="text-center py-12">
          <fa-icon [icon]="faBox" class="w-16 h-16 text-gray-400 mx-auto mb-4"></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No orders found</h2>
          <p class="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <button
            routerLink="/app/marketplace"
            class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>

        <!-- Orders -->
        <div *ngFor="let order of orders" class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Order Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Order #{{ order.order_number }}</h3>
                  <p class="text-sm text-gray-500">{{ order.created_at | date:'medium' }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="getOrderStatusClasses(order.status)"
                >
                  {{ getOrderStatusDisplay(order.status) }}
                </span>
                <div class="flex items-center space-x-2">
                  <button
                    [routerLink]="['/app/orders', order.id]"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="View Details"
                  >
                    <fa-icon [icon]="faEye" class="w-4 h-4"></fa-icon>
                  </button>
                  <button
                    (click)="downloadInvoice(order)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Download Invoice"
                  >
                    <fa-icon [icon]="faDownload" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="px-6 py-4">
            <div class="space-y-3">
              <div *ngFor="let item of order.items" class="flex items-center space-x-4">
                <img
                  [src]="item.product?.images[0]?.url || '/markt-text-logo.png'"
                  [alt]="item.product?.name"
                  class="w-16 h-16 object-cover rounded-lg"
                >
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ item.product?.name }}</h4>
                  <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <fa-icon [icon]="faStore" class="w-4 h-4 mr-1"></fa-icon>
                      {{ item.product?.seller?.shop_name }}
                    </span>
                    <span class="flex items-center">
                      <fa-icon [icon]="faMapMarkerAlt" class="w-4 h-4 mr-1"></fa-icon>
                      {{ item.product?.seller?.location }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ item.price * item.quantity | currency:'NGN' }}</p>
                  <p class="text-sm text-gray-500">{{ item.price | currency:'NGN' }} each</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Total:</span> {{ order.total | currency:'NGN' }}
                </div>
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Items:</span> {{ order.items.length }}
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button
                  *ngIf="canReviewOrder(order)"
                  (click)="navigateToReview(order)"
                  class="text-markt-primary hover:text-markt-secondary font-medium text-sm"
                >
                  Write Review
                </button>
                <button
                  *ngIf="canCancelOrder(order)"
                  (click)="cancelOrder(order)"
                  class="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Cancel Order
                </button>
                <button
                  [routerLink]="['/app/orders', order.id]"
                  class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors text-sm font-medium"
                >
                  View Details
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
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Font Awesome Icons
  faSearch = faSearch;
  faFilter = faFilter;
  faSort = faSort;
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faPrint = faPrint;
  faStar = faStar;
  faTimesCircle = faTimesCircle;
  faMapMarkerAlt = faMapMarkerAlt;
  faCalendar = faCalendar;
  faClock = faClock;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faBox = faBox;
  faCreditCard = faCreditCard;
  faArrowRight = faArrowRight;
  faRefresh = faRefresh;
  faTimes = faTimes;
  faDownload = faDownload;
  faStore = faStore;

  // Data
  orders: any[] = [];
  isLoading = false;

  // Filters and pagination
  searchQuery = '';
  statusFilter = '';
  sortBy = 'created_at_desc';
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;

  // Statistics
  orderStats = {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  };

  ngOnInit(): void {
    this.loadOrders();
    this.loadOrderStatistics();
  }

  private loadOrders(): void {
    this.isLoading = true;
    
    const params = {
      status: this.statusFilter,
      page: this.currentPage,
      limit: 10 // Assuming a default limit for pagination
    };

    this.apiService.getMyOrders(params).subscribe({
      next: (response) => {
        this.orders = response.data?.items || [];
        this.totalResults = response.data?.pagination?.total_items || 0;
        this.totalPages = response.data?.pagination?.total_pages || 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.isLoading = false;
      }
    });
  }

  private loadOrderStatistics(): void {
    this.orderService.getOrderStatistics().subscribe({
      next: (stats: any) => {
        this.orderStats = stats;
      },
      error: (error) => {
        console.error('Error loading order statistics:', error);
      }
    });
  }

  onSearchInput(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  refreshOrders(): void {
    this.loadOrders();
    this.loadOrderStatistics();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
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

  getOrderStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getOrderStatusClasses(status: string): string {
    const classMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  canReviewOrder(order: any): boolean {
    return order.status === 'delivered';
  }

  canCancelOrder(order: any): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  navigateToReview(order: any): void {
    this.router.navigate(['/app/orders', order.id, 'review']);
  }

  cancelOrder(order: any): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.updateRequestStatus(order.id, { status: 'cancelled' }).subscribe({
        next: (response) => {
          if (response.success) {
            this.refreshOrders();
          }
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        }
      });
    }
  }

  downloadInvoice(order: any): void {
    // This would typically call an API to generate and download the invoice
    
  }

  // Additional order endpoint integrations
  getOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (response) => {
        console.log('Orders loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  getSellerOrders(): void {
    this.apiService.getSellerOrders().subscribe({
      next: (response) => {
        console.log('Seller orders loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading seller orders:', error);
      }
    });
  }

  getSellerOrderStats(): void {
    this.apiService.getSellerOrderStats().subscribe({
      next: (response) => {
        console.log('Seller order stats loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading seller order stats:', error);
      }
    });
  }

  reviewOrder(orderId: string, reviewData: any): void {
    this.apiService.reviewOrder(orderId, reviewData).subscribe({
      next: (response) => {
        console.log('Order reviewed:', response.data);
      },
      error: (error) => {
        console.error('Error reviewing order:', error);
      }
    });
  }

  trackOrder(orderId: string): void {
    this.apiService.trackOrder(orderId).subscribe({
      next: (response) => {
        console.log('Order tracking loaded:', response.data);
      },
      error: (error) => {
        console.error('Error tracking order:', error);
      }
    });
  }
} 