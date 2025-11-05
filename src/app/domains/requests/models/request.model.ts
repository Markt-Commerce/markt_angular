/**
 * Request Domain Models
 */

export type RequestStatus = 'OPEN' | 'FULFILLED' | 'CLOSED' | 'EXPIRED';

/**
 * Buyer Request - Domain Entity
 */
export class BuyerRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly budget: number | undefined,
    public readonly expiresAt: string | undefined,
    public readonly status: RequestStatus,
    public readonly categoryIds: string[],
    public readonly views: number,
    public readonly upvotes: number,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  /**
   * Business Rule: Check if request is open
   */
  isOpen(): boolean {
    return this.status === 'OPEN';
  }

  /**
   * Business Rule: Check if request is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }

  /**
   * Business Rule: Check if request can accept offers
   */
  canAcceptOffers(): boolean {
    return this.isOpen() && !this.isExpired();
  }

  /**
   * Business Rule: Check if request has budget
   */
  hasBudget(): boolean {
    return this.budget !== undefined && this.budget > 0;
  }
}

/**
 * Seller Offer - Value Object
 */
export class SellerOffer {
  constructor(
    public readonly id: string,
    public readonly requestId: string,
    public readonly sellerId: string,
    public readonly price: number,
    public readonly message: string,
    public readonly status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
    public readonly createdAt: string
  ) {}

  /**
   * Business Rule: Check if offer is pending
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Business Rule: Check if offer can be accepted
   */
  canAccept(): boolean {
    return this.status === 'pending';
  }
}

