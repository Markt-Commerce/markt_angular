import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ErrorResponse,
  User,
  Product,
  Order,
  Cart,
  BuyerRequest,
  Media,
  Category,
  Niche,
  Post,
  Payment,
  Notification,
  ChatRoom,
  ChatMessage
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'https://test.api.marktcommerce.com/api/v1';

  // ============================================================================
  // USER ENDPOINTS (25 endpoints)
  // ============================================================================

  // Authentication
  register(userData: any): Observable<ApiResponse<User>> {
    return this.post<User>('/users/register', userData);
  }

  login(credentials: any): Observable<ApiResponse<User>> {
    return this.post<User>('/users/login', credentials);
  }

  logout(): Observable<ApiResponse<void>> {
    return this.post<void>('/users/logout');
  }

  // Profile Management
  getProfile(): Observable<ApiResponse<User>> {
    return this.get<User>('/users/profile');
  }

  updateProfile(profileData: any): Observable<ApiResponse<User>> {
    return this.patch<User>('/users/profile', profileData);
  }

  createBuyerAccount(buyerData: any): Observable<ApiResponse<User>> {
    return this.post<User>('/users/create-buyer', buyerData);
  }

  createSellerAccount(sellerData: any): Observable<ApiResponse<User>> {
    return this.post<User>('/users/create-seller', sellerData);
  }

  updateBuyerProfile(buyerData: any): Observable<ApiResponse<User>> {
    return this.patch<User>('/users/profile/buyer', buyerData);
  }

  updateSellerProfile(sellerData: any): Observable<ApiResponse<User>> {
    return this.patch<User>('/users/profile/seller', sellerData);
  }

  switchRole(): Observable<ApiResponse<any>> {
    return this.post<any>('/users/switch-role');
  }

  // Password & Email Management
  passwordReset(email: string): Observable<ApiResponse<any>> {
    return this.post<any>('/users/password-reset', { email });
  }

  passwordResetConfirm(data: any): Observable<ApiResponse<any>> {
    return this.post<any>('/users/password-reset/confirm', data);
  }

  sendEmailVerification(email: string): Observable<ApiResponse<any>> {
    return this.post<any>('/users/email-verification/send', { email });
  }

  verifyEmail(data: any): Observable<ApiResponse<any>> {
    return this.post<any>('/users/email-verification/verify', data);
  }

  // User Management
  getUsers(params?: any): Observable<ApiResponse<PaginatedResponse<User>>> {
    return this.get<PaginatedResponse<User>>('/users/', params);
  }

  getUserSettings(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/settings');
  }

  updateUserSettings(settings: any): Observable<ApiResponse<any>> {
    return this.patch<any>('/users/settings', settings);
  }

  uploadProfilePicture(file: File): Observable<ApiResponse<Media>> {
    return this.upload<Media>('/users/profile/picture', file);
  }

  getPublicProfile(userId: string): Observable<ApiResponse<User>> {
    return this.get<User>(`/users/${userId}/public`);
  }

  // Shop Discovery
  getShops(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/users/shops', params);
  }

  getTrendingShops(): Observable<ApiResponse<any>> {
    return this.get<any>('/users/shops/trending');
  }

  getShopCategories(): Observable<ApiResponse<Category[]>> {
    return this.get<Category[]>('/users/shops/categories');
  }

  getShopDetails(shopId: number): Observable<ApiResponse<any>> {
    return this.get<any>(`/users/shops/${shopId}`);
  }

  checkUsername(username: string): Observable<ApiResponse<any>> {
    return this.get<any>('/users/check-username', { username });
  }

  // ============================================================================
  // PRODUCT ENDPOINTS (15 endpoints)
  // ============================================================================

  getProducts(params?: any): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.get<PaginatedResponse<Product>>('/products/', params);
  }

  createProduct(productData: any): Observable<ApiResponse<Product>> {
    return this.post<Product>('/products/', productData);
  }

  getProduct(productId: string): Observable<ApiResponse<Product>> {
    return this.get<Product>(`/products/${productId}`);
  }

  updateProduct(productId: string, productData: any): Observable<ApiResponse<Product>> {
    return this.put<Product>(`/products/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/products/${productId}`);
  }

  bulkCreateProducts(products: any[]): Observable<ApiResponse<any>> {
    return this.post<any>('/products/bulk', products);
  }

  getTrendingProducts(params?: any): Observable<ApiResponse<Product[]>> {
    return this.get<Product[]>('/products/trending', params);
  }

  getRecommendedProducts(params?: any): Observable<ApiResponse<Product[]>> {
    return this.get<Product[]>('/products/recommended', params);
  }

  getProductReviews(productId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/products/${productId}/reviews`, params);
  }

  createProductReview(productId: string, reviewData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/products/${productId}/reviews`, reviewData);
  }

  upvoteReview(reviewId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/products/reviews/${reviewId}/upvote`);
  }

  trackProductView(productId: string): Observable<ApiResponse<void>> {
    return this.post<void>(`/products/${productId}/view`);
  }

  shareProduct(productId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/products/${productId}/share`);
  }

  getMyProducts(params?: any): Observable<ApiResponse<PaginatedResponse<Product>>> {
    return this.get<PaginatedResponse<Product>>('/products/seller/my-products', params);
  }

  // ============================================================================
  // ORDER ENDPOINTS (10 endpoints)
  // ============================================================================

  getOrders(): Observable<ApiResponse<Order[]>> {
    return this.get<Order[]>('/orders/');
  }

  createOrder(orderData: any): Observable<ApiResponse<Order>> {
    return this.post<Order>('/orders/', orderData);
  }

  payOrder(orderId: string, paymentData: any): Observable<ApiResponse<Order>> {
    return this.post<Order>(`/orders/${orderId}/pay`, paymentData);
  }

  getOrder(orderId: string): Observable<ApiResponse<Order>> {
    return this.get<Order>(`/orders/${orderId}`);
  }

  getSellerOrders(params?: any): Observable<ApiResponse<any>> {
    return this.get<any>('/orders/seller', params);
  }

  getSellerOrderStats(): Observable<ApiResponse<any>> {
    return this.get<any>('/orders/seller/stats');
  }

  updateOrderItemStatus(orderItemId: number, statusData: any): Observable<ApiResponse<any>> {
    return this.patch<any>(`/orders/seller/items/${orderItemId}`, statusData);
  }

  trackOrder(orderId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/orders/${orderId}/track`);
  }

  reviewOrder(orderId: string, reviewData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/orders/${orderId}/review`, reviewData);
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

  addToCart(cartData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/cart/add', cartData);
  }

  updateCartItem(itemId: string, quantityData: any): Observable<ApiResponse<any>> {
    return this.put<any>(`/cart/items/${itemId}`, quantityData);
  }

  removeCartItem(itemId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/cart/items/${itemId}`);
  }

  checkoutCart(checkoutData: any): Observable<ApiResponse<Order>> {
    return this.post<Order>('/cart/checkout', checkoutData);
  }

  getCartSummary(): Observable<ApiResponse<any>> {
    return this.get<any>('/cart/summary');
  }

  applyCoupon(couponData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/cart/coupon', couponData);
  }

  // ============================================================================
  // REQUEST ENDPOINTS (12 endpoints)
  // ============================================================================

  getRequests(params?: any): Observable<ApiResponse<PaginatedResponse<any>>> {
    return this.get<PaginatedResponse<any>>('/requests/', params);
  }

  createRequest(requestData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/requests/', requestData);
  }

  getMyRequests(params?: any): Observable<ApiResponse<PaginatedResponse<any>>> {
    return this.get<PaginatedResponse<any>>('/requests/my-requests', params);
  }

  getRequest(requestId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/requests/${requestId}`);
  }

  updateRequest(requestId: string, requestData: any): Observable<ApiResponse<any>> {
    return this.put<any>(`/requests/${requestId}`, requestData);
  }

  deleteRequest(requestId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/requests/${requestId}`);
  }

  updateRequestStatus(requestId: string, statusData: any): Observable<ApiResponse<any>> {
    return this.put<any>(`/requests/${requestId}/status`, statusData);
  }

  upvoteRequest(requestId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/requests/${requestId}/upvote`);
  }

  getRequestOffers(requestId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/requests/${requestId}/offers`);
  }

  createOffer(requestId: string, offerData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/requests/${requestId}/offers`, offerData);
  }

  acceptOffer(offerId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/requests/offers/${offerId}/accept`);
  }

  rejectOffer(offerId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/requests/offers/${offerId}/reject`);
  }

  withdrawOffer(offerId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/requests/offers/${offerId}/withdraw`);
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

  optimizeForSocial(mediaId: number, optimizationData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/media/${mediaId}/social-optimize`, optimizationData);
  }

  removeBackground(mediaId: number): Observable<ApiResponse<any>> {
    return this.post<any>(`/media/${mediaId}/remove-background`);
  }

  getMediaList(params?: any): Observable<ApiResponse<any>> {
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

  generateVariants(mediaId: number, variantData: any): Observable<ApiResponse<any>> {
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

  createCategory(categoryData: any): Observable<ApiResponse<Category>> {
    return this.post<Category>('/categories/', categoryData);
  }

  getCategory(categoryId: number): Observable<ApiResponse<Category>> {
    return this.get<Category>(`/categories/${categoryId}`);
  }

  updateCategory(categoryId: number, categoryData: any): Observable<ApiResponse<Category>> {
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

  createNiche(nicheData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/niches', nicheData);
  }

  getNiche(nicheId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/niches/${nicheId}`);
  }

  updateNiche(nicheId: string, nicheData: any): Observable<ApiResponse<any>> {
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

  moderateNiche(nicheId: string, moderationData: any): Observable<ApiResponse<any>> {
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

  addCommentReaction(commentId: string, reactionData: any): Observable<ApiResponse<any>> {
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

  createPayment(paymentData: any): Observable<ApiResponse<Payment>> {
    return this.post<Payment>('/payments/create', paymentData);
  }

  processPayment(paymentId: string, paymentData: any): Observable<ApiResponse<Payment>> {
    return this.post<Payment>(`/payments/${paymentId}/process`, paymentData);
  }

  verifyPayment(paymentId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/payments/${paymentId}/verify`);
  }

  getPayment(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.get<Payment>(`/payments/${paymentId}`);
  }

  handlePaystackWebhook(webhookData: any): Observable<ApiResponse<any>> {
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

  createStory(storyData: any): Observable<ApiResponse<any>> {
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

  createCollection(collectionData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/collections', collectionData);
  }

  getCollection(collectionId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/collections/${collectionId}`);
  }

  updateCollection(collectionId: string, collectionData: any): Observable<ApiResponse<any>> {
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
    return this.post<any>(`/chat/rooms/${roomId}/pin`);
  }

  muteChatRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/chat/rooms/${roomId}/mute`);
  }

  archiveChatRoom(roomId: string): Observable<ApiResponse<any>> {
    return this.post<any>(`/chat/rooms/${roomId}/archive`);
  }

  deleteChatRoom(roomId: string): Observable<ApiResponse<void>> {
    return this.delete<void>(`/chat/rooms/${roomId}`);
  }

  // ============================================================================
  // CHAT ENDPOINTS - MESSAGE REACTIONS (3 endpoints)
  // ============================================================================

  getMessageReactions(messageId: string): Observable<ApiResponse<any[]>> {
    return this.get<any[]>(`/chat/messages/${messageId}/reactions`);
  }

  addMessageReaction(messageId: string, reactionData: any): Observable<ApiResponse<any>> {
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

  takeModerationAction(actionData: any): Observable<ApiResponse<any>> {
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
      params: httpParams
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.post<ApiResponse<T>>(url, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.put<ApiResponse<T>>(url, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a PATCH request
   */
  patch<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.patch<ApiResponse<T>>(url, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.delete<ApiResponse<T>>(url).pipe(
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
    
    return this.http.post<ApiResponse<T>>(url, formData).pipe(
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
    
    return this.http.post<ApiResponse<T>>(url, formData).pipe(
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
            httpParams = httpParams.append(key, item.toString());
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
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.status === 422) {
      errorMessage = 'Validation error. Please check your input.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================================================
  // SOCIAL ENDPOINTS (Additional methods)
  // ============================================================================

  createPost(postData: any): Observable<ApiResponse<any>> {
    return this.post<any>('/socials/posts', postData);
  }

  getPost(postId: string): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/posts/${postId}`);
  }

  updatePost(postId: string, postData: any): Observable<ApiResponse<any>> {
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

  addComment(postId: string, commentData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/posts/${postId}/comments`, commentData);
  }

  updateComment(commentId: string, commentData: any): Observable<ApiResponse<any>> {
    return this.put<any>(`/socials/comments/${commentId}`, commentData);
  }

  deleteComment(commentId: string): Observable<ApiResponse<any>> {
    return this.delete<any>(`/socials/comments/${commentId}`);
  }

  createNichePost(nicheId: string, postData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/niches/${nicheId}/posts`, postData);
  }

  getNichePosts(nicheId: string, params?: any): Observable<ApiResponse<any>> {
    return this.get<any>(`/socials/niches/${nicheId}/posts`, params);
  }

  approveNichePost(nichePostId: string, approvalData: any): Observable<ApiResponse<any>> {
    return this.post<any>(`/socials/niches/posts/${nichePostId}/approve`, approvalData);
  }

  markMessagesAsRead(roomId: string, messageIds: string[]): Observable<ApiResponse<any>> {
    return this.post<any>(`/chats/rooms/${roomId}/messages/read`, { message_ids: messageIds });
  }
}