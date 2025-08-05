import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Add withCredentials to all requests for session-based authentication
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle unauthorized access
        handleUnauthorized(router);
      } else if (error.status === 403) {
        // Handle forbidden access
        handleForbidden(router);
      } else if (error.status === 0) {
        // Handle network errors
        handleNetworkError();
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Handle unauthorized access (401)
 */
function handleUnauthorized(router: Router): void {
  // Clear any stored authentication data
  clearAuthData();
  
  // Redirect to login page if not already there
  if (!router.url.includes('/auth/login')) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: router.url }
    });
  }
}

/**
 * Handle forbidden access (403)
 */
function handleForbidden(router: Router): void {
  // Redirect to home page or show access denied message
  router.navigate(['/home']);
}

/**
 * Handle network errors
 */
function handleNetworkError(): void {
  // Could implement retry logic or show offline message
  console.error('Network error - unable to connect to server');
}

/**
 * Clear authentication data
 */
function clearAuthData(): void {
  // Clear any stored user data
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
} 