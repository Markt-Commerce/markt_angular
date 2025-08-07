import { HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Clone the request to add headers
  let authReq = req;
  
  // Check if this is an auth request (login/register)
  const isAuthRequest = req.url.includes('/users/login') || req.url.includes('/users/register');
  
  // Add credentials for API requests to the Markt backend
  if (req.url.includes('marktcommerce.com') || req.url.includes('/api/')) {
    // In development mode, don't add withCredentials for proxy requests
    // In production, always use withCredentials for all API requests
    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
    };
    
    const options: any = {
      setHeaders: headers
    };
    
    // Only add withCredentials for production or direct API calls
    if (!isDevMode() || req.url.includes('marktcommerce.com')) {
      options.withCredentials = true;
    }
    
    authReq = req.clone(options);
  }

  return next(authReq).pipe(
    catchError((error) => {
      
      
      // Handle CORS errors specifically
      if (error.status === 0 && (error.message?.includes('CORS') || error.message?.includes('Unknown Error'))) {
        
        
        
        
        
        
        
        // For CORS errors, return a specific error that components can handle
        return throwError(() => new Error('CORS_ERROR: Backend CORS configuration issue. Please contact the backend team or use a CORS browser extension for development.'));
      }
      
      // Handle 308 redirects (likely authentication required)
      if (error.status === 308) {
        
        // Don't auto-redirect on 308, let the component handle it
        return throwError(() => error);
      }
      
      // Handle 401 Unauthorized - redirect to login
      if (error.status === 401) {
        
        router.navigateByUrl('/auth/login');
        return throwError(() => error);
      }
      
      // Handle 403 Forbidden - might need email verification
      if (error.status === 403) {
        
        return throwError(() => error);
      }
      
      // Handle network errors (status 0)
      if (error.status === 0) {
        
        return throwError(() => new Error('NETWORK_ERROR'));
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
}; 