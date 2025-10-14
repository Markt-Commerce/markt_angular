/**
 * Centralized Route Constants
 * 
 * Single source of truth for all application routes.
 * Uses relative paths to eliminate duplication and provides type safety.
 * 
 * Usage:
 *   import { ROUTES, buildPath } from '@core-next/config/routes.config';
 *   this.router.navigate([buildPath(ROUTES.AUTH.ROOT, ROUTES.AUTH.LOGIN)]);
 *   // or for absolute paths:
 *   this.router.navigate([ROUTES.ABSOLUTE.AUTH.LOGIN]);
 */

/**
 * Relative route segments
 * Use with buildPath() helper for dynamic construction
 */
export const ROUTES = {
  ROOT: '',
  LANDING: 'landing',
  DEV_NAVIGATION: 'dev-navigation',
  
  AUTH: {
    ROOT: 'auth',
    LOGIN: 'login',
    REGISTER: 'register',
    FORGOT_PASSWORD: 'forgot-password',
    VERIFY_EMAIL: 'verify-email',
  },
  
  APP: {
    ROOT: 'app',
    DASHBOARD: 'dashboard',
    MARKETPLACE: 'marketplace',
    CART: 'cart',
    CHECKOUT: 'checkout',
    COMMUNITY: 'community',
    PROFILE: 'profile',
    SETTINGS: 'settings',
    NOTIFICATIONS: 'notifications',
    CHAT: 'chat',
    
    // Orders
    ORDERS: {
      ROOT: 'orders',
      BUYER: 'buyer',
      SELLER: 'seller',
      DETAILS: 'details', // :id parameter
    },
    
    // Seller routes
    SELLER: {
      ROOT: 'seller',
      DASHBOARD: 'dashboard',
      LISTINGS: 'listings', // Aligned with router: uses "listings" not "products"
      LISTINGS_CREATE: 'listings/create',
      LISTINGS_EDIT: 'listings/edit', // :id parameter
      ORDERS: 'orders',
      ANALYTICS: 'analytics',
    },
    
    // Requests
    REQUESTS: {
      ROOT: 'requests',
      CREATE: 'create',
      DETAILS: 'details', // :id parameter
    },
    
    // Offers
    OFFERS: {
      ROOT: 'offers',
      SENT: 'sent',
      RECEIVED: 'received',
    },
    
    // Admin
    ADMIN: {
      ROOT: 'admin',
      USERS: 'users',
      PRODUCTS: 'products',
      ANALYTICS: 'analytics',
    },
    
    // Shops
    SHOPS: {
      ROOT: 'shops',
      DETAILS: '', // :id parameter (relative to shops)
    },
  },
  
  LEGAL: {
    ROOT: 'legal',
    TERMS: 'terms',
    PRIVACY: 'privacy',
  },
  
  SUPPORT: {
    ROOT: 'support',
    FAQ: 'faq',
    CONTACT: 'contact',
  },
  
  NOT_FOUND: '**',
} as const;

/**
 * Pre-built absolute paths for common routes
 * Use these for direct navigation without buildPath()
 */
export const ROUTES_ABSOLUTE = {
  ROOT: '/',
  LANDING: '/landing',
  DEV_NAVIGATION: '/dev-navigation',
  
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  APP: {
    ROOT: '/app',
    DASHBOARD: '/app/dashboard',
    MARKETPLACE: '/app/marketplace',
    CART: '/app/cart',
    CHECKOUT: '/app/checkout',
    COMMUNITY: '/app/community',
    PROFILE: '/app/profile',
    SETTINGS: '/app/settings',
    NOTIFICATIONS: '/app/notifications',
    CHAT: '/app/chat',
    
    ORDERS: {
      ROOT: '/app/orders',
      BUYER: '/app/orders/buyer',
      SELLER: '/app/orders/seller',
      DETAILS: '/app/orders/details', // append /:id
    },
    
    SELLER: {
      ROOT: '/app/seller',
      DASHBOARD: '/app/seller/dashboard',
      LISTINGS: '/app/seller/listings', // Aligned with router
      LISTINGS_CREATE: '/app/seller/listings/create',
      LISTINGS_EDIT: '/app/seller/listings/edit', // append /:id
      ORDERS: '/app/seller/orders',
      ANALYTICS: '/app/seller/analytics',
    },
    
    REQUESTS: {
      ROOT: '/app/requests',
      CREATE: '/app/requests/create',
      DETAILS: '/app/requests/details', // append /:id
    },
    
    OFFERS: {
      ROOT: '/app/offers',
      SENT: '/app/offers/sent',
      RECEIVED: '/app/offers/received',
    },
    
    ADMIN: {
      ROOT: '/app/admin',
      USERS: '/app/admin/users',
      PRODUCTS: '/app/admin/products',
      ANALYTICS: '/app/admin/analytics',
    },
    
    SHOPS: {
      ROOT: '/app/shops',
    },
  },
  
  LEGAL: {
    ROOT: '/legal',
    TERMS: '/legal/terms',
    PRIVACY: '/legal/privacy',
  },
  
  SUPPORT: {
    ROOT: '/support',
    FAQ: '/support/faq',
    CONTACT: '/support/contact',
  },
} as const;

