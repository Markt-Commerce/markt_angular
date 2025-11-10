import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { OrderService } from '../../../domains/orders';
import { ApiService } from '../../../core/services/api.service'; // Still needed for updateOrderItemStatus (not yet migrated to domain service)
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGear, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TitleMetaService } from '../../../core/services/title-meta.service';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  date: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  notes?: string;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, FontAwesomeModule],
  template: `
    <div class="order-detail-container">
      <div class="order-detail-header">
        <div class="header-content">
          <h1>Order #{{ order?.orderNumber }}</h1>
          <p>Order details and tracking information</p>
        </div>
        <app-button 
          variant="secondary" 
          size="lg"
          [outline]="true"
          [routerLink]="[ROUTES_ABSOLUTE.APP.ORDERS.ROOT]"
        >
          ← Back to Orders
        </app-button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <p>Loading order details...</p>
      </div>

      <div *ngIf="!loading && order" class="order-content">
        <!-- Order Status -->
        <div class="status-section">
          <div class="status-card">
            <div class="status-header">
              <h2>Order Status</h2>
              <span class="status-badge" [class]="order.status">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="status-timeline">
              <div class="timeline-item" [class]="getTimelineStatus('ordered')">
                <i class="fas fa-clipboard-list text-blue-500"></i>
                <div class="timeline-content">
                  <h4>Order Placed</h4>
                  <p>{{ formatDate(order.date) }}</p>
                </div>
              </div>
              <div class="timeline-item" [class]="getTimelineStatus('processing')">
                <div class="timeline-icon"><fa-icon [icon]="faGear"></fa-icon></div>
                <div class="timeline-content">
                  <h4>Processing</h4>
                  <p *ngIf="order.status !== 'pending'">{{ formatDate(order.date) }}</p>
                </div>
              </div>
              <div class="timeline-item" [class]="getTimelineStatus('shipped')">
                <i class="fas fa-box text-orange-500"></i>
                <div class="timeline-content">
                  <h4>Shipped</h4>
                  <p *ngIf="order.trackingNumber">Tracking: {{ order.trackingNumber }}</p>
                </div>
              </div>
              <div class="timeline-item" [class]="getTimelineStatus('delivered')">
                <i class="fas fa-check text-green-500"></i>
                <div class="timeline-content">
                  <h4>Delivered</h4>
                  <p *ngIf="order.estimatedDelivery">Est. {{ formatDate(order.estimatedDelivery) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Information -->
        <div class="order-info-grid">
          <!-- Customer Information -->
          <div class="info-card">
            <h3>Customer Information</h3>
            <div class="info-content">
              <div class="info-item">
                <strong>Name:</strong>
                <span>{{ order.customerName }}</span>
              </div>
              <div class="info-item">
                <strong>Email:</strong>
                <span>{{ order.customerEmail }}</span>
              </div>
              <div class="info-item">
                <strong>Phone:</strong>
                <span>{{ order.customerPhone }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="info-card">
            <h3>Shipping Address</h3>
            <div class="info-content">
              <p>{{ order.shippingAddress.street }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
              <p>{{ order.shippingAddress.country }}</p>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="info-card">
            <h3>Payment Information</h3>
            <div class="info-content">
              <div class="info-item">
                <strong>Status:</strong>
                <span class="payment-status" [class]="order.paymentStatus">
                  {{ getPaymentStatusLabel(order.paymentStatus) }}
                </span>
              </div>
              <div class="info-item">
                <strong>Method:</strong>
                <span>{{ order.paymentMethod }}</span>
              </div>
              <div class="info-item">
                <strong>Total:</strong>
                <span class="total-amount">₦{{ order.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="info-card">
            <h3>Order Summary</h3>
            <div class="info-content">
              <div class="summary-item">
                <span>Subtotal:</span>
                <span>₦{{ order.subtotal.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span>Tax:</span>
                <span>₦{{ order.tax.toLocaleString() }}</span>
              </div>
              <div class="summary-item">
                <span>Shipping:</span>
                <span>₦{{ order.shipping.toLocaleString() }}</span>
              </div>
              <div class="summary-item" *ngIf="order.discount > 0">
                <span>Discount:</span>
                <span>-₦{{ order.discount.toLocaleString() }}</span>
              </div>
              <div class="summary-item total">
                <span>Total:</span>
                <span>₦{{ order.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items">
          <h3>Order Items</h3>
          <div class="items-table">
            <div class="table-header">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span>Status</span>
            </div>

            <div class="table-row" *ngFor="let item of order.items">
              <div class="product-info">
                <img [src]="item.productImage" [alt]="item.productName" class="product-image">
                <div class="product-details">
                  <h4>{{ item.productName }}</h4>
                  <span class="product-id">ID: {{ item.productId }}</span>
                </div>
              </div>
              <span class="item-price">₦{{ item.price.toLocaleString() }}</span>
              <span class="item-quantity">{{ item.quantity }}</span>
              <span class="item-total">₦{{ item.total.toLocaleString() }}</span>
              <span class="item-status" [class]="item.status">
                {{ getStatusLabel(item.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Actions -->
        <div class="order-actions">
          <h3>Order Actions</h3>
          <div class="actions-grid">
            <app-button 
              variant="primary" 
              size="md"
              (clicked)="processOrder()"
              *ngIf="order.status === 'pending'"
            >
              Process Order
            </app-button>
            
            <app-button 
              variant="primary" 
              size="md"
              (clicked)="shipOrder()"
              *ngIf="order.status === 'processing'"
            >
              Ship Order
            </app-button>
            
            <app-button 
              variant="secondary" 
              size="md"
              [outline]="true"
              (clicked)="updateTracking()"
              *ngIf="order.status === 'shipped'"
            >
              Update Tracking
            </app-button>
            
            <app-button 
              variant="success" 
              size="md"
              (clicked)="markDelivered()"
              *ngIf="order.status === 'shipped'"
            >
              Mark as Delivered
            </app-button>
            
            <app-button 
              variant="danger" 
              size="md"
              [outline]="true"
              (clicked)="cancelOrder()"
              *ngIf="order.status === 'pending' || order.status === 'processing'"
            >
              Cancel Order
            </app-button>
            
            <app-button 
              variant="secondary" 
              size="md"
              [outline]="true"
              (clicked)="printInvoice()"
            >
              Print Invoice
            </app-button>
          </div>
        </div>

        <!-- Order Notes -->
        <div class="order-notes" *ngIf="order.notes">
          <h3>Order Notes</h3>
          <div class="notes-content">
            <p>{{ order.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !order" class="error-state">
        <div class="error-icon"><fa-icon [icon]="faXmark"></fa-icon></div>
        <h3>Order Not Found</h3>
        <p>The order you're looking for doesn't exist or has been removed.</p>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="[ROUTES_ABSOLUTE.APP.ORDERS.ROOT]"
        >
          Back to Orders
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .order-detail-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .order-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .order-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .status-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .status-header h2 {
      color: #2c3e50;
      margin: 0;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.processing {
      background: #cce5ff;
      color: #004085;
    }

    .status-badge.shipped {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-badge.delivered {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .status-badge.refunded {
      background: #e2e3e5;
      color: #383d41;
    }

    .status-timeline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .status-timeline::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: #e9ecef;
      z-index: 1;
    }

    .timeline-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      z-index: 2;
      background: white;
      padding: 0.5rem;
    }

    .timeline-item.completed .timeline-icon {
      background: #28a745;
      color: white;
    }

    .timeline-item.current .timeline-icon {
      background: #007bff;
      color: white;
    }

    .timeline-item.pending .timeline-icon {
      background: #e9ecef;
      color: #6c757d;
    }

    .timeline-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .timeline-content {
      text-align: center;
    }

    .timeline-content h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      color: #2c3e50;
    }

    .timeline-content p {
      margin: 0;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .order-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .info-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .info-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-item strong {
      color: #495057;
      font-weight: 600;
    }

    .payment-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
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

    .total-amount {
      font-weight: 700;
      color: #28a745;
      font-size: 1.1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-item.total {
      border-top: 1px solid #e9ecef;
      padding-top: 0.75rem;
      margin-top: 0.75rem;
      font-weight: 700;
      font-size: 1.1rem;
      color: #2c3e50;
    }

    .order-items {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .order-items h3 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
    }

    .items-table {
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      align-items: center;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: #2c3e50;
    }

    .product-id {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .item-price,
    .item-quantity,
    .item-total {
      font-weight: 500;
      color: #495057;
    }

    .item-total {
      font-weight: 600;
      color: #28a745;
    }

    .item-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
      text-transform: capitalize;
    }

    .item-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .item-status.processing {
      background: #cce5ff;
      color: #004085;
    }

    .item-status.shipped {
      background: #d1ecf1;
      color: #0c5460;
    }

    .item-status.delivered {
      background: #d4edda;
      color: #155724;
    }

    .item-status.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .order-actions {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .order-actions h3 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.2rem;
    }

    .actions-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .order-notes {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .order-notes h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .notes-content {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      color: #495057;
    }

    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .error-state p {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .order-detail-container {
        padding: 1rem;
      }

      .order-detail-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .status-timeline {
        flex-direction: column;
        gap: 1rem;
      }

      .status-timeline::before {
        display: none;
      }

      .order-info-grid {
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

      .actions-grid {
        flex-direction: column;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  // Expose routes for template access
  protected readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private apiService = inject(ApiService); // Still needed for updateOrderItemStatus
  private titleMeta = inject(TitleMetaService);

  loading = true;
  order: Order | null = null;

  faGear = faGear;
  faTriangleExclamation = faTriangleExclamation;
  faXmark = faXmark;

  ngOnInit(): void {
    this.loadOrder();
  }

  private loadOrder(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (orderId) {
      // Domain service returns Order directly, not wrapped in ApiResponse
      this.orderService.getOrder(orderId).subscribe({
        next: (order) => {
          // Convert domain Order to component format
          this.order = this.convertDomainOrderToComponentFormat(order);
          this.titleMeta.setTitle([`Order #${this.order.orderNumber}`, 'Markt']);
          this.titleMeta.setMeta(`Order details for ${this.order.orderNumber}`);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.loading = false;
          this.order = null;
        }
      });
    } else {
      this.loading = false;
      this.order = null;
    }
  }

  /**
   * Convert domain Order model to component format
   * Domain Order model has different structure than component interface
   */
  private convertDomainOrderToComponentFormat(domainOrder: any): Order {
    // If it's already in component format, return as-is
    if (domainOrder && domainOrder.customerName && domainOrder.orderNumber) {
      return domainOrder;
    }

    // Convert domain Order to component format
    // Domain Order has: id, orderNumber, buyerId, sellerId, shippingAddress (Address value object),
    // paymentMethod, subtotal, shippingFee, tax, discount, total, status, createdAt, items (OrderItem[]), customerNote
    return {
      id: domainOrder.id,
      orderNumber: domainOrder.orderNumber || domainOrder.order_number,
      customerName: domainOrder.buyer?.buyername || domainOrder.buyer?.name || 'Unknown',
      customerEmail: domainOrder.buyer?.email || '',
      customerPhone: domainOrder.buyer?.phone_number || '',
      total: domainOrder.total,
      subtotal: domainOrder.subtotal,
      tax: domainOrder.tax || 0,
      shipping: domainOrder.shippingFee || domainOrder.shipping_fee || 0,
      discount: domainOrder.discount || 0,
      status: this.mapOrderStatus(domainOrder.status),
      paymentStatus: 'paid', // Default assumption - domain model doesn't have payment status
      paymentMethod: domainOrder.paymentMethod || domainOrder.payment_method || 'Unknown',
      date: domainOrder.createdAt || domainOrder.created_at,
      shippingAddress: {
        street: domainOrder.shippingAddress?.street || '',
        city: domainOrder.shippingAddress?.city || '',
        state: domainOrder.shippingAddress?.state || '',
        postalCode: domainOrder.shippingAddress?.postalCode || domainOrder.shippingAddress?.postal_code || '',
        country: domainOrder.shippingAddress?.country || ''
      },
      billingAddress: {
        // Use shipping address as billing address if not provided
        street: domainOrder.billingAddress?.street || domainOrder.shippingAddress?.street || '',
        city: domainOrder.billingAddress?.city || domainOrder.shippingAddress?.city || '',
        state: domainOrder.billingAddress?.state || domainOrder.shippingAddress?.state || '',
        postalCode: domainOrder.billingAddress?.postalCode || domainOrder.billingAddress?.postal_code || domainOrder.shippingAddress?.postalCode || domainOrder.shippingAddress?.postal_code || '',
        country: domainOrder.billingAddress?.country || domainOrder.shippingAddress?.country || ''
      },
      trackingNumber: domainOrder.trackingNumber || domainOrder.tracking_number,
      estimatedDelivery: domainOrder.estimatedDelivery || domainOrder.estimated_delivery,
      items: (domainOrder.items || []).map((item: any) => ({
        id: item.id,
        productId: item.product?.id || item.product_id,
        productName: item.product?.name || 'Unknown Product',
        productImage: item.product?.images?.[0]?.media?.url || item.product?.images?.[0]?.media?.thumbnail_url || '',
        price: item.price,
        quantity: item.quantity,
        total: item.calculateTotal ? item.calculateTotal() : (item.price * item.quantity),
        status: item.status
      })),
      notes: domainOrder.customerNote || domainOrder.customer_note || domainOrder.notes
    };
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private mapOrderStatus(apiStatus: string): 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' {
    const statusMap: Record<string, 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'> = {
      'pending': 'pending',
      'confirmed': 'processing',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };
    return statusMap[apiStatus] || 'pending';
  }

  getTimelineStatus(step: string): string {
    if (!this.order) return 'pending';
    
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.order.status);
    const stepIndex = statusOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  }

  processOrder(): void {
    if (this.order) {
      // Order item status updates - using OrderService (temporarily delegates to ApiService)
      // TODO: Migrate to OrderItemRepository when created
      const updatePromises = this.order.items.map(item => 
        this.orderService.updateOrderItemStatus(parseInt(item.id), { status: 'processing' }).toPromise()
      );
      
      Promise.all(updatePromises).then(() => {
        alert('Order processed successfully!');
        this.loadOrder(); // Reload the order to get updated status
      }).catch(error => {
        console.error('Error processing order:', error);
        alert('Failed to process order.');
      });
    }
  }

  shipOrder(): void {
    if (this.order) {
      // Order item status updates - using OrderService (temporarily delegates to ApiService)
      // TODO: Migrate to OrderItemRepository when created
      const updatePromises = this.order.items.map(item => 
        this.orderService.updateOrderItemStatus(parseInt(item.id), { status: 'shipped' }).toPromise()
      );
      
      Promise.all(updatePromises).then(() => {
        alert('Order shipped successfully!');
        this.loadOrder(); // Reload the order to get updated status
      }).catch(error => {
        console.error('Error shipping order:', error);
        alert('Failed to ship order.');
      });
    }
  }

  updateTracking(): void {
    // TODO: Implement tracking update modal using apiService
    // For now, do nothing - backend will handle tracking updates
  }

  markDelivered(): void {
    if (this.order) {
      // Order item status updates - using OrderService (temporarily delegates to ApiService)
      // TODO: Migrate to OrderItemRepository when created
      const updatePromises = this.order.items.map(item => 
        this.orderService.updateOrderItemStatus(parseInt(item.id), { status: 'delivered' }).toPromise()
      );
      
      Promise.all(updatePromises).then(() => {
        alert('Order marked as delivered successfully!');
        this.loadOrder(); // Reload the order to get updated status
      }).catch(error => {
        console.error('Error marking order as delivered:', error);
        alert('Failed to mark order as delivered.');
      });
    }
  }

  cancelOrder(): void {
    if (this.order && confirm('Are you sure you want to cancel this order?')) {
      // Domain service has cancelOrder() method - use it instead of updating item statuses
      this.orderService.cancelOrder(this.order.id).subscribe({
        next: () => {
          alert('Order cancelled successfully!');
          this.loadOrder(); // Reload the order to get updated status
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('Failed to cancel order.');
        }
      });
    }
  }

  printInvoice(): void {
    // TODO: Implement invoice printing using apiService
    // For now, just use browser print
    window.print();
  }
} 