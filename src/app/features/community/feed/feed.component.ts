import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faComment, faShare, faPlus, faImage, faMapMarkerAlt, faStore, faCheckCircle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { SocialService } from '../../../core/services/social.service';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/auth.model';
import { ApiService } from '../../../core/services/api.service';
import { MediaOptimizationService } from '../../../core/services/media-optimization.service';

interface FeedPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    isSeller: boolean;
  };
  content: string;
  images?: string[];
  location?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  type: 'text' | 'product' | 'request';
  productInfo?: {
    price: number;
    category: string;
  };
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header with Create Post -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div class="max-w-2xl mx-auto px-4 py-4">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900">Your Feed</h1>
              <p class="text-gray-600">Discover what's happening in your community</p>
            </div>
            <button 
              class="bg-markt-primary hover:bg-markt-secondary text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              (click)="showCreatePost = true"
            >
              <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
              Create Post
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-6">
        <!-- Create Post Modal/Section -->
        <div *ngIf="showCreatePost" class="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Create New Post</h2>
            <button 
              (click)="showCreatePost = false"
              class="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div class="flex gap-3 mb-4">
            <div class="w-10 h-10 bg-markt-primary rounded-full flex items-center justify-center text-white font-bold">
              {{ (currentUser$ | async)?.username?.charAt(0) || 'U' }}
            </div>
            <div class="flex-1">
            <textarea 
                [(ngModel)]="newPostContent"
                placeholder="What's on your mind? Share a product, make a request, or just say hello!"
                class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-markt-primary focus:border-transparent"
                rows="3"
            ></textarea>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <button class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <fa-icon [icon]="faImage" class="w-4 h-4"></fa-icon>
                Photo
              </button>
              <button class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <fa-icon [icon]="faMapMarkerAlt" class="w-4 h-4"></fa-icon>
                Location
              </button>
            </div>
            <button 
              (click)="createPost()"
              [disabled]="!newPostContent.trim()"
              class="bg-markt-primary hover:bg-markt-secondary disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Post
            </button>
          </div>
        </div>

        <!-- Feed Posts -->
        <div class="space-y-6">
          <div *ngFor="let post of posts" class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <!-- Post Header -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-markt-primary to-markt-accent rounded-full flex items-center justify-center text-white font-bold">
                  {{ post.user.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">{{ post.user.name }}</h3>
                    <fa-icon *ngIf="post.user.isVerified" [icon]="faVerified" class="w-4 h-4 text-blue-500"></fa-icon>
                    <fa-icon *ngIf="post.user.isSeller" [icon]="faStore" class="w-4 h-4 text-markt-primary"></fa-icon>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span>{{ getTimeAgo(post.timestamp) }}</span>
                    <span *ngIf="post.location" class="flex items-center gap-1">
                      <fa-icon [icon]="faMapMarkerAlt" class="w-3 h-3"></fa-icon>
                      {{ post.location }}
                    </span>
                  </div>
                </div>
                <div class="text-gray-400">
                  <button class="p-2 hover:bg-gray-100 rounded-full">
                    <fa-icon [icon]="faEllipsisV" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Post Content -->
            <div class="p-4">
              <p class="text-gray-900 mb-3">{{ post.content }}</p>
              
              <!-- Product Info (if product post) -->
              <div *ngIf="post.type === 'product' && post.productInfo" class="bg-markt-light/20 rounded-lg p-3 mb-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">{{ post.productInfo.category }}</span>
                  <span class="text-lg font-bold text-markt-primary">₦{{ post.productInfo.price.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Post Images -->
              <div *ngIf="post.images && post.images.length > 0" class="grid gap-2 mb-3" 
                   [ngClass]="{
                     'grid-cols-1': post.images.length === 1,
                     'grid-cols-2': post.images.length >= 2
                   }">
                <div *ngFor="let image of post.images.slice(0, 4); let i = index" 
                     class="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img [src]="image" loading="lazy" decoding="async" [alt]="'Post image'" class="w-full h-full object-cover">
                  <div *ngIf="post.images.length > 4 && i === 3" 
                       class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
                    +{{ post.images.length - 4 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Post Actions -->
            <div class="px-4 py-3 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                  <button 
                    (click)="likePost(post.id.toString())"
                    class="flex items-center gap-2 text-gray-600 hover:text-markt-primary transition-colors"
                    [class.text-markt-primary]="post.isLiked"
                  >
                    <fa-icon [icon]="faHeart" class="w-5 h-5" [class.text-red-500]="post.isLiked"></fa-icon>
                    <span class="text-sm font-medium">{{ post.likes }}</span>
                  </button>
                  <button class="flex items-center gap-2 text-gray-600 hover:text-markt-primary transition-colors">
                    <fa-icon [icon]="faComment" class="w-5 h-5"></fa-icon>
                    <span class="text-sm font-medium">{{ post.comments }}</span>
              </button>
                  <button class="flex items-center gap-2 text-gray-600 hover:text-markt-primary transition-colors">
                    <fa-icon [icon]="faShare" class="w-5 h-5"></fa-icon>
                    <span class="text-sm font-medium">Share</span>
              </button>
                </div>
                <div *ngIf="post.type === 'product'" class="flex gap-2">
                  <button class="bg-markt-primary hover:bg-markt-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Contact Seller
              </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div class="text-center py-8">
          <button 
            (click)="loadMorePosts()"
            class="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FeedComponent implements OnInit {
  private authService = inject(AuthService);
  private socialService = inject(SocialService);
  private apiService = inject(ApiService);
  media = inject(MediaOptimizationService);

  // Icons
  faHeart = faHeart;
  faComment = faComment;
  faShare = faShare;
  faPlus = faPlus;
  faImage = faImage;
  faMapMarkerAlt = faMapMarkerAlt;
  faStore = faStore;
  faVerified = faCheckCircle;
  faEllipsisV = faEllipsisV;

  // State
  get currentUser$(): Observable<User | null> {
    return this.authService.currentUser$;
  }
  selectedMedia: any[] = [];
  showCreatePost = false;
  newPostContent = '';
  posts: FeedPost[] = [];
  currentPage = 1;
  hasMorePosts = true;
  loading = false;

  ngOnInit(): void {
    this.loadFeed();
  }

  private loadFeed(): void {
    this.loading = true;
    
    this.apiService.getCommunityFeed().subscribe({
      next: (response) => {
        const items = response.data?.items || response.data || [];
        this.posts = (items || []).map((post: any) => this.mapPostToFeedPost(post));
        this.hasMorePosts = response.data?.pagination?.has_next || false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading community feed:', error);
        this.posts = [];
        this.loading = false;
      }
    });
  }

  loadMorePosts(): void {
    this.currentPage++;
    this.apiService.getCommunityFeed().subscribe({
      next: (response) => {
        const items = response.data?.items || response.data || [];
        this.posts = [...this.posts, ...items.map((p: any) => this.mapPostToFeedPost(p))];
        this.hasMorePosts = response.data?.pagination?.has_next || false;
      },
      error: (error) => {
        console.error('Error loading more posts:', error);
      }
    });
  }

  private mapPostToFeedPost(post: any): FeedPost {
    return {
      id: post.id,
      user: {
        id: post.user?.id || post.seller?.id || '',
        name: post.user?.username || post.seller?.shop_name || 'Unknown User',
        avatar: post.user?.profile_picture_url || post.seller?.profile_picture_url,
        isVerified: (post.seller?.verification_status === 'verified') || false,
        isSeller: !!post.seller
      },
      content: post.caption || post.content || '',
      images: (post.social_media || post.media || []).map((m: any) => m?.media?.url || m?.url).filter(Boolean),
      location: post.location || '',
      timestamp: new Date(post.created_at),
      likes: post.like_count || post.likes_count || 0,
      comments: post.comment_count || post.comments_count || 0,
      isLiked: !!post.is_liked,
      type: post.product ? 'product' : 'text',
      productInfo: post.product ? {
        price: post.product.price,
        category: post.product.category?.name || 'Product'
      } : undefined
    };
  }

  createPost(): void {
    if (this.newPostContent.trim()) {
      this.currentUser$.subscribe(user => {
        const postData = {
          caption: this.newPostContent,
          media: this.selectedMedia,
          tags: []
        };

        this.socialService.createPost(postData).subscribe({
          next: (response) => {
            this.posts.unshift(this.mapPostToFeedPost(response));
            this.newPostContent = '';
            this.showCreatePost = false;
          },
          error: (error) => {
            console.error('Error creating post:', error);
          }
        });
      });
    }
  }

  likePost(postId: string): void {
    this.socialService.likePost(postId).subscribe({
      next: () => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.isLiked = true;
          post.likes += 1;
        }
      },
      error: (error) => {
        console.error('Error liking post:', error);
      }
    });
  }

  commentOnPost(postId: string, comment: string): void {
    this.socialService.addComment(postId, { content: comment }).subscribe({
      next: () => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments += 1;
        }
      },
      error: (error) => {
        console.error('Error commenting on post:', error);
      }
    });
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
} 