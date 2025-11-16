import type {
  BuyerRequestCategoryDto,
  BuyerRequestDto,
  BuyerRequestUserDto,
  OfferStatusDto,
  RequestImageDto,
  RequestStatusDto,
  SellerOfferDto,
  SellerOfferProductDto,
  SellerSummaryDto,
} from './request.dto';

export type RequestStatus = RequestStatusDto;
export type OfferStatus = OfferStatusDto;

export interface RequestUser {
  id: string;
  username: string;
  profilePictureUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
}

export interface RequestCategory {
  id: number | string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  isPrimary: boolean;
}

export interface RequestImage {
  id: number;
  mediaId: number | null;
  imageUrl: string | null;
  isPrimary: boolean;
  sortOrder: number | null;
}

export interface SellerSummary {
  id: string;
  shopName: string;
  profilePictureUrl: string | null;
  isVerified: boolean;
  rating: number | null;
  shopSlug: string | null;
}

export interface SellerOfferProduct {
  id: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
}

export class SellerOffer {
  constructor(
    public readonly id: string,
    public readonly requestId: string,
    public readonly sellerId: string,
    public readonly price: number | null,
    public readonly message: string | null,
    public readonly status: OfferStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly seller: SellerSummary | null,
    public readonly product: SellerOfferProduct | null
  ) {}

  static fromDto(dto: SellerOfferDto): SellerOffer {
    return new SellerOffer(
      String(dto.id),
      dto.request_id,
      String(dto.seller_id),
      typeof dto.price === 'number' ? dto.price : null,
      dto.message ?? null,
      dto.status,
      dto.created_at,
      dto.updated_at ?? null,
      SellerOffer.mapSellerSummary(dto.seller),
      SellerOffer.mapProduct(dto.product)
    );
  }

  private static mapSellerSummary(
    dto?: SellerSummaryDto | null
  ): SellerSummary | null {
    if (!dto) {
      return null;
    }

    return {
      id: String(dto.id),
      shopName: dto.shop_name,
      profilePictureUrl: dto.profile_picture_url ?? null,
      isVerified: Boolean(dto.is_verified),
      rating: typeof dto.rating === 'number' ? dto.rating : null,
      shopSlug: dto.shop_slug ?? null,
    };
  }

