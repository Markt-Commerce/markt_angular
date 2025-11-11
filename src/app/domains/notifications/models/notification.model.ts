export type NotificationType =
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

export class Notification {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly message: string,
    public readonly createdAt: string,
    public readonly isRead: boolean,
    public readonly isSeen: boolean,
    public readonly title: string | null,
    public readonly referenceType: string | null,
    public readonly referenceId: string | null,
    public readonly metadata: Record<string, unknown> | null
  ) {}

  isUnread(): boolean {
    return !this.isRead;
  }

  hasReference(): boolean {
    return Boolean(this.referenceType && this.referenceId);
  }

  markAsRead(): Notification {
    if (this.isRead) {
      return this;
    }
    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.message,
      this.createdAt,
      true,
      this.isSeen,
      this.title,
      this.referenceType,
      this.referenceId,
      this.metadata
    );
  }

  markAsSeen(): Notification {
    if (this.isSeen) {
      return this;
    }
    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.message,
      this.createdAt,
      this.isRead,
      true,
      this.title,
      this.referenceType,
      this.referenceId,
      this.metadata
    );
  }
}

