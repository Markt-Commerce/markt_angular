import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TypeSafetyService } from './type-safety.service';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Product, 
  Order, 
  OrderItem, 
  Cart, 
  CartItem, 
  CartSummary,
  BuyerRequest, 
  SellerOffer, 
  Media, 
  Category, 
  Niche, 
  Post, 
  PostComment, 
  Story, 
  Collection, 
  ChatRoom, 
  ChatMessage, 
  Payment, 
  Notification, 
  Review,
  Tracking,
  RegisterResponse,
  UserRole
} from '../models';

export interface UserData {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  account_type: UserRole;
  seller_data?: {
    shop_name: string;
    description: string;
    category_ids: number[];
    policies: Record<string, string>;
  };
  buyer_data?: {
    buyername: string;
    shipping_address: {
      latitude: number;
      longitude: number;
      street: string;
      house_number: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  account_type?: UserRole; // Optional - backend determines role from user's registration data
}

export interface ProfileData {
  username?: string;
  email?: string;
  phone_number?: string;
  profile_picture?: string;
}

export interface BuyerData {
  buyername: string;
  shipping_address: {
    latitude: number;
    longitude: number;
    street: string;
    house_number: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

export interface SellerData {
  shop_name: string;
  description: string;
  category_ids: number[];
  policies: Record<string, string>;
}

export interface PasswordResetData {
  email: string;
  code: string;
  new_password: string;
}

export interface EmailVerificationData {
  email: string;
  verification_code: string;
}

export interface UserParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: 'buyer' | 'seller';
  status?: 'active' | 'inactive';
  [key: string]: unknown;
}

export interface ShopParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_ids?: number[];
  location?: string;
  [key: string]: unknown;
}

export interface ProductParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_ids?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  seller_id?: string;
  status?: 'active' | 'inactive' | 'draft';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  weight?: number;
  status?: 'active' | 'inactive' | 'draft';
  category_ids: string[];
  tag_ids?: string[];
  media_ids?: string[];
  product_metadata?: Record<string, unknown>;
}

export interface OrderData {
  cart_id: string;
  shipping_address: {
    latitude: number;
    longitude: number;
    street: string;
    house_number: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  payment_method: string;
  customer_note?: string;
}

export interface PaymentData {
  order_id: string;
  amount: number;
  currency?: string;
  method?: string;
  metadata?: Record<string, unknown>;
}

export interface CartData {
  product_id: string;
  variant_id?: string;
  quantity?: number;
}

export interface CartItemUpdateData {
  quantity: number;
}

export interface CheckoutData {
  shipping_address: {
    latitude: number;
    longitude: number;
    street: string;
    house_number: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  payment_method: string;
  customer_note?: string;
}

export interface RequestData {
  title: string;
  description: string;
  budget?: number;
  expires_at?: string;
  category_ids: string[];
  media_ids?: string[];
  metadata?: Record<string, unknown>;
}

export interface RequestParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_ids?: string[];
  status?: 'OPEN' | 'FULFILLED' | 'CLOSED' | 'EXPIRED';
  budget_min?: number;
  budget_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface OfferData {
  product_id?: string;
  price: number;
  message: string;
}

export interface StatusUpdateData {
  status: string;
  reason?: string;
}

export interface MediaParams {
  page?: number;
  per_page?: number;
  media_type?: 'image' | 'video';
  user_id?: string;
  is_public?: boolean;
  [key: string]: unknown;
}

export interface SocialOptimizationData {
  platform: string;
  post_type: string;
  aspect_ratio?: number;
}

export interface VariantData {
  variant_type: string;
  quality: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface CategoryData {
  name: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
}

export interface NicheData {
  name: string;
  description: string;
  category_ids: string[];
  tags?: string[];
  visibility: 'public' | 'private' | 'restricted';
  max_members?: number;
  allow_buyer_posts?: boolean;
  allow_seller_posts?: boolean;
  require_approval?: boolean;
  rules?: string[];
  settings?: Record<string, unknown>;
}

export interface PostData {
  caption: string;
  category_ids?: string[];
  media_ids?: string[];
  products?: { product_id: string }[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface CommentData {
  content: string;
  parent_id?: string;
}

export interface ReactionData {
  reaction_type: string;
}

export interface StoryData {
  media_url: string;
  media_type: 'image' | 'video';
  duration?: number;
  caption?: string;
}

export interface CollectionData {
  name: string;
  description?: string;
  is_public?: boolean;
  is_collaborative?: boolean;
}

export interface SearchParams {
  query: string;
  page?: number;
  per_page?: number;
  type?: string;
  category_ids?: number[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  locations?: string[];
  sort_by?: string;
}

export interface AnalyticsParams {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface ModerationData {
  action: 'warn' | 'suspend' | 'ban' | 'delete';
  reason: string;
  duration?: number;
  target_user_id?: string;
}

export interface WebhookData {
  event: string;
  data: Record<string, unknown>;
  signature?: string;
}

export interface OrderParams {
  page?: number;
  per_page?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface ReviewData {
  rating: number;
  title?: string;
  content: string;
}

export interface CouponData {
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private typeSafety = inject(TypeSafetyService);
  private readonly API_BASE_URL = environment.apiBaseUrl;
  
  // Configure HTTP options to include credentials (cookies)
  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    })
  };

  // ============================================================================
  // USER ENDPOINTS (25 endpoints)
  // ============================================================================

  // Authentication
  register(userData: UserData): Observable<ApiResponse<RegisterResponse>> {
    return this.post<RegisterResponse>('/users/register', userData);
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<User>> {
    return this.post<User>('/users/login', credentials);
  }

  logout(): Observable<ApiResponse<void>> {
    return this.post<void>('/users/logout');
  }

  // Profile Management
  getProfile(): Observable<ApiResponse<User>> {
    return this.get<User>('/users/profile');
  }

  updateProfile(profileData: ProfileData): Observable<ApiResponse<User>> {
    return this.patch<User>('/users/profile', profileData);
  }

  createBuyerAccount(buyerData: BuyerData): Observable<ApiResponse<User>> {
    return this.post<User>('/users/create-buyer', buyerData);
  }

  createSellerAccount(sellerData: SellerData): Observable<ApiResponse<User>> {
    return this.post<User>('/users/create-seller', sellerData);
  }

  updateBuyerProfile(buyerData: BuyerData): Observable<ApiResponse<User>> {
    return this.patch<User>('/users/profile/buyer', buyerData);
  }

  updateSellerProfile(sellerData: SellerData): Observable<ApiResponse<User>> {
    return this.patch<User>('/users/profile/seller', sellerData);
  }

  switchRole(targetRole?: UserRole): Observable<ApiResponse<{ user: User; message: string }>> {
    // Validate targetRole parameter
    if (targetRole !== undefined && targetRole !== 'buyer' && targetRole !== 'seller') {
      return throwError(() => new Error('Invalid targetRole: must be "buyer" or "seller"'));
    }

    const requestBody = targetRole ? { role: targetRole } : undefined;
    
    // Try POST first, fallback to PATCH, then GET
    return this.post<{ user: User; message: string }>('/users/switch-role', requestBody).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 405 || error.status === 404) {
          return this.patch<{ user: User; message: string }>('/users/switch-role', requestBody).pipe(
            catchError((patchErr: HttpErrorResponse) => {
              if (patchErr.status === 405 || patchErr.status === 404) {
                return this.get<{ user: User; message: string }>('/users/switch-role', requestBody);
              }
              return throwError(() => patchErr);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  // Password & Email Management
  passwordReset(email: string): Observable<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/users/password-reset', { email });
  }

  passwordResetConfirm(data: PasswordResetData): Observable<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/users/password-reset/confirm', data);
  }

  sendEmailVerification(email: string): Observable<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/users/email-verification/send', { email });
  }

  verifyEmail(data: EmailVerificationData): Observable<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/users/email-verification/verify', data);
  }

  // User Management
  getUsers(params?: UserParams): Observable<ApiResponse<PaginatedResponse<User>>> {
    return this.get<PaginatedResponse<User>>('/users/', params);
  }

  getUserSettings(): Observable<ApiResponse<Record<string, unknown>>> {
    return this.get<Record<string, unknown>>('/users/settings');
  }

  updateUserSettings(settings: Record<string, unknown>): Observable<ApiResponse<Record<string, unknown>>> {
    return this.patch<Record<string, unknown>>('/users/settings', settings);
  }

  uploadProfilePicture(file: File): Observable<ApiResponse<Media>> {
    return this.upload<Media>('/users/profile/picture', file);
  }

  getPublicProfile(userId: string): Observable<ApiResponse<User>> {
    return this.get<User>(`/users/${userId}/public`);
  }

  // Shop Discovery
  getShops(params?: ShopParams): Observable<ApiResponse<PaginatedResponse<Record<string, unknown>>>> {
    return this.get<PaginatedResponse<Record<string, unknown>>>('/users/shops', params);
  }

  getTrendingShops(): Observable<ApiResponse<Record<string, unknown>[]>> {
    return this.get<Record<string, unknown>[]>('/users/shops/trending');
  }

  getShopCategories(): Observable<ApiResponse<Category[]>> {
    return this.get<Category[]>('/users/shops/categories');
  }

  getShopDetails(shopId: number): Observable<ApiResponse<Record<string, unknown>>> {
    return this.get<Record<string, unknown>>(`/users/shops/${shopId}`);
  }

  checkUsername(username: string): Observable<ApiResponse<{ available: boolean; message?: string }>> {
    return this.get<{ available: boolean; message?: string }>('/users/check-username', { username });
  }

  /**
   * Get VAPID public key for push notifications
   */
  getVapidPublicKey(): Observable<ApiResponse<{ publicKey: string }>> {
    return this.get<{ publicKey: string }>('/notifications/vapid-public-key');
  }

  /**
   * Update push notification subscription
   */
  updatePushSubscription(subscription: any): Observable<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/users/push-subscription', subscription);
  }

  // ============================================================================
  // PRODUCT ENDPOINTS (15 endpoints)
  // ============================================================================

  getProducts(params?: ProductParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.get<PaginatedResponse<Product>>('/products/', params);
  }

  createProduct(productData: ProductData): Observable<ApiResponse<Product>> {
    return this.post<Product>('/products/', productData);
  }

  getProduct(productId: string): Observable<ApiResponse<Product>> {
    return this.get<Product>(`/products/${productId}`);
  }

  updateProduct(productId: string, productData: ProductData): Observable<ApiResponse<Product>> {
    return this.put<Product>(`/products/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/products/${productId}`);
  }

  bulkCreateProducts(products: ProductData[]): Observable<ApiResponse<{ success: string[]; errors: string[] }>> {
    return this.post<{ success: string[]; errors: string[] }>('/products/bulk', products);
  }

  getTrendingProducts(params?: ProductParams): Observable<ApiResponse<Product[]>> {
    return this.get<Product[]>('/products/trending', params);
  }

  getRecommendedProducts(params?: ProductParams): Observable<ApiResponse<Product[]>> {
    return this.get<Product[]>('/products/recommended', params);
  }

  getProductReviews(productId: string, params?: ProductParams): Observable<ApiResponse<{ items: unknown[]; pagination: unknown }>> {
    return this.get<{ items: unknown[]; pagination: unknown }>(`/products/${productId}/reviews`, params);
  }

  addProductReview(productId: string, reviewData: { rating: number; title?: string; content: string }): Observable<ApiResponse<unknown>> {
    return this.post<unknown>(`/products/${productId}/reviews`, reviewData);
  }

  upvoteReview(reviewId: string): Observable<ApiResponse<{ success: boolean; new_count: number }>> {
    return this.post<{ success: boolean; new_count: number }>(`/products/reviews/${reviewId}/upvote`);
  }

  trackProductView(productId: string): Observable<ApiResponse<void>> {
    return this.post<void>(`/products/${productId}/view`);
  }

  shareProduct(productId: string): Observable<ApiResponse<{ success: boolean; share_url: string }>> {
    return this.post<{ success: boolean; share_url: string }>(`/products/${productId}/share`);
  }

  getMyProducts(params?: ProductParams): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.get<PaginatedResponse<Product>>('/products/seller/my-products', params);
  }

  // ============================================================================
  // ORDER ENDPOINTS (10 endpoints)
  // ============================================================================

  getOrders(): Observable<ApiResponse<Order[]>> {
    return this.get<Order[]>('/orders/');
  }

  createOrder(orderData: OrderData): Observable<ApiResponse<Order>> {
    return this.post<Order>('/orders/', orderData);
  }

  payOrder(orderId: string, paymentData: PaymentData): Observable<ApiResponse<Order>> {
    return this.post<Order>(`/orders/${orderId}/pay`, paymentData);
  }

  getOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.get<Order>(`/orders/${orderId}`);
  }

