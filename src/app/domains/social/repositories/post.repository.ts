/**
 * Post Repository
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { Post, PostStatus } from '../models/post.model';
import { PostDto, PostCreateDto, PostCommentDto, CommentCreateDto, PostUpdateDto, CommentUpdateDto } from '../models/post.dto';

@Injectable({
  providedIn: 'root'
})
export class PostRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/socials/posts'; // Using /socials/posts to match API endpoints

  private toDomain(dto: PostDto): Post {
    return new Post(
      dto.id,
      dto.seller_id,
      dto.caption,
      dto.like_count,
      dto.comment_count,
      dto.created_at,
      dto.categories.map(c => c.id.toString()),
      'published' as PostStatus
    );
  }

  findAll(params?: Record<string, unknown>): Observable<Post[]> {
    return this.apiClient.get<PostDto[]>(this.baseEndpoint, params).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  findById(id: string): Observable<Post> {
    return this.apiClient.get<PostDto>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  create(data: PostCreateDto): Observable<Post> {
    return this.apiClient.post<PostDto>(this.baseEndpoint, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  like(id: string): Observable<void> {
    return this.apiClient.post<void>(`${this.baseEndpoint}/${id}/like`).pipe(
      map(() => undefined)
    );
  }

  getComments(postId: string): Observable<PostCommentDto[]> {
    return this.apiClient.get<PostCommentDto[]>(`${this.baseEndpoint}/${postId}/comments`).pipe(
      map(response => response.data)
    );
  }

  addComment(postId: string, data: CommentCreateDto): Observable<PostCommentDto> {
    return this.apiClient.post<PostCommentDto>(`${this.baseEndpoint}/${postId}/comments`, data).pipe(
      map(response => response.data)
    );
  }

  update(id: string, data: PostUpdateDto): Observable<Post> {
    return this.apiClient.put<PostDto>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/${id}`).pipe(
      map(() => void 0)
    );
  }

  unlike(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/${id}/like`).pipe(
      map(() => void 0)
    );
  }

  updateComment(commentId: string, data: CommentUpdateDto): Observable<PostCommentDto> {
    return this.apiClient.put<PostCommentDto>(`/api/v1/socials/comments/${commentId}`, data).pipe(
      map(response => response.data)
    );
  }

  deleteComment(commentId: string): Observable<void> {
    return this.apiClient.delete<void>(`/api/v1/socials/comments/${commentId}`).pipe(
      map(() => void 0)
    );
  }
}

