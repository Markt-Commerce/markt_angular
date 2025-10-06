import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCommentDots, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  buyerName: string;
  buyerAvatar: string;
  buyerId: string;
  createdAt: string;
  expiresAt: string;
  offersCount: number;
  viewsCount: number;
  tags: string[];
  location: string;
  urgency: 'low' | 'medium' | 'high';
  mediaUrls: string[];
  isOwner: boolean;
}

interface Offer {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  sellerId: string;
  productName: string;
  productImage: string;
  price: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  _processing?: boolean;
}

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent, FontAwesomeModule],
  template: `
    <div class="request-detail-container">
      <!-- Header -->
      <div class="request-header">
        <div class="header-left">
          <app-button 
            variant="secondary" 
            size="sm"
            [outline]="true"
            [routerLink]="['/app/requests']"
          >
            ← Back to Requests
          </app-button>
        </div>
        
        <div class="header-actions" *ngIf="request && !request.isOwner">
          <app-button 
            variant="primary" 
            size="md"
            [routerLink]="['/app/offers/new', request.id]"
          >
            Create Offer
          </app-button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <p>Loading request details...</p>
      </div>

      <div *ngIf="!loading && request" class="request-content">
        <!-- Request Information -->
        <div class="request-info">
          <div class="request-meta">
            <div class="status-badge" [class]="request.status">
              {{ getStatusLabel(request.status) }}
            </div>
            <div class="urgency-badge" [class]="request.urgency">
              {{ getUrgencyLabel(request.urgency) }}
            </div>
          </div>

          <h1 class="request-title">{{ request.title }}</h1>
          
          <div class="request-stats">
            <span class="stat-item">
              <span class="stat-icon"><fa-icon [icon]="faCommentDots"></fa-icon></span>
              {{ request.viewsCount }} views
            </span>
            <span class="stat-item">
              <span class="stat-icon">💬</span>
              {{ request.offersCount }} offers
            </span>
            <span class="stat-item">
              <span class="stat-icon">⏰</span>
              Expires {{ formatDate(request.expiresAt) }}
            </span>
          </div>

          <div class="buyer-info">
            <img [src]="request.buyerAvatar" [alt]="request.buyerName" class="buyer-avatar">
            <div class="buyer-details">
              <h3>{{ request.buyerName }}</h3>
              <span class="location">{{ request.location }}</span>
            </div>
          </div>
        </div>

        <!-- Request Description -->
        <div class="request-description">
          <h2>Description</h2>
          <p>{{ request.description }}</p>
        </div>

        <!-- Request Details -->
        <div class="request-details">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>Budget:</strong>
              <span>₦{{ request.budget.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <strong>Category:</strong>
              <span>{{ request.category }}</span>
            </div>
            <div class="detail-item">
              <strong>Posted:</strong>
              <span>{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <strong>Expires:</strong>
              <span>{{ formatDate(request.expiresAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Request Tags -->
        <div class="request-tags" *ngIf="request.tags.length > 0">
          <h3>Tags</h3>
          <div class="tags-list">
            <span class="tag" *ngFor="let tag of request.tags">{{ tag }}</span>
          </div>
        </div>

        <!-- Request Media -->
        <div class="request-media" *ngIf="request.mediaUrls.length > 0">
          <h3>Reference Images</h3>
          <div class="media-grid">
            <div class="media-item" *ngFor="let mediaUrl of request.mediaUrls">
              <img [src]="mediaUrl" [alt]="'Reference image'">
            </div>
          </div>
        </div>

        <!-- Owner Actions -->
        <div class="owner-actions" *ngIf="request.isOwner && request.status === 'open'">
          <h3>Manage Request</h3>
          <div class="actions-grid">
            <app-button 
              variant="secondary" 
              size="md"
              [outline]="true"
              [routerLink]="['/app/requests', request.id, 'edit']"
            >
              Edit Request
            </app-button>
            <app-button 
              variant="danger" 
              size="md"
              [outline]="true"
              (clicked)="cancelRequest()"
            >
              Cancel Request
            </app-button>
          </div>
        </div>

        <!-- Offers Section -->
        <div class="offers-section">
          <div class="section-header">
            <h2>Offers ({{ offers.length }})</h2>
            <div class="offers-filter">
              <select [(ngModel)]="offerFilter" (change)="filterOffers()" class="filter-select">
                <option value="">All Offers</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div class="offers-list" *ngIf="filteredOffers.length > 0">
            <div class="offer-card" *ngFor="let offer of filteredOffers">
              <div class="offer-header">
                <div class="seller-info">
                  <img [src]="offer.sellerAvatar" [alt]="offer.sellerName" class="seller-avatar">
                  <div class="seller-details">
                    <h4>{{ offer.sellerName }}</h4>
                    <span class="offer-date">{{ formatDate(offer.createdAt) }}</span>
                  </div>
                </div>
                <div class="offer-status" [class]="offer.status">
                  {{ getOfferStatusLabel(offer.status) }}
                </div>
              </div>

              <div class="offer-content">
                <div class="product-info">
                  <img [src]="offer.productImage" [alt]="offer.productName" class="product-image">
                  <div class="product-details">
                    <h5>{{ offer.productName }}</h5>
                    <span class="product-price">₦{{ offer.price.toLocaleString() }}</span>
                  </div>
                </div>

                <div class="offer-message" *ngIf="offer.message">
                  <p>{{ offer.message }}</p>
                </div>
              </div>

              <div class="offer-actions" *ngIf="request.isOwner && offer.status === 'pending'">
                <app-button 
                  variant="success" 
                  size="sm"
                  (clicked)="acceptOffer(offer)"
                  [loading]="!!offer._processing"
                >
                  {{ offer._processing ? 'Accepting...' : 'Accept Offer' }}
                </app-button>
                <app-button 
                  variant="danger" 
                  size="sm"
                  [outline]="true"
                  (clicked)="rejectOffer(offer)"
                  [disabled]="!!offer._processing"
                >
                  Reject Offer
                </app-button>
              </div>

              <div class="offer-actions" *ngIf="!request.isOwner && offer.status === 'pending'">
                <app-button 
                  variant="secondary" 
                  size="sm"
                  [outline]="true"
                  (clicked)="withdrawOffer(offer)"
                  [disabled]="!!offer._processing"
                >
                  {{ offer._processing ? 'Withdrawing...' : 'Withdraw Offer' }}
                </app-button>
              </div>
            </div>
          </div>

          <div class="no-offers" *ngIf="filteredOffers.length === 0">
            <div class="no-offers-icon"><fa-icon [icon]="faCommentDots"></fa-icon></div>
            <h3>No offers yet</h3>
            <p *ngIf="!request.isOwner">Be the first to create an offer!</p>
            <p *ngIf="request.isOwner">No offers have been made yet. Check back later!</p>
            <app-button 
              *ngIf="!request.isOwner"
              variant="primary" 
              size="lg"
              [routerLink]="['/app/offers/new', request.id]"
            >
              Create First Offer
            </app-button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !request" class="error-state">
        <div class="error-icon"><fa-icon [icon]="faXmark"></fa-icon></div>
        <h3>Request Not Found</h3>
        <p>The request you're looking for doesn't exist or has been removed.</p>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/requests']"
        >
          Back to Requests
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .request-detail-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .request-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .request-info {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .request-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-badge.open {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.in_progress {
      background: #cce5ff;
      color: #004085;
    }

    .status-badge.completed {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .urgency-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .urgency-badge.low {
      background: #d4edda;
      color: #155724;
    }

    .urgency-badge.medium {
      background: #fff3cd;
      color: #856404;
    }

    .urgency-badge.high {
      background: #f8d7da;
      color: #721c24;
    }

    .request-title {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .request-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .stat-icon {
      font-size: 1.1rem;
    }

    .buyer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .buyer-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .buyer-details h3 {
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
    }

    .location {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .request-description,
    .request-details,
    .request-tags,
    .request-media,
    .owner-actions,
    .offers-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .request-description h2,
    .offers-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .request-description p {
      color: #495057;
      line-height: 1.6;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detail-item strong {
      color: #495057;
    }

    .tags-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      background: #e9ecef;
      color: #495057;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .media-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
    }

    .actions-grid {
      display: flex;
      gap: 1rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
    }

    .offers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .offer-card {
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 1.5rem;
      transition: box-shadow 0.2s ease;
    }

    .offer-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .offer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .seller-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .seller-details h4 {
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
    }

    .offer-date {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .offer-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .offer-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .offer-status.accepted {
      background: #d4edda;
      color: #155724;
    }

    .offer-status.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .offer-status.withdrawn {
      background: #e2e3e5;
      color: #383d41;
    }

    .offer-content {
      margin-bottom: 1rem;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .product-details h5 {
      margin: 0 0 0.25rem 0;
      color: #2c3e50;
    }

    .product-price {
      font-weight: 600;
      color: #28a745;
    }

    .offer-message {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .offer-message p {
      margin: 0;
      color: #495057;
      line-height: 1.5;
    }

    .offer-actions {
      display: flex;
      gap: 0.5rem;
    }

    .no-offers {
      text-align: center;
      padding: 3rem 2rem;
    }

    .no-offers-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .no-offers h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .no-offers p {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .loading-state,
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
      .request-detail-container {
        padding: 1rem;
      }

      .request-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .request-stats {
        flex-direction: column;
        gap: 0.5rem;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }

      .media-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        flex-direction: column;
      }

      .offer-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .offer-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  loading = true;
  request: BuyerRequest | null = null;
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  offerFilter = '';

  faCommentDots = faCommentDots;
  faTriangleExclamation = faTriangleExclamation;
  faXmark = faXmark;

  ngOnInit(): void {
    this.loadRequest();
  }

  private loadRequest(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    
    if (requestId) {
      this.loading = true;
      
      this.apiService.getRequest(requestId).subscribe({
        next: (response) => {
          this.request = response.data as any;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.loading = false;
        }
      });

      // Load offers for this request
      this.apiService.getRequestOffers(requestId).subscribe({
        next: (response) => {
          this.offers = (response.data || []) as any[];
      this.filteredOffers = [...this.offers];
        },
        error: (error) => {
          console.error('Error loading offers:', error);
          this.offers = [];
          this.filteredOffers = [];
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getUrgencyLabel(urgency: string): string {
    const urgencyMap: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };
    return urgencyMap[urgency] || urgency;
  }

  getOfferStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  filterOffers(): void {
    if (this.offerFilter) {
      this.filteredOffers = this.offers.filter(offer => offer.status === this.offerFilter);
    } else {
      this.filteredOffers = [...this.offers];
    }
  }

  acceptOffer(offer: Offer): void {
    if (confirm('Are you sure you want to accept this offer?')) {
      offer._processing = true;
      this.apiService.acceptOffer(offer.id).subscribe({
        next: (response) => {
        offer.status = 'accepted';
          offer._processing = false;
        this.filterOffers();
          const productId = (response as any)?.data?.product_id;
          if (productId) {
            this.cartService.addToCart(String(productId), 1).subscribe({
              next: () => this.router.navigate(['/app/checkout'], { queryParams: { source: 'offer', offerId: offer.id } }),
              error: () => this.router.navigate(['/app/checkout'], { queryParams: { source: 'offer', offerId: offer.id } })
            });
          } else {
            this.router.navigate(['/app/checkout'], { queryParams: { source: 'offer', offerId: offer.id } });
          }
        },
        error: () => { offer._processing = false; }
      });
    }
  }

  rejectOffer(offer: Offer): void {
    if (confirm('Are you sure you want to reject this offer?')) {
      offer._processing = true;
      this.apiService.rejectOffer(offer.id).subscribe({
        next: () => {
        offer.status = 'rejected';
          offer._processing = false;
        this.filterOffers();
        },
        error: () => { offer._processing = false; }
      });
    }
  }

  withdrawOffer(offer: Offer): void {
    if (confirm('Are you sure you want to withdraw this offer?')) {
      offer._processing = true;
      this.apiService.withdrawOffer(offer.id).subscribe({
        next: () => {
        offer.status = 'withdrawn';
          offer._processing = false;
        this.filterOffers();
        },
        error: () => { offer._processing = false; }
      });
    }
  }

  cancelRequest(): void {
    if (confirm('Are you sure you want to cancel this request?')) {
      // TODO: Cancel request via API
      
      if (this.request) {
        this.request.status = 'cancelled';
      }
    }
  }
} 