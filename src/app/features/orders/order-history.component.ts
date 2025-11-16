import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faDownload,
  faPlus,
  faEye,
  faStar,
  faRedo,
  faTruck,
  faClock,
  faCheck,
  faTimes,
  faMessage,
  faFilter,
  faQuestion,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { OrderService, Order, OrderStatus } from '../../domains/orders';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface OrderStatusTab {
  key: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

interface OrderFilters {
  search: string;
  timeRange: string;
  sortBy: string;
}

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8 mx-auto">
      <!-- Page Header -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-dark mb-2">Order History</h1>
            <p class="text-muted">
              Track and manage all your orders in one place
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              (click)="exportOrders()"
              class="px-4 py-2 bg-light text-dark rounded-lg hover:bg-border transition-colors"
            >
              <fa-icon [icon]="faDownload" class="mr-2"></fa-icon>Export
            </button>
            <button
              (click)="createNewOrder()"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              <fa-icon [icon]="faPlus" class="mr-2"></fa-icon>New Order
            </button>
          </div>
        </div>
      </section>

      <!-- Search and Filters -->
      <section class="bg-white rounded-xl border border-border p-6 mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <div class="relative">
              <fa-icon
                [icon]="faSearch"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted"
              ></fa-icon>
              <input
                type="text"
                placeholder="Search by order number, seller, or product..."
                [(ngModel)]="filters.search"
                (input)="onSearchChange()"
                class="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <select
              [(ngModel)]="filters.timeRange"
              (change)="onFilterChange()"
              class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <select
              [(ngModel)]="filters.sortBy"
              (change)="onFilterChange()"
              class="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="date_desc">Sort by Date</option>
              <option value="amount_desc">Sort by Amount</option>
              <option value="status">Sort by Status</option>
              <option value="seller">Sort by Seller</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Status Tabs -->
      <section class="mb-8">
        <div class="border-b border-border">
          <nav class="flex space-x-8">
            <button
              *ngFor="let tab of statusTabs()"
              (click)="selectStatusTab(tab.key)"
              class="py-3 px-1 border-b-2 transition-colors"
              [class.border-primary]="selectedTab() === tab.key"
              [class.text-primary]="selectedTab() === tab.key"
              [class.font-medium]="selectedTab() === tab.key"
              [class.border-transparent]="selectedTab() !== tab.key"
              [class.text-muted]="selectedTab() !== tab.key"
              [class.hover:text-dark]="selectedTab() !== tab.key"
            >
              {{ tab.label }}
              <span
                class="ml-2 text-xs px-2 py-1 rounded-full"
                [class.bg-primary]="selectedTab() === tab.key"
                [class.text-white]="selectedTab() === tab.key"
                [class.bg-yellow-100]="
                  tab.key === 'pending' && selectedTab() !== tab.key
                "
                [class.text-yellow-800]="
                  tab.key === 'pending' && selectedTab() !== tab.key
                "
                [class.bg-blue-100]="
                  tab.key === 'shipped' && selectedTab() !== tab.key
                "
                [class.text-blue-800]="
                  tab.key === 'shipped' && selectedTab() !== tab.key
                "
                [class.bg-green-100]="
                  tab.key === 'delivered' && selectedTab() !== tab.key
                "
                [class.text-green-800]="
                  tab.key === 'delivered' && selectedTab() !== tab.key
                "
                [class.bg-red-100]="
                  tab.key === 'cancelled' && selectedTab() !== tab.key
                "
                [class.text-red-800]="
                  tab.key === 'cancelled' && selectedTab() !== tab.key
                "
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </section>

      <!-- Orders List -->
      <section class="space-y-6">
        <!-- Loading State -->
        <div *ngIf="isLoading()" class="space-y-6">
          <div
            *ngFor="let i of [1, 2, 3]"
            class="bg-white rounded-xl border border-border p-6 animate-pulse"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div class="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                  <div class="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div class="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <div class="flex items-start space-x-4">
                  <div class="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div class="flex-1">
                    <div class="h-4 w-56 bg-gray-200 rounded mb-2"></div>
                    <div class="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                    <div class="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-end space-x-2">
                <div class="h-8 w-24 bg-gray-200 rounded"></div>
                <div class="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading() && filteredOrders().length === 0"
          class="text-center py-12"
        >
          <div
            class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <fa-icon [icon]="faCheck" class="w-8 h-8 text-gray-400"></fa-icon>
          </div>
          <h2 class="text-xl font-medium text-gray-900 mb-2">
            No orders found
          </h2>
          <p class="text-gray-500 mb-6">
            You haven't placed any orders yet or no orders match your current
            filters.
          </p>
          <button
            (click)="createNewOrder()"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Start Shopping
          </button>
        </div>

        <!-- Order Cards -->
        <div
          *ngFor="let order of filteredOrders()"
          class="bg-white rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
        >
          <!-- Order Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                [class]="getOrderStatusIconBg(order.status)"
              >
                <fa-icon
                  [icon]="getOrderStatusIcon(order.status)"
                  [class]="getOrderStatusIconColor(order.status)"
                >
                </fa-icon>
              </div>
              <div>
                <h3 class="font-semibold text-dark">
                  Order #{{ order.orderNumber }}
                </h3>
                <p class="text-sm text-muted">
                  Placed on {{ order.createdAt | date : 'mediumDate' }}
                </p>
              </div>
            </div>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              [class]="getOrderStatusBadgeClasses(order.status)"
            >
              {{ getOrderStatusDisplay(order.status) }}
            </span>
          </div>

          <!-- Order Items -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
              <div
                class="space-y-4"
                *ngIf="order.items.length > 1; else singleItem"
              >
                <div
                  *ngFor="let item of order.items"
                  class="flex items-start space-x-4"
                >
                  <img
                    [src]="getProductImage(item.product)"
                    [alt]="item.product?.name ?? 'Order item'"
                    class="w-16 h-16 rounded-lg object-cover"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-dark mb-1">
                      {{ item.product?.name ?? 'Product' }}
                    </h4>
                    <p class="text-sm text-muted mb-2">
                      Sold by
                      {{ getSellerName(item.product) || 'Unknown Seller' }}
                    </p>
                    <div class="flex items-center space-x-2 text-sm">
                      <span class="text-muted">Qty: {{ item.quantity }}</span>
                      <span class="text-muted">•</span>
                      <span class="font-medium text-dark">{{
                        item.price * item.quantity
                          | currency : 'NGN' : 'symbol' : '1.2-2'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #singleItem>
                <div class="flex items-start space-x-4">
                  <img
                    [src]="getProductImage(order.items[0].product)"
                    [alt]="order.items[0]?.product?.name ?? 'Order item'"
                    class="w-16 h-16 rounded-lg object-cover"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium text-dark mb-1">
                      {{ order.items[0]?.product?.name ?? 'Product' }}
                    </h4>
                    <p class="text-sm text-muted mb-2">
                      Sold by
                      {{
                        getSellerName(order.items[0]?.product) ||
                          'Unknown Seller'
                      }}
                    </p>
                    <div class="flex items-center space-x-2 text-sm">
                      <span class="text-muted"
                        >Qty: {{ order.items[0].quantity }}</span
                      >
                      <span class="text-muted">•</span>
                      <span class="font-medium text-dark">{{
                        order.items[0].price * order.items[0].quantity
                          | currency : 'NGN' : 'symbol' : '1.2-2'
                      }}</span>
                    </div>
                  </div>
                </div>
              </ng-template>
            </div>

            <!-- Order Actions -->
            <div class="flex items-center justify-end space-x-2">
              <button
                (click)="viewOrderDetails(order)"
                class="px-3 py-2 bg-light text-dark rounded-lg hover:bg-border transition-colors text-sm"
              >
                <fa-icon [icon]="faEye" class="mr-1"></fa-icon>View Details
              </button>
              <button
                *ngIf="canReviewOrder(order)"
                (click)="reviewOrder(order)"
                class="px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                <fa-icon [icon]="faStar" class="mr-1"></fa-icon>Review
              </button>
              <button
                *ngIf="canReorder(order)"
                (click)="reorderItems(order)"
                class="px-3 py-2 bg-light text-dark rounded-lg hover:bg-border transition-colors text-sm"
              >
                <fa-icon [icon]="faRedo" class="mr-1"></fa-icon>Reorder
              </button>
              <button
                *ngIf="canTrackOrder(order) && order.status === 'shipped'"
                (click)="trackOrder(order)"
                class="px-3 py-2 bg-light text-dark rounded-lg hover:bg-border transition-colors text-sm"
              >
                <fa-icon [icon]="faTruck" class="mr-1"></fa-icon>Track
              </button>
              <button
                *ngIf="canContactSeller(order) && order.status === 'shipped'"
                (click)="contactSeller(order)"
                class="px-3 py-2 bg-light text-dark rounded-lg hover:bg-border transition-colors text-sm"
              >
                <fa-icon [icon]="faMessage" class="mr-1"></fa-icon>Contact
              </button>
              <button
                *ngIf="canCancelOrder(order)"
                (click)="cancelOrder(order)"
                class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                <fa-icon [icon]="faTimes" class="mr-1"></fa-icon>Cancel
              </button>
            </div>
          </div>

          <!-- Order Footer (for multi-item orders) -->
          <div
            *ngIf="order.items.length > 1"
            class="mt-4 pt-4 border-t border-border"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted" *ngIf="order.status === 'shipped'">
                Estimated delivery: {{ getEstimatedDelivery(order) }}
              </span>
              <span class="font-semibold text-dark"
                >Total:
                {{ order.total | currency : 'NGN' : 'symbol' : '1.2-2' }}</span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- Pagination -->
      <section class="mt-12 flex items-center justify-between">
        <div class="text-sm text-muted">Showing 1-3 of 24 orders</div>
        <div class="flex items-center space-x-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1"
            class="px-3 py-2 border border-border rounded-lg text-muted hover:bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <fa-icon [icon]="faChevronLeft"></fa-icon>
          </button>
          <button class="px-3 py-2 bg-primary text-white rounded-lg">1</button>
          <button
            class="px-3 py-2 border border-border rounded-lg text-muted hover:bg-light transition-colors"
          >
            2
          </button>
          <button
            class="px-3 py-2 border border-border rounded-lg text-muted hover:bg-light transition-colors"
          >
            3
          </button>
          <span class="px-3 py-2 text-muted">...</span>
          <button
            class="px-3 py-2 border border-border rounded-lg text-muted hover:bg-light transition-colors"
          >
            8
          </button>
          <button
            (click)="nextPage()"
            class="px-3 py-2 border border-border rounded-lg text-muted hover:bg-light transition-colors"
          >
            <fa-icon [icon]="faChevronRight"></fa-icon>
          </button>
        </div>
      </section>

      <!-- Quick Actions Sidebar -->
      <div
        class="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-3 z-10"
      >
        <button
          (click)="showAdvancedFilters()"
          class="w-12 h-12 bg-white border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-light transition-colors"
          title="Filter Orders"
        >
          <fa-icon [icon]="faFilter" class="text-muted"></fa-icon>
        </button>
        <button
          (click)="exportOrders()"
          class="w-12 h-12 bg-white border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-light transition-colors"
          title="Export Data"
        >
          <fa-icon [icon]="faDownload" class="text-muted"></fa-icon>
        </button>
        <button
          (click)="showHelp()"
          class="w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-secondary transition-colors"
          title="Help & Support"
        >
          <fa-icon [icon]="faQuestion" class="text-white"></fa-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* Custom color variables to match Figma design */
      :host {
        --primary: #e94c2a;
        --secondary: #e94b26;
        --accent: #e07575;
        --dark: #181211;
        --light: #f4f1f0;
        --muted: #886a63;
        --border: #e5dddc;
      }

      .text-primary {
        color: var(--primary) !important;
      }
      .bg-primary {
        background-color: var(--primary) !important;
      }
      .border-primary {
        border-color: var(--primary) !important;
      }
      .ring-primary {
        --tw-ring-color: var(--primary) !important;
      }

      .text-secondary {
        color: var(--secondary) !important;
      }
      .bg-secondary {
        background-color: var(--secondary) !important;
      }

      .text-dark {
        color: var(--dark) !important;
      }
      .text-muted {
        color: var(--muted) !important;
      }
      .bg-light {
        background-color: var(--light) !important;
      }
      .bg-border {
        background-color: var(--border) !important;
      }
      .border-border {
        border-color: var(--border) !important;
      }
    `,
  ],
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  // Font Awesome Icons
  faSearch = faSearch;
  faDownload = faDownload;
  faPlus = faPlus;
  faEye = faEye;
  faStar = faStar;
  faRedo = faRedo;
  faTruck = faTruck;
  faClock = faClock;
  faCheck = faCheck;
  faTimes = faTimes;
  faMessage = faMessage;
  faFilter = faFilter;
  faQuestion = faQuestion;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  // Signals for reactive state management
  orders = signal<Order[]>([]);
  isLoading = signal<boolean>(false);
  selectedTab = signal<string>('all');
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalOrders = signal<number>(0);

  // Filters
  filters: OrderFilters = {
    search: '',
    timeRange: 'all',
    sortBy: 'date_desc',
  };

  // Status tabs configuration - matching Figma design exactly
  statusTabs = signal<OrderStatusTab[]>([
    {
      key: 'all',
      label: 'All Orders',
      count: 24,
      color: 'text-white',
      bgColor: 'bg-primary',
    },
    {
      key: 'pending',
      label: 'Processing',
      count: 3,
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      count: 8,
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      count: 12,
      color: 'text-green-800',
      bgColor: 'bg-green-100',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: 1,
      color: 'text-red-800',
      bgColor: 'bg-red-100',
    },
  ]);

  ngOnInit(): void {
    // Use domain OrderService to load real orders
    this.loadOrders();
    // Uncomment below to use mock data for development/testing
    // this.loadMockOrders();
  }

  /**
   * Load mock orders for development and testing
   * This provides sample data that matches the design exactly
   */
  private loadMockOrders(): void {
    this.isLoading.set(true);

    // Simulate API delay
    setTimeout(() => {
      const mockOrdersData: any[] = [
        {
          id: '1',
          order_number: 'MKT-2024-001',
          buyer_id: 'buyer1',
          seller_id: 'seller1',
          cart_id: 'cart1',
          shipping_address: {
            latitude: 0,
            longitude: 0,
            street: '123 Main St',
            house_number: '123',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            postal_code: '100001',
          },
          payment_method: 'card',
          subtotal: 89.99,
          shipping_fee: 0,
          tax: 0,
          discount: 0,
          total: 89.99,
          status: 'delivered',
          created_at: '2024-03-15T10:30:00Z',
          items: [
            {
              id: 'item1',
              orderId: '1',
              product_id: 'prod1',
              seller_id: 'seller1',
              quantity: 1,
              price: 89.99,
              status: 'delivered',
              product: {
                id: 'prod1',
                name: 'Premium Wireless Headphones',
                description: 'High-quality wireless headphones',
                price: 89.99,
                stock: 10,
                status: 'active',
                seller_id: 'seller1',
                category_ids: ['cat1'],
                tag_ids: ['tag1'],
                media_ids: ['media1'],
                variants: [],
                images: [
                  {
                    id: 'img1',
                    product_id: 'prod1',
                    media_id: 'media1',
                    sort_order: 1,
                    is_featured: true,
                    media: {
                      id: 'media1',
                      user_id: 'seller1',
                      original_filename: 'headphones.jpg',
                      original_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      thumbnail_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      mobile_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      tablet_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      desktop_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      social_square_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      social_post_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      social_story_url:
                        '/assets/images/products/premium-wireless-headphones.jpg',
                      width: 400,
                      height: 400,
                      file_size: 50000,
                      mime_type: 'image/jpeg',
                      media_type: 'image',
                      is_public: true,
                      background_removed: false,
                      processing_status: 'completed',
                      storage_key: 'headphones.jpg',
                      variants: [],
                      created_at: '2024-03-15T10:00:00Z',
                      updated_at: '2024-03-15T10:00:00Z',
                    },
                  },
                ],
                seller: {
                  id: 'seller1',
                  shop_name: 'TechHub Campus Store',
                  shop_slug: 'techhub-campus',
                  description: 'Your campus tech store',
                  policies: {},
                  categories: [],
                  total_products: 50,
                  total_sales: 1000,
                  total_rating: 4.5,
                  average_rating: 4.5,
                  total_raters: 200,
                  verification_status: 'verified',
                  is_active: true,
                  joined_date: '2024-01-01T00:00:00Z',
                },
                average_rating: 4.5,
                review_count: 25,
                view_count: 150,
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-15T00:00:00Z',
              } as any,
            } as any,
          ],
          buyer: {
            id: 'buyer1',
            buyername: 'John Doe',
            profile_picture_url: '/assets/images/mike-seller.png',
          },
        },
        {
          id: '2',
          order_number: 'MKT-2024-002',
          buyer_id: 'buyer1',
          seller_id: 'seller2',
          cart_id: 'cart2',
          shipping_address: {
            latitude: 0,
            longitude: 0,
            street: '123 Main St',
            house_number: '123',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            postal_code: '100001',
          },
          payment_method: 'card',
          subtotal: 190.99,
          shipping_fee: 0,
          tax: 0,
          discount: 0,
          total: 190.99,
          status: 'shipped',
          created_at: '2024-03-18T14:20:00Z',
          items: [
            {
              id: 'item2',
              orderId: '2',
              product_id: 'prod2',
              seller_id: 'seller2',
              quantity: 1,
              price: 156.0,
              status: 'shipped',
              product: {
                id: 'prod2',
                name: 'Calculus Textbook',
                description: 'Comprehensive mathematics textbook',
                price: 156.0,
                stock: 5,
                status: 'active',
                seller_id: 'seller2',
                category_ids: ['cat2'],
                tag_ids: ['tag2'],
                media_ids: ['media2'],
                variants: [],
                images: [
                  {
                    id: 'img2',
                    product_id: 'prod2',
                    media_id: 'media2',
                    sort_order: 1,
                    is_featured: true,
                    media: {
                      id: 'media2',
                      user_id: 'seller2',
                      original_filename: 'textbook.jpg',
                      original_url:
                        '/assets/images/products/calculus-textbook.png',
                      thumbnail_url:
                        '/assets/images/products/calculus-textbook.png',
                      mobile_url:
                        '/assets/images/products/calculus-textbook.png',
                      tablet_url:
                        '/assets/images/products/calculus-textbook.png',
                      desktop_url:
                        '/assets/images/products/calculus-textbook.png',
                      social_square_url:
                        '/assets/images/products/calculus-textbook.png',
                      social_post_url:
                        '/assets/images/products/calculus-textbook.png',
                      social_story_url:
                        '/assets/images/products/calculus-textbook.png',
                      width: 400,
                      height: 400,
                      file_size: 50000,
                      mime_type: 'image/jpeg',
                      media_type: 'image',
                      is_public: true,
                      background_removed: false,
                      processing_status: 'completed',
                      storage_key: 'textbook.jpg',
                      variants: [],
                      created_at: '2024-03-18T10:00:00Z',
                      updated_at: '2024-03-18T10:00:00Z',
                    },
                  },
                ],
                seller: {
                  id: 'seller2',
                  shop_name: 'Campus BookStore',
                  shop_slug: 'campus-bookstore',
                  description: 'Your campus bookstore',
                  policies: {},
                  categories: [],
                  total_products: 200,
                  total_sales: 5000,
                  total_rating: 4.8,
                  average_rating: 4.8,
                  total_raters: 500,
                  verification_status: 'verified',
                  is_active: true,
                  joined_date: '2024-01-01T00:00:00Z',
                },
                average_rating: 4.8,
                review_count: 50,
                view_count: 300,
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-18T00:00:00Z',
              } as any,
            },
            {
              id: 'item3',
              orderId: '2',
              product_id: 'prod3',
              seller_id: 'seller3',
              quantity: 1,
              price: 34.99,
              status: 'shipped',
              product: {
                id: 'prod3',
                name: 'Sony Headphones',
                description: 'Professional gaming mouse and mouse pad',
                price: 34.99,
                stock: 20,
                status: 'active',
                seller_id: 'seller3',
                category_ids: ['cat3'],
                tag_ids: ['tag3'],
                media_ids: ['media3'],
                variants: [],
                images: [
                  {
                    id: 'img3',
                    product_id: 'prod3',
                    media_id: 'media3',
                    sort_order: 1,
                    is_featured: true,
                    media: {
                      id: 'media3',
                      user_id: 'seller3',
                      original_filename: 'gaming-set.jpg',
                      original_url:
                        '/assets/images/products/sony-headphones.png',
                      thumbnail_url:
                        '/assets/images/products/sony-headphones.png',
                      mobile_url: '/assets/images/products/sony-headphones.png',
                      tablet_url: '/assets/images/products/sony-headphones.png',
                      desktop_url:
                        '/assets/images/products/sony-headphones.png',
                      social_square_url:
                        '/assets/images/products/sony-headphones.png',
                      social_post_url:
                        '/assets/images/products/sony-headphones.png',
                      social_story_url:
                        '/assets/images/products/sony-headphones.png',
                      width: 400,
                      height: 400,
                      file_size: 50000,
                      mime_type: 'image/jpeg',
                      media_type: 'image',
                      is_public: true,
                      background_removed: false,
                      processing_status: 'completed',
                      storage_key: 'gaming-set.jpg',
                      variants: [],
                      created_at: '2024-03-18T10:00:00Z',
                      updated_at: '2024-03-18T10:00:00Z',
                    },
                  },
                ],
                seller: {
                  id: 'seller3',
                  shop_name: 'GameZone Electronics',
                  shop_slug: 'gamezone-electronics',
                  description: 'Gaming electronics store',
                  policies: {},
                  categories: [],
                  total_products: 100,
                  total_sales: 2000,
                  total_rating: 4.6,
                  average_rating: 4.6,
                  total_raters: 300,
                  verification_status: 'verified',
                  is_active: true,
                  joined_date: '2024-01-01T00:00:00Z',
                },
                average_rating: 4.6,
                review_count: 40,
                view_count: 200,
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-18T00:00:00Z',
              } as any,
            } as any,
          ],
          buyer: {
            id: 'buyer1',
            buyername: 'John Doe',
            profile_picture_url: '/assets/images/mike-seller.png',
          },
        },
        {
          id: '3',
          order_number: 'MKT-2024-003',
          buyer_id: 'buyer1',
          seller_id: 'seller4',
          cart_id: 'cart3',
          shipping_address: {
            latitude: 0,
            longitude: 0,
            street: '123 Main St',
            house_number: '123',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            postal_code: '100001',
          },
          payment_method: 'card',
          subtotal: 45.0,
          shipping_fee: 0,
          tax: 0,
          discount: 0,
          total: 45.0,
          status: 'pending',
          created_at: '2024-03-20T09:15:00Z',
          items: [
            {
              id: 'item4',
              orderId: '3',
              product_id: 'prod4',
              seller_id: 'seller4',
              quantity: 1,
              price: 45.0,
              status: 'pending',
              product: {
                id: 'prod4',
                name: 'Vintage Leather Jacket',
                description: 'Classic vintage denim jacket',
                price: 45.0,
                stock: 3,
                status: 'active',
                seller_id: 'seller4',
                category_ids: ['cat4'],
                tag_ids: ['tag4'],
                media_ids: ['media4'],
                variants: [],
                images: [
                  {
                    id: 'img4',
                    product_id: 'prod4',
                    media_id: 'media4',
                    sort_order: 1,
                    is_featured: true,
                    media: {
                      id: 'media4',
                      user_id: 'seller4',
                      original_filename: 'jacket.jpg',
                      original_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      thumbnail_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      mobile_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      tablet_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      desktop_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      social_square_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      social_post_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      social_story_url:
                        '/assets/images/products/vintage-leather-jacket.jpg',
                      width: 400,
                      height: 400,
                      file_size: 50000,
                      mime_type: 'image/jpeg',
                      media_type: 'image',
                      is_public: true,
                      background_removed: false,
                      processing_status: 'completed',
                      storage_key: 'jacket.jpg',
                      variants: [],
                      created_at: '2024-03-20T10:00:00Z',
                      updated_at: '2024-03-20T10:00:00Z',
                    },
                  },
                ],
                seller: {
                  id: 'seller4',
                  shop_name: 'RetroFashion Co.',
                  shop_slug: 'retrofashion-co',
                  description: 'Vintage and retro fashion',
                  policies: {},
                  categories: [],
                  total_products: 75,
                  total_sales: 1500,
                  total_rating: 4.7,
                  average_rating: 4.7,
                  total_raters: 250,
                  verification_status: 'verified',
                  is_active: true,
                  joined_date: '2024-01-01T00:00:00Z',
                },
                average_rating: 4.7,
                review_count: 30,
                view_count: 180,
                created_at: '2024-03-01T00:00:00Z',
                updated_at: '2024-03-20T00:00:00Z',
              } as any,
            } as any,
          ],
          buyer: {
            id: 'buyer1',
            buyername: 'John Doe',
            profile_picture_url: '/assets/images/mike-seller.png',
          } as any,
        },
      ];

      const mockOrders = mockOrdersData as Order[];

      this.orders.set(mockOrders);
      this.updateStatusCounts();
      this.calculatePagination();
      this.isLoading.set(false);
    }, 1000); // 1 second delay to simulate API call
  }

  /**
   * Load orders from the domain OrderService
   * Domain service returns Observable<Order[]> directly (no wrapper)
   */
  private loadOrders(): void {
    this.isLoading.set(true);

    this.orderService
      .loadBuyerOrders()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          const orders = this.orderService.buyerOrders;
          this.orders.set(orders || []);
          this.updateStatusCounts();
          this.calculatePagination();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.orders.set([]);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Update status tab counts based on current orders
   */
  private updateStatusCounts(): void {
    const orders = this.orders();
    const tabs = this.statusTabs();

    tabs.forEach((tab) => {
      if (tab.key === 'all') {
        tab.count = orders.length;
      } else {
        tab.count = orders.filter((order) => order.status === tab.key).length;
      }
    });

    this.statusTabs.set([...tabs]);
  }

  /**
   * Calculate pagination based on total orders
   */
  private calculatePagination(): void {
    const total = this.orders().length;
    this.totalOrders.set(total);
    this.totalPages.set(Math.max(1, Math.ceil(total / 10))); // 10 orders per page
  }

  /**
   * Get filtered orders based on selected tab and search
   */
  filteredOrders(): Order[] {
    let filtered = this.orders();

    // Filter by status tab
    if (this.selectedTab() !== 'all') {
      filtered = filtered.filter(
        (order) => order.status === this.selectedTab()
      );
    }

    // Filter by search query
    if (this.filters.search.trim()) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.items.some(
            (item) =>
              item.product?.name.toLowerCase().includes(searchTerm) ||
              this.getSellerName(item.product)
                ?.toLowerCase()
                .includes(searchTerm)
          )
      );
    }

    // Apply sorting
    filtered = this.applySorting(filtered);

    // Apply pagination
    const startIndex = (this.currentPage() - 1) * 10;
    const endIndex = startIndex + 10;

    return filtered.slice(startIndex, endIndex);
  }

  /**
   * Apply sorting to orders
   */
  private applySorting(orders: Order[]): Order[] {
    switch (this.filters.sortBy) {
      case 'date_desc':
        return orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'date_asc':
        return orders.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'amount_desc':
        return orders.sort((a, b) => b.total - a.total);
      case 'amount_asc':
        return orders.sort((a, b) => a.total - b.total);
      case 'status':
        return orders.sort((a, b) => a.status.localeCompare(b.status));
      case 'seller':
        return orders.sort((a, b) => {
          const aSeller = this.getSellerName(a.items[0]?.product) || '';
          const bSeller = this.getSellerName(b.items[0]?.product) || '';
          return aSeller.localeCompare(bSeller);
        });
      default:
        return orders;
    }
  }

  /**
   * Select status tab and reset pagination
   */
  selectStatusTab(tabKey: string): void {
    this.selectedTab.set(tabKey);
    this.currentPage.set(1);
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    this.currentPage.set(1);
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.currentPage.set(1);
  }

  /**
   * Get order status display text
   */
  getOrderStatusDisplay(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'Pending',
      processing: 'Processing',
      confirmed: 'Confirmed',
      shipped: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };
    return statusMap[status] || status;
  }

  /**
   * Get order status badge classes
   */
  getOrderStatusBadgeClasses(status: OrderStatus): string {
    const classMap: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-purple-100 text-purple-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get order status icon
   */
  getOrderStatusIcon(status: OrderStatus) {
    const iconMap: Record<OrderStatus, any> = {
      pending: faClock,
      processing: faClock,
      confirmed: faCheck,
      shipped: faTruck,
      delivered: faCheck,
      cancelled: faTimes,
      returned: faRedo,
      refunded: faRedo,
    };
    return iconMap[status] || faClock;
  }

  /**
   * Get order status icon background classes
   */
  getOrderStatusIconBg(status: OrderStatus): string {
    const classMap: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100',
      processing: 'bg-yellow-100',
      confirmed: 'bg-blue-100',
      shipped: 'bg-blue-100',
      delivered: 'bg-green-100',
      cancelled: 'bg-red-100',
      returned: 'bg-purple-100',
      refunded: 'bg-gray-100',
    };
    return classMap[status] || 'bg-gray-100';
  }

  /**
   * Get order status icon color classes
   */
  getOrderStatusIconColor(status: OrderStatus): string {
    const classMap: Record<OrderStatus, string> = {
      pending: 'text-yellow-600',
      processing: 'text-yellow-600',
      confirmed: 'text-blue-600',
      shipped: 'text-blue-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
      returned: 'text-purple-600',
      refunded: 'text-gray-600',
    };
    return classMap[status] || 'text-gray-600';
  }

  /**
   * Get seller name from product
   * Domain Product model may not have seller property directly accessible
   * This helper safely extracts seller information
   */
  getSellerName(product: any): string | null {
    // Try to get seller name from various possible structures
    if (product?.seller?.shop_name) {
      return product.seller.shop_name;
    }
    if (product?.seller?.name) {
      return product.seller.name;
    }
    if (product?.seller_name) {
      return product.seller_name;
    }
    // If seller info is not available in product, return null
    // The template will show 'Unknown Seller' as fallback
    return null;
  }

  /**
   * Get product image with fallback
   */
  getProductImage(product: any): string {
    // Try different image URL paths
    if (product?.thumbnailUrl) {
      return product.thumbnailUrl;
    }
    if (product?.images?.[0]?.media?.original_url) {
      return product.images[0].media.original_url;
    }
    if (product?.images?.[0]?.media?.desktop_url) {
      return product.images[0].media.desktop_url;
    }
    if (product?.images?.[0]?.media?.thumbnail_url) {
      return product.images[0].media.thumbnail_url;
    }
    if (product?.images?.[0]?.media?.url) {
      return product.images[0].media.url;
    }
    if (product?.images?.[0]?.url) {
      return product.images[0].url;
    }
    // Fallback to a default image
    return '/assets/images/products/placeholder.jpg';
  }

  /**
   * Get estimated delivery date
   */
  getEstimatedDelivery(order: Order): string {
    const orderDate = new Date(order.createdAt);
    const estimatedDate = new Date(
      orderDate.getTime() + 4 * 24 * 60 * 60 * 1000
    ); // 4 days
    return estimatedDate.toLocaleDateString();
  }

  /**
   * Check if order can be reviewed
   */
  canReviewOrder(order: Order): boolean {
    return order.status === 'delivered';
  }

  /**
   * Check if order can be reordered
   */
  canReorder(order: Order): boolean {
    return order.status === 'delivered';
  }

  /**
   * Check if order can be tracked
   */
  canTrackOrder(order: Order): boolean {
    return ['shipped', 'delivered'].includes(order.status);
  }

  /**
   * Check if seller can be contacted
   */
  canContactSeller(order: Order): boolean {
    return ['pending', 'confirmed', 'shipped'].includes(order.status);
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  /**
   * View order details
   */
  viewOrderDetails(order: Order): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT, order.id]);
  }

  /**
   * Review order
   */
  reviewOrder(order: Order): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT, order.id, 'review']);
  }

  /**
   * Reorder items
   */
  reorderItems(order: Order): void {
    // Add items to cart and navigate to cart
    this.router.navigate([ROUTES_ABSOLUTE.APP.CART]);
  }

  /**
   * Track order
   */
  trackOrder(order: Order): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT, order.id, 'track']);
  }

  /**
   * Contact seller
   */
  contactSeller(order: Order): void {
    const metadata = (
      order as unknown as { metadata?: Record<string, unknown> | null }
    ).metadata;
    const sellerId = metadata?.['seller_id'] as string | undefined;
    if (sellerId) {
      this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT], {
        queryParams: { seller: sellerId },
      });
    } else {
      console.warn('Seller information is not available for this order yet.');
    }
  }

  /**
   * Cancel order
   * Uses domain OrderService.cancelOrder() which includes business logic validation
   */
  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService
        .cancelOrder(order.id)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (cancelledOrder) => {
            // Domain service returns the updated Order directly
            // Refresh orders to get updated list
            this.loadOrders();
          },
          error: (error) => {
            console.error('Error cancelling order:', error);
            // Domain service throws error if order cannot be cancelled (business rule)
            alert(
              error.message ||
                'Failed to cancel order. Order may not be cancellable.'
            );
          },
        });
    }
  }

  /**
   * Export orders
   */
  exportOrders(): void {
    // TODO: Implement export functionality
  }

  /**
   * Create new order (navigate to marketplace)
   */
  createNewOrder(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.MARKETPLACE]);
  }

  /**
   * Show advanced filters
   */
  showAdvancedFilters(): void {
    // TODO: Implement advanced filters modal
  }

  /**
   * Show help
   */
  showHelp(): void {
    // TODO: Implement help modal or navigate to help page
  }

  /**
   * Pagination methods
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage() - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages(), start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getPaginationStart(): number {
    return (this.currentPage() - 1) * 10 + 1;
  }

  getPaginationEnd(): number {
    return Math.min(this.currentPage() * 10, this.totalOrders());
  }
}
