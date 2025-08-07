import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ApiService } from '../../core/services/api.service';

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  location: string;
  join_date: string;
  rating: number;
  total_reviews: number;
  total_orders: number;
  total_listings: number;
  is_verified: boolean;
  is_seller: boolean;
}

interface Review {
  id: number;
  reviewer_name: string;
  reviewer_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  images: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-cover">
          <div class="profile-avatar">
            <img 
              *ngIf="profile?.avatar_url" 
              [src]="profile?.avatar_url" 
              [alt]="profile?.full_name"
              class="avatar-img"
            >
            <div *ngIf="!profile?.avatar_url" class="avatar-placeholder">
              {{ profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U' }}
            </div>
            <div class="verification-badge" *ngIf="profile?.is_verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
          </div>
          
          <div class="profile-info">
            <h1 class="profile-name">{{ profile?.full_name || profile?.username }}</h1>
            <p class="profile-username">&#64;{{ profile?.username }}</p>
            <p class="profile-location" *ngIf="profile?.location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ profile?.location }}
            </p>
            <p class="profile-bio" *ngIf="profile?.bio">{{ profile?.bio }}</p>
            <p class="profile-join-date">Member since {{ profile?.join_date | date:'MMMM yyyy' }}</p>
          </div>

          <div class="profile-actions">
            <app-button 
              variant="primary" 
              size="md"
              [routerLink]="['/profile/edit']"
            >
              Edit Profile
            </app-button>
            <app-button 
              variant="secondary" 
              size="md"
              [routerLink]="['/messages']"
            >
              Send Message
            </app-button>
          </div>
        </div>
      </div>

      <!-- Profile Stats -->
      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-value">{{ profile?.rating || 0 }}</div>
          <div class="stat-label">Rating</div>
          <div class="stat-stars">
            <svg *ngFor="let star of getStars(profile?.rating || 0)" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ profile?.total_reviews || 0 }}</div>
          <div class="stat-label">Reviews</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ profile?.total_orders || 0 }}</div>
          <div class="stat-label">Orders</div>
        </div>
        
        <div class="stat-card" *ngIf="profile?.is_seller">
          <div class="stat-value">{{ profile?.total_listings || 0 }}</div>
          <div class="stat-label">Listings</div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="profile-content">
        <div class="content-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'about'"
            (click)="setActiveTab('about')"
          >
            About
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'reviews'"
            (click)="setActiveTab('reviews')"
          >
            Reviews ({{ profile?.total_reviews || 0 }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'listings'"
            (click)="setActiveTab('listings')"
            *ngIf="profile?.is_seller"
          >
            Listings ({{ profile?.total_listings || 0 }})
          </button>
        </div>

        <!-- About Tab -->
        <div class="tab-content" *ngIf="activeTab === 'about'">
          <div class="about-section">
            <h3>Contact Information</h3>
            <div class="contact-info">
              <div class="info-item">
                <strong>Email:</strong>
                <span>{{ profile?.email }}</span>
              </div>
              <div class="info-item" *ngIf="profile?.phone">
                <strong>Phone:</strong>
                <span>{{ profile?.phone }}</span>
              </div>
              <div class="info-item" *ngIf="profile?.location">
                <strong>Location:</strong>
                <span>{{ profile?.location }}</span>
              </div>
            </div>

            <h3>Account Information</h3>
            <div class="account-info">
              <div class="info-item">
                <strong>Username:</strong>
                <span>&#64;{{ profile?.username }}</span>
              </div>
              <div class="info-item">
                <strong>Member Since:</strong>
                <span>{{ profile?.join_date | date:'longDate' }}</span>
              </div>
              <div class="info-item">
                <strong>Account Type:</strong>
                <span>{{ profile?.is_seller ? 'Seller' : 'Buyer' }}</span>
              </div>
              <div class="info-item">
                <strong>Verification:</strong>
                <span [class]="profile?.is_verified ? 'verified' : 'unverified'">
                  {{ profile?.is_verified ? 'Verified' : 'Not Verified' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews Tab -->
        <div class="tab-content" *ngIf="activeTab === 'reviews'">
          <div class="reviews-section">
            <div class="reviews-header">
              <h3>User Reviews</h3>
              <div class="average-rating">
                <span class="rating-value">{{ profile?.rating || 0 }}</span>
                <div class="rating-stars">
                  <svg *ngFor="let star of getStars(profile?.rating || 0)" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                  </svg>
                </div>
                <span class="total-reviews">({{ profile?.total_reviews || 0 }} reviews)</span>
              </div>
            </div>

            <div class="reviews-list" *ngIf="reviews.length > 0; else noReviews">
              <div class="review-item" *ngFor="let review of reviews">
                <div class="review-header">
                  <div class="reviewer-info">
                    <img [src]="review.reviewer_avatar || '/markt-text-logo.png'" [alt]="review.reviewer_name" class="reviewer-avatar">
                    <div>
                      <div class="reviewer-name">{{ review.reviewer_name }}</div>
                      <div class="review-date">{{ review.created_at | date:'mediumDate' }}</div>
                    </div>
                  </div>
                  <div class="review-rating">
                    <svg *ngFor="let star of getStars(review.rating)" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                    </svg>
                  </div>
                </div>
                <div class="review-content">
                  <p>{{ review.comment }}</p>
                </div>
              </div>
            </div>

            <ng-template #noReviews>
              <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
                <h3>No reviews yet</h3>
                <p>This user hasn't received any reviews yet.</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Listings Tab -->
        <div class="tab-content" *ngIf="activeTab === 'listings' && profile?.is_seller">
          <div class="listings-section">
            <h3>User Listings</h3>
            <div class="listings-grid" *ngIf="listings.length > 0; else noListings">
              <div class="listing-card" *ngFor="let listing of listings" [routerLink]="['/marketplace/product', listing.id]">
                <div class="listing-image">
                  <img [src]="listing.images[0] || '/markt-text-logo.png'" [alt]="listing.title">
                </div>
                <div class="listing-info">
                  <h4>{{ listing.title }}</h4>
                  <p class="listing-price">{{ listing.price | currency:listing.currency:'symbol':'1.0-0' }}</p>
                  <p class="listing-location">{{ listing.location }}</p>
                </div>
              </div>
            </div>

            <ng-template #noListings>
              <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
                <h3>No listings yet</h3>
                <p>This user hasn't created any listings yet.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    /* Profile Header */
    .profile-header {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .profile-cover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 3rem 2rem;
      color: white;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .profile-avatar {
      position: relative;
      flex-shrink: 0;
    }

    .avatar-img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid white;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid white;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 600;
      color: #6b7280;
    }

    .verification-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #10b981;
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .profile-username {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0 0 1rem 0;
    }

    .profile-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1rem 0;
      opacity: 0.9;
    }

    .profile-bio {
      margin: 0 0 1rem 0;
      line-height: 1.6;
      opacity: 0.9;
    }

    .profile-join-date {
      font-size: 0.875rem;
      opacity: 0.8;
      margin: 0;
    }

    .profile-actions {
      display: flex;
      gap: 1rem;
      flex-shrink: 0;
    }

    /* Profile Stats */
    .profile-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .stat-stars {
      display: flex;
      justify-content: center;
      gap: 0.25rem;
      color: #f59e0b;
    }

    /* Profile Content */
    .profile-content {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .content-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab-btn {
      padding: 1rem 2rem;
      border: none;
      background: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }

    .tab-btn:hover {
      color: #374151;
      background: #f9fafb;
    }

    .tab-btn.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .tab-content {
      padding: 2rem;
    }

    /* About Section */
    .about-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 1rem 0;
    }

    .about-section h3:not(:first-child) {
      margin-top: 2rem;
    }

    .contact-info,
    .account-info {
      display: grid;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .info-item strong {
      color: #374151;
    }

    .verified {
      color: #10b981;
      font-weight: 600;
    }

    .unverified {
      color: #6b7280;
    }

    /* Reviews Section */
    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .average-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .rating-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .rating-stars {
      display: flex;
      gap: 0.25rem;
      color: #f59e0b;
    }

    .total-reviews {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-item {
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .reviewer-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .reviewer-name {
      font-weight: 600;
      color: #1f2937;
    }

    .review-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .review-rating {
      display: flex;
      gap: 0.25rem;
      color: #f59e0b;
    }

    .review-content p {
      color: #374151;
      line-height: 1.6;
      margin: 0;
    }

    /* Listings Section */
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .listing-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      color: inherit;
    }

    .listing-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .listing-image {
      height: 200px;
      overflow: hidden;
    }

    .listing-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .listing-info {
      padding: 1rem;
    }

    .listing-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .listing-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .listing-location {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: #6b7280;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-cover {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .profile-actions {
        justify-content: center;
      }

      .profile-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-tabs {
        overflow-x: auto;
      }

      .tab-btn {
        white-space: nowrap;
      }

      .reviews-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .listings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private apiService = inject(ApiService);

  profile: UserProfile | null = null;
  activeTab = 'about';
  reviews: Review[] = [];
  listings: Listing[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadProfile();
    this.loadReviews();
    this.loadListings();
  }

  loadProfile(): void {
    this.loading = true;
    
    this.apiService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.data as any;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.profile = null;
        this.loading = false;
      }
    });
  }

  loadReviews(): void {
    this.apiService.getMyReviews().subscribe({
      next: (response) => {
        this.reviews = response.data || [];
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviews = [];
      }
    });
  }

  loadListings(): void {
    this.apiService.getMyProducts().subscribe({
      next: (response) => {
        this.listings = (response.data?.items || []) as any;
      },
      error: (error) => {
        console.error('Error loading listings:', error);
        this.listings = [];
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStars(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    
    if (hasHalfStar) {
      stars.push(0.5);
    }
    
    return stars;
  }

  // User management endpoint integrations - using component data instead of hardcoded values
  createBuyerAccount(buyerData: any): void {
    this.apiService.createBuyerAccount(buyerData).subscribe({
      next: (response) => {
        console.log('Buyer account created:', response.data);
      },
      error: (error) => {
        console.error('Error creating buyer account:', error);
      }
    });
  }

  createSellerAccount(sellerData: any): void {
    this.apiService.createSellerAccount(sellerData).subscribe({
      next: (response) => {
        console.log('Seller account created:', response.data);
      },
      error: (error) => {
        console.error('Error creating seller account:', error);
      }
    });
  }

  updateBuyerProfile(buyerData: any): void {
    this.apiService.updateBuyerProfile(buyerData).subscribe({
      next: (response) => {
        console.log('Buyer profile updated:', response.data);
      },
      error: (error) => {
        console.error('Error updating buyer profile:', error);
      }
    });
  }

  updateSellerProfile(sellerData: any): void {
    this.apiService.updateSellerProfile(sellerData).subscribe({
      next: (response) => {
        console.log('Seller profile updated:', response.data);
      },
      error: (error) => {
        console.error('Error updating seller profile:', error);
      }
    });
  }

  switchRole(): void {
    this.apiService.switchRole().subscribe({
      next: (response) => {
        console.log('Role switched:', response.data);
      },
      error: (error) => {
        console.error('Error switching role:', error);
      }
    });
  }

  getUsers(): void {
    this.apiService.getUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  getPublicProfile(userId: string): void {
    this.apiService.getPublicProfile(userId).subscribe({
      next: (response) => {
        console.log('Public profile loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading public profile:', error);
      }
    });
  }

  loadUserSettings(): void {
    this.apiService.getUserSettings().subscribe({
      next: (response) => {
        console.log('User settings loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading user settings:', error);
      }
    });
  }

  updateUserSettings(settings: any): void {
    this.apiService.updateUserSettings(settings).subscribe({
      next: (response) => {
        console.log('User settings updated:', response.data);
      },
      error: (error) => {
        console.error('Error updating user settings:', error);
      }
    });
  }

  passwordReset(email: string): void {
    this.apiService.passwordReset(email).subscribe({
      next: (response) => {
        console.log('Password reset email sent:', response.data);
      },
      error: (error) => {
        console.error('Error sending password reset:', error);
      }
    });
  }

  passwordResetConfirm(resetData: any): void {
    this.apiService.passwordResetConfirm(resetData).subscribe({
      next: (response) => {
        console.log('Password reset confirmed:', response.data);
      },
      error: (error) => {
        console.error('Error confirming password reset:', error);
      }
    });
  }

  sendEmailVerification(email: string): void {
    this.apiService.sendEmailVerification(email).subscribe({
      next: (response) => {
        console.log('Email verification sent:', response.data);
      },
      error: (error) => {
        console.error('Error sending email verification:', error);
      }
    });
  }

  verifyEmail(verificationData: any): void {
    this.apiService.verifyEmail(verificationData).subscribe({
      next: (response) => {
        console.log('Email verified:', response.data);
      },
      error: (error) => {
        console.error('Error verifying email:', error);
      }
    });
  }

  logout(): void {
    this.apiService.logout().subscribe({
      next: (response) => {
        console.log('Logged out successfully:', response.data);
      },
      error: (error) => {
        console.error('Error logging out:', error);
      }
    });
  }
} 