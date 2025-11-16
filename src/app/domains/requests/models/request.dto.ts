import type { Pagination } from '../../../core/infrastructure/http/api-response.types';

export const REQUEST_STATUS = [
  'open',
  'fulfilled',
  'closed',
  'expired',
] as const;

export type RequestStatusDto = (typeof REQUEST_STATUS)[number];

export const OFFER_STATUS = [
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
] as const;

export type OfferStatusDto = (typeof OFFER_STATUS)[number];

export interface BuyerRequestDto {
  readonly id: string;
  readonly user_id: string;
  readonly title: string;
  readonly description: string;
  readonly budget?: number | null;
  readonly expires_at?: string | null;
  readonly status: RequestStatusDto;
  readonly category_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly images?: RequestImageDto[];
  readonly categories?: BuyerRequestCategoryDto[];
  readonly offers?: SellerOfferDto[];
  readonly views: number;
  readonly upvotes: number;
  readonly request_metadata?: Record<string, unknown> | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly user?: BuyerRequestUserDto | null;
  readonly is_upvoted?: boolean;
}

export interface BuyerRequestUserDto {
  readonly id: string;
  readonly username: string;
  readonly profile_picture?: string | null;
  readonly profile_picture_url?: string | null;
  readonly first_name?: string | null;
  readonly last_name?: string | null;
  readonly email_verified?: boolean;
}

export interface RequestImageDto {
  readonly id: number;
  readonly request_id: string;
  readonly media_id?: number | null;
  readonly image_url?: string | null;
  readonly is_primary?: boolean;
  readonly sort_order?: number | null;
}

export interface BuyerRequestCategoryDto {
  readonly id: number | string;
  readonly name: string;
  readonly slug?: string | null;
  readonly description?: string | null;
  readonly image_url?: string | null;
  readonly parent_id?: number | null;
  readonly is_primary?: boolean;
}

export interface SellerOfferDto {
  readonly id: number | string;
  readonly request_id: string;
  readonly seller_id: number | string;
  readonly product_id?: string | null;
  readonly price?: number | null;
  readonly message?: string | null;
  readonly status: OfferStatusDto;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly seller?: SellerSummaryDto | null;
  readonly product?: SellerOfferProductDto | null;
}

export interface SellerSummaryDto {
  readonly id: number | string;
  readonly shop_name: string;
  readonly shop_slug?: string | null;
  readonly profile_picture_url?: string | null;
  readonly is_verified?: boolean;
  readonly rating?: number | null;
}

export interface SellerOfferProductDto {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly images?: Array<{ url: string }>;
}

export interface BuyerRequestCreateDto {
  readonly title: string;
  readonly description: string;
  readonly budget?: number | null;
  readonly expires_at?: string | null;
  readonly category_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly metadata?: Record<string, unknown> | null;
}

export interface SellerOfferCreateDto {
  readonly product_id?: string | null;
  readonly price?: number | null;
  readonly message?: string | null;
}

export interface BuyerRequestUpdateDto {
  readonly title?: string;
  readonly description?: string;
  readonly budget?: number | null;
  readonly expires_at?: string | null;
  readonly category_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly metadata?: Record<string, unknown> | null;
}

export interface StatusUpdateDto {
  readonly status: RequestStatusDto;
}

export interface BuyerRequestSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly search?: string;
  readonly category_ids?: Array<number | string>;
  readonly min_budget?: number;
  readonly max_budget?: number;
  readonly status?: RequestStatusDto;
  readonly sort_by?: string;
  readonly sort_order?: 'asc' | 'desc';
}

export interface BuyerRequestSearchResultDto {
  readonly items: BuyerRequestDto[];
  readonly pagination: Pagination;
}

export interface RequestUpvoteResponseDto {
  readonly upvotes: number;
}

export interface RequestStatisticsDto {
  readonly total: number;
  readonly open: number;
  readonly fulfilled: number;
  readonly closed: number;
  readonly expired: number;
  readonly mine?: number;
  readonly offers?: number;
}
