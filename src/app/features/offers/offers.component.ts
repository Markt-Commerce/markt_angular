import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';

interface Offer {
  id: string;
  request_id: string;
  request_title: string;
  buyer_name: string;
  product_name: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  expires_at: string;
  message: string;
}

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="offers-container">
      <div class="offers-header">
        <div class="header-content">
          <h1>My Offers</h1>
          <p>Manage your offers to buyer requests</p>
        </div>
        <div class="header-actions">
          <app-button
            variant="primary"
            size="md"
            (click)="createNewOffer()"
          >
            Create New Offer
          </app-button>
        </div>
      </div>

      <div class="offers-filters">
        <div class="filter-group">
          <app-input
            type="text"
            placeholder="Search offers..."
            [(ngModel)]="searchQuery"
            (input)="filterOffers()"
            [fullWidth]="false"
          ></app-input>
        </div>
        
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="filterOffers()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
        
        <div class="filter-group">
          <select [(ngModel)]="sortBy" (change)="filterOffers()" class="filter-select">
            <option value="created_at">Date Created</option>
            <option value="price">Price</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div class="offers-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalOffers }}</div>
          <div class="stat-label">Total Offers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ pendingOffers }}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ acceptedOffers }}</div>
          <div class="stat-label">Accepted</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalValue | currency }}</div>
          <div class="stat-label">Total Value</div>
        </div>
      </div>

      <div class="offers-list">
        <div *ngIf="filteredOffers.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No offers found</h3>
          <p>You haven't made any offers yet, or no offers match your current filters.</p>
          <app-button
            variant="primary"
            size="md"
            (click)="createNewOffer()"
          >
            Create Your First Offer
          </app-button>
        </div>

        <div *ngFor="let offer of filteredOffers" class="offer-card">
          <div class="offer-header">
            <div class="offer-info">
              <h3 class="offer-title">{{ offer.request_title }}</h3>
              <p class="offer-buyer">Buyer: {{ offer.buyer_name }}</p>
            </div>
            <div class="offer-status" [class]="'status-' + offer.status">
              {{ offer.status | titlecase }}
            </div>
          </div>
          
          <div class="offer-details">
            <div class="detail-row">
              <span class="detail-label">Product:</span>
              <span class="detail-value">{{ offer.product_name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price:</span>
              <span class="detail-value price">{{ offer.price | currency }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ offer.created_at | date:'short' }}</span>
            </div>
            <div class="detail-row" *ngIf="offer.expires_at">
              <span class="detail-label">Expires:</span>
              <span class="detail-value">{{ offer.expires_at | date:'short' }}</span>
            </div>
          </div>
          
          <div class="offer-message" *ngIf="offer.message">
            <strong>Message:</strong>
            <p>{{ offer.message }}</p>
          </div>
          
          <div class="offer-actions">
            <app-button
              variant="secondary"
              size="sm"
              [outline]="true"
              (click)="viewOffer(offer.id)"
            >
              View Details
            </app-button>
            <app-button
              *ngIf="offer.status === 'pending'"
              variant="danger"
              size="sm"
              [outline]="true"
              (click)="withdrawOffer(offer.id)"
            >
              Withdraw
            </app-button>
            <app-button
              variant="secondary"
              size="sm"
              [outline]="true"
              (click)="viewRequest(offer.request_id)"
            >
              View Request
            </app-button>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="filteredOffers.length > 0">
        <app-button
          variant="secondary"
          size="sm"
          [outline]="true"
          [disabled]="currentPage === 1"
          (click)="previousPage()"
        >
          Previous
        </app-button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <app-button
          variant="secondary"
          size="sm"
          [outline]="true"
          [disabled]="currentPage === totalPages"
          (click)="nextPage()"
        >
          Next
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .offers-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .offers-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .header-content p {
      color: #718096;
      margin: 0;
    }

    .offers-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: white;
      font-size: 0.875rem;
    }

    .offers-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #718096;
      font-size: 0.875rem;
    }

    .offers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .offer-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1.5rem;
      transition: all 0.2s ease;
    }

    .offer-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .offer-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .offer-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .offer-buyer {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .offer-status {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-accepted {
      background: #d1fae5;
      color: #065f46;
    }

    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-withdrawn {
      background: #f3f4f6;
      color: #374151;
    }

    .offer-details {
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .detail-label {
      font-weight: 500;
      color: #4a5568;
    }

    .detail-value {
      color: #2d3748;
    }

    .detail-value.price {
      font-weight: 600;
      color: #059669;
    }

    .offer-message {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .offer-message strong {
      color: #4a5568;
      font-size: 0.875rem;
    }

    .offer-message p {
      margin: 0.5rem 0 0 0;
      color: #2d3748;
      font-size: 0.875rem;
    }

    .offer-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #718096;
      margin: 0 0 1.5rem 0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-info {
      color: #718096;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .offers-container {
        padding: 1rem;
      }

      .offers-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .offers-filters {
        flex-direction: column;
      }

      .offer-header {
        flex-direction: column;
        gap: 0.5rem;
      }

      .offer-actions {
        flex-direction: column;
      }

      .offers-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class OffersComponent implements OnInit {
  private router = inject(Router);

  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  searchQuery = '';
  statusFilter = '';
  sortBy = 'created_at';
  currentPage = 1;
  itemsPerPage = 10;

  get totalOffers(): number {
    return this.offers.length;
  }

  get pendingOffers(): number {
    return this.offers.filter(offer => offer.status === 'pending').length;
  }

  get acceptedOffers(): number {
    return this.offers.filter(offer => offer.status === 'accepted').length;
  }

  get totalValue(): number {
    return this.offers
      .filter(offer => offer.status === 'accepted')
      .reduce((sum, offer) => sum + offer.price, 0);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOffers.length / this.itemsPerPage);
  }

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    // Mock data - replace with actual API call
    this.offers = [
      {
        id: '1',
        request_id: 'req1',
        request_title: 'Looking for vintage camera equipment',
        buyer_name: 'John Smith',
        product_name: 'Canon AE-1 Camera',
        price: 250,
        status: 'pending',
        created_at: '2024-01-15T10:30:00Z',
        expires_at: '2024-01-22T10:30:00Z',
        message: 'I have a Canon AE-1 in excellent condition with original leather case.'
      },
      {
        id: '2',
        request_id: 'req2',
        request_title: 'Need laptop for programming',
        buyer_name: 'Sarah Johnson',
        product_name: 'MacBook Pro 2020',
        price: 1200,
        status: 'accepted',
        created_at: '2024-01-10T14:20:00Z',
        expires_at: '2024-01-17T14:20:00Z',
        message: 'MacBook Pro with 16GB RAM, perfect for development work.'
      },
      {
        id: '3',
        request_id: 'req3',
        request_title: 'Searching for acoustic guitar',
        buyer_name: 'Mike Wilson',
        product_name: 'Yamaha FG800',
        price: 180,
        status: 'rejected',
        created_at: '2024-01-08T09:15:00Z',
        expires_at: '2024-01-15T09:15:00Z',
        message: 'Yamaha FG800 acoustic guitar, barely used, comes with case.'
      }
    ];
    this.filterOffers();
  }

  filterOffers(): void {
    let filtered = [...this.offers];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.request_title.toLowerCase().includes(query) ||
        offer.buyer_name.toLowerCase().includes(query) ||
        offer.product_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(offer => offer.status === this.statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price':
          return b.price - a.price;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    this.filteredOffers = filtered;
    this.currentPage = 1;
  }

  createNewOffer(): void {
    this.router.navigate(['/app/offers/create']);
  }

  viewOffer(offerId: string): void {
    this.router.navigate(['/app/offers', offerId]);
  }

  viewRequest(requestId: string): void {
    this.router.navigate(['/app/requests', requestId]);
  }

  withdrawOffer(offerId: string): void {
    if (confirm('Are you sure you want to withdraw this offer?')) {
      // Mock API call
      const offer = this.offers.find(o => o.id === offerId);
      if (offer) {
        offer.status = 'withdrawn';
        this.filterOffers();
      }
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