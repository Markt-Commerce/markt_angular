import { AddressDto } from '../../../core/shared/value-objects/address.value-object';
import { ProductDto } from '../../marketplace/models/product.dto';

export interface CartItemDto {
  id: number;
  cart_id: number;
  product_id: string;
  variant_id?: number | null;
  variant?: {
    id: number;
    name?: string;
    price?: number;
  } | null;
  quantity: number;
  product_price: number;
  product: ProductDto;
}

export interface CartDto {
  id: number;
  buyer_id: number;
  items: CartItemDto[];
  total_items: number;
  subtotal: number;
  coupon_code?: string | null;
  expires_at: string;
}

export interface AddToCartDto {
  product_id: string;
  quantity?: number;
  variant_id?: number | null;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartSummaryDto {
  item_count: number;
  subtotal: number;
  total: number;
  discount: number;
}

export interface CheckoutDto {
  shipping_address: AddressDto;
  billing_address: AddressDto;
  notes?: string;
}

export interface CheckoutResponseDto {
  order_id: number;
  message: string;
}

export interface ApplyCouponResponseDto {
  success: boolean;
  message: string;
  discount: number;
}
