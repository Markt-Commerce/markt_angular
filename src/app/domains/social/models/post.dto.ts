/**
 * Social DTOs
 */

import { Category } from '../../../core/models';

export interface PostDto {
  id: string;
  seller_id: string;
  caption: string;
  categories: Category[];
  social_media: Array<{
    id: string;
    post_id: string;
    media_id: string;
    platform: string;
    post_type: string;
    media: any;
  }>;
  niche_context?: any;
  like_count: number;
  comment_count: number;
  created_at: string;
  seller: any;
}

export interface PostCreateDto {
  caption: string;
  category_ids?: string[];
  media_ids?: string[];
  products?: Array<{ product_id: string }>;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface PostCommentDto {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: any;
}

export interface CommentCreateDto {
  content: string;
  parent_id?: string;
}

export interface PostUpdateDto {
  caption?: string;
  category_ids?: string[];
  media_ids?: string[];
  products?: Array<{ product_id: string }>;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface CommentUpdateDto {
  content: string;
}
