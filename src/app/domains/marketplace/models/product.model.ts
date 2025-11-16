import type {
  ProductDto,
  ProductCategoryDto,
  ProductImageDto,
  ProductSellerDto,
  ProductSellerUserDto,
  ProductStatusDto,
  ProductVariantDto,
  ProductMetadataDto,
} from './product.dto';

export type ProductStatus = ProductStatusDto;

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    private readonly priceValue: number,
    public readonly compareAtPrice: number | null,
    public readonly costPerItem: number | null,
    public readonly sku: string | null,
    public readonly barcode: string | null,
    public readonly weight: number | null,
    private readonly stockValue: number,
    public readonly status: ProductStatus,
    public readonly sellerId: number | string | null,
    public readonly seller: ProductSellerDto | null,
    public readonly sellerUser: ProductSellerUserDto | null,
    public readonly categoryIds: Array<number | string>,
    public readonly categories: ProductCategoryDto[],
    public readonly tagIds: Array<number | string>,
    public readonly mediaIds: number[],
    public readonly variants: ProductVariantDto[],
    public readonly images: ProductImageDto[],
    public readonly productMetadata: ProductMetadataDto | null,
    public readonly averageRating: number,
    public readonly reviewCount: number,
    public readonly viewCount: number,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static fromDto(dto: ProductDto): Product {
    return new Product(
      dto.id,
      dto.name,
      dto.description ?? null,
      dto.price,
      dto.compare_at_price ?? null,
      dto.cost_per_item ?? null,
      dto.sku ?? null,
      dto.barcode ?? null,
      dto.weight ?? null,
      dto.stock ?? 0,
      dto.status,
      dto.seller_id ?? null,
      dto.seller ?? null,
      dto.seller_user ?? null,
      Array.isArray(dto.category_ids) ? dto.category_ids : [],
      dto.categories ?? [],
      dto.tag_ids ?? [],
      dto.media_ids ?? [],
      dto.variants ?? [],
      dto.images ?? [],
      dto.product_metadata ?? null,
      dto.average_rating ?? 0,
      dto.review_count ?? 0,
      dto.view_count ?? 0,
      dto.created_at,
      dto.updated_at
    );
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isArchived(): boolean {
    return this.status === 'archived' || this.status === 'deleted';
  }

  isOutOfStock(): boolean {
    return this.stockValue === 0 || this.status === 'out_of_stock';
  }

  isAvailable(): boolean {
    return this.isActive() && !this.isOutOfStock();
  }

  canPurchase(quantity: number): boolean {
    if (quantity <= 0) return false;
    return this.isAvailable() && this.stockValue >= quantity;
  }

  getPrice(): number {
    return this.priceValue;
  }

  hasDiscount(): boolean {
    return (
      typeof this.compareAtPrice === 'number' &&
      this.compareAtPrice !== null &&
      this.compareAtPrice > this.priceValue
    );
  }

  calculateSubtotal(quantity: number): number {
    if (quantity <= 0) return 0;
    return this.priceValue * quantity;
  }

  getCompareAtPrice(): number | null {
    return this.compareAtPrice;
  }

  getCostPerItem(): number | null {
    return this.costPerItem;
  }

  getSku(): string | null {
    return this.sku;
  }

  getBarcode(): string | null {
    return this.barcode;
  }

  getWeight(): number | null {
    return this.weight;
  }

  getStock(): number {
    return this.stockValue;
  }

  isLowStock(threshold = 10): boolean {
    if (this.isOutOfStock()) return false;
    return this.stockValue <= threshold;
  }

  getStockStatus(): string {
    if (this.isOutOfStock()) return 'Out of stock';
    if (this.isLowStock()) return `Only ${this.stockValue} left`;
    return 'In stock';
  }

  withUpdatedStock(newStock: number): Product {
    return new Product(
      this.id,
      this.name,
      this.description,
      this.priceValue,
      this.compareAtPrice,
      this.costPerItem,
      this.sku,
      this.barcode,
      this.weight,
      newStock,
      this.status,
      this.sellerId,
      this.seller,
      this.sellerUser,
      this.categoryIds,
      this.categories,
      this.tagIds,
      this.mediaIds,
      this.variants,
      this.images,
      this.productMetadata,
      this.averageRating,
      this.reviewCount,
      this.viewCount,
      this.createdAt,
      this.updatedAt
    );
  }
}

