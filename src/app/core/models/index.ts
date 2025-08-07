// Common Models
export interface Pagination {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  first_page: number;
  last_page: number;
  previous_page: number | null;
  next_page: number | null;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: number;
  status?: string;
}

export interface BuyerSimple {
  id: string;
  buyername: string;
  profile_picture_url?: string;
}

// User Models
export interface RegisterResponse {
  user: User;
  token: string;
  message?: string;
}

export interface Address {
  latitude: number;
  longitude: number;
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface BuyerAccount {
  id: string;
  buyername: string;
  shipping_address: Address;
  total_orders: number;
  pending_orders: number;
  last_order_date: string;
  is_active: boolean;
  created_at: string;
}

export interface SellerAccount {
  id: string;
  shop_name: string;
  shop_slug: string;
  description: string;
  policies: Record<string, string>;
  categories: Category[];
  total_products: number;
  total_sales: number;
  total_rating: number;
  average_rating: number;
  total_raters: number;
  verification_status: string;
  is_active: boolean;
  joined_date: string;
  // Additional properties for compilation
  profile_picture_url?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  profile_picture_url?: string;
  address?: Address;
  is_buyer: boolean;
  is_seller: boolean;
  current_role: 'buyer' | 'seller';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  buyer_account?: BuyerAccount;
  seller_account?: SellerAccount;
  // Additional properties for compilation
  first_name?: string;
  last_name?: string;
}

export interface UserProfile extends User {
  address: Address; // Make address required for UserProfile
}

export interface UserLogin {
  email: string;
  password: string;
  account_type: 'buyer' | 'seller';
}

export interface UserRegister {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  account_type: 'buyer' | 'seller';
  seller_data?: {
    shop_name: string;
    description: string;
    category_ids: number[];
    policies: Record<string, string>;
  };
  buyer_data?: {
    buyername: string;
    shipping_address: Address;
  };
}

// Product Models
export interface ProductVariant {
  id: string;
  name: string;
  options: Record<string, string>;
}

export interface ProductImage {
  id: string;
  product_id: string;
  media_id: string;
  sort_order: number;
  is_featured: boolean;
  alt_text?: string;
  media: Media;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  cost_per_item?: number;
  sku?: string;
  barcode?: string;
  stock: number;
  weight?: number;
  status: 'active' | 'inactive' | 'draft';
  seller_id: string;
  category_ids: string[];
  tag_ids: string[];
  media_ids: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  seller: SellerAccount;
  average_rating: number;
  review_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  product_metadata?: Record<string, any>;
  // Additional properties for compilation
  is_verified?: boolean;
  is_featured?: boolean;
  condition?: string;
  currency?: string;
  category?: Category;
}

export interface ProductCreate {
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
  variants?: ProductVariant[];
  product_metadata?: Record<string, any>;
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  content: string;
  is_verified: boolean;
  upvotes: number;
  created_at: string;
  user: User;
}

export interface ProductReviews {
  items: ProductReview[];
  pagination: Pagination;
}

export interface ReviewUpvote {
  success: boolean;
  new_count: number;
}

// Order Models
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  product: Product;
  variant?: ProductVariant;
}

export type OrderItemStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  cart_id: string;
  shipping_address: Address;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  customer_note?: string;
  created_at: string;
  items: OrderItem[];
  buyer: BuyerSimple;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderCreate {
  cart_id: string;
  shipping_address: Address;
  payment_method: string;
  customer_note?: string;
}

// Cart Models
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product_price: number;
  product: Product;
}

export interface Cart {
  id: string;
  buyer_id: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  coupon_code?: string;
  expires_at: string;
  // Additional properties for compilation
  item_count?: number;
}

export interface AddToCart {
  product_id: string;
  variant_id?: string;
  quantity?: number;
}

export interface UpdateCartItem {
  quantity: number;
}

export interface Checkout {
  shipping_address: Address;
  billing_address: Address;
  notes?: string;
}

export interface CartSummary {
  item_count: number;
  subtotal: number;
  discount: number;
  total: number;
}

// Request Models
export interface BuyerRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  budget?: number;
  expires_at?: string;
  status: RequestStatus;
  category_ids: string[];
  media_ids: string[];
  images: RequestImage[];
  categories: Category[];
  offers: SellerOffer[];
  views: number;
  upvotes: number;
  request_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  user: User;
}

