import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHeart,
  faComment,
  faShare,
  faBookmark,
  faEllipsisH,
  faPlus,
  faCamera,
  faVideo,
  faImage,
  faSmile,
  faMapMarkerAlt,
  faClock,
  faUser,
  faStore,
  faStar,
  faThumbsUp,
  faThumbsDown,
  faFlag,
  faTrash,
  faEdit,
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faCompress,
} from '@fortawesome/free-solid-svg-icons';
import {
  SocialService,
  Post,
  PostComment,
  Story,
  FeedItem,
} from '../../domains/social';
import { AuthService } from '../../domains/authentication/services/auth.service';
import { MarketplaceService } from '../../domains/marketplace/services/marketplace.service';
import { MediaService } from '../../domains/media';
import { ChatService } from '../../domains/chat';
import { ApiService } from '../../core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

interface FeedPostViewModel {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  commentCount: number; // Number of comments
  comments?: CommentViewModel[]; // Array of comment objects
  shares: number;
  is_liked: boolean;
  is_bookmarked: boolean;
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
  media?: Array<{ type: 'image' | 'video'; url: string }>;
  tags?: string[];
  location?: string;
  showMenu?: boolean;
  showComments?: boolean;
  newComment?: string;
}

interface CommentViewModel {
  id: number;
  user: {
    id: string;
    username: string;
    profilePictureUrl?: string | null;
  } | null;
  content: string;
  createdAt: string;
  isLiked: boolean;
  likeCount: number;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Social Feed</h1>
          <p class="text-gray-500">
            Discover and connect with the Markt community
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            routerLink="/app/social/create"
            class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            <fa-icon [icon]="faPlus" class="w-4 h-4 mr-2"></fa-icon>
            Create Post
          </button>
        </div>
      </div>

      <!-- Stories -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Stories</h2>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <!-- Add Story -->
          <button
            routerLink="/app/social/stories/create"
            class="flex-shrink-0 flex flex-col items-center space-y-2"
          >
            <div
              class="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-markt-primary transition-colors"
            >
              <fa-icon [icon]="faPlus" class="w-6 h-6 text-gray-400"></fa-icon>
            </div>
            <span class="text-xs text-gray-500">Add Story</span>
          </button>

          <!-- Story Items -->
          <div
            *ngFor="let story of stories"
            class="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer"
            (click)="viewStory(story)"
          >
            <div
              class="w-16 h-16 rounded-full border-2 border-markt-primary p-1"
            >
              <img
                [src]="story.user?.profilePictureUrl || '/markt-text-logo.png'"
                [alt]="story.user?.username"
                class="w-full h-full rounded-full object-cover"
              />
            </div>
            <span class="text-xs text-gray-700 truncate w-16 text-center">{{
              story.user?.username
            }}</span>
          </div>
        </div>
      </div>

      <!-- Create Post -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-start space-x-4">
          <img
            [src]="user?.profile_picture_url || '/markt-text-logo.png'"
            [alt]="user?.username"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1">
            <textarea
              [(ngModel)]="newPostContent"
              placeholder="What's on your mind? Share your thoughts, products, or experiences..."
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-markt-primary resize-none"
            ></textarea>

            <!-- Post Actions -->
            <div class="flex items-center justify-between mt-4">
              <div class="flex items-center space-x-4">
                <button
                  (click)="addMedia()"
                  class="flex items-center space-x-2 text-gray-500 hover:text-markt-primary transition-colors"
                >
                  <fa-icon [icon]="faImage" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">Photo</span>
                </button>
                <button
                  (click)="addVideo()"
                  class="flex items-center space-x-2 text-gray-500 hover:text-markt-primary transition-colors"
                >
                  <fa-icon [icon]="faVideo" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">Video</span>
                </button>
                <button
                  (click)="addProduct()"
                  class="flex items-center space-x-2 text-gray-500 hover:text-markt-primary transition-colors"
                >
                  <fa-icon [icon]="faStore" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">Product</span>
                </button>
                <button
                  (click)="addLocation()"
                  class="flex items-center space-x-2 text-gray-500 hover:text-markt-primary transition-colors"
                >
                  <fa-icon [icon]="faMapMarkerAlt" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">Location</span>
                </button>
              </div>
              <button
                (click)="createPost()"
                [disabled]="!newPostContent.trim()"
                class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="space-y-6">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"
          ></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && posts.length === 0" class="text-center py-12">
          <fa-icon
            [icon]="faUser"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          ></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No posts yet</h2>
          <p class="text-gray-500 mb-6">
            Be the first to share something with the community!
          </p>
          <button
            routerLink="/app/social/create"
            class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            Create Your First Post
          </button>
        </div>

