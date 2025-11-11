import { Pagination } from '../../../core/infrastructure/http/api-response.types';

export type NotificationTypeDto =
  | 'post_like'
  | 'post_comment'
  | 'new_follower'
  | 'product_review'
  | 'review_upvote'
  | 'order_update'
  | 'shipment_update'
  | 'promotional'
  | 'system_alert'
  | 'request_offer'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'offer_withdrawn'
  | 'request_closed'
  | 'request_status_change'
  | 'request_expired'
  | 'cart_item_added'
  | 'order_placed'
  | 'payment_success'
  | 'payment_failed'
  | 'niche_invitation'
  | 'niche_post_approved'
  | 'niche_post_rejected'
  | 'moderation_action';

export interface NotificationDto {
  id: number;
  user_id: string;
  type: NotificationTypeDto;
  title: string | null;
  message: string;
  is_read: boolean;
  is_seen: boolean;
  reference_type: string | null;
  reference_id: string | null;
  metadata_: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationListDto {
  items: NotificationDto[];
  pagination: Pagination;
}

export interface UnreadCountDto {
  count: number;
}

export interface MarkAsReadRequestDto {
  notification_ids: number[];
}

export interface MarkAsReadResponseDto {
  updated: number;
}
