import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: number;
  date: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="orders-container">
      <div class="orders-header">
        <div class="header-content">
          <h1>Orders</h1>
          <p>Manage your orders and track their status</p>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search orders by number, customer name, or email..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input"
          >
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="statusFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <select [(ngModel)]="paymentFilter" (change)="onFilter()" class="filter-select">
            <option value="">All Payment Status</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Payment Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="onSort()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total-high">Total: High to Low</option>
            <option value="total-low">Total: Low to High</option>
          </select>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="orders-table">
        <div class="table-header">
          <span>Order #</span>
          <span>Customer</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
          <span>Payment</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        <div class="table-row" *ngFor="let order of filteredOrders">
          <span class="order-number">{{ order.orderNumber }}</span>
          <div class="customer-info">
            <span class="customer-name">{{ order.customerName }}</span>
            <span class="customer-email">{{ order.customerEmail }}</span>
          </div>
          <span class="items-count">{{ order.items }} items</span>
          <span class="order-total">₦{{ order.total.toLocaleString() }}</span>
          <span class="order-status" [class]="order.status">
            {{ getStatusLabel(order.status) }}
          </span>
          <span class="payment-status" [class]="order.paymentStatus">
            {{ getPaymentStatusLabel(order.paymentStatus) }}
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
            <app-button 
              variant="secondary" 
              size="sm"
              [outline]="true"
              (clicked)="updateStatus(order.id)"
              *ngIf="order.status === 'pending'"
            >
              Process
            </app-button>
            <app-button 
              variant="secondary" 
              size="sm"
              [outline]="true"
              (clicked)="shipOrder(order.id)"
              *ngIf="order.status === 'processing'"
            >
              Ship
            </app-button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredOrders.length === 0">
        <div class="empty-icon">📦</div>
        <h3>No orders found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="filteredOrders.length > 0">
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
    .orders-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .orders-header {
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

    .orders-table {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .table-header {
      display: grid;
      grid-template-columns: 1fr 1.5fr 0.5fr 1fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 1.5fr 0.5fr 1fr 1fr 1fr 1fr 1fr;
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

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .customer-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .customer-email {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .items-count {
      font-weight: 500;
      color: #6c757d;
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

    .order-status.refunded {
      background: #e2e3e5;
      color: #383d41;
    }

    .payment-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
      text-transform: capitalize;
    }

    .payment-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .payment-status.paid {
      background: #d4edda;
      color: #155724;
    }

    .payment-status.failed {
      background: #f8d7da;
      color: #721c24;
    }

    .payment-status.refunded {
      background: #e2e3e5;
      color: #383d41;
    }

    .order-date {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .order-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
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
      .orders-container {
        padding: 1rem;
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

      .customer-info {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .order-actions {
        justify-content: center;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      total: 25000,
      status: 'pending',
      items: 2,
      date: '2025-01-03T10:30:00Z',
      paymentStatus: 'paid',
      shippingAddress: '123 Main St, Lagos, Nigeria'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      total: 15000,
      status: 'processing',
      items: 1,
      date: '2025-01-03T09:15:00Z',
      paymentStatus: 'paid',
      shippingAddress: '456 Oak Ave, Abuja, Nigeria'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike.johnson@example.com',
      total: 35000,
      status: 'shipped',
      items: 3,
      date: '2025-01-02T16:45:00Z',
      paymentStatus: 'paid',
      shippingAddress: '789 Pine Rd, Port Harcourt, Nigeria',
      trackingNumber: 'TRK123456'
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah.wilson@example.com',
      total: 18000,
      status: 'delivered',
      items: 2,
      date: '2025-01-01T14:20:00Z',
      paymentStatus: 'paid',
      shippingAddress: '321 Elm St, Kano, Nigeria'
    },
    {
      id: '5',
      orderNumber: 'ORD-005',
      customerName: 'David Brown',
      customerEmail: 'david.brown@example.com',
      total: 12000,
      status: 'cancelled',
      items: 1,
      date: '2025-01-01T11:00:00Z',
      paymentStatus: 'refunded',
      shippingAddress: '654 Maple Dr, Ibadan, Nigeria'
    }
  ];

  filteredOrders: Order[] = [];
  searchQuery = '';
  statusFilter = '';
  paymentFilter = '';
  sortBy = 'newest';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  ngOnInit(): void {
    this.loadOrders();
    this.applyFilters();
  }

  private loadOrders(): void {
    // TODO: Load orders from API
    console.log('Loading orders...');
    this.filteredOrders = [...this.orders];
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
    let filtered = [...this.orders];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Payment filter
    if (this.paymentFilter) {
      filtered = filtered.filter(order => order.paymentStatus === this.paymentFilter);
    }

    // Sort
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'total-high':
        filtered.sort((a, b) => b.total - a.total);
        break;
      case 'total-low':
        filtered.sort((a, b) => a.total - b.total);
        break;
    }

    this.filteredOrders = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded'
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

  updateStatus(orderId: string): void {
    // TODO: Update order status via API
    console.log('Updating status for order:', orderId);
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'pending') {
      order.status = 'processing';
      this.applyFilters();
    }
  }

  shipOrder(orderId: string): void {
    // TODO: Ship order via API
    console.log('Shipping order:', orderId);
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'processing') {
      order.status = 'shipped';
      order.trackingNumber = 'TRK' + Math.random().toString(36).substr(2, 6).toUpperCase();
      this.applyFilters();
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