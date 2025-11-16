/**
 * Product DTOs (Data Transfer Objects)
 *
 * These types match the EXACT structure of API requests and responses.
 * They contain NO business logic - just data shape.
 *
 * DTOs are used for:
 * - API request bodies (CreateProductDto, UpdateProductDto)
 * - API response data (ProductDto)
 * - Serialization/deserialization
 */

import { Pagination } from '../../../core/infrastructure/http/api-response.types';
import type { MediaDto, MediaVariantDto } from '../../media/models/media.dto';

/**
 * Product as returned from API
 */
export const PRODUCT_STATUS = [
  'active',
  'draft',
  'archived',
  'out_of_stock',
  'deleted',
] as const;

export type ProductStatusDto = (typeof PRODUCT_STATUS)[number];

export interface ProductDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly compare_at_price: number | null;
  readonly cost_per_item: number | null;
  readonly sku: string | null;
  readonly barcode: string | null;
  readonly stock: number;
  readonly weight: number | null;
  readonly status: ProductStatusDto;
  readonly seller_id: number | string | null;
  readonly category_ids: Array<number | string>;
  readonly tag_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly variants?: ProductVariantDto[];
  readonly images?: ProductImageDto[];
  readonly seller?: ProductSellerDto | null;
  readonly seller_user?: ProductSellerUserDto | null;
  readonly categories?: ProductCategoryDto[];
  readonly product_metadata?: ProductMetadataDto | null;
  readonly average_rating: number;
  readonly review_count: number;
  readonly view_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Product variant DTO
 */
export interface ProductVariantDto {
  readonly id: number;
  readonly name: string;
  readonly options: ProductVariantOptionsDto | null;
}

/**
 * Product image DTO
 */
export interface ProductImageDto {
  readonly id: number;
  readonly product_id: string;
  readonly media_id: number;
  readonly sort_order: number;
  readonly is_featured: boolean;
  readonly alt_text?: string | null;
  readonly media?: ProductImageMediaDto | null;
}

export interface ProductImageMediaDto extends MediaDto {
  readonly variants?: MediaVariantDto[];
}

export type ProductVariantOptionsDto = Record<string, unknown> & {
  values?: string[];
  prices?: Array<number | null>;
};

export type ProductMetadataDto = Record<string, unknown>;

/**
 * Seller DTO
 */
export interface ProductSellerDto {
  readonly id: number | string;
  readonly shop_name: string;
  readonly shop_slug: string | null;
  readonly profile_picture_url?: string | null;
  readonly average_rating?: number | null;
  readonly verification_status?: string | null;
  readonly description?: string | null;
  readonly total_products?: number | null;
}

export interface ProductSellerUserDto {
  readonly id: string;
  readonly username: string;
  readonly profile_picture?: string | null;
}

export interface ProductCategoryDto {
  readonly id: number | string;
  readonly name: string;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly image_url?: string | null;
  readonly parent_id?: number | null;
}

/**
 * Create product request DTO
 */
export interface CreateProductDto {
  readonly name: string;
  readonly description?: string | null;
  readonly price: number;
  readonly compare_at_price?: number | null;
  readonly cost_per_item?: number | null;
  readonly sku?: string | null;
  readonly barcode?: string | null;
  readonly stock?: number;
  readonly weight?: number | null;
  readonly status?: ProductStatusDto;
  readonly category_ids?: Array<number | string>;
  readonly tag_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly variants?: ProductVariantCreateDto[];
  readonly product_metadata?: Record<string, unknown> | null;
}

/**
 * Update product request DTO
 */
export interface UpdateProductDto {
  readonly name?: string;
  readonly description?: string | null;
  readonly price?: number;
  readonly compare_at_price?: number | null;
  readonly cost_per_item?: number | null;
  readonly sku?: string | null;
  readonly barcode?: string | null;
  readonly stock?: number;
  readonly weight?: number | null;
  readonly status?: ProductStatusDto;
  readonly category_ids?: Array<number | string>;
  readonly tag_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly variants?: ProductVariantCreateDto[];
  readonly product_metadata?: Record<string, unknown> | null;
}

/**
 * Product search parameters
 */
export interface ProductSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly search?: string;
  readonly sort_by?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  readonly category_ids?: Array<number | string>;
  readonly category_id?: number | string;
  readonly min_price?: number;
  readonly max_price?: number;
  readonly price_min?: number;
  readonly price_max?: number;
  readonly in_stock?: boolean;
  readonly status?: ProductStatusDto;
  readonly seller_id?: number | string;
  readonly tag_ids?: Array<number | string>;
  readonly tags?: string[];
  readonly exclude_id?: string;
  readonly limit?: number;
  readonly rating_min?: number;
  readonly rating_max?: number;
}

/**
 * Product search result DTO
 */
export interface ProductSearchResultDto {
  readonly items: ProductDto[];
  readonly pagination: ProductPaginationDto;
}

export interface ProductVariantCreateDto {
  readonly name: string;
  readonly options: Record<string, unknown>;
}

export interface BulkProductResultDto {
  readonly success: Array<{ index: number; product_id: string; name: string }>;
  readonly errors: Array<{
    index: number;
    error: string;
    product_data: Record<string, unknown>;
  }>;
}

export interface ProductReviewDto {
  readonly id: number | string;
  readonly product_id: string;
  readonly user_id: string;
  readonly order_id?: string | null;
  readonly rating: number;
  readonly title?: string | null;
  readonly content: string;
  readonly is_verified: boolean;
  readonly upvotes: number;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly user?: ProductReviewUserDto | null;
}

export interface ProductReviewUserDto {
  readonly id: string;
  readonly username: string;
  readonly profile_picture?: string | null;
  readonly first_name?: string | null;
  readonly last_name?: string | null;
}

export interface ProductReviewsResponseDto {
  readonly reviews?: ProductReviewDto[];
  readonly items?: ProductReviewDto[];
  readonly pagination: Pagination;
}

export interface ProductPaginationDto {
  readonly page: number;
  readonly per_page: number;
  readonly total: number;
  readonly total_pages: number;
  readonly has_next?: boolean;
  readonly has_prev?: boolean;
}

export interface ReviewUpvoteResponseDto {
  readonly success: boolean;
  readonly new_count: number;
}

export interface ShareProductResponseDto {
  readonly status: 'success' | 'failed';
  readonly share_url?: string;
}

export interface WishlistToggleResponseDto {
  readonly success: boolean;
  readonly is_wishlisted?: boolean;
  readonly message?: string;
}
