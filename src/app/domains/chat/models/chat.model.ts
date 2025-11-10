/**
 * Chat Domain Models
 */

export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * Chat Message - Domain Entity
 */
export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly messageType: MessageType,
    public readonly isRead: boolean,
    public readonly createdAt: string,
    public readonly readAt?: string
  ) {}

  /**
   * Business Rule: Check if message is read
   */
  isReadMessage(): boolean {
    return this.isRead;
  }

  /**
   * Business Rule: Check if message is text
   */
  isText(): boolean {
    return this.messageType === 'text';
  }

  /**
   * Business Rule: Check if message is from system
   */
  isSystemMessage(): boolean {
    return this.messageType === 'system';
  }
}

/**
 * Chat Room - Aggregate Root
 */
export class ChatRoom {
  constructor(
    public readonly id: string,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly pinned: boolean,
    public readonly muted: boolean,
    public readonly archived: boolean,
    public readonly productId?: string,
    public readonly requestId?: string,
    public readonly lastMessageAt?: string,
    public readonly unreadCountBuyer?: number,
    public readonly unreadCountSeller?: number
  ) {}

  /**
   * Business Rule: Get unread count for current user
   */
  getUnreadCount(userId: string): number {
    if (userId === this.buyerId) {
      return this.unreadCountBuyer ?? 0;
    }
    if (userId === this.sellerId) {
      return this.unreadCountSeller ?? 0;
    }
    return 0;
  }

  /**
   * Business Rule: Check if room has unread messages
   */
  hasUnread(userId: string): boolean {
    return this.getUnreadCount(userId) > 0;
  }

  /**
   * Business Rule: Check if room is active
   */
  isActive(): boolean {
    return !this.archived;
  }
}

