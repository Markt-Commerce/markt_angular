import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTES_ABSOLUTE } from '../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCheck, 
  faCopy, 
  faTruck, 
  faHistory, 
  faMessage, 
  faShoppingBag,
  faShieldAlt,
  faUndo,
  faHeadset,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { OrderService } from '../../domains/orders/services/order.service';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  quantity: number;
  price: number;
  seller: {
    name: string;
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: {
    type: string;
    lastFour: string;
  };
  status: string;
  estimatedDelivery: string;
  carrier: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Main Content -->
      <main class=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Success Hero Section (Full Width) -->
        <section class="bg-white rounded-2xl shadow-sm border border-border p-8 mb-8 text-center">
          <div class="mb-6">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <fa-icon [icon]="faCheck" class="text-3xl text-green-600"></fa-icon>
            </div>
            <h1 class="text-3xl font-bold text-dark mb-2">Order Placed Successfully!</h1>
            <p class="text-lg text-muted">Thank you for your purchase. Your order has been confirmed and is being processed.</p>
          </div>
          
          <div class="bg-light rounded-xl p-6 mb-6">
            <div class="flex items-center justify-center space-x-3">
              <span class="text-sm font-medium text-muted">Order Number:</span>
              <span class="text-xl font-bold text-dark">#{{ orderData?.orderNumber ?? 'MKT-2024-001847' }}</span>
              <button (click)="copyOrderNumber()" class="p-2 text-muted hover:text-primary transition-colors">
                <fa-icon [icon]="copyIcon" class="w-4 h-4"></fa-icon>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-dark">2-3</div>
              <div class="text-sm text-muted">Business Days</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-primary">{{ (orderData?.total | currency:'USD') || '$127.98' }}</div>
              <div class="text-sm text-muted">Total Paid</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-dark">{{ orderData?.items?.length ?? 3 }}</div>
              <div class="text-sm text-muted">Items Ordered</div>
            </div>
          </div>
        </section>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Left Column -->
          <div class="space-y-8">
            
            <!-- Order Details -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Order Details</h2>
              
              <!-- Items -->
              <div class="space-y-4 mb-8">
                @for (item of orderData?.items ?? mockItems; track item.id) {
                  <div class="flex items-center space-x-4 p-4 bg-light rounded-xl">
                    <img 
                      [src]="(item.product.images?.[0]?.url) || getDefaultImage(item.product.name || '')"
                      [alt]="item.product.name || ''"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                    <div class="flex-1">
                      <h3 class="font-semibold text-dark">{{ item.product.name || '' }}</h3>
                      <p class="text-sm text-muted">Sold by {{ item.seller.name || 'TechStore Campus' }}</p>
                      <p class="text-sm text-muted">Qty: {{ item.quantity }}</p>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-dark">{{ item.price * item.quantity | currency:'USD' }}</div>
                    </div>
                  </div>
                }
              </div>

              <!-- Pricing Breakdown -->
              <div class="border-t border-border pt-6">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-muted">Subtotal</span>
                    <span class="text-dark">{{ (orderData?.subtotal | currency:'USD') || '$154.98' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted">Campus Delivery Fee</span>
                    <span class="text-dark">{{ (orderData?.shipping | currency:'USD') || '$5.00' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted">Student Discount</span>
                    <span class="text-green-600">-{{ (orderData?.discount | currency:'USD') || '$15.00' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted">Tax</span>
                    <span class="text-dark">{{ (orderData?.tax | currency:'USD') || '$12.00' }}</span>
                  </div>
                  <div class="border-t border-border pt-3">
                    <div class="flex justify-between text-lg font-bold">
                      <span class="text-dark">Total</span>
                      <span class="text-primary">{{ (orderData?.total | currency:'USD') || '$127.98' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Delivery Information -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Delivery Information</h2>
              
              <div class="space-y-6">
                <div>
                  <h3 class="font-semibold text-dark mb-3">Shipping Address</h3>
                  <div class="text-muted">
                    <p>{{ orderData?.shippingAddress?.firstName ?? 'Sarah' }} {{ orderData?.shippingAddress?.lastName ?? 'Johnson' }}</p>
                    <p>{{ orderData?.shippingAddress?.address ?? 'Campus Dormitory Building A' }}</p>
                    <p>{{ orderData?.shippingAddress?.city ?? 'Room 247' }}</p>
                    <p>{{ orderData?.shippingAddress?.state ?? 'University Campus, State 12345' }}</p>
                  </div>
                </div>
                
                <div>
                  <h3 class="font-semibold text-dark mb-3">Payment Method</h3>
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <fa-icon [icon]="faCreditCard" class="text-blue-600"></fa-icon>
                    </div>
                    <div class="text-muted">
                      <p>{{ orderData?.paymentMethod?.type ?? 'Visa' }} ending in {{ orderData?.paymentMethod?.lastFour ?? '4242' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6 p-6 bg-light rounded-xl">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-dark">Tracking Information</h3>
                  <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {{ orderData?.status ?? 'Processing' }}
                  </span>
                </div>
                <p class="text-muted mb-4">Your order is being prepared for shipment. You'll receive tracking details via email once shipped.</p>
                <div class="text-sm text-muted">
                  <p><strong>Estimated Delivery:</strong> {{ orderData?.estimatedDelivery ?? 'March 28-30, 2024' }}</p>
                  <p><strong>Carrier:</strong> {{ orderData?.carrier ?? 'Campus Express Delivery' }}</p>
                </div>
              </div>
            </section>

          </div>

          <!-- Right Column -->
          <div class="space-y-8">
            
            <!-- Next Steps -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">What's Next?</h2>
              
              <div class="space-y-4">
                <button (click)="trackOrder()" class="w-full flex items-center justify-center space-x-3 p-4 bg-primary text-white rounded-xl hover:bg-secondary transition-colors">
                  <fa-icon [icon]="faTruck"></fa-icon>
                  <span class="font-medium">Track Your Order</span>
                </button>
                
                <button (click)="viewOrderHistory()" class="w-full flex items-center justify-center space-x-3 p-4 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                  <fa-icon [icon]="faHistory"></fa-icon>
                  <span class="font-medium">View Order History</span>
                </button>
                
                <button (click)="contactSellers()" class="w-full flex items-center justify-center space-x-3 p-4 border border-border text-dark rounded-xl hover:bg-light transition-colors">
                  <fa-icon [icon]="faMessage"></fa-icon>
                  <span class="font-medium">Contact Sellers</span>
                </button>
                
                <button (click)="continueShopping()" class="w-full flex items-center justify-center space-x-3 p-4 border border-border text-dark rounded-xl hover:bg-light transition-colors">
                  <fa-icon [icon]="faShoppingBag"></fa-icon>
                  <span class="font-medium">Continue Shopping</span>
                </button>
              </div>
            </section>

            <!-- Trust & Support -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Trust & Support</h2>
              
              <div class="space-y-6">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <fa-icon [icon]="faShieldAlt" class="text-green-600"></fa-icon>
                  </div>
                  <div>
                    <h3 class="font-semibold text-dark mb-1">Buyer Protection</h3>
                    <p class="text-sm text-muted">Your purchase is protected by our comprehensive buyer guarantee policy.</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <fa-icon [icon]="faUndo" class="text-blue-600"></fa-icon>
                  </div>
                  <div>
                    <h3 class="font-semibold text-dark mb-1">Easy Returns</h3>
                    <p class="text-sm text-muted">30-day return policy for most items. Check individual seller policies for details.</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <fa-icon [icon]="faHeadset" class="text-purple-600"></fa-icon>
                  </div>
                  <div>
                    <h3 class="font-semibold text-dark mb-1">24/7 Support</h3>
                    <p class="text-sm text-muted">Our campus support team is here to help with any questions or concerns.</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>

      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  // Icons
  faCheck = faCheck;
  faCopy = faCopy;
  faTruck = faTruck;
  faHistory = faHistory;
  faMessage = faMessage;
  faShoppingBag = faShoppingBag;
  faShieldAlt = faShieldAlt;
  faUndo = faUndo;
  faHeadset = faHeadset;
  faCreditCard = faCreditCard;

  // Component state
  orderData: OrderData | null = null;
  loading = false;
  error = '';
  copyIcon = faCopy;

  // Mock data for demonstration (matches Figma design)
  mockItems: OrderItem[] = [
    {
      id: 'item-1',
      product: {
        id: 'headphones',
        name: 'Wireless Bluetooth Headphones',
        images: [{ url: '/assets/images/products/sony-headphones.png' }]
      },
      quantity: 1,
      price: 79.99,
      seller: { name: 'TechStore Campus' }
    },
    {
      id: 'item-2',
      product: {
        id: 'textbook',
        name: 'Calculus Textbook (3rd Edition)',
        images: [{ url: '/assets/images/products/calculus-textbook.png' }]
      },
      quantity: 1,
      price: 45.00,
      seller: { name: 'BookExchange' }
    },
    {
      id: 'item-3',
      product: {
        id: 'hoodie',
        name: 'Campus Hoodie - Medium',
        images: [{ url: '/assets/images/products/vintage-jacket.png' }]
      },
      quantity: 1,
      price: 29.99,
      seller: { name: 'StudentWear' }
    }
  ];

  ngOnInit(): void {
    this.loadOrderData();
  }

  private loadOrderData(): void {
    // Get order ID from route parameters
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (orderId) {
      this.loading = true;
      // Domain service returns Order directly, not wrapped in ApiResponse
      this.orderService.getOrder(orderId).subscribe({
        next: (order) => {
          // Convert domain Order to component format
          this.orderData = this.transformOrderData(order);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          // Use mock data if API fails
          this.orderData = this.getMockOrderData();
          this.loading = false;
        }
      });
    } else {
      // Use mock data if no order ID
      this.orderData = this.getMockOrderData();
    }
  }

  /**
   * Transform domain Order model to component format
   * Domain Order model has different structure (Address value object, OrderItem domain models, etc.)
   */
  private transformOrderData(domainOrder: any): OrderData {
    // If it's already in component format, return as-is
    if (domainOrder && domainOrder.orderNumber && domainOrder.items && !domainOrder.shippingAddress?.street) {
      return domainOrder;
    }

    // Convert domain Order to component format
    // Domain Order has: id, orderNumber, buyerId, sellerId, shippingAddress (Address value object),
    // paymentMethod, subtotal, shippingFee, tax, discount, total, status, createdAt, items (OrderItem[]), customerNote
    return {
      id: domainOrder.id,
      orderNumber: domainOrder.orderNumber || domainOrder.order_number || `MKT-${domainOrder.id}`,
      items: (domainOrder.items || []).map((item: any) => ({
        id: item.id,
        product: {
          id: item.product?.id || item.product_id,
          name: item.product?.name || 'Unknown Product',
          images: item.product?.images || item.product?.productDto?.images || []
        },
        quantity: item.quantity,
        price: item.price, // Domain model already has price as number, not cents
        seller: { 
          name: item.product?.seller?.shop_name || item.product?.seller?.name || item.seller?.name || 'Unknown Seller' 
        }
      })),
      subtotal: domainOrder.subtotal || 0,
      shipping: domainOrder.shippingFee || domainOrder.shipping_fee || 0,
      tax: domainOrder.tax || 0,
      discount: domainOrder.discount || 0,
      total: domainOrder.total || 0,
      shippingAddress: {
        // Domain Order uses Address value object with camelCase properties
        firstName: domainOrder.shippingAddress?.firstName || domainOrder.shippingAddress?.first_name || 
                   domainOrder.shipping_address?.first_name || '',
        lastName: domainOrder.shippingAddress?.lastName || domainOrder.shippingAddress?.last_name || 
                 domainOrder.shipping_address?.last_name || '',
        address: domainOrder.shippingAddress?.street || domainOrder.shippingAddress?.address || 
                 domainOrder.shipping_address?.address || '',
        city: domainOrder.shippingAddress?.city || domainOrder.shipping_address?.city || '',
        state: domainOrder.shippingAddress?.state || domainOrder.shipping_address?.state || '',
        postalCode: domainOrder.shippingAddress?.postalCode || domainOrder.shippingAddress?.postal_code || 
                    domainOrder.shipping_address?.postal_code || ''
      },
      paymentMethod: {
        type: domainOrder.paymentMethod || domainOrder.payment_method || 'Visa',
        lastFour: domainOrder.paymentMethod?.lastFour || domainOrder.payment_method?.last_four || '4242'
      },
      status: domainOrder.status || 'Processing',
      estimatedDelivery: domainOrder.estimatedDelivery || domainOrder.estimated_delivery || 'March 28-30, 2024',
      carrier: domainOrder.carrier || 'Campus Express Delivery'
    };
  }

  private getMockOrderData(): OrderData {
    return {
      id: 'order-123',
      orderNumber: 'MKT-2024-001847',
      items: this.mockItems,
      subtotal: 154.98,
      shipping: 5.00,
      tax: 12.00,
      discount: 15.00,
      total: 127.98,
      shippingAddress: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        address: 'Campus Dormitory Building A',
        city: 'Room 247',
        state: 'University Campus, State 12345',
        postalCode: '12345'
      },
      paymentMethod: {
        type: 'Visa',
        lastFour: '4242'
      },
      status: 'Processing',
      estimatedDelivery: 'March 28-30, 2024',
      carrier: 'Campus Express Delivery'
    };
  }

  getDefaultImage(productName: string): string {
    // Return appropriate default image based on product name
    if (productName?.toLowerCase().includes('headphone')) {
      return '/assets/images/products/sony-headphones.png';
    } else if (productName?.toLowerCase().includes('textbook') || productName?.toLowerCase().includes('calculus')) {
      return '/assets/images/products/calculus-textbook.png';
    } else if (productName?.toLowerCase().includes('hoodie')) {
      return '/assets/images/products/vintage-jacket.png';
    }
    return '/assets/images/products/sony-headphones.png'; // Default fallback
  }

  copyOrderNumber(): void {
    const orderNumber = this.orderData?.orderNumber ?? 'MKT-2024-001847';
    navigator.clipboard.writeText(`#${orderNumber}`).then(() => {
      // Show copied feedback
      this.copyIcon = faCheck;
      setTimeout(() => {
        this.copyIcon = faCopy;
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
    });
  }

  trackOrder(): void {
    // Navigate to order tracking page
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT, this.orderData?.id, 'track']);
  }

  viewOrderHistory(): void {
    // Navigate to order history page
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT]);
  }

  contactSellers(): void {
    // Navigate to messages/chat with sellers
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT]);
  }

  continueShopping(): void {
    // Navigate back to marketplace
    this.router.navigate([ROUTES_ABSOLUTE.APP.MARKETPLACE]);
  }
}
