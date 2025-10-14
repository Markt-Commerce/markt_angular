/**
 * Route-to-State Dependency Map
 * 
 * This file maps each application route to its state dependencies.
 * It serves as documentation and enables:
 * - Understanding which services a route depends on
 * - Identifying which signals need to be initialized
 * - Determining caching and real-time requirements
 * - Generating dev dashboards and documentation
 * 
 * @see routes.config.ts for route definitions
 */

import { ROUTES_ABSOLUTE } from './routes.config';

/**
 * Metadata for route state dependencies
 */
export interface RouteStateMeta {
  /** Service classes that own state for this route */
  services: string[];
  
  /** Specific signals/state keys accessed by the route */
  signals: string[];
  
  /** Whether route requires real-time updates */
  realtime: boolean;
  
  /** Cache strategy: 'session' | 'memory' | 'none' | 'persistent' */
  cache: 'session' | 'memory' | 'none' | 'persistent';
  
  /** Optional: human-readable description */
  description?: string;
  
  /** Optional: preload priority (higher = load earlier) */
  preloadPriority?: number;
  
  /** Optional: requires authentication */
  requiresAuth?: boolean;
  
  /** Optional: required user role */
  requiredRole?: 'buyer' | 'seller' | 'admin';
}

/**
 * Complete route-to-state mapping
 * Keys must match route paths from ROUTES_ABSOLUTE
 */
