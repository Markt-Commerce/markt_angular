/**
 * Chat Domain Models
 *
 * These domain objects encapsulate the business logic for Markt's real-time chat.
 * They are intentionally immutable to keep state transitions predictable.
 */

export type ChatMessageType =
  | 'text'
  | 'image'
  | 'product'
  | 'offer'
  | 'discount'
  | 'discount_response';

export class ChatParticipant {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly isSeller: boolean,
    public readonly profilePicture: string | null = null
  ) {}

  displayName(): string {
    return this.username;
  }

  hasAvatar(): boolean {
    return Boolean(this.profilePicture);
  }
}

export class ChatProductSummary {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly image: string | null = null
  ) {}
}

export class ChatRequestSummary {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null = null
  ) {}
}

export class ChatMessageOffer {
  constructor(
    public readonly id: number,
    public readonly productId: string,
    public readonly price: number,
    public readonly status: string
  ) {}
}

export class ChatMessage {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly senderId: string,
    public readonly sender: ChatParticipant,
    public readonly content: string,
    public readonly messageType: ChatMessageType,
    public readonly createdAt: string,
    public readonly isRead: boolean,
    public readonly messageData: Readonly<
      Record<string, unknown>
    > | null = null,
    public readonly readAt: string | null = null,
    public readonly offer: ChatMessageOffer | null = null
  ) {}

  isFrom(userId: string): boolean {
    return this.senderId === userId;
  }

  isText(): boolean {
    return this.messageType === 'text';
  }

  isOffer(): boolean {
    return this.messageType === 'offer';
  }

  isUnread(): boolean {
    return !this.isRead;
  }
}

export class LastMessagePreview {
  constructor(
    public readonly id: number,
    public readonly senderId: string,
    public readonly content: string,
    public readonly messageType: ChatMessageType,
    public readonly createdAt: string
  ) {}
}

export interface ChatPagination {
  page: number;
  perPage: number;
  total: number;
}

/**
 * ChatRoom represents the minimal persisted room shape returned during creation calls.
 */
export class ChatRoom {
  constructor(
    public readonly id: number,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly productId: string | null,
    public readonly requestId: string | null,
    public readonly lastMessageAt: string | null,
    public readonly unreadCountBuyer: number,
    public readonly unreadCountSeller: number
  ) {}

  getUnreadCountFor(userId: string): number {
    if (userId === this.buyerId) {
      return this.unreadCountBuyer;
    }
    if (userId === this.sellerId) {
      return this.unreadCountSeller;
    }
    return 0;
  }
}

export class ChatRoomSummary {
  constructor(
    public readonly id: number,
    public readonly otherUser: ChatParticipant,
    public readonly unreadCount: number,
    public readonly lastMessageAt: string | null,
    public readonly lastMessage: LastMessagePreview | null,
    public readonly product: ChatProductSummary | null,
    public readonly request: ChatRequestSummary | null
  ) {}

  hasUnread(): boolean {
    return this.unreadCount > 0;
  }
}

export interface ChatRoomsResult {
  rooms: ChatRoomSummary[];
  pagination: ChatPagination;
}

export interface ChatMessagesResult {
  messages: ChatMessage[];
  pagination: ChatPagination;
}

export class ChatDiscount {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly discountType: 'percentage' | 'fixed_amount',
    public readonly discountValue: number,
    public readonly expiresAt: string,
    public readonly usageLimit: number,
    public readonly usageCount: number,
    public readonly status:
      | 'pending'
      | 'active'
      | 'accepted'
      | 'rejected'
      | 'expired'
      | 'used'
      | 'cancelled',
    public readonly minimumOrderAmount: number | null = null,
    public readonly maximumDiscountAmount: number | null = null,
    public readonly discountMessage: string | null = null,
    public readonly discountCode: string | null = null,
    public readonly product: ChatProductSummary | null = null
  ) {}

  isActive(now: Date = new Date()): boolean {
    if (
      this.status === 'cancelled' ||
      this.status === 'rejected' ||
      this.status === 'expired'
    ) {
      return false;
    }
    if (this.usageCount >= this.usageLimit) {
      return false;
    }
    const expiry = new Date(this.expiresAt);
    return expiry.getTime() > now.getTime();
  }
}

export interface DiscountApplicationResult {
  success: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export interface ChatDiscountResponse {
  discountId: number;
  response: ChatDiscount['status'];
  responseMessage?: string | null;
  messageId: number;
  updatedAt: string;
  discount: {
    id: number;
    status: ChatDiscount['status'];
    discountType: ChatDiscount['discountType'];
    discountValue: number;
    expiresAt: string;
  };
}

export interface DiscountCancellationResult {
  discountId: number;
  status: ChatDiscount['status'];
  cancelledAt: string;
}
