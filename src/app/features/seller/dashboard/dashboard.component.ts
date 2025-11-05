import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ApiService } from '../../../core/services/api.service'; // Still needed for getSellerAnalytics (not yet migrated)
import { ROUTES_ABSOLUTE, buildPath } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
  faChevronDown
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
  status: 'pending' | 'shipped' | 'processing';
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
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private apiService = inject(ApiService); // Still needed for getSellerAnalytics (not yet migrated)
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
    totalRevenue: 18432,
    totalOrders: 156,
    productViews: 3247,
    conversionRate: 4.8,
    todaysRevenue: 2847,
    newOrders: 23
  });

  recentOrders = signal<RecentOrder[]>([
    {
      id: '1',
      orderNumber: '1234',
      customerName: 'Sarah Johnson',
      customerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      total: 89.99,
      status: 'pending',
      date: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      orderNumber: '1233',
      customerName: 'Mike Wilson',
      customerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
      total: 156.50,
      status: 'shipped',
      date: '2024-03-15T09:15:00Z'
    },
    {
      id: '3',
      orderNumber: '1232',
      customerName: 'Emma Davis',
      customerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
      total: 67.25,
      status: 'processing',
      date: '2024-03-15T08:45:00Z'
    }
  ]);

  recentMessages = signal<RecentMessage[]>([
    {
      id: '1',
      customerName: 'Lisa Chen',
      customerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      message: 'Hi! Is this item still available?',
      timeAgo: '2 min ago',
      isUnread: true
    },
    {
      id: '2',
      customerName: 'Tom Rodriguez',
      customerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
      message: 'Can you provide more details about shipping?',
      timeAgo: '1 hour ago',
      isUnread: false
    },
    {
      id: '3',
      customerName: 'Anna Smith',
      customerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
      message: 'Thank you for the quick delivery!',
      timeAgo: '3 hours ago',
      isUnread: false
    }
  ]);

  topProducts = signal<TopProduct[]>([
    {
      id: '1',
      name: 'MacBook Pro 13"',
      category: 'Electronics',
      price: 1299,
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e8796dd9de-84cb6ce4422a01eb5d70.png',
      sold: 24
    },
    {
      id: '2',
      name: 'Student Backpack',
      category: 'Accessories',
      price: 89,
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/74028f9f61-9979014e14c1a16de9d5.png',
      sold: 18
    },
    {
      id: '3',
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 159,
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c0a6c1cda3-12a4ca92dca2d1a52fe1.png',
      sold: 15
    },
    {
      id: '4',
      name: 'Study Desk Lamp',
      category: 'Home & Living',
      price: 45,
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/ca180432b2-e43e0972ffed8f9bf3b9.png',
      sold: 12
    }
  ]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load dashboard data from API
   * This method fetches real data from the backend when available
   */
  private loadDashboardData(): void {
    // TODO: getSellerAnalytics() not yet migrated to domain service - keeping ApiService for now
    this.apiService.getSellerAnalytics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update stats with real data
          this.stats.set({
            totalRevenue: response.data.total_revenue || 18432,
            totalOrders: response.data.total_orders || 156,
            productViews: response.data.product_views || 3247,
            conversionRate: response.data.conversion_rate || 4.8,
            todaysRevenue: response.data.todays_revenue || 2847,
            newOrders: response.data.new_orders || 23
          });
        }
      },
      error: (error) => {
        console.error('Error loading seller analytics:', error);
        // Keep mock data on error
      }
    });

    // Migrated to OrderService.getOrders() - uses DDD pattern with OrderRepository
    this.orderService.getOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Take first 3 orders and map to RecentOrder format
          const orders: RecentOrder[] = response.data.slice(0, 3).map((order: any) => ({
            id: order.id,
            orderNumber: order.order_number || order.id,
            customerName: order.buyer?.buyername || order.buyer?.username || 'Unknown Customer',
            customerAvatar: order.buyer?.profile_picture_url || '/assets/images/default-avatar.png',
            total: order.total || 0,
            status: order.status || 'pending',
            date: order.created_at || new Date().toISOString()
          }));
          this.recentOrders.set(orders);
        }
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
        // Keep mock data on error
      }
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
      cancelled: 'Cancelled'
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