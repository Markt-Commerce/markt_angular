import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { OrderService, Order, SellerOrderItem } from '../../domains/orders';
import { AuthService } from '../../domains/authentication';
import { ButtonComponent } from '../../shared/components/button/button.component';

type OrderStatusView =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'confirmed'
  | 'refunded';
type OrderItemStatusView =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

interface OrderItemView {
  id: number;
  quantity: number;
  price: number;
  status: OrderItemStatusView;
  product: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
    seller?: {
      shop_name?: string;
      location?: string;
    };
  };
}

interface OrderView {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatusView;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  shipping_fee: number;
  items: OrderItemView[];
  currency: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    ButtonComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ viewMode === 'seller' ? 'Seller Orders' : 'My Orders' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Track your orders and view order history
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <div
            class="inline-flex rounded-md border border-gray-200 overflow-hidden"
          >
            <button
              (click)="setViewMode('buyer')"
              class="px-3 py-2 text-sm font-medium focus:outline-none"
              [class.bg-white]="viewMode === 'buyer'"
              [class.text-gray-900]="viewMode === 'buyer'"
              [class.bg-gray-50]="viewMode !== 'buyer'"
              [class.text-gray-600]="viewMode !== 'buyer'"
            >
              My Orders
            </button>
            <button
              (click)="setViewMode('seller')"
              class="px-3 py-2 text-sm font-medium border-l border-gray-200 focus:outline-none"
              [class.bg-white]="viewMode === 'seller'"
              [class.text-gray-900]="viewMode === 'seller'"
              [class.bg-gray-50]="viewMode !== 'seller'"
              [class.text-gray-600]="viewMode !== 'seller'"
            >
              Seller Orders
            </button>
          </div>
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
        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <fa-icon [icon]="faBox" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ orderStats.total }}
              </p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <fa-icon [icon]="faClock" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ orderStats.pending }}
              </p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <fa-icon [icon]="faCheckCircle" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ orderStats.completed }}
              </p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 text-red-600">
              <fa-icon [icon]="faTimes" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Cancelled</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ orderStats.cancelled }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0"
        >
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <fa-icon
                  [icon]="faSearch"
                  class="w-5 h-5 text-gray-400"
                ></fa-icon>
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
              />
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
        <div *ngIf="isLoading" class="grid grid-cols-1 gap-4 md:gap-6">
          <div class="card p-0 overflow-hidden" *ngFor="let s of [1, 2, 3]">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div
                class="mt-2 h-4 w-32 bg-gray-200 rounded animate-pulse"
              ></div>
            </div>
            <div class="px-6 py-4 space-y-3">
              <div class="flex items-center space-x-4" *ngFor="let i of [1, 2]">
                <div
                  class="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div class="flex-1">
                  <div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
                  <div
                    class="mt-2 h-3 w-24 bg-gray-200 rounded animate-pulse"
                  ></div>
                </div>
                <div class="text-right">
                  <div
                    class="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto"
                  ></div>
                  <div
                    class="mt-2 h-3 w-16 bg-gray-200 rounded animate-pulse ml-auto"
                  ></div>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div
                class="h-8 w-28 bg-gray-200 rounded animate-pulse ml-auto"
              ></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading && orders.length === 0"
          class="text-center py-12"
        >
          <fa-icon
            [icon]="faBox"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          ></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">
            {{
              viewMode === 'seller' ? 'No seller orders yet' : 'No orders found'
            }}
          </h2>
          <p class="text-gray-500 mb-6">
            {{
              viewMode === 'seller'
                ? 'You have not received any orders.'
                : 'You have not placed any orders yet.'
            }}
          </p>
          <div class="flex items-center justify-center gap-3">
            <app-button
              *ngIf="viewMode === 'buyer'"
              routerLink="ROUTES_ABSOLUTE.APP.MARKETPLACE"
              variant="primary"
              size="md"
              >Start Shopping</app-button
            >
            <app-button
              *ngIf="viewMode === 'seller'"
              routerLink="/app/seller/listings"
              variant="primary"
              size="md"
              >View Listings</app-button
            >
          </div>
        </div>

        <!-- Orders -->
        <div *ngFor="let order of orders" class="card overflow-hidden p-0">
          <!-- Order Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    Order #{{ order.order_number }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ order.created_at | date : 'medium' }}
                  </p>
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
                    [routerLink]="[ROUTES_ABSOLUTE.APP.ORDERS.ROOT, order.id]"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="View Details"
                  >
                    <fa-icon [icon]="faEye" class="w-4 h-4"></fa-icon>
                  </button>
                  <button
                    (click)="trackOrder(order.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Track Order"
                  >
                    <fa-icon [icon]="faMapMarkerAlt" class="w-4 h-4"></fa-icon>
                  </button>
                  <button
                    (click)="downloadInvoice(order)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Download Invoice (Coming Soon)"
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
              <div
                *ngFor="let item of order.items"
                class="flex items-center space-x-4"
              >
                <img
                  [src]="item.product.images[0]?.url || '/markt-text-logo.png'"
                  [alt]="item.product.name || 'Product image'"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">
                    {{ item.product.name }}
                  </h4>
                  <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                  <div
                    class="flex items-center space-x-4 text-sm text-gray-500"
                  >
                    <span class="flex items-center">
                      <fa-icon [icon]="faStore" class="w-4 h-4 mr-1"></fa-icon>
                      {{ item.product.seller?.shop_name || 'Unknown Seller' }}
                    </span>
                    <span class="flex items-center">
                      <fa-icon
                        [icon]="faMapMarkerAlt"
                        class="w-4 h-4 mr-1"
                      ></fa-icon>
                      {{ item.product.seller?.location || '' }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">
                    {{
                      item.price * item.quantity | currency : getCurrency(order)
                    }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ item.price | currency : getCurrency(order) }} each
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Total:</span>
                  {{ order.total | currency : getCurrency(order) }}
                </div>
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Items:</span>
                  {{ order.items.length }}
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
                <app-button
                  [routerLink]="[ROUTES_ABSOLUTE.APP.ORDERS.ROOT, order.id]"
                  variant="primary"
                  size="sm"
                  >View Details</app-button
                >
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
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class OrdersComponent implements OnInit {
  // Expose routes for template access
  protected readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

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
  orders: OrderView[] = [];
  private buyerOrders: Order[] = [];
  private sellerOrderItems: SellerOrderItem[] = [];
  isLoading = false;

  // View mode: buyer vs seller
  viewMode: 'buyer' | 'seller' = 'buyer';

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
    cancelled: 0,
  };

  ngOnInit(): void {
    this.loadOrders();
    this.loadOrderStatistics();
  }

  private loadOrders(): void {
    const params: Record<string, unknown> = {
      status: this.statusFilter || undefined,
      page: this.currentPage,
      per_page: 10,
    };

    this.isLoading = true;

    if (this.viewMode === 'seller') {
      this.orderService
        .loadSellerOrders(params)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => {
            this.sellerOrderItems =
              this.orderService.sellerOrderItemsSnapshot ?? [];
            const pagination = this.orderService.sellerPaginationSnapshot;
            this.totalResults =
              pagination?.totalItems ?? this.sellerOrderItems.length;
            this.totalPages = pagination?.totalPages ?? 1;
            this.refreshOrdersFromState();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading seller orders:', error);
            this.sellerOrderItems = [];
            this.orders = [];
            this.totalResults = 0;
            this.totalPages = 1;
            this.isLoading = false;
          },
        });

      return;
    }

    this.orderService
      .loadBuyerOrders(params)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.buyerOrders = this.orderService.buyerOrders;
          this.totalResults = this.buyerOrders.length;
          this.totalPages = 1;
          this.refreshOrdersFromState();
          this.computeBuyerStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading buyer orders:', error);
          this.buyerOrders = [];
          this.orders = [];
          this.totalResults = 0;
          this.totalPages = 1;
          this.orderStats = {
            total: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
          };
          this.isLoading = false;
        },
      });
  }

  private refreshOrdersFromState(): void {
    if (this.viewMode === 'seller') {
      this.orders = this.sellerOrderItems.map((item) =>
        this.mapSellerOrderItemToView(item)
      );
      return;
    }

    this.orders = this.buyerOrders.map((order) =>
      this.mapBuyerOrderToView(order)
    );
  }

  private mapBuyerOrderToView(order: Order): OrderView {
    const currency = 'NGN';
    const items: OrderItemView[] = order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      status: item.status as OrderItemStatusView,
      product: {
        id: item.product?.id ?? '',
        name: item.product?.name ?? 'Product',
        images: item.product?.thumbnailUrl
          ? [{ url: item.product.thumbnailUrl }]
          : [],
        seller: {
          shop_name: order.buyer?.buyername ?? 'Buyer',
          location: this.formatAddressLocation(order.shippingAddress),
        },
      },
    }));

    return {
      id: order.id,
      order_number: order.orderNumber,
      created_at: order.createdAt,
      status: order.status as OrderStatusView,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax ?? 0,
      discount: order.discount ?? 0,
      shipping_fee: order.shippingFee ?? 0,
      items,
      currency,
    };
  }

  private mapSellerOrderItemToView(item: SellerOrderItem): OrderView {
    const currency = 'NGN';
    const productName = item.product?.name ?? 'Product';
    const productImages = item.product?.thumbnailUrl
      ? [{ url: item.product.thumbnailUrl }]
      : [];
    const total = item.price * item.quantity;

    const viewItem: OrderItemView = {
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      status: item.status as OrderItemStatusView,
      product: {
        id: item.product?.id ?? '',
        name: productName,
        images: productImages,
        seller: {
          shop_name: item.order.buyer?.buyername ?? 'Buyer',
          location: '',
        },
      },
    };

    return {
      id: item.orderId,
      order_number: item.order.orderNumber,
      created_at: item.order.createdAt,
      status: item.status as OrderStatusView,
      total,
      subtotal: total,
      tax: 0,
      discount: 0,
      shipping_fee: 0,
      items: [viewItem],
      currency,
    };
  }

  private formatAddressLocation(
    address?: {
      city?: string | null;
      state?: string | null;
      country?: string | null;
    } | null
  ): string {
    if (!address) {
      return '';
    }

    const parts = [address.city, address.state, address.country].filter(
      (part): part is string => Boolean(part && part.trim().length > 0)
    );

    return parts.join(', ');
  }

  private computeBuyerStats(): void {
    const total = this.buyerOrders.length;
    const pending = this.buyerOrders.filter(
      (order) =>
        order.status === 'pending' ||
        order.status === 'processing' ||
        order.status === 'confirmed'
    ).length;
    const completed = this.buyerOrders.filter(
      (order) => order.status === 'delivered'
    ).length;
    const cancelled = this.buyerOrders.filter(
      (order) => order.status === 'cancelled' || order.status === 'returned'
    ).length;
    this.orderStats = { total, pending, completed, cancelled };
  }

  private loadOrderStatistics(): void {
    if (this.viewMode === 'seller') {
      this.orderService
        .loadSellerStats()
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (stats) => {
            this.orderStats = {
              total: stats.totalOrders ?? this.orderStats.total,
              pending: stats.pendingOrders ?? this.orderStats.pending,
              completed: stats.completedOrders ?? this.orderStats.completed,
              cancelled: stats.cancelledOrders ?? this.orderStats.cancelled,
            };
          },
          error: (error) => {
            console.error('Error loading seller order statistics:', error);
          },
        });
      return;
    }

    this.computeBuyerStats();
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

  onViewModeChange(): void {
    this.currentPage = 1;
    this.loadOrders();
    this.loadOrderStatistics();
  }

  setViewMode(mode: 'buyer' | 'seller'): void {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      this.onViewModeChange();
    }
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
      pending: 'Pending',
      processing: 'Processing',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };
    return statusMap[status] || status;
  }

  getOrderStatusClasses(status: string): string {
    const classMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  getCurrency(order: OrderView): string {
    return order.currency || 'NGN';
  }

  canReviewOrder(order: OrderView): boolean {
    return order.status === 'delivered';
  }

  canCancelOrder(order: OrderView): boolean {
    return ['pending', 'processing', 'confirmed'].includes(order.status);
  }

  navigateToReview(order: OrderView): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT, order.id, 'review']);
  }

  cancelOrder(order: OrderView): void {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.orderService
      .cancelOrder(order.id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.buyerOrders = this.orderService.buyerOrders;
          this.refreshOrdersFromState();
          this.computeBuyerStats();
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
        },
      });
  }

  downloadInvoice(order: OrderView): void {
    if (!order || !order.id) {
      console.error('Invalid order data for invoice download');
      return;
    }

    // TODO: Implement invoice download when backend endpoint is available
    // For now, show a message that this feature is coming soon

    // You can show a toast notification here instead
    // this.notificationService.show('Invoice download feature coming soon!');
  }

  reviewOrder(
    orderId: string,
    reviewData: { rating: number; comment?: string }
  ): void {
    this.orderService
      .reviewOrder(orderId, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          console.info('Review submitted for order:', orderId);
        },
        error: (error) => {
          console.error('Error submitting review:', error);
        },
      });
  }

  trackOrder(orderId: string): void {
    this.orderService
      .trackOrder(orderId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (tracking) => {
          // TODO: Surface tracking modal when UI is ready
          console.info('Order tracking update:', tracking);
        },
        error: (error) => {
          console.error('Error tracking order:', error);
        },
      });
  }
}