  private static mapProduct(
    dto?: SellerOfferProductDto | null
  ): SellerOfferProduct | null {
    if (!dto) {
      return null;
    }

    const imageUrl =
      dto.images && dto.images.length > 0 ? dto.images[0]?.url ?? null : null;

    return {
      id: dto.id,
      name: dto.name,
      price: typeof dto.price === 'number' ? dto.price : null,
      imageUrl,
    };
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isAccepted(): boolean {
    return this.status === 'accepted';
  }

  withStatus(status: OfferStatus): SellerOffer {
    return new SellerOffer(
      this.id,
      this.requestId,
      this.sellerId,
      this.price,
      this.message,
      status,
      this.createdAt,
      this.updatedAt,
      this.seller,
      this.product
    );
  }
}

export class BuyerRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly budget: number | null,
    public readonly expiresAt: string | null,
    public readonly status: RequestStatus,
    public readonly categoryIds: Array<number | string>,
    public readonly categories: RequestCategory[],
    public readonly mediaIds: number[],
    public readonly images: RequestImage[],
    public readonly offers: SellerOffer[],
    public readonly requestMetadata: Record<string, unknown>,
    public readonly views: number,
    public readonly upvotes: number,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly user: RequestUser | null,
    public readonly isUpvoted: boolean
  ) {}

  static fromDto(dto: BuyerRequestDto): BuyerRequest {
    const offers = (dto.offers ?? []).map((offer) =>
      SellerOffer.fromDto(offer)
    );
    return new BuyerRequest(
      dto.id,
      dto.user_id,
      dto.title,
      dto.description,
      BuyerRequest.normalizeNumber(dto.budget),
      dto.expires_at ?? null,
      dto.status,
      dto.category_ids ?? [],
      BuyerRequest.mapCategories(dto.categories),
      dto.media_ids ?? [],
      BuyerRequest.mapImages(dto.images),
      offers,
      (dto.request_metadata as Record<string, unknown>) ?? {},
      dto.views ?? 0,
      dto.upvotes ?? 0,
      dto.created_at,
      dto.updated_at,
      BuyerRequest.mapUser(dto.user),
      Boolean((dto as { is_upvoted?: boolean }).is_upvoted)
    );
  }

  private static mapUser(dto?: BuyerRequestUserDto | null): RequestUser | null {
    if (!dto) {
      return null;
    }

    const profilePictureUrl =
      typeof dto.profile_picture_url === 'string'
        ? dto.profile_picture_url
        : typeof dto.profile_picture === 'string'
        ? dto.profile_picture
        : null;

    const emailVerified =
      typeof dto.email_verified === 'boolean'
        ? dto.email_verified
        : Boolean(dto.email_verified);

    return {
      id: dto.id,
      username: dto.username,
      profilePictureUrl,
      firstName: dto.first_name ?? null,
      lastName: dto.last_name ?? null,
      emailVerified,
    };
  }

  private static mapCategories(
    categories?: BuyerRequestCategoryDto[] | null
  ): RequestCategory[] {
    if (!categories) {
      return [];
    }

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug ?? null,
      imageUrl: category.image_url ?? null,
      isPrimary: Boolean(category.is_primary),
    }));
  }

  private static mapImages(images?: RequestImageDto[] | null): RequestImage[] {
    if (!images) {
      return [];
    }

    return images.map((image) => ({
      id: image.id,
      mediaId: image.media_id ?? null,
      imageUrl: image.image_url ?? null,
      isPrimary: Boolean(image.is_primary),
      sortOrder: image.sort_order ?? null,
    }));
  }

  private static normalizeNumber(value?: number | null): number | null {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    return null;
  }

  isOpen(): boolean {
    return this.status === 'open';
  }

  isFulfilled(): boolean {
    return this.status === 'fulfilled';
  }

  isClosed(): boolean {
    return this.status === 'closed';
  }

  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date(this.expiresAt).getTime() < Date.now();
  }

  canAcceptOffers(): boolean {
    return this.isOpen() && !this.isExpired();
  }

  hasBudget(): boolean {
    return typeof this.budget === 'number' && this.budget > 0;
  }

  hasOffers(): boolean {
    return this.offers.length > 0;
  }

  withUpdatedUpvotes(upvotes: number): BuyerRequest {
    return new BuyerRequest(
      this.id,
      this.userId,
      this.title,
      this.description,
      this.budget,
      this.expiresAt,
      this.status,
      this.categoryIds,
      this.categories,
      this.mediaIds,
      this.images,
      this.offers,
      this.requestMetadata,
      this.views,
      upvotes,
      this.createdAt,
      this.updatedAt,
      this.user,
      this.isUpvoted
    );
  }

  withStatus(status: RequestStatus): BuyerRequest {
    return new BuyerRequest(
      this.id,
      this.userId,
      this.title,
      this.description,
      this.budget,
      this.expiresAt,
      status,
      this.categoryIds,
      this.categories,
      this.mediaIds,
      this.images,
      this.offers,
      this.requestMetadata,
      this.views,
      this.upvotes,
      this.createdAt,
      this.updatedAt,
      this.user,
      this.isUpvoted
    );
  }

  withOffers(offers: SellerOffer[]): BuyerRequest {
    return new BuyerRequest(
      this.id,
      this.userId,
      this.title,
      this.description,
      this.budget,
      this.expiresAt,
      this.status,
      this.categoryIds,
      this.categories,
      this.mediaIds,
      this.images,
      offers,
      this.requestMetadata,
      this.views,
      this.upvotes,
      this.createdAt,
      this.updatedAt,
      this.user,
      this.isUpvoted
    );
  }
}
