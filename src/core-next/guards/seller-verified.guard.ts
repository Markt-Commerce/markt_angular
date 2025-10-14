/**
 * Seller Verified Guard - Specialized Business Logic Guard
 * 
 * This is an example of a specialized guard that handles domain-specific
 * business rules. It checks if a seller has completed verification.
 * 
 * Usage:
 * ```ts
 * {
 *   path: 'seller/products',
 *   canActivate: [compositeGuard, sellerVerifiedGuard],
 *   data: GuardPresets.seller()
 * }
 * ```
 * 
 * Stack order matters:
 * 1. compositeGuard - handles auth + role
 * 2. sellerVerifiedGuard - handles verification status
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Seller Verified Guard
 * 
 * Ensures seller has completed verification before accessing protected routes.
 * Assumes compositeGuard has already verified auth + seller role.
 */
export const sellerVerifiedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  
  const router = inject(Router);
  
  // TODO: Proper service injection will be added during Phase 6 (Atomic Cutover)
  // when SellerService and AppStateService are migrated to core-next
  //
  // Proper injection will look like:
  // const sellerService = inject(SellerService);
  // const appStateService = inject(AppStateService);
  
  console.warn('[SellerVerifiedGuard] Service injection not yet implemented - placeholder behavior');
  
  // Placeholder implementation - will be replaced during migration
  // Expected logic:
  // 1. Get shop from sellerService.shop()
  // 2. Check shop.verification_status
  // 3. Allow if 'verified' or 'approved'
  // 4. Redirect to /app/seller/verification if not verified
  // 5. Show appropriate notifications via appStateService
  
  // Placeholder: allow access for now
  return true;
};

/**
 * Optional: Seller verification status checker (can be used independently)
 * 
 * TODO: Implement during Phase 6 (Atomic Cutover)
 * Will check SellerService.shop().verification_status
 */
export function checkSellerVerified(): boolean {
  // Placeholder implementation
  console.warn('[checkSellerVerified] Not yet implemented - placeholder behavior');
  return false;
}

/**
 * Example usage:
 * 
 * ```ts
 * // In app.routes.ts
 * import { compositeGuard, GuardPresets } from '@core-next/guards/composite.guard';
 * import { sellerVerifiedGuard } from '@core-next/guards/seller-verified.guard';
 * 
 * {
 *   path: 'seller',
 *   canActivate: [compositeGuard],
 *   data: GuardPresets.seller(),
 *   children: [
 *     {
 *       path: 'dashboard',
 *       component: SellerDashboardComponent,
 *       // No additional guard - all sellers can see dashboard
 *     },
 *     {
 *       path: 'products',
 *       component: ProductsComponent,
 *       canActivate: [sellerVerifiedGuard], // Add verification check
 *     },
 *     {
 *       path: 'analytics',
 *       component: AnalyticsComponent,
 *       canActivate: [sellerVerifiedGuard], // Add verification check
 *     },
 *     {
 *       path: 'verification',
 *       component: VerificationComponent,
 *       // No verification guard - this IS the verification page
 *     }
 *   ]
 * }
 * ```
 */

