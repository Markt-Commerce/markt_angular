/**
 * Favorite DTOs (Data Transfer Objects)
 *
 * These types match the EXACT structure of API requests and responses.
 * They contain NO business logic - just data shape.
 */

import { Pagination } from '../../../core/infrastructure/http/api-response.types';

/**
 * Favorite as returned from API
 */
export interface FavoriteDto {
  readonly id: string;
  readonly user_id: string;
  readonly product_id: string;
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
 * Paginated favorites response
 */
export interface FavoritesResponseDto {
  readonly items?: FavoriteDto[];
  readonly favorites?: FavoriteDto[];
  readonly pagination: Pagination;
}

/**
 * Create favorite request
 */
export interface FavoriteCreateDto {
  readonly product_id: string;
}

/**
 * Search params for favorites
 */
export interface FavoriteSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly product_id?: string;
  readonly user_id?: string;
}
