import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  CollectionCreateDto,
  CollectionUpdateDto,
  FollowSearchParamsDto,
  ModerationActionCreateDto,
  NicheCreateDto,
  NichePostApprovalDto,
  NichePostCreateDto,
  NicheSearchParamsDto,
  NicheUpdateDto,
  PostCommentCreateDto,
  PostCommentSearchParamsDto,
  PostCommentUpdateDto,
  PostCreateDto,
  PostFeedParamsDto,
  PostSearchParamsDto,
  PostStatusUpdateDto,
  PostUpdateDto,
  ReactionCreateDto,
  StoryCreateDto,
} from '../models/post.dto';
import {
  Collection,
  Follow,
  Niche,
  NicheMembership,
  NicheModerationAction,
  NichePostSummary,
  Post,
  PostComment,
  Story,
} from '../models/post.model';
import { PostRepository } from '../repositories/post.repository';
import { NicheRepository } from '../repositories/niche.repository';
import { FollowRepository } from '../repositories/follow.repository';
import { StoryRepository } from '../repositories/story.repository';
import { CollectionRepository } from '../repositories/collection.repository';

type FeedScope = 'personalized' | 'trending' | 'following' | 'discover';

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  private postRepository = inject(PostRepository);
  private nicheRepository = inject(NicheRepository);
  private followRepository = inject(FollowRepository);
  private storyRepository = inject(StoryRepository);
  private collectionRepository = inject(CollectionRepository);

  private readonly postsSignal = signal<PaginatedResponse<Post> | null>(null);
  private readonly feedSignal = signal<PaginatedResponse<Post> | null>(null);
  private readonly selectedPostSignal = signal<Post | null>(null);
  private readonly commentsSignal =
    signal<PaginatedResponse<PostComment> | null>(null);
  private readonly nichesSignal =
    signal<PaginatedResponse<Niche> | null>(null);
  private readonly selectedNicheSignal = signal<Niche | null>(null);
  private readonly nicheMembersSignal =
    signal<PaginatedResponse<NicheMembership> | null>(null);
  private readonly nichePostsSignal =
    signal<PaginatedResponse<NichePostSummary> | null>(null);
  private readonly followersSignal =
    signal<PaginatedResponse<Follow> | null>(null);
  private readonly followingSignal =
    signal<PaginatedResponse<Follow> | null>(null);
  private readonly storiesSignal = signal<Story[]>([]);
  private readonly collectionsSignal = signal<Collection[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  private readonly postsState = this.postsSignal.asReadonly();
  private readonly feedState = this.feedSignal.asReadonly();
  private readonly selectedPostState = this.selectedPostSignal.asReadonly();
  private readonly commentsState = this.commentsSignal.asReadonly();
  private readonly nichesState = this.nichesSignal.asReadonly();
  private readonly selectedNicheState = this.selectedNicheSignal.asReadonly();
  private readonly nicheMembersState = this.nicheMembersSignal.asReadonly();
  private readonly nichePostsState = this.nichePostsSignal.asReadonly();
  private readonly followersState = this.followersSignal.asReadonly();
  private readonly followingState = this.followingSignal.asReadonly();
  private readonly storiesState = this.storiesSignal.asReadonly();
  private readonly collectionsState = this.collectionsSignal.asReadonly();
  private readonly loadingState = this.loadingSignal.asReadonly();
  private readonly errorState = this.errorSignal.asReadonly();

  readonly posts$ = toObservable(this.postsState);
  readonly feed$ = toObservable(this.feedState);
  readonly selectedPost$ = toObservable(this.selectedPostState);
  readonly comments$ = toObservable(this.commentsState);
  readonly niches$ = toObservable(this.nichesState);
  readonly selectedNiche$ = toObservable(this.selectedNicheState);
  readonly nicheMembers$ = toObservable(this.nicheMembersState);
  readonly nichePosts$ = toObservable(this.nichePostsState);
  readonly followers$ = toObservable(this.followersState);
  readonly following$ = toObservable(this.followingState);
  readonly stories$ = toObservable(this.storiesState);
  readonly collections$ = toObservable(this.collectionsState);
  readonly isLoading$ = toObservable(this.loadingState);
  readonly error$ = toObservable(this.errorState);

  loadPosts(
    params?: PostSearchParamsDto
  ): Observable<PaginatedResponse<Post>> {
    this.startLoading();
    return this.postRepository.findPaginated(params).pipe(
      tap((result) => this.postsSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  getPosts(params?: PostSearchParamsDto): Observable<Post[]> {
    return this.loadPosts(params).pipe(map((result) => result.items));
  }

  getPostsSnapshot(): PaginatedResponse<Post> | null {
    return this.postsSignal();
  }

  getPost(id: string): Observable<Post> {
    this.startLoading();
    return this.postRepository.findById(id).pipe(
      tap((post) => {
        this.selectedPostSignal.set(post);
        this.mergePostIntoCollections(post);
      }),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  createPost(dto: PostCreateDto): Observable<Post> {
    const caption = dto.caption ?? '';
    if (!caption.trim()) {
      throw new Error('Post caption is required');
    }
    if (caption.length > 2000) {
      throw new Error('Post caption cannot exceed 2000 characters');
    }

    return this.postRepository.create(dto).pipe(
      tap((created) => {
        const snapshot = this.postsSignal();
        if (snapshot) {
          this.postsSignal.set({
            ...snapshot,
            items: [created, ...snapshot.items],
            pagination: snapshot.pagination,
          });
        }
        this.mergePostIntoCollections(created);
      })
    );
  }

  updatePost(id: string, dto: PostUpdateDto): Observable<Post> {
    return this.postRepository.update(id, dto).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  updatePostStatus(
    id: string,
    dto: PostStatusUpdateDto
  ): Observable<Post> {
    return this.postRepository.updateStatus(id, dto).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  deletePost(id: string): Observable<void> {
    return this.postRepository.delete(id).pipe(
      tap(() => {
        const postsSnapshot = this.postsSignal();
        if (postsSnapshot) {
          this.postsSignal.set({
            ...postsSnapshot,
            items: postsSnapshot.items.filter((post) => post.id !== id),
          });
        }

        const feedSnapshot = this.feedSignal();
        if (feedSnapshot) {
          this.feedSignal.set({
            ...feedSnapshot,
            items: feedSnapshot.items.filter((post) => post.id !== id),
          });
        }

        if (this.selectedPostSignal()?.id === id) {
          this.selectedPostSignal.set(null);
        }
      })
    );
  }

  togglePostLike(id: string): Observable<Post> {
    return this.postRepository.toggleLike(id).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  likePost(id: string): Observable<Post> {
    return this.postRepository.like(id).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  unlikePost(id: string): Observable<Post> {
    return this.postRepository.unlike(id).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  addBookmark(postId: string): Observable<Post> {
    return this.postRepository.bookmark(postId).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  removeBookmark(postId: string): Observable<Post> {
    return this.postRepository.removeBookmark(postId).pipe(
      tap((updated) => this.mergePostIntoCollections(updated))
    );
  }

  loadFeed(
    scope: FeedScope,
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    this.startLoading();
    return this.postRepository.getFeed(scope, params).pipe(
      tap((result) => this.feedSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  getFeed(
    params?: (PostFeedParamsDto & { type?: FeedScope })
  ): Observable<PaginatedResponse<Post>> {
    const { type, ...rest } = params ?? {};
    const scope: FeedScope = type ?? 'personalized';
    return this.loadFeed(scope, rest);
  }

  getPersonalizedFeed(
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.getFeed(params);
  }

  getTrendingFeed(
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.loadFeed('trending', params);
  }

  getFollowingFeed(
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.loadFeed('following', params);
  }

  getDiscoveryFeed(
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.loadFeed('discover', params);
  }

  getNicheFeed(
    nicheId: string,
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    this.startLoading();
    return this.postRepository.getNicheFeed(nicheId, params).pipe(
      tap((result) => this.feedSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  getFeedSnapshot(): PaginatedResponse<Post> | null {
    return this.feedSignal();
  }

  setInitialFeed(posts: unknown[]): void {
    const normalized = posts
      .map((item) => {
        if (item instanceof Post) {
          return item;
        }
        try {
          return Post.fromDto(item as never);
        } catch {
          return null;
        }
      })
      .filter((post): post is Post => Boolean(post));

    this.feedSignal.set({
      items: normalized,
      pagination: {
        page: 1,
        per_page: normalized.length,
        total_items: normalized.length,
        total_pages: 1,
        first_page: 1,
        last_page: 1,
        previous_page: null,
        next_page: null,
        has_next: false,
        has_prev: false,
      },
    });
  }

  loadPostComments(
    postId: string,
    params?: PostCommentSearchParamsDto
  ): Observable<PaginatedResponse<PostComment>> {
    return this.postRepository.getComments(postId, params).pipe(
      tap((result) => this.commentsSignal.set(result))
    );
  }

  getPostComments(
    postId: string,
    params?: PostCommentSearchParamsDto
  ): Observable<PaginatedResponse<PostComment>> {
    return this.loadPostComments(postId, params);
  }

  addComment(
    postId: string,
    content: string | PostCommentCreateDto
  ): Observable<PostComment> {
    const dto: PostCommentCreateDto =
      typeof content === 'string' ? { content } : content;

    if (!dto.content?.trim()) {
      throw new Error('Comment content is required');
    }

    return this.postRepository.addComment(postId, dto).pipe(
      tap((created) => {
        const snapshot = this.commentsSignal();
        if (snapshot) {
          this.commentsSignal.set({
            ...snapshot,
            items: [created, ...snapshot.items],
          });
        }
      })
    );
  }

  updateComment(
    commentId: number | string,
    dto: PostCommentUpdateDto
  ): Observable<PostComment> {
    return this.postRepository.updateComment(commentId, dto).pipe(
      tap((updated) => {
        const snapshot = this.commentsSignal();
        if (!snapshot) {
          return;
        }
        this.commentsSignal.set({
          ...snapshot,
          items: snapshot.items.map((comment) =>
            comment.id === updated.id ? updated : comment
          ),
        });
      })
    );
  }

  deleteComment(commentId: number | string): Observable<void> {
    return this.postRepository.deleteComment(commentId).pipe(
      tap(() => {
        const snapshot = this.commentsSignal();
        if (!snapshot) {
          return;
        }
        this.commentsSignal.set({
          ...snapshot,
          items: snapshot.items.filter((comment) => comment.id !== commentId),
        });
      })
    );
  }

  likeComment(commentId: number | string): Observable<PostComment> {
    return this.postRepository.addCommentReaction(commentId, {
      reaction_type: 'like',
    });
  }

  unlikeComment(commentId: number | string): Observable<PostComment> {
    return this.postRepository.removeCommentReaction(commentId, 'like');
  }

  addCommentReaction(
    commentId: number | string,
    dto: ReactionCreateDto
  ): Observable<PostComment> {
    return this.postRepository.addCommentReaction(commentId, dto);
  }

  removeCommentReaction(
    commentId: number | string,
    reactionType: string
  ): Observable<PostComment> {
    return this.postRepository.removeCommentReaction(commentId, reactionType);
  }

  sharePost(postId: string): Observable<{ shareUrl: string }> {
    const shareUrl = `${window.location.origin}/app/social/posts/${postId}`;
    return of({ shareUrl });
  }

  getArchivedPosts(
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.postRepository.getArchived(params).pipe(
      tap((result) => this.postsSignal.set(result))
    );
  }

  getDraftPosts(
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.postRepository.getDrafts(params).pipe(
      tap((result) => this.postsSignal.set(result))
    );
  }

  loadNiches(
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<Niche>> {
    this.startLoading();
    return this.nicheRepository.findPaginated(params).pipe(
      tap((result) => this.nichesSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  getNiches(
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<Niche>> {
    return this.loadNiches(params);
  }

  getMyNiches(
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<Niche>> {
    this.startLoading();
    return this.nicheRepository.findMine(params).pipe(
      tap((result) => this.nichesSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  getNichesSnapshot(): PaginatedResponse<Niche> | null {
    return this.nichesSignal();
  }

  getNiche(id: string): Observable<Niche> {
    this.startLoading();
    return this.nicheRepository.findById(id).pipe(
      tap((niche) => this.selectedNicheSignal.set(niche)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  createNiche(dto: NicheCreateDto): Observable<Niche> {
    return this.nicheRepository.create(dto).pipe(
      tap((created) => {
        const snapshot = this.nichesSignal();
        if (snapshot) {
          this.nichesSignal.set({
            ...snapshot,
            items: [created, ...snapshot.items],
          });
        }
        this.selectedNicheSignal.set(created);
      })
    );
  }

  updateNiche(id: string, dto: NicheUpdateDto): Observable<Niche> {
    return this.nicheRepository.update(id, dto).pipe(
      tap((updated) => {
        const snapshot = this.nichesSignal();
        if (snapshot) {
          this.nichesSignal.set({
            ...snapshot,
            items: snapshot.items.map((niche) =>
              niche.id === updated.id ? updated : niche
            ),
          });
        }
        if (this.selectedNicheSignal()?.id === updated.id) {
          this.selectedNicheSignal.set(updated);
        }
      })
    );
  }

  joinNiche(id: string): Observable<NicheMembership> {
    return this.nicheRepository.join(id).pipe(
      tap(() => {
        const snapshot = this.selectedNicheSignal();
        if (snapshot) {
          this.selectedNicheSignal.set(snapshot);
        }
      })
    );
  }

  leaveNiche(id: string): Observable<void> {
    return this.nicheRepository.leave(id).pipe(
      tap(() => {
        const membersSnapshot = this.nicheMembersSignal();
        if (membersSnapshot) {
          this.nicheMembersSignal.set({
            ...membersSnapshot,
            items: membersSnapshot.items.filter(
              (membership) => membership.nicheId !== id
            ),
          });
        }
      })
    );
  }

  getNicheMembers(
    id: string,
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<NicheMembership>> {
    return this.nicheRepository.getMembers(id, params).pipe(
      tap((result) => this.nicheMembersSignal.set(result))
    );
  }

  getNichePosts(
    id: string,
    params?: NicheSearchParamsDto
  ): Observable<PaginatedResponse<NichePostSummary>> {
    return this.nicheRepository.getPosts(id, params).pipe(
      tap((result) => this.nichePostsSignal.set(result))
    );
  }

  createNichePost(
    id: string,
    dto: NichePostCreateDto
  ): Observable<NichePostSummary> {
    return this.nicheRepository.createPost(id, dto).pipe(
      tap((created) => {
        const snapshot = this.nichePostsSignal();
        if (snapshot) {
          this.nichePostsSignal.set({
            ...snapshot,
            items: [created, ...snapshot.items],
          });
        }
      })
    );
  }

  approveNichePost(
    nichePostId: string,
    dto: NichePostApprovalDto
  ): Observable<NichePostSummary> {
    return this.nicheRepository.approvePost(nichePostId, dto);
  }

  moderateNiche(
    nicheId: string,
    dto: ModerationActionCreateDto
  ): Observable<NicheModerationAction> {
    return this.nicheRepository.moderate(nicheId, dto);
  }

  getFollowers(
    userId: string,
    params?: FollowSearchParamsDto
  ): Observable<PaginatedResponse<Follow>> {
    return this.followRepository.getFollowers(userId, params).pipe(
      tap((result) => this.followersSignal.set(result))
    );
  }

  getFollowing(
    userId: string,
    params?: FollowSearchParamsDto
  ): Observable<PaginatedResponse<Follow>> {
    return this.followRepository.getFollowing(userId, params).pipe(
      tap((result) => this.followingSignal.set(result))
    );
  }

  followUser(userId: string): Observable<Follow> {
    return this.followRepository.follow(userId).pipe(
      tap((follow) => {
        const snapshot = this.followingSignal();
        if (snapshot) {
          this.followingSignal.set({
            ...snapshot,
            items: [follow, ...snapshot.items],
          });
        }
      })
    );
  }

  unfollowUser(userId: string): Observable<void> {
    return this.followRepository.unfollow(userId).pipe(
      tap(() => {
        const snapshot = this.followingSignal();
        if (snapshot) {
          this.followingSignal.set({
            ...snapshot,
            items: snapshot.items.filter(
              (follow) => follow.followeeId !== userId
            ),
          });
        }
      })
    );
  }

  getStories(): Observable<Story[]> {
    return this.storyRepository.findAll().pipe(
      tap((stories) => this.storiesSignal.set(stories))
    );
  }

  getStory(id: string): Observable<Story> {
    return this.storyRepository.findById(id);
  }

  createStory(dto: StoryCreateDto): Observable<Story> {
    return this.storyRepository.create(dto).pipe(
      tap((created) => this.storiesSignal.set([created, ...this.storiesSignal()]))
    );
  }

  deleteStory(id: string): Observable<void> {
    return this.storyRepository.delete(id).pipe(
      tap(() => {
        this.storiesSignal.set(
          this.storiesSignal().filter((story) => story.id !== id)
        );
      })
    );
  }

  getCollections(): Observable<Collection[]> {
    return this.collectionRepository.findAll().pipe(
      tap((collections) => this.collectionsSignal.set(collections))
    );
  }

  getCollection(id: string): Observable<Collection> {
    return this.collectionRepository.findById(id);
  }

  createCollection(dto: CollectionCreateDto): Observable<Collection> {
    return this.collectionRepository.create(dto).pipe(
      tap((created) => this.collectionsSignal.set([created, ...this.collectionsSignal()]))
    );
  }

  updateCollection(
    id: string,
    dto: CollectionUpdateDto
  ): Observable<Collection> {
    return this.collectionRepository.update(id, dto).pipe(
      tap((updated) => {
        this.collectionsSignal.set(
          this.collectionsSignal().map((collection) =>
            collection.id === id ? updated : collection
          )
        );
      })
    );
  }

  deleteCollection(id: string): Observable<void> {
    return this.collectionRepository.delete(id).pipe(
      tap(() => {
        this.collectionsSignal.set(
          this.collectionsSignal().filter((collection) => collection.id !== id)
        );
      })
    );
  }

  private mergePostIntoCollections(post: Post): void {
    const postsSnapshot = this.postsSignal();
    if (postsSnapshot) {
      this.postsSignal.set({
        ...postsSnapshot,
        items: postsSnapshot.items.map((item) =>
          item.id === post.id ? post : item
        ),
      });
    }

    const feedSnapshot = this.feedSignal();
    if (feedSnapshot) {
      this.feedSignal.set({
        ...feedSnapshot,
        items: feedSnapshot.items.map((item) =>
          item.id === post.id ? post : item
        ),
      });
    }

    if (this.selectedPostSignal()?.id === post.id) {
      this.selectedPostSignal.set(post);
    }
  }

  private handleError(error: unknown): Observable<never> {
    const message =
      error instanceof Error ? error.message : 'Unable to complete request';
    this.errorSignal.set(message);
    return throwError(() => new Error(message));
  }

  private startLoading(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  private stopLoading(): void {
    this.loadingSignal.set(false);
  }
}