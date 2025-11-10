/**
 * Order Domain Models
 *
 * Domain entities for orders with business logic.
 */

import { Address } from '../../authentication/models/user.model';
import { Product } from '../../marketplace/models/product.model';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
export type OrderItemStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/**
 * Order Item - Value Object
 */
export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly product: Product,
    public readonly quantity: number,
    public readonly price: number,
    public readonly status: OrderItemStatus,
    public readonly variantId?: string
  ) {}

  /**
   * Business Rule: Calculate item total
   */
  calculateTotal(): number {
    return this.price * this.quantity;
  }

  /**
   * Business Rule: Check if item can be cancelled
   */
  canCancel(): boolean {
    return this.status === 'pending' || this.status === 'confirmed';
  }

  /**
   * Business Rule: Check if item is delivered
   */
  isDelivered(): boolean {
    return this.status === 'delivered';
  }

  /**
   * Business Rule: Check if item can be refunded
   */
  canRefund(): boolean {
    return this.status === 'delivered' || this.status === 'shipped';
  }
}

/**
 * Order - Aggregate Root
 */
export class Order {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly buyerId: string,
    public readonly sellerId: string,
    public readonly shippingAddress: Address,
    public readonly paymentMethod: string,
    public readonly subtotal: number,
    public readonly shippingFee: number,
    public readonly tax: number,
    public readonly discount: number,
    public readonly total: number,
    public readonly status: OrderStatus,
    public readonly createdAt: string,
    public readonly items: OrderItem[],
    public readonly customerNote?: string
  ) {}

  /**
   * Business Rule: Calculate total amount
   */
  calculateTotal(): number {
    return this.subtotal + this.shippingFee + this.tax - this.discount;
  }

  /**
   * Business Rule: Check if order can be cancelled
   */
  canCancel(): boolean {
    return this.status === 'pending' || this.status === 'confirmed';
  }

  /**
   * Business Rule: Check if order is completed
   */
  isCompleted(): boolean {
    return this.status === 'delivered';
  }

  /**
   * Business Rule: Check if order can be refunded
   */
  canRefund(): boolean {
    return this.status === 'delivered' || this.status === 'shipped';
  }

  /**
   * Business Rule: Get total items count
   */
  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Business Rule: Check if all items are delivered
   */
  allItemsDelivered(): boolean {
    return this.items.every((item) => item.isDelivered());
  }

  /**
   * Business Rule: Validate order total matches calculation
   */
  isValid(): boolean {
    const calculatedTotal = this.calculateTotal();
    return Math.abs(calculatedTotal - this.total) < 0.01; // Allow small floating point differences
  }
}