  getSellerOrders(params?: OrderParams): Observable<ApiResponse<PaginatedResponse<Order>>> {
    return this.get<PaginatedResponse<Order>>('/orders/seller', params);
  }

  getSellerOrderStats(): Observable<ApiResponse<OrderStats>> {
    return this.get<OrderStats>('/orders/seller/stats');
  }

  updateOrderItemStatus(orderItemId: number, statusData: StatusUpdateData): Observable<ApiResponse<OrderItem>> {
    return this.patch<OrderItem>(`/orders/seller/items/${orderItemId}`, statusData);
  }

  trackOrder(orderId: string): Observable<ApiResponse<Tracking[]>> {
    return this.get<Tracking[]>(`/orders/${orderId}/track`);
  }

  getOrderTracking(orderId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/orders/${orderId}/tracking`);
  }

  reviewOrder(orderId: string, reviewData: ReviewData): Observable<ApiResponse<Review>> {
    return this.post<Review>(`/orders/${orderId}/review`, reviewData);
  }

  // ============================================================================
  // CART ENDPOINTS (8 endpoints)
  // ============================================================================

  getCart(): Observable<ApiResponse<Cart>> {
    return this.get<Cart>('/cart/');
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.delete<void>('/cart/');
  }

  addToCart(cartData: CartData): Observable<ApiResponse<CartItem>> {
    return this.post<CartItem>('/cart/add', cartData);
  }

  updateCartItem(itemId: string, quantityData: CartItemUpdateData): Observable<ApiResponse<CartItem>> {
    return this.put<CartItem>(`/cart/items/${itemId}`, quantityData);
  }

  removeCartItem(itemId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/cart/items/${itemId}`);
  }

