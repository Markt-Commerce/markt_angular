/**
 * Shop Domain Models
 * 
 * Domain entities for shop/seller discovery and analytics.
 */

export interface ShopCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ShopStats {
  product_count: number;
  post_count: number;
  follower_count: number;
}

export interface ShopUser {
  id: string;
  username: string;
  profile_picture: string;
}

export interface ShopRecentProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface ShopRecentPost {
  id: string;
  caption: string;
  media: Array<{ url: string; type: string; alt_text?: string }>;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

/**
 * Shop Domain Entity
 */
export class Shop {
  constructor(
    public readonly id: number,
    public readonly shopName: string,
    public readonly shopSlug: string,
    public readonly description: string,
    public readonly categories: ShopCategory[],
    public readonly verificationStatus: string,
    public readonly isActive: boolean,
    public readonly totalRating: number,
    public readonly totalRaters: number,
    public readonly averageRating: number,
    public readonly user: ShopUser,
    public readonly stats?: ShopStats,
    public readonly isFollowed?: boolean
  ) {}

  /**
   * Business Rule: Check if shop is verified
   */
  isVerified(): boolean {
    return this.verificationStatus === 'verified';
  }

  /**
   * Business Rule: Check if shop has good rating
   */
  hasGoodRating(): boolean {
    return this.averageRating >= 4.0 && this.totalRaters > 0;
  }

  /**
   * Business Rule: Get display rating
   */
  getDisplayRating(): number {
    return this.totalRaters > 0 ? this.averageRating : 0;
  }
}

/**
 * Shop Detail Domain Entity
 */
export class ShopDetail extends Shop {
  constructor(
    id: number,
    shopName: string,
    shopSlug: string,
    description: string,
    categories: ShopCategory[],
    verificationStatus: string,
    isActive: boolean,
    totalRating: number,
    totalRaters: number,
    averageRating: number,
    user: ShopUser,
    public readonly policies: Record<string, string>,
    public readonly recentProducts: ShopRecentProduct[],
    public readonly recentPosts: ShopRecentPost[],
    stats?: ShopStats,
    isFollowed?: boolean,
    public readonly canFollow?: boolean
  ) {
    super(
      id,
      shopName,
      shopSlug,
      description,
      categories,
      verificationStatus,
      isActive,
      totalRating,
      totalRaters,
      averageRating,
      user,
      stats,
      isFollowed
    );
  }
}

