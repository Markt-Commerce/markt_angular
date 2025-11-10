/**
 * Product Domain Model
 * 
 * This is a DOMAIN ENTITY - it contains business logic and rules.
 * It's independent of how the API structures data.
 * 
 * Key principles:
 * - Contains business rules (e.g., canPurchase, isAvailable)
 * - Immutable where possible (readonly properties)
 * - Methods enforce business logic
 */

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private _price: number,
    private _stock: number,
    public readonly status: 'active' | 'inactive' | 'draft',
    public readonly sellerId: string,
    public readonly categoryIds: string[],
    public readonly averageRating: number = 0,
    public readonly reviewCount: number = 0,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  /**
   * Business Rule: Product is available if it has stock and is active
   */
  isAvailable(): boolean {
    return this._stock > 0 && this.status === 'active';
  }

  /**
   * Business Rule: Can purchase if available and has enough stock
   */
  canPurchase(quantity: number): boolean {
    if (quantity <= 0) return false;
    return this.isAvailable() && this._stock >= quantity;
  }

  /**
   * Business Rule: Get current price (could include discounts, etc.)
   */
  getPrice(): number {
    return this._price;
  }

  /**
   * Business Rule: Calculate subtotal for a given quantity
   */
  calculateSubtotal(quantity: number): number {
    if (quantity <= 0) return 0;
    return this._price * quantity;
  }

  /**
   * Business Rule: Check if product is low stock (threshold = 10)
   */
  isLowStock(): boolean {
    return this._stock > 0 && this._stock <= 10;
  }

  /**
   * Business Rule: Check if product is out of stock
   */
  isOutOfStock(): boolean {
    return this._stock === 0;
  }

  /**
   * Business Rule: Get stock status message
   */
  getStockStatus(): string {
    if (this.isOutOfStock()) return 'Out of stock';
    if (this.isLowStock()) return `Only ${this._stock} left`;
    return 'In stock';
  }

  /**
   * Get current stock (read-only access)
   */
  getStock(): number {
    return this._stock;
  }

  /**
   * Create a new Product with updated stock (immutability)
   */
  withUpdatedStock(newStock: number): Product {
    return new Product(
      this.id,
      this.name,
      this._price,
      newStock,
      this.status,
      this.sellerId,
      this.categoryIds,
      this.averageRating,
      this.reviewCount,
      this.createdAt,
      this.updatedAt
    );
  }
}


