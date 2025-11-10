/**
 * User Domain Model
 * 
 * Domain entity representing a user with business logic.
 */

export type UserRole = 'buyer' | 'seller';

// Import shared Address value object
import { Address } from '../../../core/shared/value-objects/address.value-object';
export { Address };

export interface BuyerAccountData {
  id: string;
  buyername: string;
  shipping_address: Address;
  total_orders: number;
  pending_orders: number;
  last_order_date: string;
  is_active: boolean;
  created_at: string;
}

export interface SellerAccountData {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string;
  policies: Record<string, string>;
  categories: Array<{ id: string; name: string }>;
  total_products: number;
  total_sales: number;
  total_rating: number;
  average_rating: number;
  total_raters: number;
  verification_status: string;
  is_active: boolean;
  joined_date: string;
  profile_picture_url?: string;
}

/**
 * User Domain Entity
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly currentRole: UserRole,
    public readonly emailVerified: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly profilePictureUrl?: string,
    public readonly address?: Address,
    public readonly buyerAccount?: BuyerAccountData,
    public readonly sellerAccount?: SellerAccountData
  ) {}

  /**
   * Business Rule: Check if user is a buyer
   */
  isBuyer(): boolean {
    return this.currentRole === 'buyer' || this.buyerAccount !== undefined;
  }

  /**
   * Business Rule: Check if user is a seller
   */
  isSeller(): boolean {
    return this.currentRole === 'seller' || this.sellerAccount !== undefined;
  }

  /**
   * Business Rule: Check if user can switch roles
   */
  canSwitchRole(targetRole: UserRole): boolean {
    if (targetRole === 'buyer' && !this.buyerAccount) {
      return false;
    }
    if (targetRole === 'seller' && !this.sellerAccount) {
      return false;
    }
    return this.currentRole !== targetRole;
  }

  /**
   * Business Rule: Check if user has verified email
   */
  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  /**
   * Business Rule: Check if seller is verified
   */
  isSellerVerified(): boolean {
    return this.sellerAccount?.verification_status === 'verified';
  }

  /**
   * Business Rule: Get display name
   */
  getDisplayName(): string {
    if (this.currentRole === 'buyer' && this.buyerAccount) {
      return this.buyerAccount.buyername;
    }
    if (this.currentRole === 'seller' && this.sellerAccount) {
      return this.sellerAccount.shop_name;
    }
    return this.username;
  }

  /**
   * Business Rule: Check if user has complete profile
   */
  hasCompleteProfile(): boolean {
    const hasEmail = !!this.email;
    const hasPhone = !!this.phoneNumber;
    const hasAddress = !!this.address;
    
    if (this.currentRole === 'buyer') {
      return hasEmail && hasPhone && hasAddress && !!this.buyerAccount;
    }
    if (this.currentRole === 'seller') {
      return hasEmail && hasPhone && !!this.sellerAccount;
    }
    return hasEmail && hasPhone;
  }

  /**
   * Create user with updated role (immutability)
   */
  withRole(newRole: UserRole): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.phoneNumber,
      newRole,
      this.emailVerified,
      this.createdAt,
      this.updatedAt,
      this.profilePictureUrl,
      this.address,
      this.buyerAccount,
      this.sellerAccount
    );
  }

  /**
   * Create user with updated profile picture (immutability)
   */
  withProfilePicture(url: string): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.phoneNumber,
      this.currentRole,
      this.emailVerified,
      this.createdAt,
      this.updatedAt,
      url,
      this.address,
      this.buyerAccount,
      this.sellerAccount
    );
  }
}

/**
 * User Session - Value Object
 */
export class UserSession {
  constructor(
    public readonly user: User,
    public readonly token: string,
    public readonly expiresAt: Date
  ) {}

  /**
   * Business Rule: Check if session is valid
   */
  isValid(): boolean {
    return new Date() < this.expiresAt;
  }

  /**
   * Business Rule: Check if session is expired
   */
  isExpired(): boolean {
    return !this.isValid();
  }
}

