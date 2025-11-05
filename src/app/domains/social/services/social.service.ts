/**
 * Social Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PostRepository } from '../repositories/post.repository';
import { Post } from '../models/post.model';
import { PostCreateDto, CommentCreateDto } from '../models/post.dto';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private postRepository = inject(PostRepository);

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

  addComment(postId: string, content: string): Observable<any> {
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content is required');
    }

    const data: CommentCreateDto = { content };
    return this.postRepository.addComment(postId, data);
  }
}

