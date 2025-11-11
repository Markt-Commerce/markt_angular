import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ROUTES_ABSOLUTE, buildPath } from '../../core/config/routes.config';
import { 
  faCopy, 
  faTruck, 
  faCheck, 
  faExternalLinkAlt,
  faBell,
  faExclamationTriangle,
  faComments,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { OrderService } from '../../domains/orders';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  isCurrent: boolean;
  icon: string;
}

interface PackageItem {
  id: string;
  name: string;
  details: string;
  price: number;
  quantity: number;
  seller: string;
  image: string;
}

interface TrackingData {
  orderNumber: string;
  placementDate: string;
  currentStatus: string;
  deliveryProgress: number;
  expectedDelivery: string;
  trackingNumber: string;
  carrier: string;
  serviceType: string;
  weight: string;
  timeline: TrackingEvent[];
  packageContents: PackageItem[];
  deliveryAddress: {
    name: string;
    institution: string;
    address: string;
    city: string;
    building: string;
  };
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Main Content -->
      <main class=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Order Header Section -->
        <section class="bg-white rounded-2xl shadow-sm border border-border p-8 mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-dark mb-2">Order #{{ trackingData?.orderNumber ?? 'MK-2024-001847' }}</h1>
              <p class="text-muted">Placed on {{ trackingData?.placementDate ?? 'March 15, 2024' }}</p>
            </div>
            <div class="flex items-center space-x-3 mt-4 lg:mt-0">
              <button (click)="copyOrderNumber()" class="flex items-center space-x-2 px-4 py-2 text-muted hover:text-primary transition-colors border border-border rounded-lg">
                <fa-icon [icon]="copyIcon" class="w-4 h-4"></fa-icon>
                <span>Copy Order #</span>
              </button>
              <span class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {{ trackingData?.currentStatus ?? 'Out for Delivery' }}
              </span>
            </div>
          </div>
          
