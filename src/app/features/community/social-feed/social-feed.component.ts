import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHeart, 
  faStore, 
  faUsers, 
  faCalendar, 
  faPlus, 
  faImage, 
  faTag, 
  faEllipsis, 
  faComment, 
  faShare, 
  faBookmark,
  faShoppingCart,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../domains/authentication/services/auth.service';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  following: number;
  followers: number;
  isVerified?: boolean;
}

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  isOwnStory?: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    badge?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  type: 'social' | 'product' | 'event';
  productInfo?: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image?: string;
  };
  eventInfo?: {
    title: string;
    date: string;
    location: string;
    rsvpCount: number;
    image?: string;
  };
}

interface TrendingTopic {
  rank: number;
  name: string;
  posts: number;
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  major: string;
  mutualFriends: number;
}

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.css']
})
export class SocialFeedComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  // FontAwesome Icons
  faHeart = faHeart;
  faStore = faStore;
  faUsers = faUsers;
  faCalendar = faCalendar;
  faPlus = faPlus;
  faImage = faImage;
  faTag = faTag;
  faEllipsis = faEllipsis;
  faComment = faComment;
  faShare = faShare;
  faBookmark = faBookmark;
  faShoppingCart = faShoppingCart;
  faHandshake = faHandshake;

  // Component state
  newPostContent = '';
  currentUser: User | null = null;

  // Mock data - in real app, this would come from API
  stories: Story[] = [
    {
      id: '1',
      user: { name: 'Alex', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' }
    },
    {
      id: '2',
      user: { name: 'Mike', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' }
    }
  ];

  posts: Post[] = [
    {
      id: '1',
      author: {
        name: 'Alex Rodriguez',
        username: '@alexr_stanford',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'
      },
      content: 'Just finished my CS229 midterm! 🎉 Anyone else feeling the relief? Time to celebrate with some boba tea from the campus store!',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/893d7a0901-024933260fa1b5701489.png',
      timestamp: '2h',
      likes: 24,
      comments: 8,
      shares: 5,
      isLiked: false,
      type: 'social'
    },
    {
      id: '2',
      author: {
        name: 'Emma Wilson',
        username: '@emmaw_stanford',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        badge: 'Verified Seller'
      },
      content: 'Selling my barely used textbooks! Perfect condition, great for next semester 📚',
      timestamp: '4h',
      likes: 12,
      comments: 5,
      shares: 3,
      isLiked: false,
      type: 'product',
      productInfo: {
        id: 'calculus-textbook-bundle',
        title: 'Calculus Textbook',
        price: 45,
        originalPrice: 120,
        image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/b5a660d856-2ddd4d62eb66ec2775aa.png'
      }
    },
    {
      id: '3',
      author: {
        name: 'Stanford Union',
        username: '@stanford_union',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
        badge: 'Official'
      },
      content: '🎵 Spring Concert featuring local artists! Join us this Friday at the Quad for an amazing night of music and community.',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/3164bc9022-4324bc11c485639df8e7.png',
      timestamp: '6h',
      likes: 89,
      comments: 23,
      shares: 15,
      isLiked: true,
      type: 'event',
      eventInfo: {
        title: 'Spring Concert 2024',
        date: 'Friday, March 15 • 7:00 PM',
        location: 'Stanford Main Quad',
        rsvpCount: 156,
        image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/3164bc9022-4324bc11c485639df8e7.png'
      }
    }
  ];

  trendingTopics: TrendingTopic[] = [
    { rank: 1, name: 'SpringBreakPlans', posts: 2847 },
    { rank: 2, name: 'TextbookSale', posts: 1234 },
    { rank: 3, name: 'StudyGroup', posts: 882 }
  ];

  suggestedUsers: SuggestedUser[] = [
    {
      id: '1',
      name: 'Jake Thompson',
      username: '@jakethompson',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
      major: 'CS Major',
      mutualFriends: 5
    },
    {
      id: '2',
      name: 'Lisa Park',
      username: '@lisapark',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
      major: 'Business',
      mutualFriends: 3
    }
  ];

  ngOnInit(): void {
    this.initializeUser();
    this.loadFeedData();
  }

  private initializeUser(): void {
    // Get current user from auth service
    this.authService.authState$.subscribe(authState => {
      if (authState.user) {
        this.currentUser = {
          id: authState.user.id,
          name: authState.user.buyerAccount?.buyername || authState.user.sellerAccount?.shop_name || 'User',
          username: `@${authState.user.username}`,
          avatar: authState.user.profilePictureUrl || '/Logo.png',
          following: 127,
          followers: 89
        };
      }
    });
  }

  private loadFeedData(): void {
    // In a real app, this would load from API
    // For now, we're using mock data defined above
  }


  createPost(): void {
    if (!this.newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: this.currentUser?.name || 'User',
        username: this.currentUser?.username || '@user',
        avatar: this.currentUser?.avatar || '/Logo.png'
      },
      content: this.newPostContent,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      type: 'social'
    };

    this.posts.unshift(newPost);
    this.newPostContent = '';
  }

  toggleLike(post: Post): void {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
  }

  scrollToCreatePost(): void {
    // Scroll to the create post section
    const createPostElement = document.querySelector('section:nth-of-type(2)');
    if (createPostElement) {
      createPostElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // TrackBy functions for performance optimization
  trackByStoryId(index: number, story: Story): string {
    return story.id;
  }

  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  trackByTopicRank(index: number, topic: TrendingTopic): number {
    return topic.rank;
  }

  trackByUserId(index: number, user: SuggestedUser): string {
    return user.id;
  }

  makeOffer(productId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/app/offers/make', productId]);
  }
}