        <!-- Posts -->
        <div
          *ngFor="let post of posts"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <!-- Post Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img
                  [src]="post.user?.avatar || '/markt-text-logo.png'"
                  [alt]="post.user?.username"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="font-medium text-gray-900">
                      {{ post.user?.username }}
                    </h3>
                    <span *ngIf="post.user?.verified" class="text-blue-500">
                      <fa-icon [icon]="faStar" class="w-4 h-4"></fa-icon>
                    </span>
                  </div>
                  <div
                    class="flex items-center space-x-2 text-sm text-gray-500"
                  >
                    <span>{{ formatTimestamp(post.timestamp) }}</span>
                    <span *ngIf="post.location">•</span>
                    <span *ngIf="post.location" class="flex items-center">
                      <fa-icon
                        [icon]="faMapMarkerAlt"
                        class="w-3 h-3 mr-1"
                      ></fa-icon>
                      {{ post.location }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Post Actions Menu -->
              <div class="relative">
                <button
                  (click)="togglePostMenu(post)"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <fa-icon [icon]="faEllipsisH" class="w-4 h-4"></fa-icon>
                </button>

                <!-- Dropdown Menu -->
                <div
                  *ngIf="post.showMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                >
                  <button
                    *ngIf="post.user?.id === user?.id"
                    (click)="editPost(post)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <fa-icon [icon]="faEdit" class="w-4 h-4 mr-2"></fa-icon>
                    Edit Post
                  </button>
                  <button
                    *ngIf="post.user?.id === user?.id"
                    (click)="deletePost(post)"
                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <fa-icon [icon]="faTrash" class="w-4 h-4 mr-2"></fa-icon>
                    Delete Post
                  </button>
                  <button
                    *ngIf="post.user?.id !== user?.id"
                    (click)="reportPost(post)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <fa-icon [icon]="faFlag" class="w-4 h-4 mr-2"></fa-icon>
                    Report Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <div class="px-6 py-4">
            <p class="text-gray-900 mb-4">{{ post.content }}</p>

            <!-- Post Media -->
            <div *ngIf="post.media && post.media.length > 0" class="mb-4">
              <div
                [ngClass]="
                  post.media.length === 1
                    ? 'grid grid-cols-1'
                    : 'grid grid-cols-2 gap-2'
                "
                class="rounded-lg overflow-hidden"
              >
                <div
                  *ngFor="let media of post.media; let i = index"
                  class="relative"
                >
                  <img
                    *ngIf="media.type === 'image'"
                    [src]="media.url"
                    [alt]="post.content"
                    class="w-full h-64 object-cover cursor-pointer"
                    (click)="openMediaViewer(post.media, i)"
                  />
                  <video
                    *ngIf="media.type === 'video'"
                    [src]="media.url"
                    class="w-full h-64 object-cover cursor-pointer"
                    controls
                  ></video>
                </div>
              </div>
            </div>

            <!-- Product Link -->
            <div
              *ngIf="post.productInfo"
              class="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <img
                  [src]="post.productInfo.image || '/markt-text-logo.png'"
                  [alt]="post.productInfo.title"
                  class="w-16 h-16 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">
                    {{ post.productInfo.title }}
                  </h4>
                  <p class="text-lg font-bold text-gray-900">
                    {{ post.productInfo.price | currency : 'NGN' }}
                  </p>
                </div>
                <button
                  [routerLink]="[
                    '/app/marketplace/products',
                    post.productInfo.id
                  ]"
                  class="bg-markt-primary text-white px-3 py-1 rounded-md hover:bg-markt-secondary transition-colors text-sm"
                >
                  View Product
                </button>
              </div>
            </div>

