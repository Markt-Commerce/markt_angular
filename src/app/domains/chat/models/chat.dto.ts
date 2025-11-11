/**
 * Chat DTOs aligned with backend Flask Marshmallow schemas.
 */

export type ChatMessageType =
  | 'text'
  | 'image'
  | 'product'
  | 'offer'
  | 'discount'
  | 'discount_response';

export interface PaginationDto {
  page: number;
  per_page: number;
  total: number;
}

export interface UserBasicDto {
  id: string;
  username: string;
  profile_picture?: string | null;
  is_seller: boolean;
}

export interface ProductBasicDto {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

export interface RequestBasicDto {
  id: string;
  title: string;
  description?: string | null;
}

export interface ChatMessageOfferDto {
  id: number;
  product_id: string;
  price: number;
  status: string;
}

export interface ChatMessageDto {
  id: number;
  room_id: number;
  sender_id: string;
  sender: UserBasicDto;
  content: string;
  message_type: ChatMessageType;
  message_data?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  offer?: ChatMessageOfferDto;
}

export interface ChatMessageListDto {
  messages: ChatMessageDto[];
  pagination: PaginationDto;
}

export interface ChatRoomDto {
  id: number;
  buyer_id: string;
  seller_id: string;
  product_id?: string | null;
  request_id?: string | null;
  last_message_at?: string | null;
  unread_count_buyer: number;
  unread_count_seller: number;
}

export interface LastMessagePreviewDto {
  id: number;
  sender_id: string;
  content: string;
  message_type: ChatMessageType;
  created_at: string;
}

export interface ChatRoomListItemDto {
  id: number;
  other_user: UserBasicDto;
  product?: ProductBasicDto | null;
  request?: RequestBasicDto | null;
  last_message?: LastMessagePreviewDto | null;
  unread_count: number;
  last_message_at?: string | null;
}

export interface ChatRoomListDto {
  rooms: ChatRoomListItemDto[];
  pagination: PaginationDto;
}

export interface CreateChatRoomDto {
  buyer_id?: string;
  seller_id?: string;
  product_id?: string | null;
  request_id?: string | null;
}

export interface SendMessageDto {
  content: string;
  message_type?: ChatMessageType;
  message_data?: Record<string, unknown> | null;
}

export interface SendOfferDto {
  product_id: string;
  price: number;
  message?: string;
}

export interface ChatMessageReactionCreateDto {
  reaction_type: string;
}

export interface ChatMessageReactionSummaryDto {
  reaction_type: string;
  emoji: string;
  count: number;
  has_reacted: boolean;
}

export type DiscountTypeDto = 'percentage' | 'fixed_amount';

export type DiscountStatusDto =
  | 'pending'
  | 'active'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'used'
  | 'cancelled';

export interface ChatDiscountDto {
  id: number;
  room_id: number;
  discount_type: DiscountTypeDto;
  discount_value: number;
  minimum_order_amount?: number | null;
  maximum_discount_amount?: number | null;
  expires_at: string;
  usage_limit: number;
  usage_count: number;
  status: DiscountStatusDto;
  discount_message?: string | null;
  discount_code?: string | null;
  created_at: string;
  product?: ProductBasicDto | null;
  created_by: Pick<UserBasicDto, 'id' | 'username'>;
  offered_to: Pick<UserBasicDto, 'id' | 'username'>;
}

export interface CreateChatDiscountDto {
  discount_type: DiscountTypeDto;
  discount_value: number;
  expires_at: string;
  usage_limit?: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  product_id?: string;
  discount_message?: string;
  discount_code?: string;
  metadata?: Record<string, unknown>;
}

export interface DiscountResponseDto {
  discount_id: number;
  response: DiscountStatusDto;
  response_message?: string | null;
  message_id: number;
  updated_at: string;
  discount: Pick<
    ChatDiscountDto,
    'id' | 'status' | 'discount_type' | 'discount_value' | 'expires_at'
  >;
}

export interface DiscountResponseRequestDto {
  response: 'accepted' | 'rejected';
  response_message?: string;
}

export interface DiscountApplicationRequestDto {
  order_amount: number;
}

export interface DiscountApplicationResponseDto {
  success: boolean;
  discount_amount: number;
  message: string;
  order_amount: number;
  final_amount: number;
}

export interface RoomDiscountsDto {
  discounts: ChatDiscountDto[];
}

export interface MarkReadResponseDto {
  message: string;
}

export interface DiscountCancellationDto {
  discount_id: number;
  status: DiscountStatusDto;
  cancelled_at: string;
}