  checkoutCart(checkoutData: CheckoutData): Observable<ApiResponse<Order>> {
    return this.post<Order>('/cart/checkout', checkoutData);
  }

  getCartSummary(): Observable<ApiResponse<CartSummary>> {
    return this.get<CartSummary>('/cart/summary');
  }

  applyCoupon(couponData: CouponData): Observable<ApiResponse<{ discount_amount: number; message: string }>> {
    return this.post<{ discount_amount: number; message: string }>('/cart/coupon', couponData);
  }

  // ============================================================================
  // REQUEST ENDPOINTS (12 endpoints)
  // ============================================================================

  getRequests(params?: RequestParams): Observable<ApiResponse<PaginatedResponse<BuyerRequest>>> {
    return this.get<PaginatedResponse<BuyerRequest>>('/requests/', params);
  }

  createRequest(requestData: RequestData): Observable<ApiResponse<BuyerRequest>> {
    return this.post<BuyerRequest>('/requests/', requestData);
  }

  getMyRequests(params?: RequestParams): Observable<ApiResponse<PaginatedResponse<BuyerRequest>>> {
    return this.get<PaginatedResponse<BuyerRequest>>('/requests/my-requests', params);
  }

  getRequest(requestId: string): Observable<ApiResponse<BuyerRequest>> {
    return this.get<BuyerRequest>(`/requests/${requestId}`);
  }

