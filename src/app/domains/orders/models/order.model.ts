export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'confirmed'
  | 'refunded';

export type OrderItemStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface OrderAddress {
  street?: string | null;
  houseNumber?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  recipientName?: string | null;
}

export interface OrderProductSummary {
  id: string;
  name: string;
  price: number;
  thumbnailUrl?: string | null;
  slug?: string | null;
}

export interface OrderVariantSummary {
  id: number;
  name: string;
  sku?: string | null;
  options?: Record<string, string> | null;
}

export interface BuyerSummary {
  id: string;
  buyername: string;
  email?: string | null;
  phone?: string | null;
  profilePictureUrl?: string | null;
}

export class OrderItem {
  constructor(
    public readonly id: number,
    public readonly orderId: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly status: OrderItemStatus,
    public readonly createdAt: string,
    public readonly product?: OrderProductSummary | null,
    public readonly variant?: OrderVariantSummary | null
  ) {}

  calculateTotal(): number {
    return this.price * this.quantity;
  }

  canCancel(): boolean {
    return this.status === 'pending' || this.status === 'processing';
  }

  isDelivered(): boolean {
    return this.status === 'delivered';
  }

  canRefund(): boolean {
    return this.status === 'delivered' || this.status === 'shipped';
  }
}

export class OrderPayment {
  constructor(
    public readonly id: number,
    public readonly amount: number,
    public readonly method: string,
    public readonly status: PaymentStatus,
    public readonly createdAt: string,
    public readonly transactionId?: string | null,
    public readonly paidAt?: string | null
  ) {}

  isSuccessful(): boolean {
    return this.status === 'completed';
  }
}

export class OrderShipment {
  constructor(
    public readonly id: number,
    public readonly carrier: string | null,
    public readonly trackingNumber: string | null,
    public readonly trackingUrl: string | null,
    public readonly status: string | null,
    public readonly shippedAt: string | null,
    public readonly deliveredAt: string | null
  ) {}

  isDelivered(): boolean {
    return Boolean(this.deliveredAt);
  }
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly buyerId: string,
    public readonly subtotal: number,
    public readonly shippingFee: number | null,
    public readonly tax: number | null,
    public readonly discount: number | null,
    public readonly total: number,
    public readonly status: OrderStatus,
    public readonly createdAt: string,
    public readonly items: OrderItem[],
    public readonly shippingAddress: OrderAddress | null,
    public readonly billingAddress: OrderAddress | null,
    public readonly paymentMethod?: string | null,
    public readonly customerNote?: string | null,
    public readonly payments: OrderPayment[] = [],
    public readonly shipments: OrderShipment[] = [],
    public readonly buyer?: BuyerSummary | null,
    public readonly updatedAt?: string | null,
    public readonly metadata?: Record<string, unknown> | null
  ) {}

  calculateItemTotal(): number {
    return this.items.reduce((total, item) => total + item.calculateTotal(), 0);
  }

  calculateTotal(): number {
    const shipping = this.shippingFee ?? 0;
    const tax = this.tax ?? 0;
    const discount = this.discount ?? 0;
    return this.subtotal + shipping + tax - discount;
  }

  canCancel(): boolean {
    return this.status === 'pending' || this.status === 'processing' || this.status === 'confirmed';
  }

  isCompleted(): boolean {
    return this.status === 'delivered';
  }

  canRefund(): boolean {
    return this.status === 'delivered' || this.status === 'shipped';
  }

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  allItemsDelivered(): boolean {
    return this.items.every((item) => item.isDelivered());
  }

  hasOutstandingBalance(): boolean {
    const successfulPayments = this.payments
      .filter((payment) => payment.isSuccessful())
      .reduce((sum, payment) => sum + payment.amount, 0);
    return successfulPayments < this.total;
  }

  getPrimaryShipment(): OrderShipment | undefined {
    if (!this.shipments.length) {
      return undefined;
    }
    return this.shipments[0];
  }
}

export class SellerOrderItem {
  constructor(
    public readonly id: number,
    public readonly orderId: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly status: OrderItemStatus,
    public readonly createdAt: string,
    public readonly order: SellerOrderSummary,
    public readonly product?: OrderProductSummary | null,
    public readonly variant?: OrderVariantSummary | null
  ) {}

  calculateTotal(): number {
    return this.price * this.quantity;
  }
}

export class SellerOrderSummary {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly createdAt: string,
    public readonly buyer?: BuyerSummary | null
  ) {}
}

export interface SellerOrderStats {
  totalOrders: number;
  pendingOrders: number;
  monthlyEarnings: number;
  completedOrders?: number;
  cancelledOrders?: number;
}
