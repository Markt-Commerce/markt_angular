import { Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Niche, 
  NicheCreate, 
  NicheUpdate, 
  Post,
  PostCreate,
  PostUpdate,
  PostComment,
  CommentCreate,
  CommentUpdate,
  NichePost,
  NichePostCreate,
  ReactionSummary,
  ReactionCreate,
  Collection,
  Story,
  StoryCreate,
  CollectionCreate,
  CollectionUpdate,
  FollowResponse,
  FollowingList,
  PaginatedResponse,
  BookmarkResponse,
  FollowersList,
  ApiResponse,
  NichePostApproval,
  NicheMembershipSearchResult
} from '../models';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { forkJoin } from 'rxjs';
import { RealtimeService } from './realtime.service';

export interface FeedType {
  type: 'personalized' | 'trending' | 'following' | 'discover' | 'niche';
  nicheId?: string;
}

export interface PostFilters {
  category_ids?: number[];
  seller_id?: number;
  niche_id?: string;
  tags?: string[];
  sort_by?: 'created_at' | 'likes' | 'comments';
  sort_order?: 'asc' | 'desc';
}

export interface NicheParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_ids?: string[];
  visibility?: 'public' | 'private' | 'restricted';
}

export interface FeedParams {
  page?: number;
  per_page?: number;
  type?: string;
}

export interface NicheMembersParams {
  page?: number;
  per_page?: number;
  role?: 'member' | 'moderator' | 'admin';
}

export interface ModerationData {
  action: 'warn' | 'suspend' | 'ban' | 'delete';
  reason: string;
  duration?: number;
  target_user_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private typeSafety = inject(TypeSafetyService);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private realtime = inject(RealtimeService);
  
  private feedSubject = new BehaviorSubject<Post[]>([]);
  public feed$ = this.feedSubject.asObservable();

  private nichesSubject = new BehaviorSubject<Niche[]>([]);
  public niches$ = this.nichesSubject.asObservable();

  constructor() {
    this.setupRealtime();
  }
  
  /** Seed initial feed so realtime updates can merge into it */
  public setInitialFeed(posts: Post[]): void {
    this.feedSubject.next(posts || []);
  }

  // ============================================================================
  // NICHE OPERATIONS
  // ============================================================================

  /**
   * Get all niches
   */
  getNiches(params?: NicheParams): Observable<ApiResponse<PaginatedResponse<Niche>>> {
    return this.apiService.getNiches(params);
  }

  /**
   * Create new niche
   */
  createNiche(nicheData: NicheCreate): Observable<ApiResponse<Niche>> {
    return this.apiService.createNiche(nicheData);
  }

  /**
   * Get single niche
   */
  getNiche(nicheId: string): Observable<ApiResponse<Niche>> {
    return this.apiService.getNiche(nicheId);
  }

