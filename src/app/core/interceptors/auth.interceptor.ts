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
      console.log('HTTP Error intercepted:', error);
      
      // Handle CORS errors specifically
      if (error.status === 0 && (error.message?.includes('CORS') || error.message?.includes('Unknown Error'))) {
        console.log('CORS error detected for:', req.url);
        console.log('This is likely due to CORS configuration on the backend.');
        console.log('For development, you can:');
        console.log('1. Use a CORS browser extension to disable CORS');
        console.log('2. Contact the backend team to enable CORS for localhost');
        console.log('3. Use a proxy server to bypass CORS');
        
        // For CORS errors, return a specific error that components can handle
        return throwError(() => new Error('CORS_ERROR: Backend CORS configuration issue. Please contact the backend team or use a CORS browser extension for development.'));
      }
      
      // Handle 308 redirects (likely authentication required)
      if (error.status === 308) {
        console.log('308 Redirect detected - authentication may be required');
        // Don't auto-redirect on 308, let the component handle it
        return throwError(() => error);
      }
      
      // Handle 401 Unauthorized - redirect to login
      if (error.status === 401) {
        console.log('401 Unauthorized - redirecting to login');
        router.navigateByUrl('/auth/login');
        return throwError(() => error);
      }
      
      // Handle 403 Forbidden - might need email verification
      if (error.status === 403) {
        console.log('403 Forbidden - possible email verification required');
        return throwError(() => error);
      }
      
      // Handle network errors (status 0)
      if (error.status === 0) {
        console.log('Network error - connection failed for:', req.url);
        return throwError(() => new Error('NETWORK_ERROR'));
      }

      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
}; 