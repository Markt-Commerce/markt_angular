export type UserRole = 'buyer' | 'seller';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  account_type: UserRole;
  seller_data?: {
    shop_name: string;
    description: string;
    category_ids: number[];
    policies: Record<string, string>;
  };
  buyer_data?: {
    buyername: string;
    shipping_address: {
      street: string;
      house_number: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
      latitude: number;
      longitude: number;
    };
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  profile_picture_url?: string;
  is_buyer: boolean;
  is_seller: boolean;
  email_verified: boolean;
  current_role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
} 