/**
 * Social Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PostRepository } from '../repositories/post.repository';
import { Post } from '../models/post.model';
import { PostCreateDto, CommentCreateDto } from '../models/post.dto';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private postRepository = inject(PostRepository);
  private apiService = inject(ApiService); // Temporary: for methods not yet migrated to repository

  getPosts(params?: Record<string, unknown>): Observable<Post[]> {
    return this.postRepository.findAll(params);
  }

  getPost(id: string): Observable<Post> {
    return this.postRepository.findById(id);
  }

  createPost(data: PostCreateDto): Observable<Post> {
    if (!data.caption || data.caption.trim().length === 0) {
      throw new Error('Post caption is required');
    }

    if (data.caption.length > 2000) {
      throw new Error('Post caption cannot exceed 2000 characters');
    }

    return this.postRepository.create(data);
  }

  likePost(id: string): Observable<void> {
    return this.postRepository.like(id);
  }

  addComment(postId: string, content: string | { content: string }): Observable<any> {
    // Handle both string and object formats for backward compatibility
    const commentContent = typeof content === 'string' ? content : content.content;
    
    if (!commentContent || commentContent.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    const data: CommentCreateDto = { content: commentContent };
    return this.postRepository.addComment(postId, data);
  }

  /**
   * Get post comments
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getPostComments(postId: string, params?: any): Observable<any> {
    return this.apiService.getPostComments(postId, params);
  }

  /**
   * Get feed (paginated posts)
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService or uses getPosts
   */
  getFeed(params?: any): Observable<any> {
    // Use getPosts for now, which returns Post[]
    // Components expecting paginated response should be updated
    return this.getPosts(params);
  }

  /**
   * Set initial feed (internal state management)
   * TODO: Remove when proper state management is implemented
   * Temporary: no-op method for backward compatibility
   */
  setInitialFeed(posts: any[]): void {
    // No-op: This was likely used for internal state management
    // Components should manage their own state
  }

  /**
   * Unlike post
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  unlikePost(postId: string): Observable<any> {
    return this.apiService.unlikePost(postId);
  }

  /**
   * Unlike comment
   * TODO: Migrate to PostRepository when method is added
   * Temporary: uses removeCommentReaction with 'like' type
   */
  unlikeComment(commentId: string): Observable<any> {
    return this.apiService.removeCommentReaction(commentId, 'like');
  }

  /**
   * Like comment
   * TODO: Migrate to PostRepository when method is added
   * Temporary: uses addCommentReaction with 'like' type
   */
  likeComment(commentId: string): Observable<any> {
    return this.apiService.addCommentReaction(commentId, { reaction_type: 'like' });
  }

  /**
   * Remove bookmark
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  removeBookmark(postId: string): Observable<any> {
    return this.apiService.removeBookmark(postId);
  }

  /**
   * Add bookmark
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  addBookmark(postId: string): Observable<any> {
    return this.apiService.bookmarkPost(postId);
  }

  /**
   * Share post
   * TODO: Migrate to PostRepository when method is added
   * Note: ApiService doesn't have sharePost, so this is a no-op that returns success
   * The component handles the actual sharing (copying link to clipboard)
   */
  sharePost(postId: string): Observable<any> {
    // ApiService doesn't have sharePost endpoint, so return success immediately
    // The component will handle the actual sharing (copying link)
    return of({ success: true, share_url: `${window.location.origin}/app/social/posts/${postId}` });
  }

  /**
   * Delete post
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  deletePost(postId: string): Observable<any> {
    return this.apiService.deletePost(postId);
  }

  /**
   * Update post
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  updatePost(postId: string, postData: any): Observable<any> {
    return this.apiService.updatePost(postId, postData);
  }

  /**
   * Get followers
   * TODO: Migrate to UserRepository or PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getFollowers(userId: string, params?: any): Observable<any> {
    return this.apiService.getFollowers(userId, params);
  }

  /**
   * Get following
   * TODO: Migrate to UserRepository or PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getFollowing(userId: string, params?: any): Observable<any> {
    return this.apiService.getFollowing(userId, params);
  }

  /**
   * Follow user
   * TODO: Migrate to UserRepository when method is added
   * Temporary: delegates to ApiService
   */
  followUser(userId: string): Observable<any> {
    return this.apiService.followUser(userId);
  }

  /**
   * Unfollow user
   * TODO: Migrate to UserRepository when method is added
   * Temporary: delegates to ApiService
   */
  unfollowUser(userId: string): Observable<any> {
    return this.apiService.unfollowUser(userId);
  }

  /**
   * Get my niches
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  getMyNiches(params?: any): Observable<any> {
    return this.apiService.getMyNiches(params);
  }

  /**
   * Get niche
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  getNiche(nicheId: string): Observable<any> {
    return this.apiService.getNiche(nicheId);
  }

  /**
   * Get niche feed
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  getNicheFeed(nicheId: string, params?: any): Observable<any> {
    return this.apiService.getNicheFeed(nicheId, params);
  }

  /**
   * Get niche members
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  getNicheMembers(nicheId: string, params?: any): Observable<any> {
    return this.apiService.getNicheMembers(nicheId, params);
  }

  /**
   * Get niche posts
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  getNichePosts(nicheId: string, params?: any): Observable<any> {
    return this.apiService.getNichePosts(nicheId, params);
  }

  /**
   * Get niches
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  getNiches(params?: any): Observable<any> {
    return this.apiService.getNiches(params);
  }

  /**
   * Create niche
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  createNiche(nicheData: any): Observable<any> {
    return this.apiService.createNiche(nicheData);
  }

  /**
   * Update niche
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  updateNiche(nicheId: string, nicheData: any): Observable<any> {
    return this.apiService.updateNiche(nicheId, nicheData);
  }

  /**
   * Create niche post
   * TODO: Migrate to NicheRepository when created
   * Temporary: delegates to ApiService
   */
  createNichePost(nicheId: string, postData: any): Observable<any> {
    return this.apiService.createNichePost(nicheId, postData);
  }

  /**
   * Add comment reaction
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  addCommentReaction(commentId: string, reactionData: any): Observable<any> {
    return this.apiService.addCommentReaction(commentId, reactionData);
  }

  /**
   * Get archived posts
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getArchivedPosts(params?: any): Observable<any> {
    return this.apiService.getArchivedPosts(params);
  }

  /**
   * Get draft posts
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getDraftPosts(params?: any): Observable<any> {
    return this.apiService.getDraftPosts(params);
  }

  /**
   * Get discovery feed
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getDiscoveryFeed(params?: any): Observable<any> {
    return this.apiService.getDiscoveryFeed(params);
  }

  /**
   * Get following feed
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getFollowingFeed(params?: any): Observable<any> {
    return this.apiService.getFollowingFeed(params);
  }

  /**
   * Get trending feed
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  getTrendingFeed(params?: any): Observable<any> {
    return this.apiService.getTrendingFeed(params);
  }

  /**
   * Delete comment
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  deleteComment(commentId: string): Observable<any> {
    return this.apiService.deleteComment(commentId);
  }

  /**
   * Update comment
   * TODO: Migrate to PostRepository when method is added
   * Temporary: delegates to ApiService
   */
  updateComment(commentId: string, commentData: any): Observable<any> {
    return this.apiService.updateComment(commentId, commentData);
  }

  /**
   * Get stories
   * TODO: Migrate to StoryRepository when created
   * Temporary: delegates to ApiService
   */
  getStories(): Observable<any> {
    return this.apiService.getStories();
  }

  /**
   * Create story
   * TODO: Migrate to StoryRepository when created
   * Temporary: delegates to ApiService
   */
  createStory(storyData: any): Observable<any> {
    return this.apiService.createStory(storyData);
  }

  /**
   * Delete story
   * TODO: Migrate to StoryRepository when created
   * Temporary: delegates to ApiService
   */
  deleteStory(storyId: string): Observable<any> {
    return this.apiService.deleteStory(storyId);
  }

  /**
   * Get story
   * TODO: Migrate to StoryRepository when created
   * Temporary: delegates to ApiService
   */
  getStory(storyId: string): Observable<any> {
    return this.apiService.getStory(storyId);
  }

  /**
   * Create collection
   * TODO: Migrate to CollectionRepository when created
   * Temporary: delegates to ApiService
   */
  createCollection(collectionData: any): Observable<any> {
    return this.apiService.createCollection(collectionData);
  }

  /**
   * Delete collection
   * TODO: Migrate to CollectionRepository when created
   * Temporary: delegates to ApiService
   */
  deleteCollection(collectionId: string): Observable<any> {
    return this.apiService.deleteCollection(collectionId);
  }

  /**
   * Get collection
   * TODO: Migrate to CollectionRepository when created
   * Temporary: delegates to ApiService
   */
  getCollection(collectionId: string): Observable<any> {
    return this.apiService.getCollection(collectionId);
  }

  /**
   * Get collections
   * TODO: Migrate to CollectionRepository when created
   * Temporary: delegates to ApiService
   */
  getCollections(): Observable<any> {
    return this.apiService.getCollections();
  }

  /**
   * Update collection
   * TODO: Migrate to CollectionRepository when created
   * Temporary: delegates to ApiService
   */
  updateCollection(collectionId: string, collectionData: any): Observable<any> {
    return this.apiService.updateCollection(collectionId, collectionData);
  }
}

