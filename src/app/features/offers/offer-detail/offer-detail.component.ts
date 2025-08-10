import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface Offer {
  id: string;
  request_id: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    username: string;
    rating: number;
    review_count: number;
    is_verified: boolean;
  };
  product: {
    name: string;
    description: string;
    condition: string;
    images: string[];
  };
  price: number;
  currency: string;
  quantity: number;
  delivery_time: number;
  delivery_cost: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  expires_at: string;
  message?: string;
  terms?: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerId?: string;
  productName?: string;
  productId?: string;
}

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  buyer: {
    id: string;
    name: string;
    avatar: string;
  };
  created_at: string;
  expires_at: string;
  status: 'open' | 'closed' | 'expired';
}

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonComponent, InputComponent, FontAwesomeModule],
  template: `
    <div class="offer-detail-container">
      <div class="offer-header">
        <div class="header-content">
          <div class="breadcrumb">
            <a routerLink="/app/requests">Requests</a>
            <span class="separator">/</span>
            <a routerLink="/app/requests/{{ request?.id }}">{{ request?.title }}</a>
            <span class="separator">/</span>
            <span>Offer</span>
          </div>
          <h1>Offer Details</h1>
        </div>
        <div class="header-actions">
          <app-button
            variant="secondary"
            size="md"
            [outline]="true"
            (click)="goBack()"
          >
            Back to Request
          </app-button>
        </div>
      </div>

      <div class="offer-content">
        <div class="offer-main">
          <div class="offer-card">
            <div class="offer-status" [class]="'status-' + offer?.status">
              <span class="status-badge">{{ getStatusText(offer?.status) }}</span>
              <span class="status-time" *ngIf="offer?.expires_at">
                Expires {{ formatTime(offer?.expires_at) }}
              </span>
            </div>

            <div class="offer-seller">
              <div class="seller-info">
                <img [src]="offer!.seller.avatar" [alt]="offer!.seller.name" class="seller-avatar">
                <div class="seller-details">
                  <h3>{{ offer!.seller.name }}</h3>
                  <div class="seller-meta">
                    <span class="seller-username">&#64;{{ offer!.seller.username }}</span>
                    <span class="seller-rating"><fa-icon [icon]="faStar"></fa-icon> {{ offer!.seller.rating }} ({{ offer!.seller.review_count }} reviews)</span>
                    <span *ngIf="offer!.seller.is_verified" class="verified-badge">✓ Verified</span>
                  </div>
                </div>
              </div>
              <div class="seller-actions">
                <app-button
                  variant="secondary"
                  size="sm"
                  [outline]="true"
                  (click)="viewSellerProfile(offer!.seller.id)"
                >
                  View Profile
                </app-button>
                <app-button
                  variant="primary"
                  size="sm"
                  (click)="sendMessage(offer!.seller.id)"
                >
                  Message
                </app-button>
              </div>
            </div>

            <div class="offer-product">
              <h3>Product Details</h3>
              <div class="product-info">
                <div class="product-images" *ngIf="offer!.product.images.length">
                  <img 
                    [src]="offer!.product.images[0]" 
                    [alt]="offer!.product.name" 
                    class="product-image"
                    (click)="showImageGallery()"
                  >
                  <div class="image-count" *ngIf="offer!.product.images.length > 1">
                    +{{ offer!.product.images.length - 1 }} more
                  </div>
                </div>
                
                <div class="product-details">
                  <h4>{{ offer!.product.name }}</h4>
                  <p>{{ offer!.product.description }}</p>
                  <div class="product-condition">
                    <span class="condition-badge">{{ offer!.product.condition }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="offer-pricing">
              <h3>Pricing & Delivery</h3>
              <div class="pricing-grid">
                <div class="pricing-item">
                  <span class="pricing-label">Unit Price:</span>
                  <span class="pricing-value">{{ offer?.currency }} {{ offer?.price }}</span>
                </div>
                <div class="pricing-item">
                  <span class="pricing-label">Quantity:</span>
                  <span class="pricing-value">{{ offer?.quantity }}</span>
                </div>
                <div class="pricing-item">
                  <span class="pricing-label">Delivery Cost:</span>
                  <span class="pricing-value">{{ offer?.currency }} {{ offer?.delivery_cost }}</span>
                </div>
                <div class="pricing-item total">
                  <span class="pricing-label">Total Price:</span>
                  <span class="pricing-value">{{ offer?.currency }} {{ offer?.total_price }}</span>
                </div>
              </div>
              
              <div class="delivery-info">
                <div class="delivery-item">
                  <span class="delivery-icon">🚚</span>
                  <span>Delivery Time: {{ offer?.delivery_time }} days</span>
                </div>
              </div>
            </div>

            <div class="offer-message" *ngIf="offer?.message">
              <h3>Seller's Message</h3>
              <p>{{ offer?.message }}</p>
            </div>

            <div class="offer-terms" *ngIf="offer?.terms">
              <h3>Terms & Conditions</h3>
              <p>{{ offer?.terms }}</p>
            </div>
          </div>

          <div class="offer-actions" *ngIf="canTakeAction()">
            <div class="action-buttons">
              <app-button
                variant="success"
                size="lg"
                (click)="acceptOffer()"
                [loading]="accepting"
                [disabled]="accepting"
              >
                Accept Offer
              </app-button>
              
              <app-button
                variant="danger"
                size="lg"
                [outline]="true"
                (click)="rejectOffer()"
                [loading]="rejecting"
                [disabled]="rejecting"
              >
                Reject Offer
              </app-button>
              
              <app-button
                variant="secondary"
                size="lg"
                [outline]="true"
                (click)="showCounterOffer = true"
              >
                Make Counter Offer
              </app-button>
            </div>
          </div>
        </div>

        <div class="offer-sidebar">
          <div class="request-summary">
            <h3>Request Summary</h3>
            <div class="request-info">
              <h4>{{ request?.title }}</h4>
              <p>{{ request?.description }}</p>
              
              <div class="request-meta">
                <div class="meta-item">
                  <span class="meta-label">Category:</span>
                  <span class="meta-value">{{ request?.category }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Budget:</span>
                  <span class="meta-value">{{ request?.budget_min }} - {{ request?.budget_max }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Posted by:</span>
                  <span class="meta-value">{{ request!.buyer.name }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Posted:</span>
                  <span class="meta-value">{{ formatTime(request?.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="similar-offers">
            <h3>Other Offers</h3>
            <div class="offers-list">
              <div *ngFor="let similarOffer of similarOffers" class="similar-offer">
                <div class="similar-offer-info">
                  <span class="offer-price">{{ similarOffer.currency }} {{ similarOffer.price }}</span>
                  <span class="offer-seller-name">{{ similarOffer.seller.name }}</span>
                </div>
                <app-button
                  variant="secondary"
                  size="sm"
                  [outline]="true"
                  (click)="viewOffer(similarOffer.id)"
                >
                  View
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Counter Offer Modal -->
      <div *ngIf="showCounterOffer" class="modal-overlay" (click)="closeCounterOffer()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Make Counter Offer</h2>
            <button class="close-button" (click)="closeCounterOffer()">×</button>
          </div>

          <form [formGroup]="counterOfferForm" (ngSubmit)="submitCounterOffer()" class="modal-form">
            <div class="form-group">
              <app-input
                id="price"
                name="price"
                type="number"
                label="Your Price"
                placeholder="Enter your counter offer price"
                formControlName="price"
                [required]="true"
                [fullWidth]="true"
              ></app-input>
            </div>

            <div class="form-group">
              <app-input
                id="message"
                name="message"
                type="textarea"
                label="Message (Optional)"
                placeholder="Add a message to your counter offer"
                formControlName="message"
                [fullWidth]="true"
              ></app-input>
            </div>

            <div class="form-actions">
              <app-button
                type="button"
                variant="secondary"
                size="md"
                [outline]="true"
                (click)="closeCounterOffer()"
              >
                Cancel
              </app-button>
              
              <app-button
                type="submit"
                variant="primary"
                size="md"
                [loading]="submittingCounter"
                [disabled]="counterOfferForm.invalid || submittingCounter"
              >
                Send Counter Offer
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offer-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .offer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0.5rem 0 0 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #718096;
    }

    .breadcrumb a {
      color: #3182ce;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .separator {
      color: #cbd5e0;
    }

    .offer-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    .offer-main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .offer-card {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .offer-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f7fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending .status-badge {
      background: #fef5e7;
      color: #d69e2e;
    }

    .status-accepted .status-badge {
      background: #c6f6d5;
      color: #2f855a;
    }

    .status-rejected .status-badge {
      background: #fed7d7;
      color: #c53030;
    }

    .status-expired .status-badge {
      background: #e2e8f0;
      color: #4a5568;
    }

    .status-time {
      font-size: 0.875rem;
      color: #718096;
    }

    .offer-seller {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .seller-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .seller-details h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .seller-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.875rem;
      color: #718096;
    }

    .seller-username {
      color: #3182ce;
      font-weight: 500;
    }

    .verified-badge {
      background: #c6f6d5;
      color: #2f855a;
      padding: 0.125rem 0.375rem;
      border-radius: 0.125rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .seller-actions {
      display: flex;
      gap: 0.5rem;
    }

    .offer-product {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .offer-product h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .product-info {
      display: flex;
      gap: 1rem;
    }

    .product-images {
      position: relative;
      flex-shrink: 0;
    }

    .product-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .product-image:hover {
      opacity: 0.8;
    }

    .image-count {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .product-details {
      flex: 1;
    }

    .product-details h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .product-details p {
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .condition-badge {
      background: #ebf8ff;
      color: #3182ce;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .offer-pricing {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .offer-pricing h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .pricing-grid {
      display: grid;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .pricing-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 0.5rem;
    }

    .pricing-item.total {
      background: #ebf8ff;
      font-weight: 600;
    }

    .pricing-label {
      color: #4a5568;
    }

    .pricing-value {
      font-weight: 600;
      color: #2d3748;
    }

    .delivery-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .delivery-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #4a5568;
    }

    .delivery-icon {
      font-size: 1rem;
    }

    .offer-message,
    .offer-terms {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .offer-message h3,
    .offer-terms h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .offer-message p,
    .offer-terms p {
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .offer-actions {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .offer-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .request-summary,
    .similar-offers {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
    }

    .request-summary h3,
    .similar-offers h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .request-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .request-info p {
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .request-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .meta-label {
      color: #718096;
    }

    .meta-value {
      color: #2d3748;
      font-weight: 500;
    }

    .offers-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .similar-offer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }

    .similar-offer-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .offer-price {
      font-weight: 600;
      color: #2d3748;
    }

    .offer-seller-name {
      font-size: 0.875rem;
      color: #718096;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #718096;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .offer-detail-container {
        padding: 1rem;
      }

      .offer-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .offer-content {
        grid-template-columns: 1fr;
      }

      .offer-seller {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .seller-actions {
        justify-content: center;
      }

      .product-info {
        flex-direction: column;
      }

      .action-buttons {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class OfferDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  offer?: Offer;
  request?: Request;
  similarOffers: Offer[] = [];
  showCounterOffer = false;
  accepting = false;
  rejecting = false;
  submittingCounter = false;

  counterOfferForm!: FormGroup;
  faStar = faStar;

  ngOnInit(): void {
    this.initForm();
    this.loadOffer();
    this.loadRequest();
    this.loadSimilarOffers();
  }

  private initForm(): void {
    this.counterOfferForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(0.01)]],
      message: ['']
    });
  }

  private loadOffer(): void {
    const offerId = this.route.snapshot.paramMap.get('id');
    
    if (offerId) {
      // Use the actual API service to get offer details
      this.apiService.getRequestOffers(offerId).subscribe({
        next: (response) => {
          if (response.data && response.data.length > 0) {
            this.offer = response.data[0] as any; // Get the first offer
            this.loadRequest();
            this.loadSimilarOffers();
          }
        },
        error: (error) => {
          console.error('Error loading offer:', error);
        }
      });
    }
  }

  private loadRequest(): void {
    if (this.offer?.request_id) {
      this.apiService.getRequest(this.offer.request_id).subscribe({
        next: (response) => {
          this.request = response.data as any;
        },
        error: (error) => {
          console.error('Error loading request:', error);
        }
      });
    }
  }

  private loadSimilarOffers(): void {
    if (this.offer?.request_id) {
      this.apiService.getRequestOffers(this.offer.request_id).subscribe({
        next: (response) => {
          this.similarOffers = response.data.filter(o => o.id !== this.offer?.id) as any[];
        },
        error: (error) => {
          console.error('Error loading similar offers:', error);
        }
      });
    }
  }

  getStatusText(status?: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  }

  canTakeAction(): boolean {
    return this.offer?.status === 'pending' && this.request?.status === 'open';
  }

  acceptOffer(): void {
    if (confirm('Are you sure you want to accept this offer?')) {
      this.accepting = true;
      
      if (this.offer?.id) {
        this.apiService.acceptOffer(this.offer.id).subscribe({
          next: (response) => {
            this.accepting = false;
            this.offer!.status = 'accepted';
            const productId = (response?.data?.product_id) || (this.offer as any)?.productId || (this.offer as any)?.product_id;
            if (productId) {
              this.cartService.addToCart(String(productId), 1).subscribe({
                next: () => this.router.navigate(['/app/checkout'], { queryParams: { source: 'offer', offerId: this.offer!.id } }),
                error: () => this.router.navigate(['/app/checkout'], { queryParams: { source: 'offer', offerId: this.offer!.id } })
              });
            } else {
              this.router.navigate(['/app/checkout'], { queryParams: { source: 'offer', offerId: this.offer!.id } });
            }
          },
          error: (error) => {
            console.error('Error accepting offer:', error);
            this.accepting = false;
          }
        });
      }
    }
  }

  rejectOffer(): void {
    if (confirm('Are you sure you want to reject this offer?')) {
      this.rejecting = true;
      
      if (this.offer?.id) {
        this.apiService.rejectOffer(this.offer.id).subscribe({
          next: (response) => {
            this.rejecting = false;
            this.offer!.status = 'rejected';
            // Optionally navigate back to requests
            this.router.navigate(['/app/requests', this.request?.id]);
          },
          error: (error) => {
            console.error('Error rejecting offer:', error);
            this.rejecting = false;
          }
        });
      }
    }
  }

  closeCounterOffer(): void {
    this.showCounterOffer = false;
    this.counterOfferForm.reset();
  }

  submitCounterOffer(): void {
    if (this.counterOfferForm.valid) {
      this.submittingCounter = true;
      
      const formData = this.counterOfferForm.value;
      
      if (this.offer?.id) {
        // Use the createOffer endpoint for counter offers
        this.apiService.createOffer(this.offer.request_id, formData).subscribe({
          next: (response) => {
            this.submittingCounter = false;
            this.closeCounterOffer();
            // Optionally navigate to the new offer
            this.router.navigate(['/app/offers', response.data.id]);
          },
          error: (error) => {
            console.error('Error submitting counter offer:', error);
            this.submittingCounter = false;
          }
        });
      }
    }
  }

  viewSellerProfile(sellerId?: string): void {
    if (sellerId) {
      this.router.navigate(['/app/profile', sellerId]);
    }
  }

  sendMessage(sellerId?: string): void {
    if (sellerId) {
      this.router.navigate(['/app/chat', sellerId]);
    }
  }

  showImageGallery(): void {
    // Mock image gallery - replace with actual implementation
    
  }

  viewOffer(offerId: string): void {
    this.router.navigate(['/app/offers', offerId]);
  }

  goBack(): void {
    this.router.navigate(['/app/requests', this.request?.id]);
  }
} 