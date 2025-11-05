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
