/**
 * Review Domain Models
 *
 * Immutable domain models with business logic.
 */

import { ReviewDto } from './review.dto';

/**
 * Review domain model
 */
export class Review {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string,
    public readonly orderId: string | null,
    public readonly rating: number,
    public readonly title: string | null,
    public readonly content: string,
    public readonly isVerified: boolean,
    public readonly upvotes: number,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly product: {
      id: string;
      name: string;
      price: number;
      primaryImageUrl: string | null;
    } | null
  ) {}

  static fromDto(dto: ReviewDto): Review {
    return new Review(
      dto.id,
      dto.user_id,
      dto.product_id,
      dto.order_id ?? null,
      dto.rating,
      dto.title ?? null,
      dto.content,
      dto.is_verified,
      dto.upvotes,
      dto.created_at,
      dto.updated_at ?? null,
      dto.product
        ? {
            id: dto.product.id,
            name: dto.product.name,
            price: dto.product.price,
            primaryImageUrl: dto.product.primary_image_url ?? null,
          }
        : null
    );
  }

  isValidRating(): boolean {
    return this.rating >= 1 && this.rating <= 5;
  }

  hasContent(): boolean {
    return this.content.trim().length > 0;
  }

  get created_at(): string {
    return this.createdAt;
  }

  get updated_at(): string | null {
    return this.updatedAt;
  }

  get user_id(): string {
    return this.userId;
  }

  get product_id(): string {
    return this.productId;
  }

  get order_id(): string | null {
    return this.orderId;
  }

  get is_verified(): boolean {
    return this.isVerified;
  }
}

