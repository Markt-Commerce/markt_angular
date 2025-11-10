/**
 * Order DTOs
 *
 * API request/response types for orders.
 */

import { AddressDto } from '../../../core/shared/value-objects/address.value-object';
import { ProductDto } from '../../marketplace/models/product.dto';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type OrderItemStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItemDto {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  product: ProductDto;
  variant?: {
    id: string;
    name: string;
    options: Record<string, string>;
  };
}

export interface OrderDto {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  cart_id: string;
  shipping_address: AddressDto;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  customer_note?: string;
  created_at: string;
  items: OrderItemDto[];
  buyer: {
    id: string;
    buyername: string;
    profile_picture_url?: string;
  };
}

export interface OrderCreateDto {
  cart_id: string;
  shipping_address: AddressDto;
  payment_method: string;
  customer_note?: string;
}
