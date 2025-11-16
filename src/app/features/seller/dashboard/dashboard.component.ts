import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../domains/orders/services/order.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTES_ABSOLUTE, buildPath } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MarketplaceService } from '../../../domains/marketplace';
import { OrderItemStatus } from '../../../domains/orders/models/order.model';
import {
  SellerAnalyticsService,
  SellerStartCardsService,
  StartCardsResponse,
} from '../../../domains/authentication';
import {
  faBell,
  faChartLine,
  faBox,
  faShoppingCart,
  faComments,
  faChartBar,
  faWarehouse,
  faCog,
  faPlus,
  faDollarSign,
  faShoppingBag,
  faEye,
  faPercentage,
  faShippingFast,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  productViews: number;
  conversionRate: number;
  todaysRevenue: number;
  newOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAvatar: string;
  total: number;
  status: OrderItemStatus;
  date: string;
}

interface RecentMessage {
  id: string;
  customerName: string;
  customerAvatar: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  sold: number;
}

interface SalesData {
  day: string;
  revenue: number;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private analyticsService = inject(SellerAnalyticsService);
  private startCardsService = inject(SellerStartCardsService);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);

  // Font Awesome Icons
  faBell = faBell;
  faChartLine = faChartLine;
  faBox = faBox;
  faShoppingCart = faShoppingCart;
  faComments = faComments;
  faChartBar = faChartBar;
  faWarehouse = faWarehouse;
  faCog = faCog;
  faPlus = faPlus;
  faDollarSign = faDollarSign;
  faShoppingBag = faShoppingBag;
  faEye = faEye;
  faPercentage = faPercentage;
  faShippingFast = faShippingFast;
  faChevronDown = faChevronDown;

  // Signals for reactive state management
  stats = signal<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    productViews: 0,
    conversionRate: 0,
    todaysRevenue: 0,
    newOrders: 0,
  });

  isLoading = signal<boolean>(false);
  startCards = signal<StartCardsResponse | null>(null);

  /**
   * Get incomplete start cards for display
   */
  getIncompleteStartCards() {
    const cards = this.startCards();
    return cards?.getIncompleteCards() || [];
  }

  /**
   * Check if seller has incomplete onboarding tasks
   */
  hasIncompleteTasks(): boolean {
    const cards = this.startCards();
    return cards ? cards.getCompletedCount() < cards.getTotalCount() : false;
  }

  recentOrders = signal<RecentOrder[]>([
    {
      id: '1',
      orderNumber: '1234',
      customerName: 'Sarah Johnson',
      customerAvatar:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      total: 89.99,
      status: 'pending',
      date: '2024-03-15T10:30:00Z',
    },
    {
      id: '2',
      orderNumber: '1233',
      customerName: 'Mike Wilson',
      customerAvatar:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
      total: 156.5,
      status: 'shipped',
      date: '2024-03-15T09:15:00Z',
    },
    {
      id: '3',
      orderNumber: '1232',
      customerName: 'Emma Davis',
      customerAvatar:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
      total: 67.25,
      status: 'processing',
      date: '2024-03-15T08:45:00Z',
    },
  ]);

  recentMessages = signal<RecentMessage[]>([
    {
      id: '1',
      customerName: 'Lisa Chen',
      customerAvatar:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      message: 'Hi! Is this item still available?',
      timeAgo: '2 min ago',
      isUnread: true,
    },
    {
      id: '2',
      customerName: 'Tom Rodriguez',
      customerAvatar:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
      message: 'Can you provide more details about shipping?',
      timeAgo: '1 hour ago',
      isUnread: false,
    },
    {
      id: '3',
      customerName: 'Anna Smith',
      customerAvatar:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
      message: 'Thank you for the quick delivery!',
      timeAgo: '3 hours ago',
      isUnread: false,
    },
  ]);

  topProducts = signal<TopProduct[]>([
    {
      id: '1',
      name: 'MacBook Pro 13"',
      category: 'Electronics',
      price: 1299,
      image:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/e8796dd9de-84cb6ce4422a01eb5d70.png',
      sold: 24,
    },
    {
      id: '2',
      name: 'Student Backpack',
      category: 'Accessories',
      price: 89,
      image:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/74028f9f61-9979014e14c1a16de9d5.png',
      sold: 18,
    },
    {
      id: '3',
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 159,
      image:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/c0a6c1cda3-12a4ca92dca2d1a52fe1.png',
      sold: 15,
    },
    {
      id: '4',
      name: 'Study Desk Lamp',
      category: 'Home & Living',
      price: 45,
      image:
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/ca180432b2-e43e0972ffed8f9bf3b9.png',
      sold: 12,
    },
  ]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load dashboard data from API
   * Uses domain services for analytics and start cards
   */
  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load analytics overview (30-day window by default)
    this.analyticsService.getAnalyticsOverview({ window_days: 30 }).subscribe({
      next: (overview) => {
        // Map analytics overview to dashboard stats
        // Note: The backend returns revenue_30d, orders_30d, views_30d, conversion_30d
        // We'll use these for the main stats, and calculate today's values separately if needed
        this.stats.set({
          totalRevenue: overview.revenue30d,
          totalOrders: overview.orders30d,
          productViews: overview.views30d,
          conversionRate: overview.conversion30d,
          // For now, we'll use the 30-day values as placeholders
          // In a real implementation, you might want separate "today" metrics
          todaysRevenue: 0, // TODO: Add today-specific endpoint if needed
          newOrders: 0, // TODO: Add today-specific endpoint if needed
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading seller analytics:', error);
        this.isLoading.set(false);
        // Keep default values on error
      },
    });

    // Load start cards for onboarding
    this.startCardsService.getStartCards().subscribe({
      next: (cards) => {
        this.startCards.set(cards);
      },
      error: (error) => {
        console.error('Error loading start cards:', error);
        // Start cards are optional, so we don't fail the whole dashboard
      },
    });

    this.orderService
      .loadSellerOrders({ per_page: 5 })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          const sellerItems = this.orderService.sellerOrderItemsSnapshot ?? [];
          const recentOrders: RecentOrder[] = sellerItems
            .slice(0, 3)
            .map((item) => ({
              id: item.orderId,
              orderNumber: item.order.orderNumber,
              customerName:
                item.order.buyer?.buyername ||
                item.order.buyer?.id ||
                `Order ${item.orderId}`,
              customerAvatar:
                item.order.buyer?.profilePictureUrl ||
                '/assets/images/default-avatar.png',
              total: item.price * item.quantity,
              status: item.status,
              date: item.order.createdAt,
            }));
          this.recentOrders.set(recentOrders);
        },
        error: (error) => {
          console.error('Error loading recent orders:', error);
        },
      });
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  }

  /**
   * Navigation methods
   */
  navigateToCreateListing(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SELLER.LISTINGS_CREATE]);
  }

  navigateToAnalytics(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SELLER.ANALYTICS]);
  }

  navigateToInventory(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SELLER.LISTINGS]);
  }

  navigateToOrders(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT]);
  }

  navigateToMessages(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT]);
  }
}
