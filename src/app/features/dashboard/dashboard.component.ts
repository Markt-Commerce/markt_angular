import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChartLine,
  faShoppingCart,
  faUsers,
  faBox,
  faDollarSign,
  faArrowUp,
  faArrowDown,
  faEye,
  faTimesCircle,
  faUser,
  faStore,
  faCalendar,
  faClock,
  faStar,
  faHeart,
  faShare,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { RequestService } from '../../core/services/request.service';
import { ProfileService } from '../../core/services/profile.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-markt-primary to-markt-secondary rounded-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">
              Welcome back, {{ getUserDisplayName() }}! 👋
            </h1>
            <p class="text-markt-light mt-1">
              Here's what's happening with your account today
            </p>
          </div>
          <div class="hidden md:block">
            <img
              [src]="user?.profile_picture_url || '/markt-text-logo.png'"
              alt="Profile"
              class="w-16 h-16 rounded-full border-4 border-white/20"
            >
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Cart Items -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <fa-icon [icon]="faShoppingCart" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Cart Items</p>
              <p class="text-2xl font-semibold text-gray-900">{{ cartItemCount }}</p>
            </div>
          </div>
          <div class="mt-4">
            <a
              routerLink="/app/cart"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Cart →
            </a>
          </div>
        </div>

        <!-- Orders -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <fa-icon [icon]="faBox" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-2xl font-semibold text-gray-900">{{ orderStats.total }}</p>
            </div>
          </div>
          <div class="mt-4">
            <a
              routerLink="/app/orders"
              class="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              View Orders →
            </a>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <fa-icon [icon]="faTimesCircle" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Notifications</p>
              <p class="text-2xl font-semibold text-gray-900">{{ unreadNotifications }}</p>
            </div>
          </div>
          <div class="mt-4">
            <a
              routerLink="/app/notifications"
              class="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
            >
              View All →
            </a>
          </div>
        </div>

        <!-- Messages -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <fa-icon [icon]="faTimesCircle" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Messages</p>
              <p class="text-2xl font-semibold text-gray-900">{{ unreadMessages }}</p>
            </div>
          </div>
          <div class="mt-4">
            <a
              routerLink="/app/chat"
              class="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View Messages →
            </a>
          </div>
        </div>
      </div>

      <!-- Seller Stats (if seller) -->
      <div *ngIf="isSeller" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <fa-icon [icon]="faStore" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Products</p>
              <p class="text-2xl font-semibold text-gray-900">{{ sellerStats.totalProducts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <fa-icon [icon]="faChartLine" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Sales</p>
              <p class="text-2xl font-semibold text-gray-900">{{ sellerStats.totalSales | currency:'NGN' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 text-orange-600">
              <fa-icon [icon]="faStar" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rating</p>
              <p class="text-2xl font-semibold text-gray-900">{{ sellerStats.averageRating }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-pink-100 text-pink-600">
              <fa-icon [icon]="faUsers" class="w-6 h-6"></fa-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Customers</p>
              <p class="text-2xl font-semibold text-gray-900">{{ sellerStats.totalCustomers }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Orders -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div class="p-6">
            <div *ngIf="recentOrders.length === 0" class="text-center py-8">
              <fa-icon [icon]="faBox" class="w-12 h-12 text-gray-400 mx-auto mb-4"></fa-icon>
              <p class="text-gray-500">No orders yet</p>
              <a
                routerLink="/app/marketplace"
                class="mt-2 inline-block text-markt-primary hover:text-markt-secondary font-medium"
              >
                Start shopping →
              </a>
            </div>
            <div *ngFor="let order of recentOrders.slice(0, 5)" class="flex items-center py-3 border-b border-gray-100 last:border-b-0">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <fa-icon [icon]="faBox" class="w-5 h-5 text-gray-600"></fa-icon>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <p class="text-sm font-medium text-gray-900">Order #{{ order.order_number }}</p>
                <p class="text-sm text-gray-500">{{ order.total | currency:'NGN' }}</p>
              </div>
              <div class="ml-4">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="getOrderStatusClasses(order.status)"
                >
                  {{ getOrderStatusDisplay(order.status) }}
                </span>
              </div>
            </div>
            <div *ngIf="recentOrders.length > 5" class="mt-4 text-center">
              <a
                routerLink="/app/orders"
                class="text-sm text-markt-primary hover:text-markt-secondary font-medium"
              >
                View all orders →
              </a>
            </div>
          </div>
        </div>

        <!-- Recent Notifications -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Notifications</h3>
          </div>
          <div class="p-6">
            <div *ngIf="recentNotifications.length === 0" class="text-center py-8">
              <fa-icon [icon]="faTimesCircle" class="w-12 h-12 text-gray-400 mx-auto mb-4"></fa-icon>
              <p class="text-gray-500">No notifications</p>
            </div>
            <div *ngFor="let notification of recentNotifications.slice(0, 5)" class="flex items-start py-3 border-b border-gray-100 last:border-b-0">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <fa-icon [icon]="getNotificationIcon(notification.type)" class="w-4 h-4 text-gray-600"></fa-icon>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm text-gray-900">{{ notification.message }}</p>
                <p class="text-xs text-gray-500">{{ formatTimestamp(notification.created_at) }}</p>
              </div>
              <div *ngIf="!notification.is_read" class="ml-2">
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
            <div *ngIf="recentNotifications.length > 5" class="mt-4 text-center">
              <a
                routerLink="/app/notifications"
                class="text-sm text-markt-primary hover:text-markt-secondary font-medium"
              >
                View all notifications →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              routerLink="/app/marketplace"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faStore" class="w-6 h-6 text-blue-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">Browse Products</span>
            </a>

            <a
              routerLink="/app/requests"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faTimesCircle" class="w-6 h-6 text-green-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">View Requests</span>
            </a>

            <a
              routerLink="/app/social"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faUsers" class="w-6 h-6 text-purple-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">Social Feed</span>
            </a>

            <a
              routerLink="/app/profile"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faUser" class="w-6 h-6 text-orange-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">My Profile</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Seller Quick Actions (if seller) -->
      <div *ngIf="isSeller" class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Seller Tools</h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              routerLink="/app/seller/products/create"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faPlus" class="w-6 h-6 text-blue-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">Add Product</span>
            </a>

            <a
              routerLink="/app/seller/orders"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faBox" class="w-6 h-6 text-green-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">Manage Orders</span>
            </a>

            <a
              routerLink="/app/seller/analytics"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faChartLine" class="w-6 h-6 text-purple-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">Analytics</span>
            </a>

            <a
              routerLink="/app/seller/products"
              class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-markt-primary hover:bg-markt-primary/5 transition-colors"
            >
              <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <fa-icon [icon]="faStore" class="w-6 h-6 text-orange-600"></fa-icon>
              </div>
              <span class="text-sm font-medium text-gray-900">My Products</span>
            </a>
          </div>
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
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private chatService = inject(ChatService);
  private marketplaceService = inject(MarketplaceService);
  private requestService = inject(RequestService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Font Awesome Icons
  faShoppingBag = faShoppingCart;
  faBox = faBox;
  faHeart = faHeart;
  faMessageCircle = faTimesCircle;
  faBell = faTimesCircle;
  faTrendingUp = faChartLine;
  faUsers = faUsers;
  faStore = faStore;
  faFileText = faTimesCircle;
  faPlus = faTimesCircle;
  faEye = faEye;
  faClock = faClock;
  faCheckCircle = faTimesCircle;
  faExclamationTriangle = faTimesCircle;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faDollarSign = faDollarSign;
  faChartLine = faChartLine;
  faStar = faStar;
  faShoppingCart = faShoppingCart;
  faUserPlus = faUser;
  faCamera = faTimesCircle;
  faTimesCircle = faTimesCircle;
  faUser = faUser;

  // Data
  user: any = null;
  cartItemCount = 0;
  unreadNotifications = 0;
  unreadMessages = 0;
  recentOrders: any[] = [];
  recentNotifications: any[] = [];
  recentRequests: any[] = [];
  notifications: any[] = [];
  loading = true;

  // Stats
  orderStats = {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  };

  sellerStats = {
    totalProducts: 0,
    totalSales: 0,
    averageRating: 0,
    totalCustomers: 0
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Load user profile
    this.apiService.getProfile().subscribe({
      next: (response) => {
        this.user = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.loading = false;
      }
    });

    // Load recent orders
    this.apiService.getMyOrders({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentOrders = response.data?.items || [];
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
        this.recentOrders = [];
      }
    });

    // Load recent requests
    this.apiService.getMyRequests({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentRequests = response.data?.items || [];
      },
      error: (error) => {
        console.error('Error loading recent requests:', error);
        this.recentRequests = [];
      }
    });

    // Load notifications
    this.apiService.getNotifications({ limit: 5 }).subscribe({
      next: (response) => {
        this.notifications = response.data || [];
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.notifications = [];
      }
    });
  }

  private loadRecentData(): void {
    // Load recent orders
    this.orderService.getOrders$().subscribe(orders => {
      this.recentOrders = orders.slice(0, 5);
    });

    // Load recent notifications
    this.notificationService.getNotifications$().subscribe(notifications => {
      this.recentNotifications = notifications.slice(0, 5);
    });

    // Load order statistics
    this.orderService.getOrderStatistics().subscribe(stats => {
      this.orderStats = stats;
    });

    // Load seller statistics if seller
    if (this.isSeller) {
      this.loadSellerStats();
    }
  }

  private loadSellerStats(): void {
    // This would typically come from the seller service
    // For now, using mock data
    this.sellerStats = {
      totalProducts: 12,
      totalSales: 150000,
      averageRating: 4.5,
      totalCustomers: 45
    };
  }

  getUserDisplayName(): string {
    if (!this.user) return 'User';

    if (this.user.current_role === 'buyer' && this.user.buyer_account) {
      return this.user.buyer_account.buyername;
    } else if (this.user.current_role === 'seller' && this.user.seller_account) {
      return this.user.seller_account.shop_name;
    }
    return this.user.username;
  }

  get isSeller(): boolean {
    return this.user?.current_role === 'seller';
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

  getNotificationIcon(type: string): any {
    const iconMap: Record<string, any> = {
      'order': this.faBox,
      'message': this.faMessageCircle,
      'like': this.faHeart,
      'comment': this.faMessageCircle,
      'follow': this.faUserPlus,
      'product': this.faStore,
      'payment': this.faDollarSign,
      'system': this.faBell
    };
    return iconMap[type] || this.faBell;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }
} 