            <!-- Tags -->
            <div *ngIf="post.tags && post.tags.length > 0" class="mb-4">
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let tag of post.tags"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Post Actions -->
          <div class="px-6 py-3 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-6">
                <button
                  (click)="toggleLike(post)"
                  class="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                  [class.text-red-500]="post.is_liked"
                >
                  <fa-icon [icon]="faHeart" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">{{ post.likes }}</span>
                </button>

                <button
                  (click)="toggleComments(post)"
                  class="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <fa-icon [icon]="faComment" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">{{ post.commentCount }}</span>
                </button>

                <button
                  (click)="sharePost(post)"
                  class="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                >
                  <fa-icon [icon]="faShare" class="w-5 h-5"></fa-icon>
                  <span class="text-sm">Share</span>
                </button>
              </div>

              <button
                (click)="toggleBookmark(post)"
                class="text-gray-500 hover:text-yellow-500 transition-colors"
                [class.text-yellow-500]="post.is_bookmarked"
              >
                <fa-icon [icon]="faBookmark" class="w-5 h-5"></fa-icon>
              </button>
            </div>
          </div>

          <!-- Comments Section -->
          <div *ngIf="post.showComments" class="border-t border-gray-200">
            <div class="px-6 py-4">
              <!-- Add Comment -->
              <div class="flex items-center space-x-3 mb-4">
                <img
                  [src]="user?.profilePictureUrl || '/markt-text-logo.png'"
                  [alt]="user?.username"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div class="flex-1">
                  <input
                    type="text"
                    [(ngModel)]="post.newComment"
                    placeholder="Write a comment..."
                    class="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    (keyup.enter)="addComment(post)"
                  />
                </div>
              </div>

              <!-- Comments List -->
              <div class="space-y-3">
                <div
                  *ngFor="let comment of post.comments"
                  class="flex items-start space-x-3"
                >
                  <img
                    [src]="
                      comment.user?.profilePictureUrl || '/markt-text-logo.png'
                    "
                    [alt]="comment.user?.username"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div class="flex-1">
                    <div class="bg-gray-50 rounded-lg px-3 py-2">
                      <div class="flex items-center space-x-2">
                        <span class="font-medium text-gray-900">{{
                          comment.user?.username
                        }}</span>
                        <span class="text-xs text-gray-500">{{
                          formatTimestamp(comment.createdAt)
                        }}</span>
                      </div>
                      <p class="text-gray-700">{{ comment.content }}</p>
                    </div>
                    <div class="flex items-center space-x-4 mt-2 text-sm">
                      <button
                        (click)="likeComment(comment)"
                        class="text-gray-500 hover:text-red-500 transition-colors"
                        [class.text-red-500]="comment.isLiked"
                      >
                        <fa-icon
                          [icon]="faThumbsUp"
                          class="w-3 h-3 mr-1"
                        ></fa-icon>
                        {{ comment.likeCount }}
                      </button>
                      <button
                        class="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="hasMorePosts" class="text-center">
          <button
            (click)="loadMorePosts()"
            [disabled]="isLoadingMore"
            class="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isLoadingMore">Load More Posts</span>
            <span *ngIf="isLoadingMore">Loading...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class FeedComponent implements OnInit {
  private socialService = inject(SocialService);
  private authService = inject(AuthService);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);
  private mediaService = inject(MediaService);
  private chatService = inject(ChatService);
  private apiService = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  // Icons
  faHeart = faHeart;
  faComment = faComment;
  faShare = faShare;
  faBookmark = faBookmark;
  faEllipsisH = faEllipsisH;
  faPlus = faPlus;
  faCamera = faCamera;
  faVideo = faVideo;
  faImage = faImage;
  faSmile = faSmile;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faUser = faUser;
  faStore = faStore;
  faStar = faStar;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faFlag = faFlag;
  faTrash = faTrash;
  faEdit = faEdit;
  faPlay = faPlay;
  faPause = faPause;
  faVolumeUp = faVolumeUp;
  faVolumeMute = faVolumeMute;
  faExpand = faExpand;
  faCompress = faCompress;

