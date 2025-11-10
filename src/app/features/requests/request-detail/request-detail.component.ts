import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RequestService } from '../../../domains/requests/services/request.service';
import { CartService } from '../../../domains/cart/services/cart.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faEdit, 
  faStar, 
  faArchive, 
  faCheck, 
  faMessage, 
  faImages, 
  faComments, 
  faVideo, 
  faHandshake,
  faEye,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { NgOptimizedImage } from '@angular/common';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  status: 'Active' | 'Pending' | 'Fulfilled' | 'Closed';
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
  condition: string;
  timeline: string;
}

interface SellerResponse {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  sellerId: string;
  rating: number;
  reviewCount: number;
  price: number;
  createdAt: string;
  condition: string;
  delivery: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  _processing?: boolean;
}

interface RecentActivity {
  id: string;
  type: 'offer' | 'message';
  userName: string;
  createdAt: string;
}

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule, NgOptimizedImage],
  templateUrl: './request-detail.component.html'
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(RequestService);
  private cartService = inject(CartService);
  private navigationService = inject(NavigationService);
  private breadcrumbService = inject(BreadcrumbService);

  // Component state
  loading = signal(true);
  request = signal<BuyerRequest | null>(null);
  responses = signal<SellerResponse[]>([]);
  recentActivity = signal<RecentActivity[]>([]);

  // FontAwesome icons
  faEdit = faEdit;
  faStar = faStar;
  faArchive = faArchive;
  faCheck = faCheck;
  faMessage = faMessage;
  faImages = faImages;
  faComments = faComments;
  faVideo = faVideo;
  faHandshake = faHandshake;
  faEye = faEye;
  faClock = faClock;

  ngOnInit(): void {
    this.loadRequest();
  }

  private loadRequest(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    
    if (requestId) {
      this.loading.set(true);
      
      // Migrated to RequestService.getRequest() - uses DDD pattern with RequestRepository
      this.requestService.getRequest(requestId).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Convert API response to component's BuyerRequest interface
            const apiRequest = response.data;
            const buyerRequest: BuyerRequest = {
              id: apiRequest.id,
              title: apiRequest.title,
              description: apiRequest.description,
              category: apiRequest.categories?.[0]?.name || 'Uncategorized',
              budgetMin: apiRequest.budget || 0,
              budgetMax: apiRequest.budget || 0,
              status: apiRequest.status as 'Active' | 'Pending' | 'Fulfilled' | 'Closed',
              buyerName: apiRequest.user?.username || 'Unknown',
              buyerAvatar: apiRequest.user?.profile_picture_url || '',
              buyerId: apiRequest.user_id || apiRequest.user?.id || '',
              createdAt: apiRequest.created_at,
              expiresAt: apiRequest.expires_at || '',
              offersCount: apiRequest.offers?.length || 0,
              viewsCount: apiRequest.views || 0,
              tags: [], // TODO: Extract from metadata if available
              location: '', // TODO: Extract from metadata if available
              urgency: 'medium' as const, // TODO: Extract from metadata if available
              mediaUrls: (apiRequest.images ?? [])
                .map((img: any) => img?.media?.original_url || img?.media?.thumbnail_url || '')
                .filter((url: string) => Boolean(url)),
              isOwner: false, // TODO: Check if current user is owner
              condition: '', // TODO: Extract from request or metadata
              timeline: '' // TODO: Calculate from expiresAt
            };
            
            this.request.set(buyerRequest);
            
            // Set breadcrumbs
            this.breadcrumbService.setBreadcrumbs([
              {
                label: 'Dashboard',
                url: ROUTES_ABSOLUTE.APP.DASHBOARD,
                icon: 'home',
                isClickable: true,
                isCurrentPage: false,
                metadata: {}
              },
              {
                label: 'Requests',
                url: ROUTES_ABSOLUTE.APP.REQUESTS.ROOT,
                icon: 'clipboard',
                isClickable: true,
                isCurrentPage: false,
                metadata: {}
              },
              {
                label: buyerRequest.title,
                url: `/app/requests/${buyerRequest.id}`,
                icon: 'clipboard',
                isClickable: false,
                isCurrentPage: true,
                metadata: {
                  id: buyerRequest.id,
                  type: 'request'
                }
              }
            ]);
            
            // Load offers for this request
            this.loadOffers(requestId);
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading request:', error);
          // Fallback to mock data if API fails (for development)
      this.loadMockRequestData();
          this.loading.set(false);
        }
      });
    }
  }

  private loadOffers(requestId: string): void {
    // Migrated to RequestService.getRequestOffers() - uses DDD pattern with RequestRepository
    this.requestService.getRequestOffers(requestId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Convert API offers to component's SellerResponse interface
          const sellerResponses: SellerResponse[] = response.data.map((offer: any) => ({
            id: offer.id,
            sellerName: '', // TODO: Get seller name from offer data
            sellerAvatar: '', // TODO: Get seller avatar from offer data
            sellerId: offer.seller_id,
            rating: 0, // TODO: Get seller rating
            reviewCount: 0, // TODO: Get seller review count
            price: offer.price,
            createdAt: offer.created_at,
            condition: '', // TODO: Extract from offer data
            delivery: '', // TODO: Extract from offer data
            description: offer.message || '',
            status: offer.status as 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          }));
          
          this.responses.set(sellerResponses);
        }
      },
      error: (error) => {
        console.error('Error loading offers:', error);
    }
    });
  }

  private loadMockRequestData(): void {
    // Mock request data matching the Figma design
    const mockRequest: BuyerRequest = {
      id: '1',
      title: 'MacBook Pro 13" M1 Chip',
      description: 'Looking for a MacBook Pro 13" with M1 chip for coding and design work. Prefer 8GB RAM minimum. Must be in good working condition with original charger.',
      category: 'Electronics',
      budgetMin: 800,
      budgetMax: 1200,
      status: 'Active',
      buyerName: 'John Doe',
      buyerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
      buyerId: '1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      offersCount: 5,
      viewsCount: 124,
      tags: ['macbook', 'm1', 'coding'],
      location: 'Campus pickup preferred',
      urgency: 'medium',
      mediaUrls: [],
      isOwner: true,
      condition: 'Good to Excellent',
      timeline: 'Within 1 week'
    };

    const mockResponses: SellerResponse[] = [
      {
        id: '1',
        sellerName: 'Alex Chen',
        sellerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        sellerId: '2',
        rating: 4.9,
        reviewCount: 23,
        price: 950,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        condition: 'Excellent - Like New',
        delivery: 'Campus pickup today',
        description: 'MacBook Pro 13" M1, 8GB RAM, 256GB SSD. Purchased 6 months ago, barely used. Includes original box, charger, and documentation.',
        status: 'pending'
      },
      {
        id: '2',
        sellerName: 'Sarah Martinez',
        sellerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        sellerId: '3',
        rating: 4.7,
        reviewCount: 15,
        price: 850,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        condition: 'Good - Minor wear',
        delivery: 'Tomorrow evening',
        description: 'MacBook Pro 13" M1, 8GB RAM, 512GB SSD. Some minor scratches on lid but perfect working condition. Used for 1 year.',
        status: 'pending'
      },
      {
        id: '3',
        sellerName: 'Mike Johnson',
        sellerAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
        sellerId: '4',
        rating: 5.0,
        reviewCount: 8,
        price: 1100,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        condition: 'Excellent - Mint',
        delivery: 'Immediate pickup',
        description: 'MacBook Pro 13" M1, 16GB RAM, 512GB SSD. Mint condition, used only for 3 months. Includes AppleCare+ until 2025.',
        status: 'pending'
      }
    ];

    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'offer',
        userName: 'Alex Chen',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'message',
        userName: 'Sarah Martinez',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'offer',
        userName: 'Mike Johnson',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.request.set(mockRequest);
    this.responses.set(mockResponses);
    this.recentActivity.set(mockActivity);
    
    // Set custom breadcrumbs using the existing breadcrumb service
    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'Dashboard',
        url: ROUTES_ABSOLUTE.APP.DASHBOARD,
        icon: 'home',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      {
        label: 'Requests',
        url: ROUTES_ABSOLUTE.APP.REQUESTS.ROOT,
        icon: 'clipboard',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      {
        label: mockRequest.title,
        url: `/app/requests/${mockRequest.id}`,
        icon: 'clipboard',
        isClickable: false,
        isCurrentPage: true,
        metadata: {
          id: mockRequest.id,
          type: 'request'
        }
      }
    ]);
    
    this.loading.set(false);
  }

  // Utility methods
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

  getStars(rating: number): any[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(faStar);
    }
    
    if (hasHalfStar) {
      stars.push(faStarRegular);
    }
    
    // Fill remaining stars to make 5 total
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(faStarRegular);
    }
    
    return stars;
  }

  getAverageOffer(): number {
    const responses = this.responses();
    if (responses.length === 0) return 0;
    
    const total = responses.reduce((sum, response) => sum + response.price, 0);
    return Math.round(total / responses.length);
  }

  getTimeRemaining(): string {
    const request = this.request();
    if (!request) return '0 days';
    
    const now = new Date();
    const expiresAt = new Date(request.expiresAt);
    const diffInDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${diffInDays} days`;
  }

  getActivityText(type: string): string {
    return type === 'offer' ? 'made an offer' : 'sent a message';
  }

  // Action methods
  sortByPrice(): void {
    const sorted = [...this.responses()].sort((a, b) => a.price - b.price);
    this.responses.set(sorted);
  }

  sortByRating(): void {
    const sorted = [...this.responses()].sort((a, b) => b.rating - a.rating);
    this.responses.set(sorted);
  }

  acceptOffer(response: SellerResponse): void {
    if (confirm('Are you sure you want to accept this offer?')) {
      response._processing = true;
      
      // Migrated to RequestService.acceptOffer() - uses DDD pattern with RequestRepository
      this.requestService.acceptOffer(response.id).subscribe({
        next: (apiResponse) => {
          if (apiResponse.success) {
        response.status = 'accepted';
        response._processing = false;
        
        // Navigate to checkout or show success message
        this.router.navigate([ROUTES_ABSOLUTE.APP.CHECKOUT], { 
          queryParams: { source: 'offer', offerId: response.id } 
        });
          } else {
            response._processing = false;
            console.error('Failed to accept offer');
          }
        },
        error: (error) => {
          console.error('Error accepting offer:', error);
          response._processing = false;
        }
      });
    }
  }
} 