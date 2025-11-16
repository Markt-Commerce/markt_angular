/**
 * User DTOs
 *
 * API request/response types for authentication.
 */

import { UserRole } from './user.model';
import { AddressDto } from '../../../core/shared/value-objects/address.value-object';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  profile_picture_url?: string;
  address?: AddressDto;
  is_buyer: boolean;
  is_seller: boolean;
  current_role: UserRole;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  buyer_account?: BuyerAccountDto;
  seller_account?: SellerAccountDto;
  first_name?: string;
  last_name?: string;
}

export interface BuyerAccountDto {
  id: string;
  buyername: string;
  shipping_address: AddressDto;
  total_orders: number;
  pending_orders: number;
  last_order_date: string;
  is_active: boolean;
  created_at: string;
}

export interface SellerAccountDto {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string;
  policies: Record<string, string>;
  categories: Array<{ id: string; name: string }>;
  total_products: number;
  total_sales: number;
  total_rating: number;
  average_rating: number;
  total_raters: number;
  verification_status: string;
  is_active: boolean;
  joined_date: string;
  profile_picture_url?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  account_type?: UserRole;
}

export interface RegisterDto {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  account_type: UserRole;
  seller_data?: {
    shop_name: string;
    description: string;
    category_ids: number[];
    policies: Record<string, string>;
  };
  buyer_data?: {
    buyername: string;
    shipping_address: AddressDto;
  };
}

export interface RegisterResponseDto {
  user: UserDto;
  token: string;
  message?: string;
}

export interface ProfileUpdateDto {
  username?: string;
  email?: string;
  phone_number?: string;
  profile_picture?: string;
}

export interface BuyerAccountCreateDto {
  buyername: string;
  shipping_address: AddressDto;
}

export interface SellerAccountCreateDto {
  shop_name: string;
  description: string;
  category_ids: number[];
  policies: Record<string, string>;
}

export interface BuyerAccountUpdateDto {
  buyername?: string;
  shipping_address?: AddressDto;
}

export interface SellerAccountUpdateDto {
  shop_name?: string;
  description?: string;
  category_ids?: number[];
  policies?: Record<string, string>;
}

export interface PasswordResetDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  email: string;
  code: string;
  new_password: string;
}

export interface EmailVerificationDto {
  email: string;
  verification_code: string;
}

export interface RoleSwitchDto {
  previous_role: UserRole;
  current_role: UserRole;
  success: boolean;
  message: string;
  user: UserDto;
}

// User Settings DTOs
export interface UserSettingsDto {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  privacy_public_profile: boolean;
  preferred_language: string;
}

export interface UserSettingsUpdateDto {
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  privacy_public_profile?: boolean;
  preferred_language?: string;
}

// Public Profile DTOs
export interface PublicProfileDto {
  id: string;
  username: string;
  profile_picture_url?: string;
  is_buyer: boolean;
  is_seller: boolean;
  buyer_account?: {
    buyername: string;
    total_orders: number;
  };
  seller_account?: {
    shop_name: string;
    shop_slug: string;
    verification_status: string;
    average_rating: number;
    total_products: number;
  };
  // Social stats
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

// User List/Pagination DTOs
export interface UserSearchParamsDto {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
}

export interface UserPaginationDto {
  items: UserDto[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    first_page: number;
    last_page: number;
    previous_page: number | null;
    next_page: number | null;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Shop Discovery DTOs
export interface ShopDto {
  id: number;
  shop_name: string;
  shop_slug: string;
  description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  verification_status: string;
  is_active: boolean;
  total_rating: number;
  total_raters: number;
  average_rating: number;
  user: {
    id: string;
    username: string;
    profile_picture: string;
  };
  stats?: {
    product_count: number;
    post_count: number;
    follower_count: number;
  };
  is_followed?: boolean;
}

export interface ShopSearchParamsDto {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  verified_only?: boolean;
  active_only?: boolean;
  sort_by?: 'rating' | 'name' | 'recent' | 'followers';
}

export interface ShopListDto {
  shops: ShopDto[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ShopDetailDto extends ShopDto {
  policies: Record<string, string>;
  recent_products: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
  recent_posts: Array<{
    id: string;
    caption: string;
    media: Array<{ url: string; type: string; alt_text?: string }>;
    likes_count: number;
    comments_count: number;
    created_at: string;
  }>;
  can_follow?: boolean;
}

export interface ShopCategoryDto {
  id: number;
  name: string;
  slug: string;
}

// Seller Analytics DTOs
export interface SellerAnalyticsOverviewDto {
  revenue_30d: number;
  orders_30d: number;
  views_30d: number;
  conversion_30d: number;
}

export interface SellerAnalyticsOverviewQueryDto {
  window_days?: number; // 1-365, default 30
}

export interface SellerAnalyticsTimeseriesPointDto {
  bucket_start: string;
  value: number;
}

export interface SellerAnalyticsTimeseriesTotalsDto {
  value: number;
  count: number;
}

export interface SellerAnalyticsTimeseriesDto {
  metric: 'sales' | 'orders' | 'views' | 'conversion';
  bucket: 'day' | 'week' | 'month';
  series: SellerAnalyticsTimeseriesPointDto[];
  totals: SellerAnalyticsTimeseriesTotalsDto;
}

export interface SellerAnalyticsTimeseriesQueryDto {
  metric: 'sales' | 'orders' | 'views' | 'conversion';
  bucket: 'day' | 'week' | 'month';
  start_date: string; // ISO datetime string
  end_date: string; // ISO datetime string
}

// Seller Start Cards DTOs
export interface StartCardCTADto {
  label: string;
  href: string;
}

export interface StartCardProgressDto {
  current: number;
  target: number;
}

export interface StartCardDto {
  key: string;
  title: string;
  description: string;
  cta: StartCardCTADto;
  completed: boolean;
  progress?: StartCardProgressDto;
}

export interface StartCardsMetadataDto {
  seller_id: number;
  generated_at: string;
}

export interface StartCardsResponseDto {
  items: StartCardDto[];
  metadata: StartCardsMetadataDto;
}
