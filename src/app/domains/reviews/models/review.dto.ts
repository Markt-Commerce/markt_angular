/**
 * Review DTOs (Data Transfer Objects)
 *
 * These types match the EXACT structure of API requests and responses.
 * They contain NO business logic - just data shape.
 */

import { Pagination } from '../../../core/infrastructure/http/api-response.types';

/**
 * User Review as returned from API
 * (Reviews that a user has written, not product reviews)
 */
export interface ReviewDto {
  readonly id: string;
  readonly user_id: string;
  readonly product_id: string;
  readonly order_id?: string | null;
  readonly rating: number;
  readonly title?: string | null;
  readonly content: string;
  readonly is_verified: boolean;
  readonly upvotes: number;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly product?: {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly primary_image_url?: string | null;
  } | null;
}

/**
 * Paginated reviews response
 */
export interface ReviewsResponseDto {
  readonly items?: ReviewDto[];
  readonly reviews?: ReviewDto[];
  readonly pagination: Pagination;
}

/**
 * Create review request
 */
export interface ReviewCreateDto {
  readonly product_id: string;
  readonly rating: number;
  readonly title?: string | null;
  readonly content: string;
  readonly order_id?: string | null;
}

/**
 * Update review request
 */
export interface ReviewUpdateDto {
  readonly rating?: number;
  readonly title?: string | null;
  readonly content?: string;
}

/**
 * Search params for reviews
 */
export interface ReviewSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly product_id?: string;
  readonly user_id?: string;
  readonly rating_min?: number;
  readonly rating_max?: number;
}

