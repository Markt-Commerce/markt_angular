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

import { Pagination } from '../../../../core/infrastructure/http/api-response.types';

/**
 * Product as returned from API
 */
export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  weight?: number;
  status: 'active' | 'inactive' | 'draft';
  seller_id: string;
  category_ids: string[];
  tag_ids: string[];
  media_ids: string[];
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  seller: SellerDto;
  average_rating: number;
  review_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  product_metadata?: Record<string, unknown>;
}

/**
 * Product variant DTO
 */
export interface ProductVariantDto {
  id: string;
  name: string;
  options: Record<string, string>;
}

/**
 * Product image DTO
 */
export interface ProductImageDto {
  id: string;
  product_id: string;
  media_id: string;
  sort_order: number;
  is_featured: boolean;
  alt_text?: string;
  media: MediaDto;
}

/**
 * Media DTO
 */
export interface MediaDto {
  id: string;
  original_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
}

/**
 * Seller DTO
 */
export interface SellerDto {
  id: string;
  shop_name: string;
  shop_slug: string;
  profile_picture_url?: string;
  average_rating: number;
  verification_status: string;
}

/**
 * Create product request DTO
 */
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  weight?: number;
  status?: 'active' | 'inactive' | 'draft';
  category_ids: string[];
  tag_ids?: string[];
  media_ids?: string[];
  variants?: ProductVariantDto[];
  product_metadata?: Record<string, unknown>;
}

/**
 * Update product request DTO
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  stock?: number;
  weight?: number;
  status?: 'active' | 'inactive' | 'draft';
  category_ids?: string[];
  tag_ids?: string[];
  media_ids?: string[];
  variants?: ProductVariantDto[];
  product_metadata?: Record<string, unknown>;
}

/**
 * Product search parameters
 */
export interface ProductSearchParamsDto {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  category_ids?: number[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  status?: 'active' | 'inactive' | 'draft';
  seller_id?: string;
  tags?: string[];
}

/**
 * Product search result DTO
 */
export interface ProductSearchResultDto {
  items: ProductDto[];
  pagination: Pagination;
}


