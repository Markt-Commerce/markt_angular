import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    averageValue: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    topSelling: {
      name: string;
      sales: number;
      revenue: number;
    }[];
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    averageOrderValue: number;
  };
  performance: {
    rating: number;
    reviews: number;
    responseTime: number;
    fulfillmentRate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="analytics-container">
      <div class="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Track your shop's performance and growth metrics</p>
      </div>

      <!-- Date Range Selector -->
      <div class="date-selector">
        <app-button 
          variant="secondary" 
          size="sm"
          [outline]="true"
        >
          Last 30 Days
        </app-button>
        <app-button 
          variant="secondary" 
          size="sm"
          [outline]="true"
        >
          Last 7 Days
        </app-button>
        <app-button 
          variant="secondary" 
          size="sm"
          [outline]="true"
        >
          This Month
        </app-button>
        <app-button 
          variant="secondary" 
          size="sm"
          [outline]="true"
        >
          Custom Range
        </app-button>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <h3>Total Revenue</h3>
            <span class="metric-change positive">+15.3%</span>
          </div>
          <p class="metric-value">₦{{ analytics.revenue.total.toLocaleString() }}</p>
          <div class="metric-breakdown">
            <span>Monthly: ₦{{ analytics.revenue.monthly.toLocaleString() }}</span>
            <span>Weekly: ₦{{ analytics.revenue.weekly.toLocaleString() }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h3>Total Orders</h3>
            <span class="metric-change positive">+8.7%</span>
          </div>
          <p class="metric-value">{{ analytics.orders.total }}</p>
          <div class="metric-breakdown">
            <span>Pending: {{ analytics.orders.pending }}</span>
            <span>Completed: {{ analytics.orders.completed }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h3>Average Order Value</h3>
            <span class="metric-change positive">+5.2%</span>
          </div>
          <p class="metric-value">₦{{ analytics.orders.averageValue.toLocaleString() }}</p>
          <div class="metric-breakdown">
            <span>Total Customers: {{ analytics.customers.total }}</span>
            <span>New Customers: {{ analytics.customers.new }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <h3>Shop Rating</h3>
            <span class="metric-change positive">+0.2</span>
          </div>
          <p class="metric-value">{{ analytics.performance.rating.toFixed(1) }} ⭐</p>
          <div class="metric-breakdown">
            <span>Reviews: {{ analytics.performance.reviews }}</span>
            <span>Response Time: {{ analytics.performance.responseTime }}h</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <h2>Revenue Trends</h2>
          <div class="chart-placeholder">
            <p>📈 Revenue chart will be displayed here</p>
            <p>Daily, weekly, and monthly revenue trends</p>
          </div>
        </div>

        <div class="chart-container">
          <h2>Order Trends</h2>
          <div class="chart-placeholder">
            <p>📊 Order volume chart will be displayed here</p>
            <p>Order count and status distribution</p>
          </div>
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="top-products">
        <h2>Top Selling Products</h2>
        <div class="products-table">
          <div class="table-header">
            <span>Product</span>
            <span>Sales</span>
            <span>Revenue</span>
            <span>Performance</span>
          </div>

          <div class="table-row" *ngFor="let product of analytics.products.topSelling; let i = index">
            <div class="product-info">
              <span class="product-rank">#{{ i + 1 }}</span>
              <span class="product-name">{{ product.name }}</span>
            </div>
            <span class="product-sales">{{ product.sales }} units</span>
            <span class="product-revenue">₦{{ product.revenue.toLocaleString() }}</span>
            <div class="product-performance">
              <div class="performance-bar">
                <div class="performance-fill" [style.width.%]="getPerformancePercentage(product.revenue)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Status -->
      <div class="inventory-status">
        <h2>Inventory Status</h2>
        <div class="inventory-grid">
          <div class="inventory-card">
            <div class="inventory-icon active">📦</div>
            <div class="inventory-content">
              <h3>Active Products</h3>
              <p>{{ analytics.products.active }}</p>
            </div>
          </div>

          <div class="inventory-card">
            <div class="inventory-icon warning">⚠️</div>
            <div class="inventory-content">
              <h3>Low Stock</h3>
              <p>{{ analytics.products.lowStock }}</p>
            </div>
          </div>

          <div class="inventory-card">
            <div class="inventory-icon danger">❌</div>
            <div class="inventory-content">
              <h3>Out of Stock</h3>
              <p>{{ analytics.products.outOfStock }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Insights -->
      <div class="customer-insights">
        <h2>Customer Insights</h2>
        <div class="insights-grid">
          <div class="insight-card">
            <h3>Customer Growth</h3>
            <p class="insight-value">{{ analytics.customers.new }}</p>
            <span class="insight-label">New customers this month</span>
          </div>

          <div class="insight-card">
            <h3>Returning Customers</h3>
            <p class="insight-value">{{ analytics.customers.returning }}</p>
            <span class="insight-label">Repeat customers</span>
          </div>

          <div class="insight-card">
            <h3>Average Order Value</h3>
            <p class="insight-value">₦{{ analytics.customers.averageOrderValue.toLocaleString() }}</p>
            <span class="insight-label">Per customer</span>
          </div>

          <div class="insight-card">
            <h3>Fulfillment Rate</h3>
            <p class="insight-value">{{ analytics.performance.fulfillmentRate }}%</p>
            <span class="insight-label">Orders fulfilled on time</span>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="export-section">
        <h2>Export Data</h2>
        <div class="export-buttons">
          <app-button variant="secondary" size="md">
            📊 Export Analytics Report
          </app-button>
          <app-button variant="secondary" size="md">
            📈 Export Revenue Data
          </app-button>
          <app-button variant="secondary" size="md">
            📋 Export Order History
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .analytics-header {
      margin-bottom: 2rem;
    }

    .analytics-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .analytics-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .date-selector {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .metric-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .metric-header h3 {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .metric-change {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .metric-change.positive {
      background: #d4edda;
      color: #155724;
    }

    .metric-change.negative {
      background: #f8d7da;
      color: #721c24;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 1rem 0;
    }

    .metric-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .chart-container h2 {
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

    .top-products {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .top-products h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .products-table {
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
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

    .product-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .product-rank {
      font-weight: 700;
      color: #007bff;
      min-width: 30px;
    }

    .product-name {
      font-weight: 500;
    }

    .product-sales {
      font-weight: 500;
      color: #6c757d;
    }

    .product-revenue {
      font-weight: 600;
      color: #28a745;
    }

    .performance-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .performance-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .inventory-status {
      margin-bottom: 3rem;
    }

    .inventory-status h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .inventory-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .inventory-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .inventory-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .inventory-icon.active {
      background: #d4edda;
    }

    .inventory-icon.warning {
      background: #fff3cd;
    }

    .inventory-icon.danger {
      background: #f8d7da;
    }

    .inventory-content h3 {
      margin: 0 0 0.5rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .inventory-content p {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .customer-insights {
      margin-bottom: 3rem;
    }

    .customer-insights h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .insight-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .insight-card h3 {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .insight-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
    }

    .insight-label {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .export-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .export-section h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
    }

    .export-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: 1rem;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .charts-section {
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

      .export-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  analytics: AnalyticsData = {
    revenue: {
      total: 2500000,
      monthly: 450000,
      weekly: 125000,
      daily: 18000,
      growth: 15.3
    },
    orders: {
      total: 234,
      pending: 18,
      completed: 210,
      cancelled: 6,
      averageValue: 10684
    },
    products: {
      total: 45,
      active: 38,
      lowStock: 5,
      outOfStock: 2,
      topSelling: [
        { name: 'Wireless Headphones', sales: 45, revenue: 675000 },
        { name: 'Smart Watch', sales: 32, revenue: 480000 },
        { name: 'Laptop Stand', sales: 28, revenue: 140000 },
        { name: 'Phone Case', sales: 25, revenue: 75000 },
        { name: 'USB Cable', sales: 22, revenue: 33000 }
      ]
    },
    customers: {
      total: 156,
      new: 23,
      returning: 133,
      averageOrderValue: 16025
    },
    performance: {
      rating: 4.7,
      reviews: 89,
      responseTime: 2.5,
      fulfillmentRate: 96
    }
  };

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  private loadAnalyticsData(): void {
    // TODO: Load real analytics data from API
    console.log('Loading analytics data...');
  }

  getPerformancePercentage(revenue: number): number {
    const maxRevenue = Math.max(...this.analytics.products.topSelling.map(p => p.revenue));
    return (revenue / maxRevenue) * 100;
  }
} 