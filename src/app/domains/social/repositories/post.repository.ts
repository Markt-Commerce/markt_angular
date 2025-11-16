import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  FeedResponseDto,
  PostCommentCreateDto,
  PostCommentDto,
  PostCommentSearchParamsDto,
  PostCommentUpdateDto,
  PostCommentsResponseDto,
  PostCreateDto,
  PostDto,
  PostFeedParamsDto,
  PostSearchParamsDto,
  PostStatusUpdateDto,
  PostUpdateDto,
  ReactionCreateDto,
} from '../models/post.dto';
import { FeedItem, Post, PostComment } from '../models/post.model';

type FeedType = 'personalized' | 'trending' | 'following' | 'discover';

@Injectable({
  providedIn: 'root',
})
export class PostRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/socials/posts';
  private readonly commentsEndpoint = '/socials/comments';
  private readonly feedEndpoints: Record<FeedType, string> = {
    personalized: '/socials/feed/personalized',
    trending: '/socials/feed/trending',
    following: '/socials/feed/following',
    discover: '/socials/feed/discover',
  };

  private toPost(dto: PostDto): Post {
    return Post.fromDto(dto);
  }

  private toComment(dto: PostCommentDto): PostComment {
    return PostComment.fromDto(dto);
  }

  private mapPostResponse<
    T extends PostDto | { post?: PostDto } | null | undefined
  >(payload: T): Post {
    if (payload && this.isPostDto(payload)) {
      return this.toPost(payload);
    }

    if (
      payload &&
      typeof payload === 'object' &&
      'post' in payload &&
      payload.post
    ) {
      return this.toPost(payload.post);
    }

    throw new Error('Invalid post payload received from API');
  }

  private isPostDto(payload: unknown): payload is PostDto {
    if (!payload || typeof payload !== 'object') {
      return false;
    }
    const record = payload as Record<string, unknown>;
    return (
      typeof record['id'] === 'string' &&
      typeof record['user_id'] === 'string' &&
      typeof record['status'] === 'string'
    );
  }

  private mapPaginatedPosts(
    data: PaginatedResponse<PostDto> | null | undefined
  ): PaginatedResponse<Post> {
    if (!data) {
      return {
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      };
    }

    return {
      items: (data.items ?? []).map((dto) => this.toPost(dto)),
      pagination: data.pagination,
    };
  }

  private mapPaginatedComments(
    data: PostCommentsResponseDto | null | undefined
  ): PaginatedResponse<PostComment> {
    if (!data) {
      return {
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      };
    }

    return {
      items: (data.items ?? []).map((dto) => this.toComment(dto)),
      pagination: data.pagination,
    };
  }

  private mapFeedResponse(
    data: FeedResponseDto | null | undefined
  ): PaginatedResponse<Post> {
    if (!data) {
      return this.mapPaginatedPosts({
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      });
    }

    const posts = (data.items ?? [])
      .map((item) => FeedItem.fromDto(item).asPost())
      .filter((post): post is Post => Boolean(post));

    return {
      items: posts,
      pagination: data.pagination,
    };
  }

  private toSearchQuery(
    params?: PostSearchParamsDto
  ): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
    }

    const query: Record<string, unknown> = {};
    const {
      page,
      per_page,
      status,
      user_id,
      niche_id,
      tags,
      search,
      sort_by,
      sort_order,
    } = params;

    if (page !== undefined) query['page'] = page;
    if (per_page !== undefined) query['per_page'] = per_page;
    if (status !== undefined) query['status'] = status;
    if (user_id) query['user_id'] = user_id;
    if (niche_id) query['niche_id'] = niche_id;
    if (tags?.length) query['tags'] = tags;
    if (search) query['search'] = search;
    if (sort_by) query['sort_by'] = sort_by;
    if (sort_order) query['sort_order'] = sort_order;

    return query;
  }

  private toFeedQuery(
    params?: PostFeedParamsDto
  ): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
    }

    const query: Record<string, unknown> = {};
    if (params.page !== undefined) query['page'] = params.page;
    if (params.per_page !== undefined) query['per_page'] = params.per_page;
    if (params.niche_id) query['niche_id'] = params.niche_id;
    if (params.after) query['after'] = params.after;
    if (params.before) query['before'] = params.before;

    return query;
  }

  private toCommentQuery(
    params?: PostCommentSearchParamsDto
  ): Record<string, unknown> | undefined {
    if (!params) {
      return undefined;
    }

    const query: Record<string, unknown> = {};
    if (params.page !== undefined) query['page'] = params.page;
    if (params.per_page !== undefined) query['per_page'] = params.per_page;
    if (params.parent_id !== undefined) query['parent_id'] = params.parent_id;

    return query;
  }

  findPaginated(
    params?: PostSearchParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.apiClient
      .get<PaginatedResponse<PostDto>>(
        this.baseEndpoint,
        this.toSearchQuery(params)
      )
      .pipe(map((response) => this.mapPaginatedPosts(response.data)));
  }

  findAll(params?: PostSearchParamsDto): Observable<Post[]> {
    return this.findPaginated(params).pipe(map((result) => result.items));
  }

  findById(id: string): Observable<Post> {
    return this.apiClient
      .get<PostDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toPost(response.data)));
  }

  create(dto: PostCreateDto): Observable<Post> {
    return this.apiClient
      .post<PostDto>(this.baseEndpoint, dto)
      .pipe(map((response) => this.toPost(response.data)));
  }

  update(id: string, dto: PostUpdateDto): Observable<Post> {
    return this.apiClient
      .put<PostDto>(`${this.baseEndpoint}/${id}`, dto)
      .pipe(map((response) => this.toPost(response.data)));
  }

  updateStatus(id: string, dto: PostStatusUpdateDto): Observable<Post> {
    return this.apiClient
      .patch<PostDto>(`${this.baseEndpoint}/${id}/status`, dto)
      .pipe(map((response) => this.toPost(response.data)));
  }

  delete(id: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${id}`)
      .pipe(map(() => undefined));
  }

  toggleLike(id: string): Observable<Post> {
    return this.apiClient
      .post<PostDto | { post?: PostDto }>(`${this.baseEndpoint}/${id}/like`)
      .pipe(map((response) => this.mapPostResponse(response.data)));
  }

  like(id: string): Observable<Post> {
    return this.toggleLike(id);
  }

  unlike(id: string): Observable<Post> {
    return this.apiClient
      .delete<PostDto | { post?: PostDto }>(`${this.baseEndpoint}/${id}/like`)
      .pipe(map((response) => this.mapPostResponse(response.data)));
  }

  bookmark(id: string): Observable<Post> {
    return this.apiClient
      .post<PostDto | { post?: PostDto }>(`${this.baseEndpoint}/${id}/bookmark`)
      .pipe(map((response) => this.mapPostResponse(response.data)));
  }

  removeBookmark(id: string): Observable<Post> {
    return this.apiClient
      .delete<PostDto | { post?: PostDto }>(
        `${this.baseEndpoint}/${id}/bookmark`
      )
      .pipe(map((response) => this.mapPostResponse(response.data)));
  }

  getComments(
    postId: string,
    params?: PostCommentSearchParamsDto
  ): Observable<PaginatedResponse<PostComment>> {
    return this.apiClient
      .get<PostCommentsResponseDto>(
        `${this.baseEndpoint}/${postId}/comments`,
        this.toCommentQuery(params)
      )
      .pipe(map((response) => this.mapPaginatedComments(response.data)));
  }

  addComment(
    postId: string,
    dto: PostCommentCreateDto
  ): Observable<PostComment> {
    return this.apiClient
      .post<PostCommentDto>(`${this.baseEndpoint}/${postId}/comments`, dto)
      .pipe(map((response) => this.toComment(response.data)));
  }

  updateComment(
    commentId: number | string,
    dto: PostCommentUpdateDto
  ): Observable<PostComment> {
    return this.apiClient
      .put<PostCommentDto>(`${this.commentsEndpoint}/${commentId}`, dto)
      .pipe(map((response) => this.toComment(response.data)));
  }

  deleteComment(commentId: number | string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.commentsEndpoint}/${commentId}`)
      .pipe(map(() => undefined));
  }

  addCommentReaction(
    commentId: number | string,
    dto: ReactionCreateDto
  ): Observable<PostComment> {
    return this.apiClient
      .post<PostCommentDto>(
        `${this.commentsEndpoint}/${commentId}/reactions`,
        dto
      )
      .pipe(map((response) => this.toComment(response.data)));
  }

  removeCommentReaction(
    commentId: number | string,
    reactionType: string
  ): Observable<PostComment> {
    return this.apiClient
      .delete<PostCommentDto>(
        `${this.commentsEndpoint}/${commentId}/reactions/${reactionType}`
      )
      .pipe(map((response) => this.toComment(response.data)));
  }

  getFeed(
    type: FeedType,
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    const endpoint = this.feedEndpoints[type];
    return this.apiClient
      .get<FeedResponseDto>(endpoint, this.toFeedQuery(params))
      .pipe(map((response) => this.mapFeedResponse(response.data)));
  }

  getNicheFeed(
    nicheId: string,
    params?: PostFeedParamsDto
  ): Observable<PaginatedResponse<Post>> {
    return this.apiClient
      .get<FeedResponseDto>(
        `/socials/feed/niche/${nicheId}`,
        this.toFeedQuery(params)
      )
      .pipe(map((response) => this.mapFeedResponse(response.data)));
  }

  getArchived(params?: PostFeedParamsDto): Observable<PaginatedResponse<Post>> {
    return this.apiClient
      .get<PaginatedResponse<PostDto>>(
        '/socials/seller/posts/archived',
        this.toFeedQuery(params)
      )
      .pipe(map((response) => this.mapPaginatedPosts(response.data)));
  }

  getDrafts(params?: PostFeedParamsDto): Observable<PaginatedResponse<Post>> {
    return this.apiClient
      .get<PaginatedResponse<PostDto>>(
        '/socials/seller/posts/drafts',
        this.toFeedQuery(params)
      )
      .pipe(map((response) => this.mapPaginatedPosts(response.data)));
  }
}