  updateRequest(requestId: string, requestData: RequestData): Observable<ApiResponse<BuyerRequest>> {
    return this.put<BuyerRequest>(`/requests/${requestId}`, requestData);
  }

  deleteRequest(requestId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/requests/${requestId}`);
  }

  updateRequestStatus(requestId: string, statusData: StatusUpdateData): Observable<ApiResponse<BuyerRequest>> {
    return this.put<BuyerRequest>(`/requests/${requestId}/status`, statusData);
  }

  upvoteRequest(requestId: string): Observable<ApiResponse<{ success: boolean; new_count: number }>> {
    return this.post<{ success: boolean; new_count: number }>(`/requests/${requestId}/upvote`);
  }

  getRequestOffers(requestId: string): Observable<ApiResponse<SellerOffer[]>> {
    return this.get<SellerOffer[]>(`/requests/${requestId}/offers`);
  }

  createOffer(requestId: string, offerData: OfferData): Observable<ApiResponse<SellerOffer>> {
    return this.post<SellerOffer>(`/requests/${requestId}/offers`, offerData);
  }

  acceptOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    return this.post<SellerOffer>(`/requests/offers/${offerId}/accept`);
  }

  rejectOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    return this.post<SellerOffer>(`/requests/offers/${offerId}/reject`);
  }

  withdrawOffer(offerId: string): Observable<ApiResponse<SellerOffer>> {
    return this.post<SellerOffer>(`/requests/offers/${offerId}/withdraw`);
  }

  // ============================================================================
  // MEDIA ENDPOINTS (25 endpoints)
  // ============================================================================

  uploadMedia(file: File): Observable<ApiResponse<Media>> {
    return this.upload<Media>('/media/upload', file);
  }

  getMedia(mediaId: number): Observable<ApiResponse<Media>> {
    return this.get<Media>(`/media/${mediaId}`);
  }

  deleteMedia(mediaId: number): Observable<ApiResponse<any>> {
    return this.delete<any>(`/media/${mediaId}`);
  }

  getMediaUrls(mediaId: number): Observable<ApiResponse<any>> {
    return this.get<any>(`/media/${mediaId}/urls`);
  }

  getMediaStatus(mediaId: number): Observable<ApiResponse<any>> {
    return this.get<any>(`/media/${mediaId}/status`);
  }

  optimizeForSocial(mediaId: number, optimizationData: SocialOptimizationData): Observable<ApiResponse<any>> {
    return this.post<any>(`/media/${mediaId}/social-optimize`, optimizationData);
  }

  removeBackground(mediaId: number): Observable<ApiResponse<any>> {
    return this.post<any>(`/media/${mediaId}/remove-background`);
  }

  getMediaList(params?: MediaParams): Observable<ApiResponse<any>> {
    return this.get<any>('/media/', params);
  }

  getMediaStats(): Observable<ApiResponse<any>> {
    return this.get<any>('/media/stats');
  }

  getProductImages(productId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/media/products/${productId}/images`);
  }

  addProductImage(productId: string, file: File): Observable<ApiResponse<any>> {
    return this.upload<any>(`/media/products/${productId}/images`, file);
  }

  deleteProductImage(productId: string, imageId: number): Observable<ApiResponse<any>> {
    return this.delete<any>(`/media/products/${productId}/images/${imageId}`);
  }

  getSocialPostMedia(postId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/media/social-posts/${postId}/media`);
  }

  addSocialPostMedia(postId: string, file: File): Observable<ApiResponse<any>> {
    return this.upload<any>(`/media/social-posts/${postId}/media`, file);
  }

  deleteSocialPostMedia(postId: string, mediaId: number): Observable<ApiResponse<any>> {
    return this.delete<any>(`/media/social-posts/${postId}/media/${mediaId}`);
  }

  getRequestImages(requestId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/media/requests/${requestId}/images`);
  }

