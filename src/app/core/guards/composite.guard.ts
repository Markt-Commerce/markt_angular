/**
 * Composite Guard - Metadata-Driven Route Protection
 * 
 * Provides baseline authentication and role checks driven by route metadata.
 * This guard can be used alone or stacked with specialized guards for complex rules.
 * 
 * Usage:
 * ```ts
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [compositeGuard],
 *   data: { 
 *     auth: true,
 *     role: 'seller', // optional
 *     allowedRoles: ['buyer', 'seller'], // alternative to single role
 *     redirectOnFail: '/custom-path' // optional custom redirect
 *   }
 * }
 * 
 * // Stack with specialized guards
 * {
 *   path: 'seller/products',
 *   canActivate: [compositeGuard, sellerVerifiedGuard],
 *   data: { auth: true, role: 'seller' }
 * }
 * ```
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Route metadata interface for composite guard
 */
export interface CompositeGuardMeta {
  /** Requires authentication */
  auth?: boolean;
  
  /** Required specific role */
  role?: 'buyer' | 'seller' | 'admin';
  
  /** Allowed roles (any of these) */
  allowedRoles?: Array<'buyer' | 'seller' | 'admin'>;
  
  /** Custom redirect path on auth failure (default: /auth/login) */
  redirectOnFail?: string;
  
  /** Custom redirect path on role failure (default: /app/dashboard) */
  roleRedirect?: string;
  
  /** Allow role auto-switching if user has the required role */
  autoSwitchRole?: boolean;
  
  /** Show notification on redirect */
  showNotification?: boolean;
}

/**
 * Composite Guard Function
 * 
 * Checks route metadata and enforces auth/role requirements.
 * Can be used as the primary guard or combined with specialized guards.
 */
export const compositeGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const router = inject(Router);
  
  // Extract metadata from route data
  const meta = (route.data as CompositeGuardMeta) || {};
  
  // If no auth requirement, allow access
  if (!meta.auth) {
    return true;
  }
  
  // Lazy inject services only when needed (to avoid circular dependencies during bootstrap)
  // NOTE: These will need to be updated once we migrate services
  // For now, we'll create a simpler version that can be enhanced
  
  return checkAuthAndRole(meta, route, state, router);
};

/**
 * Check authentication and role requirements
 */
function checkAuthAndRole(
  meta: CompositeGuardMeta,
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  router: Router
): boolean | UrlTree | Observable<boolean | UrlTree> {
  
  // TODO: Once services are migrated to core-next, inject them properly
  // For now, this is a placeholder implementation that will be updated during Phase 6 (Atomic Cutover)
  // 
  // Proper injection will look like:
  // const authService = inject(AuthService);
  // const accessService = inject(AccessControlService);  
  // const appStateService = inject(AppStateService);
  
  // Temporary: Return basic structure until services are available
  // This allows the file to compile without errors during foundation phase
  
  console.warn('[CompositeGuard] Service injection not yet implemented - placeholder behavior');
  
  // Placeholder implementation - will be replaced during migration
  // For now, just check if auth is required and redirect if so
  if (meta.auth) {
    // In production, would check actual auth status
    // return router.createUrlTree([meta.redirectOnFail || ROUTES_ABSOLUTE.AUTH.LOGIN]);
    return true; // Placeholder
  }
  
  
  // NOTE: Full implementation will be added during Phase 6 (Atomic Cutover)
  // when services are properly available and migrated
  //
  // Expected implementation:
  // 1. Check if authService.isAuthenticated() if meta.auth is true
  // 2. Check role requirements using accessService.role and meta.role/allowedRoles
  // 3. Handle role switching via authService.switchRole() if meta.autoSwitchRole
  // 4. Show notifications via appStateService.showNotification()
  // 5. Redirect with appropriate query params
  
  // Placeholder return - will be replaced with actual auth/role logic
  return true;
}

/**
 * Check if user has a specific role capability
 */
function checkUserHasRole(user: any, role: 'buyer' | 'seller' | 'admin'): boolean {
  if (!user) return false;
  
  switch (role) {
    case 'buyer':
      return !!user.is_buyer;
    case 'seller':
      return !!user.is_seller;
    case 'admin':
      return !!user.is_admin || user.role === 'admin';
    default:
      return false;
  }
}

/**
 * Helper: Create guard metadata builder for cleaner route definitions
 * 
 * @example
 * ```ts
 * import { guardMeta } from '@core-next/guards/composite.guard';
 * 
 * {
 *   path: 'seller/dashboard',
 *   canActivate: [compositeGuard],
 *   data: guardMeta({ auth: true, role: 'seller', autoSwitchRole: true })
 * }
 * ```
 */
export function guardMeta(meta: CompositeGuardMeta): CompositeGuardMeta {
  return {
    autoSwitchRole: true, // Default to auto-switching
    showNotification: true, // Default to showing notifications
    ...meta
  };
}

/**
 * Preset guard metadata for common scenarios
 */
export const GuardPresets = {
  /** Requires authentication only */
  authOnly: (): CompositeGuardMeta => ({ auth: true }),
  
  /** Requires buyer role */
  buyer: (): CompositeGuardMeta => ({ 
    auth: true, 
    role: 'buyer',
    autoSwitchRole: true 
  }),
  
  /** Requires seller role */
  seller: (): CompositeGuardMeta => ({ 
    auth: true, 
    role: 'seller',
    autoSwitchRole: true 
  }),
  
  /** Requires admin role */
  admin: (): CompositeGuardMeta => ({ 
    auth: true, 
    role: 'admin',
    autoSwitchRole: false, // Admin shouldn't auto-switch
    showNotification: true
  }),
  
  /** Allows buyer or seller */
  buyerOrSeller: (): CompositeGuardMeta => ({
    auth: true,
    allowedRoles: ['buyer', 'seller'],
    autoSwitchRole: true
  }),
  
  /** Public route (no requirements) */
  public: (): CompositeGuardMeta => ({ auth: false }),
} as const;

/**
 * Example usage in routes:
 * 
 * ```ts
 * import { compositeGuard, GuardPresets, guardMeta } from '@core-next/guards/composite.guard';
 * 
 * // Using presets
 * {
 *   path: 'cart',
 *   canActivate: [compositeGuard],
 *   data: GuardPresets.buyer()
 * }
 * 
 * // Using helper
 * {
 *   path: 'orders',
 *   canActivate: [compositeGuard],
 *   data: guardMeta({ auth: true, role: 'buyer', redirectOnFail: ROUTES_ABSOLUTE.LANDING })
 * }
 * 
 * // Stacking guards
 * {
 *   path: 'seller/products',
 *   canActivate: [compositeGuard, sellerVerifiedGuard],
 *   data: GuardPresets.seller()
 * }
 * 
 * // Raw metadata
 * {
 *   path: 'admin/users',
 *   canActivate: [compositeGuard],
 *   data: { auth: true, role: 'admin', autoSwitchRole: false }
 * }
 * ```
 */

