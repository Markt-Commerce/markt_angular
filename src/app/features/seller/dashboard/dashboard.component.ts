import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Seller Dashboard</h1>
        <p>Welcome back! Here's what's happening with your shop today.</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Total Sales</h3>
            <p class="stat-value">₦{{ stats.totalSales.toLocaleString() }}</p>
            <span class="stat-change positive">+12.5% from last month</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>Total Orders</h3>
            <p class="stat-value">{{ stats.totalOrders }}</p>
            <span class="stat-change positive">+8.2% from last month</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>Pending Orders</h3>
            <p class="stat-value">{{ stats.pendingOrders }}</p>
            <span class="stat-change neutral">No change</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>Average Rating</h3>
            <p class="stat-value">{{ stats.averageRating.toFixed(1) }}</p>
            <span class="stat-change positive">+0.3 from last month</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <app-button 
            variant="primary" 
            size="lg"
            [routerLink]="['/app/seller/listings/create']"
          >
            <span>➕</span>
            Add New Product
          </app-button>
          
          <app-button 
            variant="secondary" 
            size="lg"
            [routerLink]="['/app/seller/listings']"
          >
            <span>📋</span>
            Manage Products
          </app-button>
          
          <app-button 
            variant="secondary" 
            size="lg"
            [routerLink]="['/app/orders']"
          >
            <span>📦</span>
            View Orders
          </app-button>
          
          <app-button 
            variant="secondary" 
            size="lg"
            [routerLink]="['/app/seller/analytics']"
          >
            <span>📊</span>
            View Analytics
          </app-button>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="recent-orders">
        <div class="section-header">
          <h2>Recent Orders</h2>
          <app-button 
            variant="secondary" 
            size="sm"
            [outline]="true"
            [routerLink]="['/app/orders']"
          >
            View All Orders
          </app-button>
        </div>

        <div class="orders-table">
          <div class="table-header">
            <span>Order #</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>

          <div class="table-row" *ngFor="let order of recentOrders">
            <span class="order-number">{{ order.orderNumber }}</span>
            <span class="customer-name">{{ order.customerName }}</span>
            <span class="items-count">{{ order.items }} items</span>
            <span class="order-total">₦{{ order.total.toLocaleString() }}</span>
            <span class="order-status" [class]="order.status">
              {{ getStatusLabel(order.status) }}
            </span>
            <span class="order-date">{{ formatDate(order.date) }}</span>
            <div class="order-actions">
              <app-button 
                variant="secondary" 
                size="sm"
                [outline]="true"
                [routerLink]="['/app/orders', order.id]"
              >
                View
              </app-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Chart Placeholder -->
      <div class="performance-chart">
        <h2>Sales Performance</h2>
        <div class="chart-placeholder">
          <p>📈 Sales chart will be displayed here</p>
          <p>Monthly revenue trends and analytics</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .dashboard-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .stat-value {
      margin: 0 0 0.25rem 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: #28a745;
    }

    .stat-change.negative {
      color: #dc3545;
    }

    .stat-change.neutral {
      color: #6c757d;
    }

    .quick-actions {
      margin-bottom: 3rem;
    }

    .quick-actions h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .actions-grid app-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
    }

    .recent-orders {
      margin-bottom: 3rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .orders-table {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .table-header {
      display: grid;
      grid-template-columns: 1fr 1fr 0.5fr 1fr 1fr 1fr 0.5fr;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 0.5fr 1fr 1fr 1fr 0.5fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      align-items: center;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .order-number {
      font-weight: 600;
      color: #007bff;
    }

    .customer-name {
      font-weight: 500;
    }

    .order-total {
      font-weight: 600;
      color: #28a745;
    }

    .order-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
      text-transform: capitalize;
    }

    .order-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .order-status.processing {
      background: #cce5ff;
      color: #004085;
    }

    .order-status.shipped {
      background: #d1ecf1;
      color: #0c5460;
    }

    .order-status.delivered {
      background: #d4edda;
      color: #155724;
    }

    .order-status.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .order-date {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .performance-chart {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .performance-chart h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 8px;
      color: #6c757d;
      text-align: center;
    }

    .chart-placeholder p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .table-header {
        display: none;
      }

      .table-row {
        border: 1px solid #e9ecef;
        border-radius: 8px;
        margin-bottom: 1rem;
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalSales: 1250000,
    totalOrders: 156,
    pendingOrders: 12,
    totalProducts: 45,
    averageRating: 4.7,
    monthlyRevenue: 450000
  };

  recentOrders: RecentOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      total: 25000,
      status: 'pending',
      date: '2025-01-03T10:30:00Z',
      items: 2
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Jane Smith',
      total: 15000,
      status: 'processing',
      date: '2025-01-03T09:15:00Z',
      items: 1
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Johnson',
      total: 35000,
      status: 'shipped',
      date: '2025-01-02T16:45:00Z',
      items: 3
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      customerName: 'Sarah Wilson',
      total: 18000,
      status: 'delivered',
      date: '2025-01-01T14:20:00Z',
      items: 2
    }
  ];

  ngOnInit(): void {
    // Load dashboard data
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // TODO: Load real data from API
    console.log('Loading dashboard data...');
  }

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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
} 