export type RequestStatus = 'OPEN' | 'FULFILLED' | 'CLOSED' | 'EXPIRED';

export interface BuyerRequestCreate {
  title: string;
  description: string;
  budget?: number;
  expires_at?: string;
  category_ids: string[];
  media_ids?: string[];
  metadata?: Record<string, any>;
}

export interface BuyerRequestUpdate extends Partial<BuyerRequestCreate> {}

export interface RequestImage {
  id: string;
  request_id: string;
  media_id: string;
  is_primary: boolean;
  media: Media;
}

export interface SellerOffer {
  id: string;
  request_id: string;
  seller_id: string;
  product_id?: string;
  price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  product?: Product;
  seller: SellerAccount;
}

export interface SellerOfferCreate {
  product_id?: string;
  price: number;
  message: string;
}

// Media Models
export interface MediaVariant {
  id: string;
  variant_type: string;
  quality: string;
  width: number;
  height: number;
  format: string;
  file_size: number;
  url: string;
  storage_key: string;
  processing_time: number;
}

export interface Media {
  id: string;
  user_id: string;
  original_filename: string;
  original_url: string;
  thumbnail_url: string;
  mobile_url: string;
  tablet_url: string;
  desktop_url: string;
  social_square_url: string;
  social_post_url: string;
  social_story_url: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video';
  duration?: number;
  alt_text?: string;
  caption?: string;
  is_public: boolean;
  background_removed: boolean;
  compression_quality?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  storage_key: string;
  exif_data?: Record<string, any>;
  variants: MediaVariant[];
  created_at: string;
  updated_at: string;
  // Additional properties for compilation
  url?: string;
}

export interface MediaUploadResponse {
  success: boolean;
  message: string;
  media: Media;
  urls: Record<string, string>;
  variants: MediaVariant[];
  processing_time: number;
}

export interface MediaDelete {
  success: boolean;
  message: string;
  deleted_files: string[];
}

