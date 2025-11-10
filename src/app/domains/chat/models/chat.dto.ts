/**
 * Chat DTOs
 */

export interface ChatMessageDto {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  message_data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface SendMessageDto {
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  message_data?: Record<string, unknown>;
}

export interface ChatRoomDto {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  request_id?: string;
  last_message_at?: string;
  unread_count_buyer: number;
  unread_count_seller: number;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
}

export interface CreateChatRoomDto {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  request_id?: string;
}

export interface ReactionDto {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface ReactionSummaryDto {
  reaction_type: string;
  emoji: string;
  count: number;
  has_reacted: boolean;
  user_id?: string;
}

export interface AddReactionDto {
  reaction_type: string;
}

