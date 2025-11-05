/**
 * Request DTOs
 */

export interface BuyerRequestDto {
  id: string;
  user_id: string;
  title: string;
  description: string;
  budget?: number;
  expires_at?: string;
  status: 'OPEN' | 'FULFILLED' | 'CLOSED' | 'EXPIRED';
  category_ids: string[];
  media_ids: string[];
  images: any[];
  categories: any[];
  offers: SellerOfferDto[];
  views: number;
  upvotes: number;
  request_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  user: any;
}

export interface BuyerRequestCreateDto {
  title: string;
  description: string;
  budget?: number;
  expires_at?: string;
  category_ids: string[];
  media_ids?: string[];
  metadata?: Record<string, unknown>;
}

export interface SellerOfferDto {
  id: string;
  request_id: string;
  seller_id: string;
  product_id?: string;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  product?: any;
  seller: any;
}

export interface SellerOfferCreateDto {
  product_id?: string;
  price: number;
  message: string;
}

export interface BuyerRequestUpdateDto {
  title?: string;
  description?: string;
  budget?: number;
  expires_at?: string;
  category_ids?: string[];
  media_ids?: string[];
  metadata?: Record<string, unknown>;
}

export interface StatusUpdateDto {
  status: string;
  reason?: string;
}

export interface RequestStatisticsDto {
  total_requests: number;
  open_requests: number;
  fulfilled_requests: number;
  closed_requests: number;
  expired_requests: number;
  my_requests: number;
  my_offers: number;
}