/**
 * Helper function to build route paths from segments
 * Automatically handles leading slash and joins segments
 * 
 * @param parts - Route segments to join
 * @returns Absolute path starting with /
 * 
 * @example
 * buildPath(ROUTES.APP.ROOT, ROUTES.APP.MARKETPLACE) // '/app/marketplace'
 * buildPath(ROUTES.AUTH.ROOT, ROUTES.AUTH.LOGIN) // '/auth/login'
 * buildPath(ROUTES.APP.SELLER.ROOT, ROUTES.APP.SELLER.PRODUCTS, '123') // '/app/seller/products/123'
 * buildPath(ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', '123') // '/app/marketplace/product/123'
 */
export function buildPath(...parts: (string | number | null | undefined)[]): string {
  const filtered = parts
    .filter((part): part is string | number => part !== null && part !== undefined && part !== '')
    .map(part => String(part));
  
  if (filtered.length === 0) return '/';
  
  // If first part already starts with /, don't add another
  const first = filtered[0];
  if (first.startsWith('/')) {
    // Join all parts, removing leading slashes from subsequent parts
    return filtered
      .map((part, index) => index === 0 ? part : part.replace(/^\/+/, ''))
      .join('/')
      .replace(/\/+/g, '/'); // Clean up any double slashes
  }
  
  // Relative paths - add leading slash
  return '/' + filtered.join('/');
}

/**
 * Helper function to build app-scoped paths (automatically prefixes with /app)
 * 
 * @param parts - Route segments to join (excluding 'app')
 * @returns Absolute path starting with /app
 * 
 * @example
 * buildAppPath(ROUTES.APP.MARKETPLACE) // '/app/marketplace'
 * buildAppPath(ROUTES.APP.SELLER.ROOT, ROUTES.APP.SELLER.PRODUCTS) // '/app/seller/products'
 */
export function buildAppPath(...parts: (string | number | null | undefined)[]): string {
  return buildPath(ROUTES.APP.ROOT, ...parts);
}

/**
 * Type extraction: all possible route path values
 * Enables compile-time validation of route keys
 */
type DeepValues<T> = T extends string
  ? T
  : T extends object
  ? { [K in keyof T]: DeepValues<T[K]> }[keyof T]
  : never;

export type RoutePaths = DeepValues<typeof ROUTES>;
export type AbsoluteRoutePaths = DeepValues<typeof ROUTES_ABSOLUTE>;

/**
 * Type guard to check if a string is a valid route path
 */
export function isValidRoutePath(path: string): path is RoutePaths {
  const allPaths = extractAllValues(ROUTES);
  return allPaths.includes(path);
}

/**
 * Helper to extract all string values from nested route object
 */
function extractAllValues(obj: any): string[] {
  const values: string[] = [];
  
  function traverse(current: any) {
    if (typeof current === 'string') {
      values.push(current);
    } else if (typeof current === 'object' && current !== null) {
      Object.values(current).forEach(traverse);
    }
  }
  
  traverse(obj);
  return values;
}

/**
 * Route parameter helpers
 */
export const RouteParams = {
  /**
   * Build route with ID parameter
   * @example RouteParams.withId('/app/orders/details', '123') // '/app/orders/details/123'
   */
  withId: (basePath: string, id: string | number): string => `${basePath}/${id}`,
  
  /**
   * Build shop detail route
   */
  shopDetail: (shopId: string | number): string => 
    `${ROUTES_ABSOLUTE.APP.SHOPS.ROOT}/${shopId}`,
  
  /**
   * Build order detail route
   */
  orderDetail: (orderId: string | number): string => 
    `${ROUTES_ABSOLUTE.APP.ORDERS.DETAILS}/${orderId}`,
  
  /**
   * Build seller listing edit route
   */
  sellerListingEdit: (listingId: string | number): string => 
    `${ROUTES_ABSOLUTE.APP.SELLER.LISTINGS_EDIT}/${listingId}`,
  
  /**
   * Build request detail route
   */
  requestDetail: (requestId: string | number): string => 
    `${ROUTES_ABSOLUTE.APP.REQUESTS.DETAILS}/${requestId}`,
} as const;

