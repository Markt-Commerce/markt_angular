import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AccessControlService } from '../services/access-control.service';
import { AppStateService } from '../services/app-state.service';
import { ErrorHandlerService } from '../services/error-handler.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);

  try {
    if (authService.isAuthenticated()) {
      return true;
    }

    // Store the intended destination for redirect after login
    const returnUrl = state.url;
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: returnUrl !== '/auth/login' ? returnUrl : undefined }
    });
    return false;
  } catch (error) {
    errorHandler.logError(error, 'AuthGuard error');
    router.navigate(['/auth/login']);
    return false;
  }
};

// RoleGuard: require buyer or seller role. If mismatched but the user has the required role,
// switch automatically and then allow navigation.
export const RoleGuard: CanActivateFn = (route, state) => {
  const access = inject(AccessControlService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const appState = inject(AppStateService);
  const errorHandler = inject(ErrorHandlerService);
  const required = (route.data?.['requiredRole'] as 'buyer' | 'seller' | 'either') || 'either';

  try {
    // First check if user is authenticated
    if (!auth.isAuthenticated()) {
      const returnUrl = state.url;
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: returnUrl !== '/auth/login' ? returnUrl : undefined }
      });
      return false;
    }

    if (required === 'either') return true;
    if (access.role === required) return true;

    const user = auth.getCurrentUser?.();
    const hasBuyer = !!user?.is_buyer;
    const hasSeller = !!user?.is_seller;
    const canSwitch = (required === 'buyer' && hasBuyer) || (required === 'seller' && hasSeller);

    if (!canSwitch) {
      appState.showNotification({ 
        type: 'warning', 
        message: `This feature requires a ${required} account. Please create or switch to a ${required} account.` 
      });
      return router.createUrlTree(['/app/dashboard'], { 
        queryParams: { suggestRole: required, redirect: state.url } 
      });
    }

    appState.showNotification({ 
      type: 'info', 
      message: `Switching to ${required} mode to continue...` 
    });
    
    return auth.switchRole(required).pipe(
      map(() => true as boolean | UrlTree),
      catchError((error) => {
        errorHandler.logError(error, 'RoleGuard switch error');
        appState.showNotification({ 
          type: 'error', 
          message: 'Failed to switch roles. Please try again.' 
        });
        return of(router.createUrlTree(['/app/dashboard'], { 
          queryParams: { suggestRole: required } 
        }));
      })
    );
  } catch (error) {
    errorHandler.logError(error, 'RoleGuard error');
    router.navigate(['/auth/login']);
    return false;
  }
};

export const GuestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);

  try {
    // Check if user is already authenticated
    if (!authService.isAuthenticated()) {
      // User is not authenticated, allow access to auth routes
      return true;
    }
    
    // User is already authenticated, redirect to dashboard
    // This prevents authenticated users from accessing login/register pages
    router.navigate(['/app/dashboard']);
    return false;
  } catch (error) {
    errorHandler.logError(error, 'GuestGuard error - allowing access to auth route');
    // On error, allow access to guest routes as fallback
    return true;
  }
}; 