/**
 * Notification Domain Model
 */

/**
 * Notification - Domain Entity
 */
export class Notification {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: string,
    public readonly isRead: boolean,
    public readonly createdAt: string,
    public readonly referenceType?: string,
    public readonly referenceId?: string
  ) {}

  /**
   * Business Rule: Check if notification is unread
   */
  isUnread(): boolean {
    return !this.isRead;
  }

  /**
   * Business Rule: Check if notification has reference
   */
  hasReference(): boolean {
    return !!this.referenceType && !!this.referenceId;
  }
}

