export interface Cart {
  buyer_id: string;
  cart_id: string;
  discount_percent?: number;
  discount_price?: number;
  has_discount?: boolean;
  product_id: string;
  quantity: number;
}

export interface CartProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
  sellerName: string;
  cartId?: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  discountPrice?: number;
}