          <!-- Delivery Progress -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-muted">Delivery Progress</span>
              <span class="text-sm text-muted">Expected: {{ trackingData?.expectedDelivery ?? 'Today by 6:00 PM' }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-primary h-3 rounded-full transition-all duration-500" 
                [style.width.%]="trackingData?.deliveryProgress ?? 80">
              </div>
            </div>
          </div>
        </section>

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Left Column -->
          <div class="space-y-8">
            
            <!-- Tracking Timeline -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Tracking Timeline</h2>
              
              <div class="space-y-6">
                @for (event of trackingData?.timeline ?? mockTimeline; track event.id) {
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                      @if (event.isCurrent) {
                        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <fa-icon [icon]="faTruck" class="text-white text-sm"></fa-icon>
                        </div>
                      } @else {
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <fa-icon [icon]="faCheck" class="text-green-600 text-sm"></fa-icon>
                        </div>
                      }
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-1">
                        <h3 class="font-semibold text-dark">{{ event.status }}</h3>
                        @if (event.isCurrent) {
                          <span class="px-2 py-1 bg-primary text-white rounded-full text-xs font-medium">Current</span>
                        }
                      </div>
                      <p class="text-sm text-muted mb-1">{{ event.description }}</p>
                      <p class="text-xs text-muted">{{ event.timestamp }}</p>
                    </div>
                  </div>
                }
              </div>
            </section>

            <!-- Package Contents -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Package Contents</h2>
              
              <div class="space-y-4">
                @for (item of trackingData?.packageContents ?? mockPackageContents; track item.id) {
                  <div class="flex items-center space-x-4 p-4 bg-light rounded-xl">
                    <img 
                      [src]="item.image"
                      [alt]="item.name"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                    <div class="flex-1">
                      <h3 class="font-semibold text-dark">{{ item.name }}</h3>
                      <p class="text-sm text-muted">{{ item.details }}</p>
                      <p class="text-sm text-muted">Qty: {{ item.quantity }}</p>
                      <p class="text-sm text-muted">By {{ item.seller }}</p>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-dark">{{ item.price | currency:'USD' }}</div>
                    </div>
                  </div>
                }
              </div>
            </section>

          </div>

          <!-- Right Column -->
          <div class="space-y-8">
            
            <!-- Tracking Details -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Tracking Details</h2>
              
              <div class="space-y-4 mb-6">
                <div class="flex items-center justify-between">
                  <span class="text-muted">Tracking Number:</span>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-dark">{{ trackingData?.trackingNumber ?? '1Z999AA1234567890' }}</span>
                    <button (click)="copyTrackingNumber()" class="p-1 text-muted hover:text-primary transition-colors">
                      <fa-icon [icon]="faCopy" class="w-3 h-3"></fa-icon>
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Carrier:</span>
                  <span class="font-medium text-dark">{{ trackingData?.carrier ?? 'UPS Ground' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Service Type:</span>
                  <span class="font-medium text-dark">{{ trackingData?.serviceType ?? 'Standard Delivery' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Weight:</span>
                  <span class="font-medium text-dark">{{ trackingData?.weight ?? '2.5 lbs' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-muted">Estimated Delivery:</span>
                  <span class="font-medium text-primary">{{ trackingData?.expectedDelivery ?? 'Today by 6:00 PM' }}</span>
                </div>
              </div>
              
              <button (click)="trackOnCarrierWebsite()" class="w-full flex items-center justify-center space-x-2 p-3 bg-primary text-white rounded-xl hover:bg-secondary transition-colors">
                <span>Track on UPS Website</span>
                <fa-icon [icon]="faExternalLinkAlt" class="w-4 h-4"></fa-icon>
              </button>
            </section>

            <!-- Delivery Address -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Delivery Address</h2>
              
              <div class="text-muted mb-6">
                <p class="font-medium text-dark">{{ trackingData?.deliveryAddress?.name ?? 'Emma Johnson' }}</p>
                <p>{{ trackingData?.deliveryAddress?.institution ?? 'Northwestern University' }}</p>
                <p>{{ trackingData?.deliveryAddress?.address ?? '1840 Sheridan Road' }}</p>
                <p>{{ trackingData?.deliveryAddress?.city ?? 'Evanston, IL 60208' }}</p>
                <p>{{ trackingData?.deliveryAddress?.building ?? 'Building: Willard Hall, Room 312' }}</p>
              </div>
              
              <button (click)="changeDeliveryInstructions()" class="w-full flex items-center justify-center space-x-2 p-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                <span>Change Delivery Instructions</span>
              </button>
            </section>

            <!-- Need Help? -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <h2 class="text-2xl font-bold text-dark mb-6">Need Help?</h2>
              
              <div class="space-y-3">
                <button (click)="contactSellers()" class="w-full flex items-center space-x-3 p-4 border border-border text-dark rounded-xl hover:bg-light transition-colors">
                  <fa-icon [icon]="faComments" class="w-5 h-5"></fa-icon>
                  <span class="font-medium">Contact Sellers</span>
                </button>
                
                <button (click)="getDeliveryUpdates()" class="w-full flex items-center space-x-3 p-4 border border-border text-dark rounded-xl hover:bg-light transition-colors">
                  <fa-icon [icon]="faBell" class="w-5 h-5"></fa-icon>
                  <span class="font-medium">Get Delivery Updates</span>
                </button>
                
                <button (click)="reportIssue()" class="w-full flex items-center space-x-3 p-4 border border-border text-dark rounded-xl hover:bg-light transition-colors">
                  <fa-icon [icon]="faExclamationTriangle" class="w-5 h-5"></fa-icon>
                  <span class="font-medium">Report Issue</span>
                </button>
              </div>
            </section>

            <!-- Markt Protection -->
            <section class="bg-white rounded-2xl shadow-sm border border-border p-8">
              <div class="flex items-center space-x-3 mb-4">
                <fa-icon [icon]="faShieldAlt" class="w-6 h-6 text-primary"></fa-icon>
                <h2 class="text-2xl font-bold text-dark">Markt Protection</h2>
              </div>
              
              <p class="text-muted mb-6">Your order is covered</p>
              
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faCheck" class="w-4 h-4 text-green-600"></fa-icon>
                  <span class="text-sm text-muted">Delivery guarantee</span>
                </div>
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faCheck" class="w-4 h-4 text-green-600"></fa-icon>
                  <span class="text-sm text-muted">Verified sellers</span>
                </div>
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="faCheck" class="w-4 h-4 text-green-600"></fa-icon>
                  <span class="text-sm text-muted">Secure payments</span>
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
export class OrderTrackingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  // Icons
  faCopy = faCopy;
  faTruck = faTruck;
  faCheck = faCheck;
  faExternalLinkAlt = faExternalLinkAlt;
  faBell = faBell;
  faExclamationTriangle = faExclamationTriangle;
  faComments = faComments;
  faShieldAlt = faShieldAlt;

  // Component state
  trackingData: TrackingData | null = null;
  loading = false;
  error = '';
  copyIcon = faCopy;

  // Mock data for demonstration (matches Figma design)
  mockTimeline: TrackingEvent[] = [
    {
      id: 'out-for-delivery',
      status: 'Out for Delivery',
      description: 'Your package is on the delivery truck and will arrive today',
      timestamp: 'Today, 11:45 AM',
      isCurrent: true,
      icon: 'truck'
    },
    {
      id: 'departed-facility',
      status: 'Package Departed Facility',
      description: 'Chicago Distribution Center',
      timestamp: 'Today, 6:20 AM',
      isCurrent: false,
      icon: 'check'
    },
    {
      id: 'in-transit',
      status: 'In Transit',
      description: 'Package is travelling to destination',
      timestamp: 'March 16, 2:15 PM',
      isCurrent: false,
      icon: 'check'
    },
    {
      id: 'shipped',
      status: 'Package Shipped',
      description: 'Order has been dispatched',
      timestamp: 'March 15, 4:30 PM',
      isCurrent: false,
      icon: 'check'
    },
    {
      id: 'confirmed',
      status: 'Order Confirmed',
      description: 'Seller confirmed your order',
      timestamp: 'March 15, 11:20 AM',
      isCurrent: false,
      icon: 'check'
    }
  ];

  mockPackageContents: PackageItem[] = [
    {
      id: 'jacket',
      name: 'Vintage Denim Jacket',
      details: 'Size: Medium • Color: Blue',
      price: 45.00,
      quantity: 1,
      seller: "Sarah's Closet",
      image: '/assets/images/products/vintage-jacket.png'
    },
    {
      id: 'sneakers',
      name: 'Canvas Sneakers',
      details: 'Size: 9 • Color: White',
      price: 35.00,
      quantity: 1,
      seller: "Mike's Kicks",
      image: '/assets/images/products/sony-headphones.png'
    }
  ];

  ngOnInit(): void {
    this.loadTrackingData();
  }

  private loadTrackingData(): void {
    // Get order ID from route parameters
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (orderId) {
      this.loading = true;
      this.orderService
        .trackOrder(orderId)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (tracking) => {
            this.trackingData = this.transformTrackingData(orderId, tracking);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading tracking data:', error);
            this.trackingData = this.getMockTrackingData();
            this.loading = false;
          },
        });
    } else {
      // Use mock data if no order ID
      this.trackingData = this.getMockTrackingData();
    }
  }

  private transformTrackingData(orderId: string, tracking: any): TrackingData {
    const checkpoints = Array.isArray(tracking?.checkpoints) ? tracking.checkpoints : [];
    const timeline: TrackingEvent[] = checkpoints.map((checkpoint: any, index: number) => ({
      id: `${orderId}-checkpoint-${index}`,
      status: checkpoint.status ?? 'In Transit',
      description: checkpoint.description ?? 'Status update received',
      timestamp: checkpoint.occurred_at ?? new Date().toISOString(),
      isCurrent: index === checkpoints.length - 1,
      icon: 'check',
    }));

    return {
      orderNumber: tracking?.order_number ?? orderId,
      placementDate: tracking?.placed_at ?? 'March 15, 2024',
      currentStatus: tracking?.status ?? 'Processing',
      deliveryProgress: Math.min(100, (checkpoints.length / 4) * 100 || 20),
      expectedDelivery: tracking?.estimated_delivery ?? 'Today by 6:00 PM',
      trackingNumber: tracking?.tracking_number ?? '1Z999AA1234567890',
      carrier: tracking?.carrier ?? 'UPS Ground',
      serviceType: tracking?.service_type ?? 'Standard Delivery',
      weight: tracking?.package_weight ?? '2.5 lbs',
      timeline: timeline.length ? timeline : this.mockTimeline,
      packageContents: this.mockPackageContents,
      deliveryAddress: {
        name: tracking?.recipient_name ?? 'Michael Johnson',
        institution: tracking?.delivery_address?.institution ?? 'UC Berkeley - Haas School of Business',
        address: tracking?.delivery_address?.address ?? '2220 Piedmont Ave',
        city: tracking?.delivery_address?.city ?? 'Berkeley, CA 94720',
        building: tracking?.delivery_address?.building ?? 'Haas Courtyard',
      },
    };
  }

  private getMockTrackingData(): TrackingData {
    return {
      orderNumber: 'MK-2024-001847',
      placementDate: 'March 15, 2024',
      currentStatus: 'Out for Delivery',
      deliveryProgress: 80,
      expectedDelivery: 'Today by 6:00 PM',
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS Ground',
      serviceType: 'Standard Delivery',
      weight: '2.5 lbs',
      timeline: this.mockTimeline,
      packageContents: this.mockPackageContents,
      deliveryAddress: {
        name: 'Emma Johnson',
        institution: 'Northwestern University',
        address: '1840 Sheridan Road',
        city: 'Evanston, IL 60208',
        building: 'Building: Willard Hall, Room 312'
      }
    };
  }

  copyOrderNumber(): void {
    const orderNumber = this.trackingData?.orderNumber ?? 'MK-2024-001847';
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

  copyTrackingNumber(): void {
    const trackingNumber = this.trackingData?.trackingNumber ?? '1Z999AA1234567890';
    navigator.clipboard.writeText(trackingNumber).then(() => {
      // Could show a toast notification here
    }).catch(() => {
    });
  }

  trackOnCarrierWebsite(): void {
    // Open carrier tracking website in new tab
    const trackingNumber = this.trackingData?.trackingNumber ?? '1Z999AA1234567890';
    const carrier = this.trackingData?.carrier?.toLowerCase() ?? 'ups';
    
    let trackingUrl = '';
    if (carrier.includes('ups')) {
      trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`;
    } else if (carrier.includes('fedex')) {
      trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    } else if (carrier.includes('usps')) {
      trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`;
    }
    
    if (trackingUrl) {
      window.open(trackingUrl, '_blank');
    }
  }

  changeDeliveryInstructions(): void {
    // Navigate to delivery instructions page or open modal
    this.router.navigate([ROUTES_ABSOLUTE.APP.ORDERS.ROOT, this.route.snapshot.paramMap.get('id'), 'delivery-instructions']);
  }

  contactSellers(): void {
    // Navigate to messages/chat with sellers
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT]);
  }

  getDeliveryUpdates(): void {
    // Open delivery updates modal or navigate to notifications settings
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'notifications')]);
  }

  reportIssue(): void {
    // Navigate to issue reporting page or open modal
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.SUPPORT.ROOT, 'report-issue')]);
  }
}