export interface MediaList {
  media: Media[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface MediaStats {
  total_media: number;
  total_images: number;
  total_videos: number;
  total_size: number;
  average_file_size: number;
  processing_time_avg: number;
  variants_generated: number;
}

export interface SocialMediaOptimization {
  platform: string;
  post_type: string;
  aspect_ratio?: number;
}

export interface SocialMediaOptimizationResponse {
  original_url: string;
  optimized_url: string;
  platform: string;
  post_type: string;
  dimensions: { width: number; height: number };
  file_size: number;
}

// Category Models
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  children: CategoryTree[];
}

export interface CategoryCreate {
  name: string;
  description?: string;
  parent_id?: string;
  is_active?: boolean;
}

export interface CategoryProducts {
  category: Category;
  products: Product[];
  pagination: Pagination;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

// Social Models
export interface Niche {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: Category;
  categories: Category[];
  tags: string[];
  visibility: 'public' | 'private' | 'restricted';
  max_members?: number;
  member_count: number;
  post_count: number;
  allow_buyer_posts: boolean;
  allow_seller_posts: boolean;
  require_approval: boolean;
  rules: string[];
  settings: Record<string, any>;
  status: 'active' | 'inactive' | 'moderated';
  created_at: string;
  updated_at: string;
}

export interface NicheCreate {
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
  settings?: Record<string, any>;
}

export interface NicheUpdate extends Partial<NicheCreate> {}

export interface NicheMembership {
  id: string;
  niche_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  is_active: boolean;
  is_banned: boolean;
  banned_until?: string;
  ban_reason?: string;
  post_count: number;
  comment_count: number;
  last_activity: string;
  joined_at: string;
  invited_by?: string;
  inviter?: User;
  niche: Niche;
  user: User;
}

export interface NicheMembershipSearchResult {
  items: NicheMembership[];
  pagination: Pagination;
}

export interface Post {
  id: string;
  seller_id: string;
  caption: string;
  categories: Category[];
  social_media: SocialMediaPost[];
  niche_context?: NichePost;
  like_count: number;
  comment_count: number;
  created_at: string;
  seller: SellerAccount;
}

export interface PostCreate {
  caption: string;
  category_ids?: string[];
  media_ids?: string[];
  products?: PostProduct[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface PostUpdate {
  caption?: string;
  category_ids?: string[];
  media_ids?: string[];
  products?: PostProduct[];
  tags?: string[];
  social_media?: SocialMediaPost[];
}

export interface PostProduct {
  product_id: string;
}

export interface SocialMediaPost {
  id: string;
  post_id: string;
  media_id: string;
  platform: string;
  post_type: string;
  aspect_ratio?: number;
  optimized_for_platform: boolean;
  sort_order: number;
  media: Media;
}

export interface PostDetail extends Post {
  products: Product[];
  social_media: SocialMediaPost[];
  niche_context?: NichePost;
}

export interface PostDetailSearchResult {
  items: PostDetail[];
  pagination: Pagination;
}

export interface NichePost {
  id: string;
  niche_id: string;
  post_id: string;
  niche: Niche;
  post: Post;
  is_approved: boolean;
  is_pinned: boolean;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderated_by?: string;
  moderated_at?: string;
  niche_likes: number;
  niche_comments: number;
  created_at: string;
  updated_at: string;
}

export interface NichePostCreate {
  caption: string;
  products?: PostProduct[];
  social_media?: SocialMediaPost[];
  status?: 'draft' | 'published';
}

export interface NichePostResponse {
  niche_post: NichePost;
  post: Post;
  is_approved: boolean;
  requires_approval: boolean;
}

export interface NichePostList {
  items: NichePost[];
  pagination: Pagination;
}

export interface NichePostApproval {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface PostComments {
  items: PostComment[];
  pagination: Pagination;
}

export interface CommentCreate {
  content: string;
  parent_id?: string;
}

export interface CommentUpdate {
  content: string;
}

export interface PostLike {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  followee_id: string;
  follow_type: 'buyer' | 'seller' | 'both';
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  duration?: number;
  expires_at: string;
  created_at: string;
  user: User;
  // Additional properties for compilation
  caption?: string;
  liked?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface SellerPosts {
  items: Post[];
  pagination: Pagination;
}

// Reaction Models
export interface ReactionSummary {
  reaction_type: string;
  emoji: string;
  count: number;
  has_reacted: boolean;
}

export interface ReactionCreate {
  reaction_type: string;
}

export interface PostCommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: string;
  emoji: string;
  created_at: string;
  user: User;
}

// Chat Models
export interface ChatRoom {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  request_id?: string;
  last_message_at?: string;
  unread_count_buyer: number;
  unread_count_seller: number;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
}

export interface ChatRoomList {
  rooms: ChatRoom[];
  total_items: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CreateChatRoom {
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  request_id?: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  message_data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface ChatMessageList {
  messages: ChatMessage[];
  total_items: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SendMessage {
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  message_data?: Record<string, any>;
}

export interface ChatMessageReactionSummary {
  reaction_type: string;
  emoji: string;
  count: number;
  has_reacted: boolean;
  user_id?: string;
}

export interface ChatMessageReactionCreate {
  reaction_type: string;
}

// Payment Models
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreate {
  order_id: string;
  amount: number;
  currency?: string;
  method?: string;
  metadata?: Record<string, any>;
}

export interface PaymentList {
  payments: Payment[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

// Notification Models
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  // Additional properties for compilation
  duration?: number;
}

export interface NotificationPagination {
  items: Notification[];
  pagination: Pagination;
}

export interface UnreadCount {
  count: number;
}

export interface MarkAsReadRequest {
  notification_ids: string[];
}

export interface MarkAsReadResponse {
  updated: number;
}

// Moderation Models
export interface ModerationAction {
  target_id: string;
  target_user_id: string;
  target_type: string;
  action_type: 'warn' | 'suspend' | 'ban' | 'delete';
  reason: string;
  duration?: number;
  banned_until?: string;
}

export interface NicheModerationAction {
  id: string;
  niche_id: string;
  moderator_id: string;
  target_type: string;
  target_id: string;
  target_user_id?: string;
  action_type: string;
  reason?: string;
  duration?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  moderator: User;
  target_user?: User;
}

// Search Models
export interface ProductSearchParams {
  page?: number;
  search?: string;
  sort_by?: string;
  category_ids?: number[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  locations?: string[];
}

export interface ProductSearchResult {
  items: Product[];
  pagination: Pagination;
}

export interface BuyerRequestSearchResult {
  items: BuyerRequest[];
  pagination: Pagination;
}

export interface SearchFilters {
  query?: string;
  category_ids?: number[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  locations?: string[];
  sort_by?: string;
  // Additional properties for compilation
  search?: string;
}

// Analytics Models
export interface SellerDashboard {
  total_sales: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  recent_orders: Order[];
  top_products: Product[];
  sales_chart: Array<{ date: string; sales: number }>;
}

export interface SellerSales {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  sales_by_period: Array<{ period: string; sales: number; orders: number }>;
}

export interface SellerProducts {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  top_selling_products: Product[];
}

export interface SellerCustomers {
  total_customers: number;
  new_customers: number;
  repeat_customers: number;
  top_customers: Array<{ customer: User; total_spent: number; order_count: number }>;
}

export interface PlatformAnalytics {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  active_sellers: number;
  growth_metrics: Array<{ metric: string; value: number; change: number }>;
}

// Admin Models
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  last_login?: string;
}

export interface AdminReport {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  reporter: User;
}

export interface ModerationQueue {
  items: Array<{
    id: string;
    type: string;
    content: any;
    reported_count: number;
    created_at: string;
  }>;
  pagination: Pagination;
}

// Share Models
export interface Share {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  platform: string;
  created_at: string;
}

// Bulk Models
export interface BulkProductResult {
  success: string[];
  errors: string[];
}

// Review Models
export interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  created_at: string;
}

// Tracking Models
export interface Tracking {
  id: string;
  status: string;
  location?: string;
  timestamp: string;
}

// Settings Models
export interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_online_status: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

export interface SettingsUpdate {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profile_visibility?: 'public' | 'private' | 'friends';
    show_online_status?: boolean;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    currency?: string;
  };
}

// Public Profile Models
export interface PublicProfile {
  id: string;
  username: string;
  profile_picture_url?: string;
  is_buyer: boolean;
  is_seller: boolean;
  buyer_account?: BuyerAccount;
  seller_account?: SellerAccount;
}

// Seller Simple Models
export interface SellerSimple {
  id: string;
  shop_name: string;
  shop_slug: string;
  profile_picture_url?: string;
  total_products: number;
  average_rating: number;
  verification_status: string;
}

// Order Simple Models
export interface OrderSimple {
  id: string;
  order_number: string;
  created_at: string;
  buyer: BuyerSimple;
}

// Product Simple Models
export interface ProductSimple {
  name: string;
  price: number;
  image_url?: string;
}

// User Simple Models
export interface UserSimple {
  id: string;
  username: string;
  profile_picture_url?: string;
}

// User Update Models
export interface UserUpdate {
  profile_picture?: string;
  phone_number?: string;
}

export interface BuyerUpdate {
  buyername?: string;
  shipping_address?: Address;
}

export interface SellerUpdate {
  shop_name?: string;
  description?: string;
  category_ids?: string[];
  policies?: Record<string, string>;
}

// Role Switch Models
export interface RoleSwitch {
  previous_role: 'buyer' | 'seller';
  current_role: 'buyer' | 'seller';
  success: boolean;
  message: string;
  user: User;
}

// Password Reset Models
export interface PasswordReset {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetConfirm {
  email: string;
  code: string;
  new_password: string;
}

// Username Check Models
export interface UsernameAvailable {
  available: boolean;
  message?: string;
}

// Email Verification Models
export interface EmailVerificationSend {
  email: string;
}

export interface EmailVerification {
  email: string;
  verification_code: string;
}

// User Pagination Models
export interface UserPagination {
  items: User[];
  pagination: Pagination;
}

// Settings Models
export interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_online_status: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

export interface SettingsUpdate {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profile_visibility?: 'public' | 'private' | 'friends';
    show_online_status?: boolean;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    currency?: string;
  };
} 

// Additional missing models
export interface StoryCreate {
  media_url: string;
  media_type: 'image' | 'video';
  duration?: number;
  // Additional properties for compilation
  caption?: string;
}

export interface CollectionCreate {
  name: string;
  description?: string;
  is_public?: boolean;
  is_collaborative?: boolean;
}

export interface CollectionUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
  is_collaborative?: boolean;
}

export interface FollowResponse {
  success: boolean;
  message: string;
}

export interface FollowingList {
  items: User[];
  pagination: Pagination; 
}

export interface FollowersList {
  items: User[];
  pagination: Pagination;
}

export interface BookmarkResponse {
  success: boolean;
  message: string;
} 

// Additional missing models for services
export interface BuyerOrder {
  id: string;
  order_number: string;
  seller_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  seller: SellerAccount;
}

export interface SellerOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  product: Product;
} 