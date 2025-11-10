import { Product } from '../../marketplace/models/product.model';
import { ProductDto } from '../../marketplace/models/product.dto';

export class CartItem {
  constructor(
    public readonly id: number,
    public readonly cartId: number,
    public readonly product: Product,
    private readonly _productPrice: number,
    private readonly _variantId: number | null,
    private readonly _variantName: string | null,
    private readonly _quantity: number,
    public readonly productDto?: ProductDto
  ) {}

  get quantity(): number {
    return this._quantity;
  }

  get variantId(): number | null {
    return this._variantId;
  }

  get variantName(): string | null {
    return this._variantName;
  }

  get unitPrice(): number {
    return this._productPrice;
  }

  updateQuantity(newQuantity: number): CartItem {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!this.product.canPurchase(newQuantity)) {
      throw new Error(
        `Cannot add ${newQuantity} items. Only ${this.product.getStock()} available.`
      );
    }

    return new CartItem(
      this.id,
      this.cartId,
      this.product,
      this._productPrice,
      this._variantId,
      this._variantName,
      newQuantity,
      this.productDto
    );
  }

  calculateSubtotal(): number {
    return this._productPrice * this._quantity;
  }

  isValid(): boolean {
    return this.product.canPurchase(this._quantity);
  }
}

export class Cart {
  constructor(
    public readonly id: number,
    public readonly buyerId: number,
    private readonly _items: CartItem[],
    public readonly expiresAt: string,
    private readonly _couponCode?: string | null
  ) {}

  get items(): readonly CartItem[] {
    return [...this._items];
  }

  getItems(): readonly CartItem[] {
    return this.items;
  }

  addItem(item: CartItem): Cart {
    const existingIndex = this._items.findIndex(
      existing => existing.product.id === item.product.id && existing.variantId === item.variantId
    );

    if (existingIndex !== -1) {
      const existing = this._items[existingIndex];
      const mergedItem = existing.updateQuantity(existing.quantity + item.quantity);
      const updatedItems = [...this._items];
      updatedItems[existingIndex] = mergedItem;
      return new Cart(this.id, this.buyerId, updatedItems, this.expiresAt, this._couponCode);
    }

    return new Cart(
      this.id,
      this.buyerId,
      [...this._items, item],
      this.expiresAt,
      this._couponCode
    );
  }

  removeItem(cartItemId: number): Cart {
    const updatedItems = this._items.filter(item => item.id !== cartItemId);
    return new Cart(this.id, this.buyerId, updatedItems, this.expiresAt, this._couponCode);
  }

  updateItemQuantity(cartItemId: number, quantity: number): Cart {
    const index = this._items.findIndex(item => item.id === cartItemId);
    if (index === -1) {
      throw new Error('Item not found in cart');
    }

    const updatedItem = this._items[index].updateQuantity(quantity);
    const updatedItems = [...this._items];
    updatedItems[index] = updatedItem;

    return new Cart(this.id, this.buyerId, updatedItems, this.expiresAt, this._couponCode);
  }

  calculateSubtotal(): number {
    return this._items.reduce((total, item) => total + item.calculateSubtotal(), 0);
  }

  getTotalItems(): number {
    return this._items.reduce((total, item) => total + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }

  validateItems(): { valid: boolean; invalidItems: CartItem[] } {
    const invalidItems = this._items.filter(item => !item.isValid());
    return {
      valid: invalidItems.length === 0,
      invalidItems
    };
  }

  isExpired(): boolean {
    return new Date(this.expiresAt) < new Date();
  }

  applyCoupon(couponCode: string): Cart {
    return new Cart(this.id, this.buyerId, this._items, this.expiresAt, couponCode);
  }

  get couponCode(): string | null | undefined {
    return this._couponCode;
  }
}



