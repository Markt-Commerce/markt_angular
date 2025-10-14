import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTES_ABSOLUTE, buildPath } from '../../../../core-next/config/routes.config';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHeart, 
  faComment, 
  faShare, 
  faBookmark,
  faMessage,
  faHandshake,
  faImage,
  faPaperclip,
  faCheckCircle,
  faEllipsis,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  rating?: number;
  sales?: number;
  major?: string;
  school?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  availability: string;
  category: string;
  image: string;
  timestamp: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  timestamp: string;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css']
})
export class ProductListingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // FontAwesome Icons
  faHeart = faHeart;
  faComment = faComment;
  faShare = faShare;
  faBookmark = faBookmark;
  faMessage = faMessage;
  faHandshake = faHandshake;
  faImage = faImage;
  faPaperclip = faPaperclip;
  faCheckCircle = faCheckCircle;
  faEllipsis = faEllipsis;
  faUserPlus = faUserPlus;

  // Component state
  productId: string | null = null;
  product: Product | null = null;
  seller: User | null = null;
  comments: Comment[] = [];
  similarProducts: SimilarProduct[] = [];
  newComment = '';
  isFollowing = false;
  currentUser: User | null = null;

  // Mock data - in real app, this would come from API
  trendingTags = ['#UCLA', '#StudentDeals', '#MacBook', '#TechSale', '#Electronics', '#Textbooks'];

  ngOnInit(): void {
    this.initializeUser();
    this.loadProductData();
  }

  private initializeUser(): void {
    // Get current user from auth service
    this.authService.authState$.subscribe(authState => {
      if (authState.user) {
        this.currentUser = {
          id: authState.user.id,
          name: authState.user.buyer_account?.buyername || authState.user.seller_account?.shop_name || 'User',
          username: `@${authState.user.username}`,
          avatar: authState.user.profile_picture_url || '/Logo.png'
        };
      }
    });
  }

  private loadProductData(): void {
    // Get product ID from route params
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.fetchProductDetails();
      }
    });
  }

  private fetchProductDetails(): void {
    // Mock data - in real app, this would come from API
    this.product = {
      id: this.productId!,
      title: 'MacBook Pro 16" M2 - Perfect for Students! 💻',
      description: `Hey UCLA fam! 👋 I'm selling my MacBook Pro 16" with M2 chip. It's been my faithful companion for the past year, but I'm upgrading to the new model.

This machine is absolutely perfect for any CS major or creative student. The performance is incredible - handles Xcode, Final Cut Pro, and multiple VMs without breaking a sweat. Battery life easily gets me through a full day of classes.

Comes with original charger, box, and I'll throw in a premium laptop sleeve. No scratches, dents, or issues. Always kept in a case and treated with care.

Price is firm but negotiable for fellow Bruins! 🐻 DM me if interested or have questions. Can meet anywhere on campus for inspection.

#MacBook #UCLA #StudentDeals #TechSale`,
      price: 1899,
      condition: 'Like New',
      location: 'UCLA Campus',
      availability: 'Available Now',
      category: 'Electronics',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/9fbc8d19f2-07c311491a381bec6be8.png',
      timestamp: '2 hours ago',
      views: 156,
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isBookmarked: false
    };

    this.seller = {
      id: '1',
      name: 'Alex Chen',
      username: '@alexchen_ucla',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      isVerified: true,
      rating: 4.9,
      sales: 23,
      major: 'CS Major',
      school: 'UCLA Student'
    };

    this.comments = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
        },
        content: 'Is this still available? I\'m really interested and can meet today!',
        timestamp: '1 hour ago',
        likes: 2,
        isLiked: false
      },
      {
        id: '2',
        author: {
          name: 'Mike Rodriguez',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg'
        },
        content: 'Great price! How\'s the battery health?',
        timestamp: '2 hours ago',
        likes: 1,
        isLiked: false,
        replies: [
          {
            id: '2-1',
            author: {
              name: 'Alex Chen',
              avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
              isVerified: true
            },
            content: 'Battery health is at 94%! It\'s been really well maintained.',
            timestamp: '1 hour ago',
            likes: 0,
            isLiked: false
          }
        ]
      },
      {
        id: '3',
        author: {
          name: 'Emma Wilson',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg'
        },
        content: 'DMed you! 🙌',
        timestamp: '3 hours ago',
        likes: 0,
        isLiked: false
      }
    ];

    this.similarProducts = [
      {
        id: '1',
        title: 'iPhone 14 Pro Max',
        price: 899,
        image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/28d9f48cff-0ef292c84f7fd7beeb89.png',
        timestamp: '2 days ago'
      },
      {
        id: '2',
        title: 'iPad Air + Apple Pencil',
        price: 549,
        image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/3635d6f51a-27b9e1df69f3f08fac9d.png',
        timestamp: '1 week ago'
      },
      {
        id: '3',
        title: 'AirPods Pro 2nd Gen',
        price: 199,
        image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d0758be037-6ec702f9658cef6c9bd7.png',
        timestamp: '3 days ago'
      }
    ];
  }

  toggleLike(): void {
    if (this.product) {
      this.product.isLiked = !this.product.isLiked;
      this.product.likes += this.product.isLiked ? 1 : -1;
    }
  }

  toggleBookmark(): void {
    if (this.product) {
      this.product.isBookmarked = !this.product.isBookmarked;
    }
  }

  toggleFollow(): void {
    this.isFollowing = !this.isFollowing;
  }

  messageSeller(): void {
    // Navigate to chat with seller
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.CHAT, this.seller?.id)]);
  }

  makeOffer(): void {
    // Navigate to make offer page for this specific product
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.OFFERS.ROOT, 'make', this.productId)]);
  }

  postComment(): void {
    if (!this.newComment.trim() || !this.currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        name: this.currentUser.name,
        avatar: this.currentUser.avatar
      },
      content: this.newComment,
      timestamp: 'now',
      likes: 0,
      isLiked: false
    };

    this.comments.unshift(newComment);
    this.newComment = '';
    
    if (this.product) {
      this.product.comments += 1;
    }
  }

  toggleCommentLike(comment: Comment): void {
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
  }

  viewProfile(): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.PROFILE, 'user', this.seller?.id)]);
  }

  viewSimilarProduct(product: SimilarProduct): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', product.id)]);
  }

  // TrackBy functions for performance optimization
  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }

  trackBySimilarProductId(index: number, product: SimilarProduct): string {
    return product.id;
  }
}