  addRequestImage(requestId: string, file: File): Observable<ApiResponse<any>> {
    return this.upload<any>(`/media/requests/${requestId}/images`, file);
  }

  deleteRequestImage(requestId: string, imageId: number): Observable<ApiResponse<any>> {
    return this.delete<any>(`/media/requests/${requestId}/images/${imageId}`);
  }

  downloadMedia(mediaId: number): Observable<ApiResponse<any>> {
    return this.get<any>(`/media/${mediaId}/download`);
  }

  getMediaVariants(mediaId: number): Observable<ApiResponse<any>> {
    return this.get<any>(`/media/${mediaId}/variants`);
  }

  generateVariants(mediaId: number, variantData: VariantData): Observable<ApiResponse<any>> {
    return this.post<any>(`/media/${mediaId}/generate-variants`, variantData);
  }

  updateMedia(mediaId: number, updateData: any): Observable<ApiResponse<Media>> {
    return this.put<Media>(`/media/${mediaId}`, updateData);
  }

  // ============================================================================
  // CATEGORY ENDPOINTS (5 endpoints)
  // ============================================================================

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.get<Category[]>('/categories/');
  }

  createCategory(categoryData: CategoryData): Observable<ApiResponse<Category>> {
    return this.post<Category>('/categories/', categoryData);
  }

  getCategory(categoryId: number): Observable<ApiResponse<Category>> {
    return this.get<Category>(`/categories/${categoryId}`);
  }

  updateCategory(categoryId: number, categoryData: CategoryData): Observable<ApiResponse<Category>> {
    return this.put<Category>(`/categories/${categoryId}`, categoryData);
  }

