import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RequestService } from '../../../domains/requests/services/request.service';
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
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { NgOptimizedImage } from '@angular/common';
import {
  BuyerRequest as BuyerRequestModel,
  SellerOffer,
} from '../../../domains/requests/models/request.model';

interface BuyerRequestViewModel {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  status: 'Active' | 'Pending' | 'Fulfilled' | 'Closed' | 'Expired';
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

interface SellerOfferViewModel {
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
  private breadcrumbService = inject(BreadcrumbService);

  // Component state
  loading = signal(true);
  request = signal<BuyerRequestViewModel | null>(null);
  responses = signal<SellerOfferViewModel[]>([]);
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
      
      this.requestService.getRequest(requestId).subscribe({
        next: (buyerRequest) => {
          const viewModel = this.toRequestViewModel(buyerRequest);
          this.request.set(viewModel);
          this.setupBreadcrumbs(viewModel);
          this.loading.set(false);
          this.loadOffers(requestId);
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.loading.set(false);
        },
      });
    }
  }

  private loadOffers(requestId: string): void {
    this.requestService.getRequestOffers(requestId).subscribe({
      next: (offers) => {
        const sellerResponses = offers.map((offer) => this.toOfferViewModel(offer));
          this.responses.set(sellerResponses);
      },
      error: (error) => {
        console.error('Error loading offers:', error);
      },
    });
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

  acceptOffer(response: SellerOfferViewModel): void {
    if (confirm('Are you sure you want to accept this offer?')) {
      this.updateOfferProcessing(response.id, true);
      
      this.requestService.acceptOffer(response.id).subscribe({
        next: (updatedOffer) => {
          this.replaceOffer(updatedOffer, 'accepted');
        this.router.navigate([ROUTES_ABSOLUTE.APP.CHECKOUT], { 
            queryParams: { source: 'offer', offerId: response.id },
        });
        },
        error: (error) => {
          console.error('Error accepting offer:', error);
          this.updateOfferProcessing(response.id, false);
        },
      });
    }
  }

  private toRequestViewModel(request: BuyerRequestModel): BuyerRequestViewModel {
    const firstCategory = request.categories.at(0);
    const metadata = request.requestMetadata ?? {};
    const location =
      (metadata['location'] as string | undefined) ??
      (metadata['preferred_location'] as string | undefined) ??
      'Not specified';
    const urgency =
      (metadata['urgency'] as 'low' | 'medium' | 'high' | undefined) ?? 'medium';
    const tags = Array.isArray(metadata['tags'])
      ? (metadata['tags'] as string[])
      : [];
    const timeline =
      (metadata['timeline'] as string | undefined) ??
      (request.expiresAt ? this.getTimeRemainingFrom(request.expiresAt) : 'Not specified');

    return {
      id: request.id,
      title: request.title,
      description: request.description,
      category: firstCategory?.name ?? 'Uncategorized',
      budgetMin: request.budget ?? 0,
      budgetMax: request.budget ?? 0,
      status: this.getStatusLabel(request.status),
      buyerName: request.user?.username ?? 'Unknown',
      buyerAvatar: request.user?.profilePictureUrl ?? '/markt-text-logo.png',
      buyerId: request.userId,
      createdAt: request.createdAt,
      expiresAt: request.expiresAt ?? '',
      offersCount: request.offers.length,
      viewsCount: request.views,
      tags,
      location,
      urgency,
      mediaUrls: request.images
        .map((image) => image.imageUrl)
        .filter((url): url is string => Boolean(url)),
      isOwner: false,
      condition: (metadata['condition'] as string | undefined) ?? 'Not specified',
      timeline,
    };
  }

  private toOfferViewModel(offer: SellerOffer): SellerOfferViewModel {
    return {
      id: offer.id,
      sellerName: offer.seller?.shopName ?? 'Unknown Seller',
      sellerAvatar: offer.seller?.profilePictureUrl ?? '/markt-text-logo.png',
      sellerId: offer.sellerId,
      rating: offer.seller?.rating ?? 0,
      reviewCount: 0,
      price: offer.price ?? 0,
      createdAt: offer.createdAt,
      condition: offer.product?.name ?? 'Not specified',
      delivery: 'Not specified',
      description: offer.message ?? '',
      status: offer.status,
      _processing: false,
    };
  }

  private setupBreadcrumbs(request: BuyerRequestViewModel): void {
    this.breadcrumbService.setBreadcrumbs([
      {
        label: 'Dashboard',
        url: ROUTES_ABSOLUTE.APP.DASHBOARD,
        icon: 'home',
        isClickable: true,
        isCurrentPage: false,
        metadata: {},
      },
      {
        label: 'Requests',
        url: ROUTES_ABSOLUTE.APP.REQUESTS.ROOT,
        icon: 'clipboard',
        isClickable: true,
        isCurrentPage: false,
        metadata: {},
      },
      {
        label: request.title,
        url: `/app/requests/${request.id}`,
        icon: 'clipboard',
        isClickable: false,
        isCurrentPage: true,
        metadata: {
          id: request.id,
          type: 'request',
        },
      },
    ]);
  }

  private getStatusLabel(status: string): BuyerRequestViewModel['status'] {
    switch (status) {
      case 'open':
        return 'Active';
      case 'fulfilled':
        return 'Fulfilled';
      case 'closed':
        return 'Closed';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending';
    }
  }

  private getTimeRemainingFrom(expiresAt: string): string {
    const now = new Date();
    const end = new Date(expiresAt);
    const diffInMs = end.getTime() - now.getTime();
    if (diffInMs <= 0) {
      return 'Expired';
    }
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} remaining`;
  }

  private updateOfferProcessing(offerId: string, isProcessing: boolean): void {
    const updated = this.responses().map((offer) =>
      offer.id === offerId ? { ...offer, _processing: isProcessing } : offer
    );
    this.responses.set(updated);
  }

  private replaceOffer(offer: SellerOffer, statusOverride?: SellerOfferViewModel['status']): void {
    const updatedOffer = this.toOfferViewModel(offer);
    const next = this.responses().map((item) =>
      item.id === offer.id
        ? { ...updatedOffer, status: statusOverride ?? updatedOffer.status, _processing: false }
        : item
    );
    this.responses.set(next);
  }
} 