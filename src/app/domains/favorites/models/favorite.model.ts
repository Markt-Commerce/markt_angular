/**
 * Favorite Domain Models
 *
 * Immutable domain models with business logic.
 */

import { FavoriteDto } from './favorite.dto';

/**
 * Favorite domain model
 */
export class Favorite {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly product: {
      id: string;
      name: string;
      price: number;
      primaryImageUrl: string | null;
    } | null
  ) {}

  static fromDto(dto: FavoriteDto): Favorite {
    return new Favorite(
      dto.id,
      dto.user_id,
      dto.product_id,
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
}

