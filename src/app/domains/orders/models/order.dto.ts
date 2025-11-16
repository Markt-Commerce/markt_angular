import { Pagination } from '../../../core/infrastructure/http/api-response.types';

export type OrderStatusDto =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'confirmed'
  | 'refunded';

export type OrderItemStatusDto =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatusDto =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface OrderAddressDto {
  street?: string | null;
  house_number?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone_number?: string | null;
  recipient_name?: string | null;
}

export interface OrderItemProductDto {
  id: string;
  name: string;
  slug?: string | null;
  price: number;
  thumbnail_url?: string | null;
}

export interface OrderItemVariantDto {
  id: number;
  name: string;
  sku?: string | null;
  options?: Record<string, string> | null;
}

export interface OrderItemDto {
  id: number;
  order_id: string;
  product_id: string;
  seller_id: number;
  variant_id?: number | null;
  quantity: number;
  price: number;
  status: OrderItemStatusDto;
  created_at: string;
  product?: OrderItemProductDto | null;
  variant?: OrderItemVariantDto | null;
}

export interface OrderPaymentDto {
  id: number;
  order_id: string;
  amount: number;
  method: string;
  status: PaymentStatusDto;
  transaction_id?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface OrderShipmentDto {
  id: number;
  order_id: string;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  status?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

export interface BuyerSummaryDto {
    id: string;
  buyername: string;
  email?: string | null;
  phone?: string | null;
  profile_picture_url?: string | null;
}

export interface OrderDto {
  id: string;
  order_number: string;
  buyer_id: string;
  subtotal: number;
  shipping_fee: number | null;
  tax: number | null;
  discount: number | null;
  total: number;
  status: OrderStatusDto;
  shipping_address: OrderAddressDto | null;
  billing_address: OrderAddressDto | null;
  payment_method?: string | null;
  customer_note?: string | null;
  created_at: string;
  updated_at?: string | null;
  items: OrderItemDto[];
  payments?: OrderPaymentDto[] | null;
  shipments?: OrderShipmentDto[] | null;
  buyer?: BuyerSummaryDto | null;
  metadata?: Record<string, unknown> | null;
}

export interface OrderCreateDto {
  cart_id: number;
  shipping_address: Record<string, unknown>;
  payment_method: string;
  customer_note?: string;
}

export interface SellerOrderItemDto {
  id: number;
  order_id: string;
  product: OrderItemProductDto | null;
  variant?: OrderItemVariantDto | null;
  quantity: number;
  price: number;
  status: OrderItemStatusDto;
  created_at: string;
  order: SellerOrderSummaryDto;
}

export interface SellerOrderSummaryDto {
  id: string;
  order_number: string;
  buyer?: BuyerSummaryDto | null;
  created_at: string;
}

export interface SellerOrderResponseDto {
  items: SellerOrderItemDto[];
  pagination: Pagination;
}

export interface SellerOrderStatsDto {
  total_orders: number;
  pending_orders: number;
  monthly_earnings: number;
  completed_orders?: number;
  cancelled_orders?: number;
}

export interface OrderItemStatusUpdateDto {
  status: OrderItemStatusDto;
}

export interface TrackingCheckpointDto {
  status: string;
  description?: string;
  occurred_at: string;
  location?: string | null;
}

export interface OrderTrackingDto {
  order_id: string;
  status: OrderStatusDto;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  carrier?: string | null;
  checkpoints?: TrackingCheckpointDto[];
}

export interface OrderReviewRequestDto {
  rating: number;
  comment?: string;
  photos?: string[];
}
