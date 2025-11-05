/**
 * Cart Domain Model
 * 
 * Example domain model for the Orders domain.
 * Shows how to handle aggregate roots and business logic.
 */

import { Product } from '../../marketplace/models/product.model';

/**
 * Cart Item - Value Object
 * Represents a single item in the cart with business rules
 */
export class CartItem {
  constructor(
    public readonly id: string,
    public readonly product: Product,
    private _quantity: number
  ) {}

  /**
   * Business Rule: Quantity must be positive
   */
  getQuantity(): number {
    return this._quantity;
  }

  /**
   * Business Rule: Can only update quantity if product is available
   */
  updateQuantity(newQuantity: number): CartItem {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!this.product.canPurchase(newQuantity)) {
      throw new Error(`Cannot add ${newQuantity} items. Only ${this.product.getStock()} available.`);
    }

    return new CartItem(this.id, this.product, newQuantity);
  }

  /**
   * Business Rule: Calculate item subtotal
   */
  calculateSubtotal(): number {
    return this.product.calculateSubtotal(this._quantity);
  }

  /**
   * Business Rule: Check if item is valid (product still available)
   */
  isValid(): boolean {
    return this.product.canPurchase(this._quantity);
  }
}

/**
 * Cart - Aggregate Root
 * 
 * The cart is an aggregate that contains cart items.
 * It's responsible for maintaining cart business rules.
 */
export class Cart {
  constructor(
    public readonly id: string,
    public readonly buyerId: string,
    private _items: CartItem[],
    public readonly expiresAt: string,
    private _couponCode?: string
  ) {}

  /**
   * Get all cart items
   */
  getItems(): readonly CartItem[] {
    return [...this._items]; // Return copy to maintain immutability
  }

  /**
   * Business Rule: Add item to cart
   */
  addItem(product: Product, quantity: number): Cart {
    // Check if product already in cart
    const existingItem = this._items.find(item => item.product.id === product.id);

    if (existingItem) {
      // Update quantity of existing item
      const updatedItem = existingItem.updateQuantity(existingItem.getQuantity() + quantity);
      const updatedItems = this._items.map(item =>
        item.id === existingItem.id ? updatedItem : item
      );
      return new Cart(this.id, this.buyerId, updatedItems, this.expiresAt, this._couponCode);
    } else {
      // Add new item
      const newItem = new CartItem(`temp-${Date.now()}`, product, quantity);
      return new Cart(
        this.id,
        this.buyerId,
        [...this._items, newItem],
        this.expiresAt,
        this._couponCode
      );
    }
  }

  /**
   * Business Rule: Remove item from cart
   */
  removeItem(itemId: string): Cart {
    const updatedItems = this._items.filter(item => item.id !== itemId);
    return new Cart(this.id, this.buyerId, updatedItems, this.expiresAt, this._couponCode);
  }

  /**
   * Business Rule: Update item quantity
   */
  updateItemQuantity(itemId: string, quantity: number): Cart {
    const itemIndex = this._items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    const item = this._items[itemIndex];
    const updatedItem = item.updateQuantity(quantity);
    const updatedItems = [...this._items];
    updatedItems[itemIndex] = updatedItem;

    return new Cart(this.id, this.buyerId, updatedItems, this.expiresAt, this._couponCode);
  }

  /**
   * Business Rule: Calculate cart subtotal
   */
  calculateSubtotal(): number {
    return this._items.reduce((total, item) => total + item.calculateSubtotal(), 0);
  }

  /**
   * Business Rule: Calculate total items count
   */
  getTotalItems(): number {
    return this._items.reduce((total, item) => total + item.getQuantity(), 0);
  }

  /**
   * Business Rule: Check if cart is empty
   */
  isEmpty(): boolean {
    return this._items.length === 0;
  }

  /**
   * Business Rule: Validate all items are still available
   */
  validateItems(): { valid: boolean; invalidItems: CartItem[] } {
    const invalidItems = this._items.filter(item => !item.isValid());
    return {
      valid: invalidItems.length === 0,
      invalidItems
    };
  }

  /**
   * Business Rule: Check if cart has expired
   */
  isExpired(): boolean {
    return new Date(this.expiresAt) < new Date();
  }

  /**
   * Business Rule: Apply coupon code
   */
  applyCoupon(couponCode: string): Cart {
    // Business logic: Validate coupon, apply discount
    // For now, just store the code
    return new Cart(this.id, this.buyerId, this._items, this.expiresAt, couponCode);
  }

  /**
   * Get coupon code if applied
   */
  getCouponCode(): string | undefined {
    return this._couponCode;
  }
}

