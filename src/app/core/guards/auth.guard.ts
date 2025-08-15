import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AccessControlService } from '../services/access-control.service';
import { AppStateService } from '../services/app-state.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
          return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

// RoleGuard: require buyer or seller role. If mismatched but the user has the required role,
// switch automatically and then allow navigation.
export const RoleGuard: CanActivateFn = (route, state) => {
  const access = inject(AccessControlService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const appState = inject(AppStateService);
  const required = (route.data?.['requiredRole'] as 'buyer' | 'seller' | 'either') || 'either';

  if (required === 'either') return true;
  if (access.role === required) return true;

  const user = auth.getCurrentUser?.();
  const hasBuyer = !!user?.is_buyer;
  const hasSeller = !!user?.is_seller;
  const canSwitch = (required === 'buyer' && hasBuyer) || (required === 'seller' && hasSeller);

  if (!canSwitch) {
    return router.createUrlTree(['/app/dashboard'], { queryParams: { suggestRole: required, redirect: state.url } });
  }

  appState.showNotification({ type: 'info', message: `Switching to ${required} to continue...` });
  return auth.switchRole(required).pipe(
    map(() => true as boolean | UrlTree),
    catchError(() => of(router.createUrlTree(['/app/dashboard'], { queryParams: { suggestRole: required } })))
  );
};

export const GuestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticated()) return true;
  router.navigate(['/app']);
  return false;
}; 