  // Data
  posts: FeedPostViewModel[] = [];
  stories: Story[] = [];
  user: any = null;
  isLoading = false;
  isLoadingMore = false;
  hasMorePosts = true;
  currentPage = 1;

  // New post
  newPostContent = '';
  selectedMedia: any[] = [];
  showCreatePost = false;

  ngOnInit(): void {
    this.loadUserData();
    this.loadFeed();
    this.loadStories();

    // Subscribe to realtime feed updates
    this.socialService.feed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((feed) => {
        if (feed?.items) {
          // feed$ returns PaginatedResponse<Post>, map directly to view model
          this.posts = feed.items.map((post) => this.mapPostToViewModel(post));
          this.hasMorePosts = feed.pagination?.has_next ?? false;
        }
      });
  }

  private loadUserData(): void {
    this.authService.authState$.subscribe((authState) => {
      this.user = authState.user;
    });
  }

  private loadFeed(): void {
    this.isLoading = true;

    // Use SocialService.getFeed() - returns PaginatedResponse<Post>
    this.socialService
      .getFeed({ page: 1, per_page: 20 })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          // SocialService returns PaginatedResponse<Post>, map directly to view model
          this.posts = (response.items || []).map((post) =>
            this.mapPostToViewModel(post)
          );
          this.hasMorePosts = response.pagination?.has_next ?? false;
        },
        error: (error: any) => {
          console.error('Error loading social feed:', error);
          this.posts = [];
        },
      });
  }

  private loadStories(): void {
    this.socialService.getStories().subscribe({
      next: (response) => {
        this.stories = response || [];
      },
      error: (error) => {
        console.error('Error loading stories:', error);
        this.stories = [];
      },
    });
  }

  loadMorePosts(): void {
    this.currentPage++;
    this.isLoadingMore = true;
    this.socialService
      .getFeed({ page: this.currentPage, per_page: 20 })
      .pipe(finalize(() => (this.isLoadingMore = false)))
      .subscribe({
        next: (response) => {
          // SocialService returns PaginatedResponse<Post>, map directly to view model
          const newPosts = (response.items || []).map((post) =>
            this.mapPostToViewModel(post)
          );
          this.posts = [...this.posts, ...newPosts];
          this.hasMorePosts = response.pagination?.has_next ?? false;
        },
        error: (error: any) => {
          console.error('Error loading more posts:', error);
        },
      });
  }

  createPost(): void {
    if (this.newPostContent.trim()) {
      const postData = {
        caption: this.newPostContent,
        media_ids: [],
        tags: [],
      };

      this.socialService.createPost(postData).subscribe({
        next: (post) => {
          // Service updates the signal, component reacts automatically
          this.newPostContent = '';
          this.showCreatePost = false;
        },
        error: (error) => {
          console.error('Error creating post:', error);
        },
      });
    }
  }

  private mapPostToViewModel(post: Post): FeedPostViewModel {
    const author = post.author;
    const taggedProduct = post.taggedProducts?.[0]?.product;
    const primaryMedia = post.media[0]?.media;

    return {
      id: post.id,
      user: {
        id: author?.id || post.userId,
        name: author?.displayName || 'Unknown User',
        username: author?.username || '',
        avatar: author?.profilePictureUrl || undefined,
        verified: author?.emailVerified ?? false,
      },
      content: post.caption ?? '',
      image:
        primaryMedia?.original_url ||
        primaryMedia?.thumbnail_url ||
        primaryMedia?.social_square_url ||
        primaryMedia?.social_post_url ||
        '',
      timestamp: post.createdAt,
      likes: post.likeCount,
      commentCount: post.commentCount,
      shares: 0, // TODO: Backend needs to provide shares count
      is_liked: post.isLiked,
      is_bookmarked: false, // TODO: Backend needs to provide bookmark status
      type: taggedProduct ? 'product' : 'social',
      productInfo: taggedProduct
        ? {
            id: taggedProduct.id,
            title: taggedProduct.name,
            price: taggedProduct.price,
            image: taggedProduct.primaryImageUrl || undefined,
          }
        : undefined,
      media: post.media.map((m) => ({
        type: (m.media?.media_type || 'image') as 'image' | 'video',
        url:
          m.media?.original_url ||
          m.media?.thumbnail_url ||
          m.media?.social_square_url ||
          m.media?.social_post_url ||
          '',
      })),
      tags: post.tags ?? [],
      showMenu: false,
      showComments: false,
      comments: [],
      newComment: '',
    };
  }

  toggleLike(post: FeedPostViewModel): void {
    this.socialService.togglePostLike(post.id).subscribe({
      next: (updatedPost) => {
        post.is_liked = updatedPost.isLiked;
        post.likes = updatedPost.likeCount;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      },
    });
  }

  toggleComments(post: FeedPostViewModel): void {
    post.showComments = !post.showComments;

    if (post.showComments && (!post.comments || post.comments.length === 0)) {
      this.loadComments(post);
    }
  }

  loadComments(post: FeedPostViewModel): void {
    this.socialService.getPostComments(post.id).subscribe({
      next: (response) => {
        post.comments = (response.items || []).map((comment) => {
          // Map PostComment domain model to CommentViewModel
          const reactionSummary = comment.reactionSummary || [];
          const likeReaction = reactionSummary.find(
            (r) => r.reactionType === 'like'
          );
          return {
            id: comment.id,
            user: comment.author,
            content: comment.content,
            createdAt: comment.createdAt,
            isLiked: likeReaction?.hasReacted || false,
            likeCount: likeReaction?.count || 0,
          };
        });
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
        post.comments = [];
      },
    });
  }

  addComment(post: FeedPostViewModel): void {
    if (!post.newComment?.trim()) return;

    this.socialService
      .addComment(post.id, { content: post.newComment })
      .subscribe({
        next: (comment) => {
          if (!post.comments) {
            post.comments = [];
          }
          // Map PostComment domain model to CommentViewModel
          const reactionSummary = comment.reactionSummary || [];
          const likeReaction = reactionSummary.find(
            (r) => r.reactionType === 'like'
          );
          post.comments.unshift({
            id: comment.id,
            user: comment.author,
            content: comment.content,
            createdAt: comment.createdAt,
            isLiked: likeReaction?.hasReacted || false,
            likeCount: likeReaction?.count || 0,
          });
          post.commentCount = (post.commentCount || 0) + 1;
          post.newComment = '';
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        },
      });
  }

  likeComment(comment: CommentViewModel): void {
    // Toggle like: if already liked, unlike; otherwise like
    const reactionSummary = comment.isLiked
      ? this.socialService.unlikeComment(comment.id)
      : this.socialService.likeComment(comment.id);

    reactionSummary.subscribe({
      next: (updatedComment) => {
        // Map PostComment domain model to CommentViewModel
        const reactionSummary = updatedComment.reactionSummary || [];
        const likeReaction = reactionSummary.find(
          (r) => r.reactionType === 'like'
        );
        comment.isLiked = likeReaction?.hasReacted || false;
        comment.likeCount = likeReaction?.count || 0;
      },
      error: (error: any) => {
        console.error('Error toggling comment like:', error);
      },
    });
  }

  toggleBookmark(post: FeedPostViewModel): void {
    if (post.is_bookmarked) {
      this.socialService.removeBookmark(post.id).subscribe({
        next: () => {
          post.is_bookmarked = false;
        },
        error: (error) => {
          console.error('Error removing bookmark:', error);
        },
      });
    } else {
      this.socialService.addBookmark(post.id).subscribe({
        next: () => {
          post.is_bookmarked = true;
        },
        error: (error) => {
          console.error('Error adding bookmark:', error);
        },
      });
    }
  }

  sharePost(post: any): void {
    this.socialService.sharePost(post.id).subscribe({
      next: (response) => {
        // Handle sharing (copy link, open share dialog, etc.)
        navigator.clipboard.writeText(
          `${window.location.origin}/app/social/posts/${post.id}`
        );
      },
      error: (error) => {
        console.error('Error sharing post:', error);
      },
    });
  }

  togglePostMenu(post: any): void {
    post.showMenu = !post.showMenu;
  }

  editPost(post: any): void {
    this.router.navigate(['/app/social/posts', post.id, 'edit']);
  }

  deletePost(post: FeedPostViewModel): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.socialService.deletePost(post.id).subscribe({
        next: () => {
          this.posts = this.posts.filter((p) => p.id !== post.id);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
        },
      });
    }
  }

  reportPost(post: FeedPostViewModel): void {
    this.router.navigate(['/app/social/posts', post.id, 'report']);
  }

  viewStory(story: Story): void {
    this.router.navigate(['/app/social/stories', story.id]);
  }

  addMedia(): void {
    // This would typically open a file picker
  }

  addVideo(): void {
    // This would typically open a video picker
  }

  addProduct(): void {
    this.router.navigate(['/app/social/create'], {
      queryParams: { type: 'product' },
    });
  }

  addLocation(): void {
    // This would typically open a location picker
  }

  openMediaViewer(media: any[], index: number): void {
    // This would typically open a media viewer modal
  }

  extractTags(content: string): string[] {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Social post media endpoint integrations
  addSocialPostMedia(postId: string, mediaFile: File): void {
    this.mediaService.uploadSocialPostMedia(postId, mediaFile).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error adding social post media:', error);
      },
    });
  }

  deleteSocialPostMedia(postId: string, mediaId: string): void {
    this.mediaService.deleteSocialPostMedia(postId, Number(mediaId)).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error deleting social post media:', error);
      },
    });
  }

  getSocialPostMedia(postId: string): void {
    this.mediaService.getSocialPostMediaList(postId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading social post media:', error);
      },
    });
  }

  // Additional social endpoint integrations
  addCommentViaApi(postId: string, commentData: any): void {
    // Migrated to SocialService.addComment() - uses DDD pattern with PostRepository
    this.socialService.addComment(postId, commentData).subscribe({
      next: (response) => {
        // Find the post and refresh comments
        const post = this.posts.find((p) => p.id === postId);
        if (post) {
          this.loadComments(post);
        }
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
      },
    });
  }

  addCommentReaction(commentId: string, reactionData: any): void {
    this.socialService.addCommentReaction(commentId, reactionData).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error adding comment reaction:', error);
      },
    });
  }

  addMessageReaction(messageId: string, reactionData: any): void {
    const reactionType =
      typeof reactionData === 'string'
        ? reactionData
        : reactionData?.reaction_type ?? reactionData?.type ?? '';

    if (!reactionType) {
      console.warn('Reaction type is required to add a reaction');
      return;
    }

    this.chatService.addMessageReaction(messageId, reactionType).subscribe({
      error: (error: any) => {
        console.error('Error adding message reaction:', error);
      },
    });
  }

  approveNichePost(nichePostId: string, approvalData: any): void {
    this.socialService.approveNichePost(nichePostId, approvalData).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error approving niche post:', error);
      },
    });
  }

  archiveChatRoom(roomId: string): void {
    const numericId = Number(roomId);
    if (Number.isNaN(numericId)) {
      console.warn('Cannot archive chat room: invalid identifier');
      return;
    }

    this.chatService.deleteRoom(numericId).subscribe({
      error: (err: unknown) => {
        console.error('Error archiving chat room:', err);
      },
    });
  }

  bookmarkPost(postId: string): void {
    this.socialService.addBookmark(postId).subscribe({
      next: () => {},
      error: (error: any) => {
        console.error('Error bookmarking post:', error);
      },
    });
  }

  canPostInNiche(nicheId: string): void {
    this.apiService.canPostInNiche(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error checking niche posting permission:', error);
      },
    });
  }

  createNiche(nicheData: any): void {
    this.socialService.createNiche(nicheData).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error('Error creating niche:', error);
      },
    });
  }

  createNichePost(nicheId: string, postData: any): void {
    this.socialService.createNichePost(nicheId, postData).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error('Error creating niche post:', error);
      },
    });
  }

  deletePostViaApi(postId: string): void {
    this.socialService.deletePost(postId).subscribe({
      next: (response) => {
        this.loadFeed(); // Refresh feed
      },
      error: (error) => {
        console.error('Error deleting post:', error);
      },
    });
  }

  followUser(followeeId: string): void {
    this.socialService.followUser(followeeId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error following user:', error);
      },
    });
  }

  getFollowers(userId: string): void {
    this.socialService.getFollowers(userId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading followers:', error);
      },
    });
  }

  getFollowing(userId: string): void {
    this.socialService.getFollowing(userId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading following:', error);
      },
    });
  }

  getMyNiches(): void {
    this.socialService.getMyNiches().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading my niches:', error);
      },
    });
  }

  getNiche(nicheId: string): void {
    this.socialService.getNiche(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading niche:', error);
      },
    });
  }

  getNicheFeed(nicheId: string): void {
    this.socialService.getNicheFeed(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading niche feed:', error);
      },
    });
  }

  getNicheMembers(nicheId: string): void {
    this.socialService.getNicheMembers(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading niche members:', error);
      },
    });
  }

  getNichePosts(nicheId: string): void {
    this.socialService.getNichePosts(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading niche posts:', error);
      },
    });
  }

  getNiches(): void {
    this.socialService.getNiches().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading niches:', error);
      },
    });
  }

  joinNiche(nicheId: string): void {
    this.socialService.joinNiche(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error joining niche:', error);
      },
    });
  }

  leaveNiche(nicheId: string): void {
    this.socialService.leaveNiche(nicheId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error leaving niche:', error);
      },
    });
  }

  moderateNiche(nicheId: string, moderationData: any): void {
    this.socialService.moderateNiche(nicheId, moderationData).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error moderating niche:', error);
      },
    });
  }

  unfollowUser(followeeId: string): void {
    this.socialService.unfollowUser(followeeId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error unfollowing user:', error);
      },
    });
  }

  unlikePost(postId: string): void {
    // Use SocialService.unlikePost() - returns updated Post domain model
    this.socialService.unlikePost(postId).subscribe({
      next: (response) => {},
      error: (error) => {
        console.error('Error unliking post:', error);
      },
    });
  }

  updatePost(postId: string, postData: any): void {
    // Migrated to SocialService.updatePost() - uses DDD pattern with PostRepository
    this.socialService.updatePost(postId, postData).subscribe({
      next: (response) => {
        this.loadFeed(); // Refresh feed
      },
      error: (error) => {
        console.error('Error updating post:', error);
      },
    });
  }

  // Additional social feed and comment endpoint integrations
  getArchivedPosts(): void {
    // Migrated to SocialService.getArchivedPosts() - uses DDD pattern with PostRepository
    this.socialService.getArchivedPosts().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading archived posts:', error);
      },
    });
  }

  getDraftPosts(): void {
    // Migrated to SocialService.getDraftPosts() - uses DDD pattern with PostRepository
    this.socialService.getDraftPosts().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading draft posts:', error);
      },
    });
  }

  getDiscoveryFeed(): void {
    // Migrated to SocialService.getDiscoveryFeed() - uses DDD pattern with PostRepository
    this.socialService.getDiscoveryFeed().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading discovery feed:', error);
      },
    });
  }

  getFollowingFeed(): void {
    // Migrated to SocialService.getFollowingFeed() - uses DDD pattern with PostRepository
    this.socialService.getFollowingFeed().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading following feed:', error);
      },
    });
  }

  getTrendingFeed(): void {
    // Migrated to SocialService.getTrendingFeed() - uses DDD pattern with PostRepository
    this.socialService.getTrendingFeed().subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error loading trending feed:', error);
      },
    });
  }

  deleteComment(commentId: string): void {
    // Migrated to SocialService.deleteComment() - uses DDD pattern with PostRepository
    this.socialService.deleteComment(commentId).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error deleting comment:', error);
      },
    });
  }

  updateComment(commentId: string, commentData: any): void {
    // Migrated to SocialService.updateComment() - uses DDD pattern with PostRepository
    this.socialService.updateComment(commentId, commentData).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error updating comment:', error);
      },
    });
  }

  updateNiche(nicheId: string, nicheData: any): void {
    // Migrated to SocialService.updateNiche() - uses DDD pattern
    this.socialService.updateNiche(nicheId, nicheData).subscribe({
      next: (response: any) => {},
      error: (error: any) => {
        console.error('Error updating niche:', error);
      },
    });
  }
}