  getCategoryProducts(categoryId: number, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/categories/${categoryId}/products`, params);
  }

  getPopularTags(): Observable<ApiResponse<any[]>> {
    return this.get<any[]>('/categories/tags');
  }

  createTag(tagData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/categories/tags', tagData);
  }

  // ============================================================================
  // SOCIAL ENDPOINTS (15+ endpoints)
  // ============================================================================

  getNiches(params?: any): Observable<ApiResponse<PaginatedResponse<any>>> {
    return this.get<PaginatedResponse<any>>('/socials/niches', params);
  }

  createNiche(nicheData: NicheData): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/niches', nicheData);
  }

  getNiche(nicheId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/niches/${nicheId}`);
  }

  updateNiche(nicheId: string, nicheData: NicheData): Observable<ApiResponse<any>> {
    return this.put<any>(`/socials/niches/${nicheId}`, nicheData);
  }

  joinNiche(nicheId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/niches/${nicheId}/join`);
  }

  leaveNiche(nicheId: string): Observable<ApiResponse<void>> {
    return this.post<void>(`/socials/niches/${nicheId}/leave`);
  }

  getNicheMembers(nicheId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/niches/${nicheId}/members`, params);
  }

  moderateNiche(nicheId: string, moderationData: ModerationData): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/niches/${nicheId}/moderate`, moderationData);
  }

  getMyNiches(params?: any): Observable<ApiResponse<PaginatedResponse<any>>> {
    return this.get<PaginatedResponse<any>>('/socials/my-niches', params);
  }

  canPostInNiche(nicheId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/niches/${nicheId}/can-post`);
  }

  // Feed endpoints
  getPersonalizedFeed(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/feed/personalized', params);
  }

  getTrendingFeed(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/feed/trending', params);
  }

  getFollowingFeed(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/feed/following', params);
  }

  getDiscoveryFeed(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/feed/discover', params);
  }

  getNicheFeed(nicheId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/feed/niche/${nicheId}`, params);
  }

  // Comment reactions
  getCommentReactions(commentId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/socials/comments/${commentId}/reactions`);
  }

  addCommentReaction(commentId: string, reactionData: ReactionData): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/comments/${commentId}/reactions`, reactionData);
  }

  removeCommentReaction(commentId: string, reactionType: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/socials/comments/${commentId}/reactions/${reactionType}`);
  }

  // ============================================================================
  // PAYMENT ENDPOINTS (8 endpoints)
  // ============================================================================

  getPayments(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/payments/', params);
  }

  createPayment(paymentData: PaymentData): Observable<ApiResponse<Payment>> {
    return this.post<Payment>('/payments/create', paymentData);
  }

  processPayment(paymentId: string, paymentData: PaymentData): Observable<ApiResponse<Payment>> {
    return this.post<Payment>(`/payments/${paymentId}/process`, paymentData);
  }

  verifyPayment(paymentId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/payments/${paymentId}/verify`);
  }

  getPayment(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.get<Payment>(`/payments/${paymentId}`);
  }

  handlePaystackWebhook(webhookData: WebhookData): Observable<ApiResponse<any>> {
    return this.post<any>('/payments/webhook/paystack', webhookData);
  }

  initializePayment(paymentData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/payments/initialize', paymentData);
  }

  handlePaymentCallback(paymentId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/payments/callback/${paymentId}`);
  }

  getPaymentStats(): Observable<ApiResponse<any>> {
    return this.get<any>('/payments/admin/stats');
  }

  // ============================================================================
  // NOTIFICATION ENDPOINTS (3 endpoints)
  // ============================================================================

  getNotifications(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/notifications/', params);
  }

  getUnreadCount(): Observable<ApiResponse<any>> {
    return this.get<any>('/notifications/unread/count');
  }

  markAsRead(notificationIds: number[]): Observable<ApiResponse<any>> {
    return this.post<any>('/notifications/mark-read', { notification_ids: notificationIds });
  }

  // ============================================================================
  // CHAT ENDPOINTS (referenced in schemas)
  // ============================================================================

  getChatRooms(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/chats/rooms', params);
  }

  createChatRoom(roomData: any): Observable<ApiResponse<ChatRoom>> {
    return this.post<ChatRoom>('/chats/rooms', roomData);
  }

  getChatMessages(roomId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/chats/rooms/${roomId}/messages`, params);
  }

  sendMessage(roomId: string, messageData: any): Observable<ApiResponse<ChatMessage>> {
    return this.post<ChatMessage>(`/chats/rooms/${roomId}/messages`, messageData);
  }

  // ============================================================================
  // SOCIAL ENDPOINTS - STORIES (4 endpoints)
  // ============================================================================

  getStories(): Observable<ApiResponse<any[]>> {
    return this.get<any[]>('/socials/stories');
  }

  createStory(storyData: StoryData): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/stories', storyData);
  }

  getStory(storyId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/stories/${storyId}`);
  }

  deleteStory(storyId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/socials/stories/${storyId}`);
  }

  // ============================================================================
  // SOCIAL ENDPOINTS - COLLECTIONS (5 endpoints)
  // ============================================================================

  getCollections(): Observable<ApiResponse<any[]>> {
    return this.get<any[]>('/socials/collections');
  }

  createCollection(collectionData: CollectionData): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/collections', collectionData);
  }

  getCollection(collectionId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/collections/${collectionId}`);
  }

  updateCollection(collectionId: string, collectionData: CollectionData): Observable<ApiResponse<any>> {
    return this.put<any>(`/socials/collections/${collectionId}`, collectionData);
  }

  deleteCollection(collectionId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/socials/collections/${collectionId}`);
  }

  // ============================================================================
  // SOCIAL ENDPOINTS - FOLLOW/UNFOLLOW (4 endpoints)
  // ============================================================================

  followUser(followeeId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/follow/${followeeId}`);
  }

  unfollowUser(followeeId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/socials/follow/${followeeId}`);
  }

  getFollowers(userId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/followers`, params);
  }

  getFollowing(userId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/following`, params);
  }

  // ============================================================================
  // SOCIAL ENDPOINTS - POST MANAGEMENT (4 endpoints)
  // ============================================================================

  getDraftPosts(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/seller/posts/drafts', params);
  }

  getArchivedPosts(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/seller/posts/archived', params);
  }

  bookmarkPost(postId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/posts/${postId}/bookmark`);
  }

  removeBookmark(postId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/socials/posts/${postId}/bookmark`);
  }

  // ============================================================================
  // CHAT ENDPOINTS - ROOM MANAGEMENT (4 endpoints)
  // ============================================================================

  pinChatRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/chats/rooms/${roomId}/pin`);
  }

  muteChatRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/chats/rooms/${roomId}/mute`);
  }

  archiveChatRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/chats/rooms/${roomId}/archive`);
  }

  deleteChatRoom(roomId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/chats/rooms/${roomId}`);
  }

  // ============================================================================
  // CHAT ENDPOINTS - MESSAGE REACTIONS (3 endpoints)
  // ============================================================================

  getMessageReactions(messageId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/chat/messages/${messageId}/reactions`);
  }

  addMessageReaction(messageId: string, reactionData: ReactionData): Observable<ApiResponse<any>> {
    return this.post<any>(`/chat/messages/${messageId}/reactions`, reactionData);
  }

  removeMessageReaction(messageId: string, reactionType: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/chat/messages/${messageId}/reactions/${reactionType}`);
  }

  // ============================================================================
  // SEARCH ENDPOINTS (6 endpoints)
  // ============================================================================

  globalSearch(query: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/search/global', { query, ...params });
  }

  searchProducts(query: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/search/products', { query, ...params });
  }

  searchShops(query: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/search/shops', { query, ...params });
  }

  searchRequests(query: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/search/requests', { query, ...params });
  }

  searchNiches(query: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/search/niches', { query, ...params });
  }

  searchUsers(query: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/search/users', { query, ...params });
  }

  // ============================================================================
  // ANALYTICS ENDPOINTS (5 endpoints)
  // ============================================================================

  getSellerDashboard(): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/dashboard');
  }

  getSellerSales(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/sales', params);
  }

  getSellerProducts(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/products', params);
  }

  getSellerCustomers(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/customers', params);
  }

  getPlatformAnalytics(): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/admin/platform');
  }

  // ============================================================================
  // ADMIN ENDPOINTS (6 endpoints)
  // ============================================================================

  getAdminUsers(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/admin/users', params);
  }

  updateUserStatus(userId: string, statusData: any): Observable<ApiResponse<any>> {
    return this.put<any>(`/admin/users/${userId}/status`, statusData);
  }

  getAdminReports(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/admin/reports', params);
  }

  resolveReport(reportId: string, resolutionData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/admin/reports/${reportId}/resolve`, resolutionData);
  }

  getModerationQueue(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/admin/moderation/queue', params);
  }

  takeModerationAction(actionData: ModerationData): Observable<ApiResponse<any>> {
    return this.post<any>('/admin/moderation/actions', actionData);
  }

  // ============================================================================
  // HEALTH ENDPOINTS (6 endpoints)
  // ============================================================================

  healthCheck(): Observable<ApiResponse<any>> {
    return this.get<any>('/health/');
  }

  detailedHealthCheck(): Observable<ApiResponse<any>> {
    return this.get<any>('/health/detailed');
  }

  readinessCheck(): Observable<ApiResponse<any>> {
    return this.get<any>('/health/ready');
  }

  livenessCheck(): Observable<ApiResponse<any>> {
    return this.get<any>('/health/live');
  }

  getMetrics(): Observable<ApiResponse<any>> {
    return this.get<any>('/health/metrics');
  }

  getStatus(): Observable<ApiResponse<any>> {
    return this.get<any>('/health/status');
  }

  // ============================================================================
  // CORE HTTP METHODS
  // ============================================================================

  /**
   * Make a GET request
   */
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    const httpParams = this.buildHttpParams(params);
    
    return this.http.get<ApiResponse<T>>(url, { 
      params: httpParams,
      ...this.httpOptions
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.post<ApiResponse<T>>(url, data, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.put<ApiResponse<T>>(url, data, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a PATCH request
   */
  patch<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.patch<ApiResponse<T>>(url, data, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.delete<ApiResponse<T>>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload a single file
   */
  upload<T>(endpoint: string, file: File, data?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, String(data[key]));
      });
    }
    
    return this.http.post<ApiResponse<T>>(url, formData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload multiple files
   */
  uploadMultiple<T>(endpoint: string, files: File[], data?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, String(data[key]));
      });
    }
    
    return this.http.post<ApiResponse<T>>(url, formData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Build HTTP parameters from object
   */
  private buildHttpParams(params?: Record<string, unknown>): HttpParams {
    if (!params) {
      return new HttpParams();
    }
    
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item !== null && item !== undefined) {
            httpParams = httpParams.append(key, item.toString());
            }
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });
    
    return httpParams;
  }

  /**
   * Get full URL for endpoint
   */
  private getUrl(endpoint: string): string {
    return `${this.API_BASE_URL}${endpoint}`;
  }

  /**
   * Handle HTTP errors with server-driven approach
   */
  private handleError = (error: any): Observable<never> => {
    // Prioritize server-provided error messages
    let errorMessage = this.extractServerErrorMessage(error);
    
    // Fallback to status-based messages only if server didn't provide one
    if (!errorMessage) {
      errorMessage = this.getStatusBasedErrorMessage(error);
    } 
    
    console.error('API Error:', error);
    const enriched = new Error(errorMessage) as any;
    enriched.status = error?.status;
    enriched.body = error?.error;
    enriched.url = error?.url; 
    return throwError(() => enriched);
  }

  /**
   * Extract error message from server response
   */
  private extractServerErrorMessage(error: any): string | null {
    // Check for server-provided error messages in various formats
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.error) {
      return error.error.error;
    }
    if (error.error?.detail) {
      return error.error.detail;
    }
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join(', ');
    }
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }
    return null;
  }

  /**
   * Get status-based error messages (fallback)
   */
  private getStatusBasedErrorMessage(error: any): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'Access denied. You do not have permission to perform this action.',
      404: 'Resource not found.',
      409: 'Conflict. The resource already exists.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.'
    };

    // Special handling for specific endpoints
    if (error.status === 500) {
      if (error?.url?.includes('/users/register')) {
        return 'Internal server error during registration. Please try a different username/email or try again shortly.';
      }
      if (error?.url?.includes('/users/login')) {
        return 'Internal server error during login. Please try again shortly.';
      }
    }

    if (error.status === 0) {
      return 'Network error. Please check your internet connection.';
    }

    return statusMessages[error.status] || 'An unexpected error occurred.';
  }

  // ============================================================================
  // SOCIAL ENDPOINTS (Additional methods)
  // ============================================================================

  createPost(postData: PostData): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/posts', postData);
  }

  getPost(postId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/posts/${postId}`);
  }

  updatePost(postId: string, postData: PostData): Observable<ApiResponse<any>> {
    return this.put<any>(`/socials/posts/${postId}`, postData);
  }

  deletePost(postId: string): Observable<ApiResponse<any>> {
    return this.delete<any>(`/socials/posts/${postId}`);
  }

  togglePostLike(postId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/posts/${postId}/like`);
  }

  getPostComments(postId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/posts/${postId}/comments`, params);
  }

  addComment(postId: string, commentData: CommentData): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/posts/${postId}/comments`, commentData);
  }

  updateComment(commentId: string, commentData: CommentData): Observable<ApiResponse<any>> {
    return this.put<any>(`/socials/comments/${commentId}`, commentData);
  }

  deleteComment(commentId: string): Observable<ApiResponse<any>> {
    return this.delete<any>(`/socials/comments/${commentId}`);
  }

  createNichePost(nicheId: string, postData: PostData): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/niches/${nicheId}/posts`, postData);
  }

  getNichePosts(nicheId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/niches/${nicheId}/posts`, params);
  }

  approveNichePost(nichePostId: string, approvalData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/niches/posts/${nichePostId}/approve`, approvalData);
  }

  markMessagesAsRead(roomId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/chats/rooms/${roomId}/read`);
  }

  // ============================================================================
  // ADDITIONAL MISSING ENDPOINTS
  // ============================================================================

  // User Management - Missing methods
  getMyOffers(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/my-offers');
  }

  getMyReviews(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/my-reviews');
  }

  getUserProfile(userId: string): Observable<ApiResponse<User>> {
    return this.get<User>(`/users/${userId}/profile`);
  }

  getUserProducts(userId: string): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.get<PaginatedResponse<Product>>(`/users/${userId}/products`);
  }

  getUserReviews(userId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/users/${userId}/reviews`);
  }

  getUserAddresses(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/addresses');
  }

  changePassword(passwordData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/users/change-password', passwordData);
  }

  deleteAccount(): Observable<ApiResponse<any>> {
    return this.delete<any>('/users/account');
  }

  // Settings Management - Missing methods
  getPrivacySettings(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/privacy-settings');
  }

  updatePrivacySettings(settings: any): Observable<ApiResponse<any>> {
    return this.patch<any>('/users/privacy-settings', settings);
  }

  getNotificationSettings(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/notification-settings');
  }

  updateNotificationSettings(settings: any): Observable<ApiResponse<any>> {
    return this.patch<any>('/users/notification-settings', settings);
  }

  // Analytics - Missing methods
  getSalesAnalytics(): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/sales');
  }

  getProductAnalytics(): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/products');
  }

  getCustomerAnalytics(): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/customers');
  }

  getSellerAnalytics(): Observable<ApiResponse<any>> {
    return this.get<any>('/analytics/seller/dashboard');
  }

  // Social - Missing methods
  getSocialFeed(): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/feed');
  }

  // Onboarding - Missing methods
  completeOnboarding(onboardingData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/users/onboarding', onboardingData);
  }

  // Marketplace - Missing methods
  getMarketplaceProducts(): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.get<PaginatedResponse<Product>>('/products/marketplace');
  }

  getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
    return this.get<Product[]>('/products/featured');
  }

  getTrendingRequests(): Observable<ApiResponse<any[]>> {
    return this.get<any[]>('/requests/trending');
  }

  getCommunityHighlights(): Observable<ApiResponse<any[]>> {
    return this.get<any[]>('/socials/community/highlights');
  }

  // Community - Missing methods
  getCommunityFeed(): Observable<ApiResponse<any>> {
    return this.get<any>('/socials/community/feed');
  }

  likeCommunityPost(postId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/community/posts/${postId}/like`);
  }

  commentOnCommunityPost(postId: string, commentData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/community/posts/${postId}/comments`, commentData);
  }

  // Chat - Missing methods
  getChatList(): Observable<ApiResponse<any>> {
    return this.get<any>('/chats/list');
  }

  getChatRoom(roomId: string): Observable<ApiResponse<ChatRoom>> {
    return this.get<ChatRoom>(`/chats/rooms/${roomId}`);
  }

  // Orders - Missing methods
  getMyOrders(params?: any): Observable<ApiResponse<PaginatedResponse<Order>>> {
    return this.get<PaginatedResponse<Order>>('/orders/my-orders', params);
  }

  // Additional missing methods
  getSimilarProducts(productId: string): Observable<ApiResponse<Product[]>> {
    return this.get<Product[]>(`/products/${productId}/similar`);
  }

  commentOnPost(postId: string, commentData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/posts/${postId}/comments`, commentData);
  }

  toggleWishlist(productId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/products/${productId}/wishlist`);
  }

  // Social Post Reactions
  likePost(postId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/socials/posts/${postId}/like`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  unlikePost(postId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_BASE_URL}/socials/posts/${postId}/like`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Cart Management
  removeFromCart(itemId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_BASE_URL}/cart/items/${itemId}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}