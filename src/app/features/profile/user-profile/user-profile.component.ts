import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { TitleMetaService } from '../../../core/services/title-meta.service';
import { MediaOptimizationService } from '../../../core/services/media-optimization.service';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  member_since: string;
  total_products: number;
  total_sales: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_seller: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  condition: string;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FontAwesomeModule],
  template: `
    <div class="user-profile-container">
      <div class="profile-header">
        <div class="profile-cover">
          <div class="profile-avatar">
            <img 
              [src]="profile?.avatar_url || '/markt-text-logo.png'" 
              [alt]="profile?.full_name"
              class="avatar-image"
            >
            <div *ngIf="profile?.is_verified" class="verified-badge">
              ✓
            </div>
          </div>
        </div>
        
        <div class="profile-info">
          <div class="profile-main">
            <h1 class="profile-name">{{ profile?.full_name }}</h1>
            <p class="profile-username">@{{ profile?.username }}</p>
            <p *ngIf="profile?.bio" class="profile-bio">{{ profile?.bio }}</p>
            
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs" *ngIf="profile?.is_seller">Seller</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">Buyer</span>
              <span *ngIf="profile?.is_verified" class="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Verified</span>
            </div>

            <div class="profile-meta">
              <div *ngIf="profile?.location" class="meta-item">
                <i class="fas fa-map-marker-alt text-gray-500"></i>
                <span>{{ profile?.location }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar text-gray-500"></i>
                <span>Member since {{ profile?.member_since | date:'MMM yyyy' }}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-actions">
            <app-button variant="primary" size="md" (click)="sendMessage()">{{ profile?.is_seller ? 'Message seller' : 'Message' }}</app-button>
            <app-button variant="secondary" size="md" [outline]="true" (click)="toggleFollow()">{{ isFollowing ? 'Unfollow' : 'Follow' }}</app-button>
          </div>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-number">{{ profile?.total_products || 0 }}</div>
          <div class="stat-label">Products</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ profile?.total_sales || 0 }}</div>
          <div class="stat-label">Sales</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ profile?.rating || 0 | number:'1.1-1' }}</div>
          <div class="stat-label">Rating</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ profile?.review_count || 0 }}</div>
          <div class="stat-label">Reviews</div>
        </div>
      </div>

      <div class="profile-content">
        <div class="content-tabs">
          <button 
            class="tab-button"
            [class.active]="activeTab === 'products'"
            (click)="setActiveTab('products')"
          >
            Products ({{ products.length }})
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab === 'reviews'"
            (click)="setActiveTab('reviews')"
          >
            Reviews ({{ reviews.length }})
          </button>
          <button 
            *ngIf="profile?.is_seller"
            class="tab-button"
            [class.active]="activeTab === 'about'"
            (click)="setActiveTab('about')"
          >
            About
          </button>
        </div>

        <div *ngIf="activeTab === 'products'" class="products-grid">
          <div *ngFor="let product of products" class="product-card">
            <img 
              [src]="media.getPrimaryUrl(product) || product.image_url || '/markt-text-logo.png'" 
              [srcset]="media.getSrcSet(product)"
              [sizes]="media.gridSizes()"
              loading="lazy"
              decoding="async"
              [alt]="product.name"
            >
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="price">{{ product.price | currency:'NGN' }}</p>
              <button class="view-button" (click)="viewProduct(product.id)">View Product</button>
            </div>
          </div>
        </div>

        <div *ngIf="activeTab === 'reviews'" class="reviews-list">
            <div *ngIf="reviews.length === 0" class="empty-state">
              <div class="empty-icon"><fa-icon [icon]="faStar"></fa-icon></div>
              <h3>No reviews yet</h3>
              <p>This user hasn't received any reviews yet.</p>
            </div>

            <div *ngIf="reviews.length > 0" class="reviews-list">
              <div *ngFor="let review of reviews" class="review-card">
                <div class="review-header">
                  <div class="reviewer-info">
                    <span class="reviewer-name">{{ review.reviewer_name }}</span>
                    <div class="review-rating">
                      <span *ngFor="let star of [1,2,3,4,5]" class="star" [class.filled]="star <= review.rating">★</span>
                    </div>
                  </div>
                  <span class="review-date">{{ review.created_at | date:'short' }}</span>
                </div>
                <p class="review-comment">{{ review.comment }}</p>
              </div>
            </div>
          </div>

          <!-- About Tab -->
          <div *ngIf="activeTab === 'about' && profile?.is_seller" class="about-tab">
            <div class="about-section">
              <h3>About the Seller</h3>
              <p *ngIf="profile?.bio">{{ profile!.bio }}</p>
              <p *ngIf="!profile?.bio">This seller hasn't added a bio yet.</p>
            </div>

            <div class="social-links" *ngIf="hasSocialLinks()">
              <h3>Social Links</h3>
              <div class="social-grid">
                <a *ngIf="profile?.twitter" [href]="'https://twitter.com/' + profile!.twitter!.replace('@', '')" target="_blank" class="social-link twitter">
                  <span class="social-icon">🐦</span>
                  <span>Twitter</span>
                </a>
                <a *ngIf="profile?.instagram" [href]="'https://instagram.com/' + profile!.instagram!.replace('@', '')" target="_blank" class="social-link instagram">
                  <span class="social-icon">📷</span>
                  <span>Instagram</span>
                </a>
                <a *ngIf="profile?.linkedin" [href]="profile!.linkedin" target="_blank" class="social-link linkedin">
                  <span class="social-icon">💼</span>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
  `,
  styles: [`
    .user-profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .profile-cover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      height: 200px;
      position: relative;
    }

    .profile-avatar {
      position: absolute;
      bottom: -50px;
      left: 2rem;
      position: relative;
    }

    .avatar-image {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid white;
      object-fit: cover;
    }

    .verified-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #059669;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .profile-info {
      padding: 3rem 2rem 2rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .profile-name {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.25rem 0;
    }

    .profile-username {
      color: #718096;
      font-size: 1rem;
      margin: 0 0 1rem 0;
    }

    .profile-bio {
      color: #4a5568;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0 0 1rem 0;
      max-width: 600px;
    }

    .profile-meta {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #718096;
      font-size: 0.875rem;
    }

    .meta-icon {
      font-size: 1rem;
    }

    .meta-link {
      color: #4299e1;
      text-decoration: none;
    }

    .meta-link:hover {
      text-decoration: underline;
    }

    .profile-actions {
      display: flex;
      gap: 0.75rem;
    }

    .profile-stats {
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

    .profile-content {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .content-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
    }

    .tab-button {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: #718096;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
    }

    .tab-button:hover {
      color: #4a5568;
      background: #f7fafc;
    }

    .tab-button.active {
      color: #4299e1;
      border-bottom-color: #4299e1;
    }

    .tab-content {
      padding: 2rem;
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
      margin: 0;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .product-card {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .product-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .product-image {
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info {
      padding: 1rem;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .product-price {
      font-size: 1.125rem;
      font-weight: 700;
      color: #059669;
      margin: 0 0 0.25rem 0;
    }

    .product-condition {
      font-size: 0.875rem;
      color: #718096;
      margin: 0;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-card {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .reviewer-name {
      font-weight: 600;
      color: #2d3748;
    }

    .review-rating {
      display: flex;
      gap: 0.25rem;
      margin-left: 0.5rem;
    }

    .star {
      color: #e2e8f0;
      font-size: 0.875rem;
    }

    .star.filled {
      color: #f6ad55;
    }

    .review-date {
      font-size: 0.75rem;
      color: #718096;
    }

    .review-comment {
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .about-section {
      margin-bottom: 2rem;
    }

    .about-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .social-links h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .social-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .social-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      text-decoration: none;
      color: #4a5568;
      transition: all 0.2s ease;
    }

    .social-link:hover {
      background: #f7fafc;
      transform: translateY(-1px);
    }

    .social-icon {
      font-size: 1.25rem;
    }

    @media (max-width: 768px) {
      .user-profile-container {
        padding: 1rem;
      }

      .profile-info {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .profile-actions {
        justify-content: center;
      }

      .profile-meta {
        flex-direction: column;
        gap: 0.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }

      .content-tabs {
        overflow-x: auto;
      }

      .tab-button {
        white-space: nowrap;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private titleMeta = inject(TitleMetaService);
  public media = inject(MediaOptimizationService);

  profile?: UserProfile;
  products: Product[] = [];
  reviews: Review[] = [];
  activeTab = 'products';
  isFollowing = false;
  loading = true;
  faStar = faStar;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.loading = true;
      
      this.apiService.getUserProfile(userId).subscribe({
        next: (response) => {
          this.profile = response.data as any;
          const titleHandle = this.profile?.username ? `@${this.profile.username}` : (this.profile?.full_name || 'User');
          this.titleMeta.setTitle([titleHandle, 'Markt']);
          this.titleMeta.setMeta(this.profile?.bio || undefined);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.loading = false;
        }
      });

      // Load user's products
      this.apiService.getUserProducts(userId).subscribe({
        next: (response) => {
          this.products = (response.data?.items || []) as any;
        },
        error: (error) => {
          console.error('Error loading user products:', error);
          this.products = [];
        }
      });

      // Load user's reviews
      this.apiService.getUserReviews(userId).subscribe({
        next: (response) => {
          this.reviews = response.data || [];
        },
        error: (error) => {
          console.error('Error loading user reviews:', error);
          this.reviews = [];
        }
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  hasSocialLinks(): boolean {
    return !!(this.profile?.twitter || this.profile?.instagram || this.profile?.linkedin);
  }

  sendMessage(): void {
    this.router.navigate(['/app/chat'], { queryParams: { user: this.profile?.id } });
  }

  toggleFollow(): void {
    if (!this.profile?.id) return;
    const userId = this.profile.id;
    if (this.isFollowing) {
      this.apiService.unfollowUser(userId).subscribe({
        next: () => { this.isFollowing = false; },
        error: () => { /* keep old state on error */ }
      });
    } else {
      this.apiService.followUser(userId).subscribe({
        next: () => { this.isFollowing = true; },
        error: () => { /* keep old state on error */ }
      });
    }
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/app/marketplace/product', productId]);
  }
} 