  /**
   * Update niche
   */
  updateNiche(nicheId: string, nicheData: NicheUpdate): Observable<ApiResponse<Niche>> {
    // Filter out undefined values to match NicheData interface
    const filteredData: any = {};
    Object.entries(nicheData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    });
    return this.apiService.updateNiche(nicheId, filteredData);
  }

  /**
   * Join niche
   */
  joinNiche(nicheId: string): Observable<ApiResponse<Niche>> {
    return this.apiService.joinNiche(nicheId);
  }

  /**
   * Leave niche
   */
  leaveNiche(nicheId: string): Observable<ApiResponse<void>> {
    return this.apiService.leaveNiche(nicheId);
  }

  /**
   * Get niche members
   */
  getNicheMembers(nicheId: string, params?: NicheMembersParams): Observable<ApiResponse<NicheMembershipSearchResult>> {
    return this.apiService.getNicheMembers(nicheId, params);
  }

  /**
   * Moderate niche
   */
  moderateNiche(nicheId: string, moderationData: ModerationData): Observable<ApiResponse<void>> {
    return this.apiService.moderateNiche(nicheId, moderationData);
  }

  /**
   * Get user's niches
   */
  getMyNiches(params?: NicheParams): Observable<ApiResponse<PaginatedResponse<Niche>>> {
    return this.apiService.getMyNiches(params);
  }

  /**
   * Check if user can post in niche
   */
  canPostInNiche(niche: Niche, userRole: 'buyer' | 'seller'): boolean {
    if (userRole === 'buyer') {
      return niche.allow_buyer_posts;
    } else {
      return niche.allow_seller_posts;
    }
  }

  // ============================================================================
  // FEED OPERATIONS
  // ============================================================================

  /**
   * Get feed posts
   */
  getFeed(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.globalSearch('', { type: 'posts', ...params }).pipe(
      map(response => ({
        items: response.data?.posts || [],
        pagination: response.data?.pagination || { page: 1, limit: 10, total: 0 }
      }))
    );
  }

  getPersonalizedFeed(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.getFeed(params);
  }

  /**
   * Like a post
   */
  likePost(postId: string): Observable<Post> {
    return this.apiService.post<Post>(`/socials/posts/${postId}/like`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Unlike a post
   */
  unlikePost(postId: string): Observable<Post> {
    return this.apiService.delete<Post>(`/socials/posts/${postId}/like`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Like a comment
   */
  likeComment(commentId: string): Observable<PostComment> {
    return this.apiService.post<PostComment>(`/socials/comments/${commentId}/like`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Unlike a comment
   */
  unlikeComment(commentId: string): Observable<PostComment> {
    return this.apiService.delete<PostComment>(`/socials/comments/${commentId}/like`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add bookmark
   */
  addBookmark(postId: string): Observable<BookmarkResponse> {
    return this.apiService.post<BookmarkResponse>(`/socials/posts/${postId}/bookmark`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Share post
   */
  sharePost(postId: string): Observable<Post> {
    return this.apiService.post<Post>(`/socials/posts/${postId}/share`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Share product
   */
  shareProduct(productId: string): Observable<{ success: boolean; share_url: string }> {
    return this.apiService.shareProduct(productId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get trending feed
   */
  getTrendingFeed(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.getTrendingFeed(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get following feed
   */
  getFollowingFeed(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.getFollowingFeed(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get discovery feed
   */
  getDiscoveryFeed(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.getDiscoveryFeed(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get niche feed
   */
  getNicheFeed(nicheId: string, params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.getNicheFeed(nicheId, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Load feed by type
   */
  loadFeed(feedType: FeedType, params?: FeedParams): Observable<PaginatedResponse<Post>> {
    switch (feedType.type) {
      case 'personalized':
        return this.getPersonalizedFeed(params);
      case 'trending':
        return this.getTrendingFeed(params);
      case 'following':
        return this.getFollowingFeed(params);
      case 'discover':
        return this.getDiscoveryFeed(params);
      case 'niche':
        if (feedType.nicheId) {
          return this.getNicheFeed(feedType.nicheId, params);
        }
        break;
    }
    return this.getPersonalizedFeed(params);
  }

  // ============================================================================
  // POST OPERATIONS
  // ============================================================================

  /**
   * Create new post
   */
  createPost(postData: PostCreate): Observable<Post> {
    return this.apiService.createPost(postData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get post details
   */
  getPost(postId: string): Observable<Post> {
    return this.apiService.getPost(postId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update post
   */
  updatePost(postId: string, postData: PostUpdate): Observable<Post> {
    // Filter out undefined values to match PostData interface
    const filteredData: any = {};
    Object.entries(postData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    });
    return this.apiService.updatePost(postId, filteredData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete post
   */
  deletePost(postId: string): Observable<void> {
    return this.apiService.deletePost(postId).pipe(
      map(() => void 0)
    );
  }

  /**
   * Like/unlike post
   */
  togglePostLike(postId: string): Observable<Post> {
    return this.apiService.togglePostLike(postId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get post comments
   */
  getPostComments(postId: string, params?: FeedParams): Observable<PaginatedResponse<PostComment>> {
    return this.apiService.getPostComments(postId, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add comment to post
   */
  addComment(postId: string, commentData: CommentCreate): Observable<PostComment> {
    return this.apiService.addComment(postId, commentData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update comment
   */
  updateComment(commentId: string, commentData: CommentUpdate): Observable<PostComment> {
    return this.apiService.updateComment(commentId, commentData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete comment
   */
  deleteComment(commentId: string): Observable<void> {
    return this.apiService.deleteComment(commentId).pipe(
      map(() => void 0)
    );
  }

  /**
   * Get comment reactions
   */
  getCommentReactions(commentId: string): Observable<ReactionSummary[]> {
    return this.apiService.getCommentReactions(commentId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Add comment reaction
   */
  addCommentReaction(commentId: string, reactionData: ReactionCreate): Observable<ReactionSummary> {
    return this.apiService.addCommentReaction(commentId, reactionData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove comment reaction
   */
  removeCommentReaction(commentId: string, reactionType: string): Observable<void> {
    return this.apiService.removeCommentReaction(commentId, reactionType).pipe(
      map(() => void 0)
    );
  }

  // ============================================================================
  // NICHE POST OPERATIONS
  // ============================================================================

  /**
   * Create niche post
   */
  createNichePost(nicheId: string, postData: NichePostCreate): Observable<NichePost> {
    return this.apiService.createNichePost(nicheId, postData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get niche posts
   */
  getNichePosts(nicheId: string, params?: FeedParams): Observable<PaginatedResponse<NichePost>> {
    return this.apiService.getNichePosts(nicheId, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Approve niche post
   */
  approveNichePost(nichePostId: string, approvalData: NichePostApproval): Observable<NichePost> {
    return this.apiService.approveNichePost(nichePostId, approvalData).pipe(
      map(response => response.data)
    );
  }

  // ============================================================================
  // STORY MANAGEMENT
  // ============================================================================

  /**
   * Get all stories
   */
  getStories(): Observable<Story[]> {
    return this.apiService.getStories().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Create a new story
   */
  createStory(storyData: StoryCreate): Observable<Story> {
    return this.apiService.createStory(storyData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get a specific story
   */
  getStory(storyId: string): Observable<Story> {
    return this.apiService.getStory(storyId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete a story
   */
  deleteStory(storyId: string): Observable<void> {
    return this.apiService.deleteStory(storyId).pipe(
      map(() => void 0)
    );
  }

  // ============================================================================
  // COLLECTION MANAGEMENT
  // ============================================================================

  /**
   * Get user's collections
   */
  getCollections(): Observable<Collection[]> {
    return this.apiService.getCollections().pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Create a new collection
   */
  createCollection(collectionData: CollectionCreate): Observable<Collection> {
    return this.apiService.createCollection(collectionData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get a specific collection
   */
  getCollection(collectionId: string): Observable<Collection> {
    return this.apiService.getCollection(collectionId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update a collection
   */
  updateCollection(collectionId: string, collectionData: CollectionUpdate): Observable<Collection> {
    // Filter out undefined values to match CollectionData interface
    const filteredData: any = {};
    Object.entries(collectionData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    });
    return this.apiService.updateCollection(collectionId, filteredData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Delete a collection
   */
  deleteCollection(collectionId: string): Observable<void> {
    return this.apiService.deleteCollection(collectionId).pipe(
      map(() => void 0)
    );
  }

  // ============================================================================
  // FOLLOW/UNFOLLOW MANAGEMENT
  // ============================================================================

  /**
   * Follow a user
   */
  followUser(followeeId: string): Observable<FollowResponse> {
    return this.apiService.followUser(followeeId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Unfollow a user
   */
  unfollowUser(followeeId: string): Observable<void> {
    return this.apiService.unfollowUser(followeeId).pipe(
      map(() => void 0)
    );
  }

  /**
   * Get user's followers
   */
  getFollowers(userId: string, params?: FeedParams): Observable<FollowersList> {
    return this.apiService.getFollowers(userId, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get users being followed
   */
  getFollowing(userId: string, params?: FeedParams): Observable<FollowingList> {
    return this.apiService.getFollowing(userId, params).pipe(
      map(response => response.data)
    );
  }

  // ============================================================================
  // POST MANAGEMENT
  // ============================================================================

  /**
   * Get draft posts
   */
  getDraftPosts(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.getDraftPosts(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get archived posts
   */
  getArchivedPosts(params?: FeedParams): Observable<PaginatedResponse<Post>> {
    return this.apiService.getArchivedPosts(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Bookmark a post
   */
  bookmarkPost(postId: string): Observable<BookmarkResponse> {
    return this.apiService.bookmarkPost(postId).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove bookmark from a post
   */
  removeBookmark(postId: string): Observable<void> {
    return this.apiService.removeBookmark(postId).pipe(
      map(() => void 0)
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is following another user
   */
  isFollowing(followeeId: string): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      return new Observable(subscriber => subscriber.next(false));
    }
    
    return this.getFollowing(currentUser.id, { followee_id: followeeId } as FeedParams).pipe(
      map(response => response.items.length > 0)
    );
  }

  /**
   * Get follow count for a user
   */
  getFollowCounts(userId: string): Observable<{ followers: number; following: number }> {
    return forkJoin({
      followers: this.getFollowers(userId, { per_page: 1 }),
      following: this.getFollowing(userId, { per_page: 1 })
    }).pipe(
      map(({ followers, following }) => ({
        followers: followers.pagination?.total_items || 0,
        following: following.pagination?.total_items || 0
      }))
    );
  }

  /**
   * Format story duration for display
   */
  formatStoryDuration(duration: number): string {
    if (duration < 60) {
      return `${duration}s`;
    }
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Check if story is expired
   */
  isStoryExpired(story: Story): boolean {
    return new Date(story.expires_at) < new Date();
  }

  /**
   * Get collection visibility label
   */
  getCollectionVisibilityLabel(collection: Collection): string {
    if (collection.is_collaborative) {
      return 'Collaborative';
    }
    return collection.is_public ? 'Public' : 'Private';
  }

  /**
   * Get collection visibility icon
   */
  getCollectionVisibilityIcon(collection: Collection): string {
    if (collection.is_collaborative) {
      return 'fa-users';
    }
    return collection.is_public ? 'fa-globe' : 'fa-lock';
  }

  /**
   * Format post timestamp
   */
  formatPostTimestamp(timestamp: string): string {
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

  /**
   * Format number for display
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Get reaction emoji
   */
  getReactionEmoji(reactionType: string): string {
    const emojiMap: Record<string, string> = {
      'THUMBS_UP': '👍',
      'HEART': '❤️',
      'LAUGH': '😂',
      'SAD': '😢',
      'ANGRY': '😠'
    };
    return emojiMap[reactionType] || '👍';
  }

  /**
   * Check if user can moderate niche
   */
  canModerateNiche(niche: Niche, userId: string): boolean {
    // This would check if user is admin or moderator of the niche
    return false; // Placeholder
  }

  /**
   * Get niche member count display
   */
  getNicheMemberCountDisplay(niche: Niche): string {
    if (niche.max_members) {
      return `${niche.member_count}/${niche.max_members}`;
    }
    return niche.member_count.toString();
  }

  /**
   * Check if niche is full
   */
  isNicheFull(niche: Niche): boolean {
    return niche.max_members ? niche.member_count >= niche.max_members : false;
  }

  /**
   * Get niche visibility display
   */
  getNicheVisibilityDisplay(niche: Niche): string {
    const visibilityMap: Record<string, string> = {
      'public': 'Public',
      'private': 'Private',
      'restricted': 'Restricted'
    };
    return visibilityMap[niche.visibility] || 'Unknown';
  }

  /**
   * Validate post data
   */
  validatePost(postData: PostCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!postData.caption || postData.caption.trim().length === 0) {
      errors.push('Post caption is required');
    }
    
    if (postData.caption && postData.caption.length > 500) {
      errors.push('Post caption must be less than 500 characters');
    }
    
    if (postData.category_ids && postData.category_ids.length === 0) {
      errors.push('At least one category must be selected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate comment data
   */
  validateComment(commentData: CommentCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!commentData.content || commentData.content.trim().length === 0) {
      errors.push('Comment content is required');
    }
    
    if (commentData.content && commentData.content.length > 1000) {
      errors.push('Comment must be less than 1000 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get post engagement rate
   */
  getPostEngagementRate(post: Post): number {
    const totalEngagement = post.like_count + post.comment_count;
    // This would typically be calculated based on follower count
    // For now, return a simple percentage
    return totalEngagement > 0 ? Math.round((totalEngagement / 100) * 100) : 0;
  }

  /**
   * Check if post is trending
   */
  isPostTrending(post: Post): boolean {
    const engagementRate = this.getPostEngagementRate(post);
    return engagementRate > 5; // 5% engagement rate threshold
  }

  private setupRealtime(): void {
    this.realtime.connect('/social');
    this.realtime.social$.subscribe(({ event, data }) => {
      switch (event) {
        case 'post_created':
          if (data) {
            const current = this.feedSubject.value;
            this.feedSubject.next([data as Post, ...current]);
          }
          break;
        case 'post_liked':
          if (data?.post_id) {
            const updated = this.feedSubject.value.map(p => 
              p.id === this.typeSafety.getProperty(data, 'post_id') ? { ...p, like_count: (p.like_count || 0) + 1 } : p
            );
            this.feedSubject.next(updated);
          }
          break;
        case 'comment_added':
          if (data?.post_id) {
            const updated = this.feedSubject.value.map(p => 
              p.id === this.typeSafety.getProperty(data, 'post_id') ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
            );
            this.feedSubject.next(updated);
          }
          break;
        default:
          break;
      }
    });
  }
} 