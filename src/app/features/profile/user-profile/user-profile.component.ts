import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faUserPlus, faEnvelope, faShare, faCheckCircle, faGraduationCap, faCalendar, faMapMarkerAlt, faBook, faClock, faHandshake, faFlag, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TitleMetaService } from '../../../core/services/title-meta.service';
import { MediaOptimizationService } from '../../../core/services/media-optimization.service';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  university?: string;
  member_since: string;
  total_products: number;
  total_sales: number;
  rating: number;
  review_count: number;
  followers_count: number;
  is_verified: boolean;
  is_seller: boolean;
  is_campus_ambassador?: boolean;
  response_time?: string;
  preferred_meetup?: string;
  major?: string;
  year?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  condition: string;
  created_at: string;
  views_today?: number;
  interested_count?: number;
}

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Activity {
  id: string;
  type: 'listing' | 'sale' | 'group';
  description: string;
  created_at: string;
  color: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-profile.component.html',
  styles: []
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private titleMeta = inject(TitleMetaService);
  public media = inject(MediaOptimizationService);

  // FontAwesome icons
  faStar = faStar;
  faUserPlus = faUserPlus;
  faEnvelope = faEnvelope;
  faShare = faShare;
  faCheckCircle = faCheckCircle;
  faGraduationCap = faGraduationCap;
  faCalendar = faCalendar;
  faMapMarkerAlt = faMapMarkerAlt;
  faBook = faBook;
  faClock = faClock;
  faHandshake = faHandshake;
  faFlag = faFlag;
  faArrowRight = faArrowRight;

  profile?: UserProfile;
  products: Product[] = [];
  reviews: Review[] = [];
  recentActivities: Activity[] = [];
  isFollowing = false;
  loading = true;

  ngOnInit(): void {
    this.initializeMockData(); // Initialize mock data first
    this.loadUserProfile(); // Then try to load real data from API
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
          // Keep mock data if API fails
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
          // Keep mock products if API fails
        }
      });

      // Load user's reviews
      this.apiService.getUserReviews(userId).subscribe({
        next: (response) => {
          this.reviews = response.data || [];
        },
        error: (error) => {
          console.error('Error loading user reviews:', error);
          // Keep mock reviews if API fails
        }
      });
    }
  }

  private initializeMockData(): void {
    // Mock profile data if none loaded from API
    if (!this.profile) {
      this.profile = {
        id: '1',
        username: 'alexchen_stanford',
        full_name: 'Alex Chen',
        avatar_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        bio: 'Computer Science major passionate about tech and helping fellow students find great deals on textbooks and electronics. Always happy to answer questions!',
        location: 'Palo Alto, CA',
        university: 'Stanford University',
        member_since: '2023-03-01',
        total_products: 12,
        total_sales: 89,
        rating: 4.9,
        review_count: 156,
        followers_count: 1247,
        is_verified: true,
        is_seller: true,
        is_campus_ambassador: true,
        response_time: '2 hours',
        preferred_meetup: 'Prefers campus meetups',
        major: 'Computer Science',
        year: 'Junior Year'
      };
    }

    // Mock data for demonstration - this will be replaced with real API data
    this.recentActivities = [
      {
        id: '1',
        type: 'listing',
        description: 'Listed new item: MacBook Pro',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        color: '#E94C2A'
      },
      {
        id: '2',
        type: 'sale',
        description: 'Completed sale: Physics Textbook',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        color: '#10B981'
      },
      {
        id: '3',
        type: 'group',
        description: 'Joined study group: CS101',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        color: '#3B82F6'
      }
    ];

    // Mock products if none loaded from API
    if (!this.products || this.products.length === 0) {
      this.products = [
        {
          id: '1',
          name: 'Economics Textbook Bundle',
          price: 89,
          description: 'Perfect condition, all highlighted sections included',
          image_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/60e853eaff-f5e99be783cada63c6b3.png',
          condition: 'Like New',
          created_at: new Date().toISOString(),
          views_today: 12
        },
        {
          id: '2',
          name: 'MacBook Pro 13" 2021',
          price: 1299,
          description: 'Excellent condition, includes charger and case',
          image_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/ad34108f74-9ffb1e4a039cc102e5a7.png',
          condition: 'Excellent',
          created_at: new Date().toISOString(),
          interested_count: 5
        }
      ];
    }

    // Mock reviews if none loaded from API
    if (!this.reviews || this.reviews.length === 0) {
      this.reviews = [
        {
          id: '1',
          reviewer_name: 'Sarah Johnson',
          reviewer_avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
          rating: 5,
          comment: 'Great seller! The textbook was exactly as described and shipping was super fast. Highly recommend!',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: '2',
          reviewer_name: 'Mike Rodriguez',
          reviewer_avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
          rating: 5,
          comment: 'Amazing experience! Alex was very responsive and the laptop works perfectly. Will definitely buy again.',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
        }
      ];
    }
  }

  sendMessage(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT], { queryParams: { user: this.profile?.id } });
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

  viewAllListings(): void {
    // Navigate to user's full listings page or show all products
    this.router.navigate([ROUTES_ABSOLUTE.APP.MARKETPLACE], { queryParams: { seller: this.profile?.id } });
  }

  viewProduct(productId: string): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', productId]);
  }
} 