export const ROUTE_STATE_MAP: Record<string, RouteStateMeta> = {
  // ============================================
  // Public Routes (No Auth Required)
  // ============================================
  
  [ROUTES_ABSOLUTE.LANDING]: {
    services: [],
    signals: [],
    realtime: false,
    cache: 'none',
    description: 'Landing page - public marketing content',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.DEV_NAVIGATION]: {
    services: [],
    signals: [],
    realtime: false,
    cache: 'none',
    description: 'Development navigation helper',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.LEGAL.TERMS]: {
    services: [],
    signals: [],
    realtime: false,
    cache: 'persistent',
    description: 'Terms and conditions',
    requiresAuth: false,
  },
  
  // ============================================
  // Auth Routes (Guest Only - redirects if logged in)
  // ============================================
  
  [ROUTES_ABSOLUTE.AUTH.LOGIN]: {
    services: ['AuthService'],
    signals: ['isAuthenticated', 'loginError', 'isLoading'],
    realtime: false,
    cache: 'none',
    description: 'User login',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.AUTH.REGISTER]: {
    services: ['AuthService'],
    signals: ['isAuthenticated', 'registerError', 'isLoading'],
    realtime: false,
    cache: 'none',
    description: 'User registration',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.AUTH.FORGOT_PASSWORD]: {
    services: ['AuthService'],
    signals: ['resetPasswordStatus'],
    realtime: false,
    cache: 'none',
    description: 'Password recovery flow',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.AUTH.VERIFY_EMAIL]: {
    services: ['AuthService'],
    signals: ['verificationStatus'],
    realtime: false,
    cache: 'none',
    description: 'Email verification',
    requiresAuth: false,
  },
  
  // ============================================
  // App Routes (Authenticated)
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.DASHBOARD]: {
    services: ['AuthService', 'DashboardService', 'NotificationService'],
    signals: ['user', 'currentRole', 'recentActivity', 'notifications'],
    realtime: true,
    cache: 'session',
    description: 'Main dashboard - role-aware content',
    requiresAuth: true,
    preloadPriority: 10,
  },
  
  [ROUTES_ABSOLUTE.APP.MARKETPLACE]: {
    services: ['MarketplaceService', 'CategoryService', 'AuthService'],
    signals: ['products', 'categories', 'searchQuery', 'filters', 'isAuthenticated'],
    realtime: false,
    cache: 'session',
    description: 'Product marketplace with search and filters',
    requiresAuth: false, // Public browsing allowed
    preloadPriority: 9,
  },
  
  [ROUTES_ABSOLUTE.APP.CART]: {
    services: ['CartService', 'AuthService'],
    signals: ['cart', 'cartItems', 'totalPrice', 'user'],
    realtime: false,
    cache: 'session',
    description: 'Shopping cart',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.CHECKOUT]: {
    services: ['CartService', 'OrderService', 'AuthService', 'PaymentService'],
    signals: ['cart', 'shippingAddress', 'paymentMethod', 'orderStatus'],
    realtime: false,
    cache: 'none',
    description: 'Checkout flow',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.COMMUNITY]: {
    services: ['CommunityService', 'AuthService'],
    signals: ['posts', 'discussions', 'user', 'isAuthenticated'],
    realtime: true,
    cache: 'session',
    description: 'Community discussions and posts',
    requiresAuth: false, // Public browsing allowed
  },
  
  [ROUTES_ABSOLUTE.APP.PROFILE]: {
    services: ['AuthService', 'ProfileService'],
    signals: ['user', 'profileData', 'userStats'],
    realtime: false,
    cache: 'session',
    description: 'User profile view',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.SETTINGS]: {
    services: ['AuthService', 'SettingsService'],
    signals: ['user', 'preferences', 'notificationSettings'],
    realtime: false,
    cache: 'session',
    description: 'User settings and preferences',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.NOTIFICATIONS]: {
    services: ['NotificationService', 'AuthService'],
    signals: ['notifications', 'unreadCount', 'user'],
    realtime: true,
    cache: 'memory',
    description: 'Notification center',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.CHAT]: {
    services: ['ChatService', 'RealtimeService', 'NotificationService', 'AuthService'],
    signals: ['conversations', 'activeConversation', 'messages', 'unreadCount', 'onlineStatus'],
    realtime: true,
    cache: 'memory',
    description: 'Real-time chat',
    requiresAuth: true,
    preloadPriority: 8,
  },
  
  // ============================================
  // Orders Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.ORDERS.ROOT]: {
    services: ['OrderService', 'AuthService'],
    signals: ['orders', 'currentRole', 'user'],
    realtime: false,
    cache: 'session',
    description: 'Order list (role-aware)',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.ORDERS.BUYER]: {
    services: ['OrderService', 'AuthService'],
    signals: ['buyerOrders', 'user'],
    realtime: false,
    cache: 'session',
    description: 'Buyer order history',
    requiresAuth: true,
    requiredRole: 'buyer',
  },
  
  [ROUTES_ABSOLUTE.APP.ORDERS.SELLER]: {
    services: ['OrderService', 'AuthService'],
    signals: ['sellerOrders', 'user'],
    realtime: true,
    cache: 'session',
    description: 'Seller order management',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  // Note: Order details use :id param - mapped generically
  '/app/orders/details/:id': {
    services: ['OrderService', 'AuthService', 'TrackingService'],
    signals: ['currentOrder', 'orderStatus', 'trackingInfo', 'user'],
    realtime: true,
    cache: 'memory',
    description: 'Order detail view with tracking',
    requiresAuth: true,
  },
  
  // ============================================
  // Seller Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.SELLER.ROOT]: {
    services: ['SellerService', 'AuthService'],
    signals: ['shop', 'user', 'verificationStatus'],
    realtime: false,
    cache: 'session',
    description: 'Seller hub',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  [ROUTES_ABSOLUTE.APP.SELLER.DASHBOARD]: {
    services: ['SellerService', 'AnalyticsService', 'OrderService', 'AuthService'],
    signals: ['shop', 'salesStats', 'recentOrders', 'revenue'],
    realtime: true,
    cache: 'session',
    description: 'Seller dashboard with analytics',
    requiresAuth: true,
    requiredRole: 'seller',
    preloadPriority: 7,
  },
  
  [ROUTES_ABSOLUTE.APP.SELLER.LISTINGS]: {
    services: ['SellerService', 'ProductService', 'AuthService'],
    signals: ['sellerProducts', 'shop'],
    realtime: false,
    cache: 'session',
    description: 'Seller listing management',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  [ROUTES_ABSOLUTE.APP.SELLER.LISTINGS_CREATE]: {
    services: ['SellerService', 'ProductService', 'CategoryService'],
    signals: ['categories', 'shop', 'uploadProgress'],
    realtime: false,
    cache: 'none',
    description: 'Create new listing',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  '/app/seller/listings/edit/:id': {
    services: ['SellerService', 'ProductService', 'CategoryService'],
    signals: ['currentProduct', 'categories', 'shop'],
    realtime: false,
    cache: 'memory',
    description: 'Edit existing listing',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  [ROUTES_ABSOLUTE.APP.SELLER.ORDERS]: {
    services: ['OrderService', 'SellerService', 'AuthService'],
    signals: ['sellerOrders', 'shop', 'orderStats'],
    realtime: true,
    cache: 'session',
    description: 'Seller order fulfillment',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  [ROUTES_ABSOLUTE.APP.SELLER.ANALYTICS]: {
    services: ['AnalyticsService', 'SellerService', 'AuthService'],
    signals: ['analyticsData', 'shop', 'dateRange'],
    realtime: false,
    cache: 'session',
    description: 'Seller analytics and insights',
    requiresAuth: true,
    requiredRole: 'seller',
  },
  
  // Note: /seller-verification exists as a top-level route, not under /app/seller
  
  // ============================================
  // Requests Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.REQUESTS.ROOT]: {
    services: ['RequestService', 'AuthService'],
    signals: ['requests', 'user'],
    realtime: true,
    cache: 'session',
    description: 'Product requests list',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.REQUESTS.CREATE]: {
    services: ['RequestService', 'CategoryService', 'AuthService'],
    signals: ['categories', 'user'],
    realtime: false,
    cache: 'none',
    description: 'Create new product request',
    requiresAuth: true,
  },
  
  '/app/requests/details/:id': {
    services: ['RequestService', 'OfferService', 'AuthService'],
    signals: ['currentRequest', 'offers', 'user'],
    realtime: true,
    cache: 'memory',
    description: 'Request detail with offers',
    requiresAuth: true,
  },
  
  // ============================================
  // Offers Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.OFFERS.ROOT]: {
    services: ['OfferService', 'AuthService'],
    signals: ['offers', 'user'],
    realtime: true,
    cache: 'session',
    description: 'Offers overview',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.OFFERS.SENT]: {
    services: ['OfferService', 'AuthService'],
    signals: ['sentOffers', 'user'],
    realtime: true,
    cache: 'session',
    description: 'Sent offers (seller view)',
    requiresAuth: true,
  },
  
  [ROUTES_ABSOLUTE.APP.OFFERS.RECEIVED]: {
    services: ['OfferService', 'AuthService'],
    signals: ['receivedOffers', 'user'],
    realtime: true,
    cache: 'session',
    description: 'Received offers (buyer view)',
    requiresAuth: true,
  },
  
  // ============================================
  // Admin Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.ADMIN.ROOT]: {
    services: ['AdminService', 'AuthService'],
    signals: ['user', 'adminStats'],
    realtime: false,
    cache: 'session',
    description: 'Admin dashboard',
    requiresAuth: true,
    requiredRole: 'admin',
  },
  
  [ROUTES_ABSOLUTE.APP.ADMIN.USERS]: {
    services: ['AdminService', 'UserManagementService', 'AuthService'],
    signals: ['users', 'userStats'],
    realtime: false,
    cache: 'session',
    description: 'User management',
    requiresAuth: true,
    requiredRole: 'admin',
  },
  
  [ROUTES_ABSOLUTE.APP.ADMIN.PRODUCTS]: {
    services: ['AdminService', 'ProductService', 'AuthService'],
    signals: ['products', 'productStats'],
    realtime: false,
    cache: 'session',
    description: 'Product moderation',
    requiresAuth: true,
    requiredRole: 'admin',
  },
  
  [ROUTES_ABSOLUTE.APP.ADMIN.ANALYTICS]: {
    services: ['AdminService', 'AnalyticsService', 'AuthService'],
    signals: ['platformAnalytics', 'revenue', 'growth'],
    realtime: false,
    cache: 'session',
    description: 'Platform analytics',
    requiresAuth: true,
    requiredRole: 'admin',
  },
  
  // ============================================
  // Shops Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.APP.SHOPS.ROOT]: {
    services: ['ShopService', 'AuthService'],
    signals: ['shops', 'isAuthenticated'],
    realtime: false,
    cache: 'session',
    description: 'Shop directory',
    requiresAuth: false,
  },
  
  '/app/shops/:id': {
    services: ['ShopService', 'ProductService', 'AuthService'],
    signals: ['currentShop', 'shopProducts', 'isAuthenticated'],
    realtime: false,
    cache: 'session',
    description: 'Shop detail page',
    requiresAuth: false,
  },
  
  // ============================================
  // Support Routes
  // ============================================
  
  [ROUTES_ABSOLUTE.SUPPORT.ROOT]: {
    services: ['SupportService'],
    signals: [],
    realtime: false,
    cache: 'persistent',
    description: 'Support center',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.SUPPORT.FAQ]: {
    services: ['SupportService'],
    signals: ['faqItems'],
    realtime: false,
    cache: 'persistent',
    description: 'FAQ page',
    requiresAuth: false,
  },
  
  [ROUTES_ABSOLUTE.SUPPORT.CONTACT]: {
    services: ['SupportService', 'AuthService'],
    signals: ['user', 'contactFormStatus'],
    realtime: false,
    cache: 'none',
    description: 'Contact form',
    requiresAuth: false,
  },
};

/**
 * Helper: Get state metadata for a route
 */
export function getRouteStateMeta(route: string): RouteStateMeta | null {
  // Direct match
  if (ROUTE_STATE_MAP[route]) {
    return ROUTE_STATE_MAP[route];
  }
  
  // Try parameterized route patterns
  for (const [pattern, meta] of Object.entries(ROUTE_STATE_MAP)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(route)) {
        return meta;
      }
    }
  }
  
  return null;
}

/**
 * Helper: Get all routes that depend on a specific service
 */
export function getRoutesByService(serviceName: string): string[] {
  return Object.entries(ROUTE_STATE_MAP)
    .filter(([_, meta]) => meta.services.includes(serviceName))
    .map(([route]) => route);
}

/**
 * Helper: Get all real-time routes
 */
export function getRealtimeRoutes(): string[] {
  return Object.entries(ROUTE_STATE_MAP)
    .filter(([_, meta]) => meta.realtime)
    .map(([route]) => route);
}

/**
 * Helper: Get routes by required role
 */
export function getRoutesByRole(role: 'buyer' | 'seller' | 'admin'): string[] {
  return Object.entries(ROUTE_STATE_MAP)
    .filter(([_, meta]) => meta.requiredRole === role)
    .map(([route]) => route);
}

/**
 * Statistics about the route-state map
 */
export function getRouteStateStats() {
  const routes = Object.values(ROUTE_STATE_MAP);
  
  return {
    totalRoutes: routes.length,
    realtimeRoutes: routes.filter(r => r.realtime).length,
    authRequiredRoutes: routes.filter(r => r.requiresAuth).length,
    buyerRoutes: routes.filter(r => r.requiredRole === 'buyer').length,
    sellerRoutes: routes.filter(r => r.requiredRole === 'seller').length,
    adminRoutes: routes.filter(r => r.requiredRole === 'admin').length,
    cacheStrategies: {
      session: routes.filter(r => r.cache === 'session').length,
      memory: routes.filter(r => r.cache === 'memory').length,
      persistent: routes.filter(r => r.cache === 'persistent').length,
      none: routes.filter(r => r.cache === 'none').length,
    },
  };
}

