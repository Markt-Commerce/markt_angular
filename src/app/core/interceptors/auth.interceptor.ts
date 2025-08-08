import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

const AUTH_ENDPOINTS: Record<string, boolean> = {
  '/api/v1/users/login': true,
  '/api/v1/users/register': true,
  '/api/v1/users/password-reset': true,
  '/api/v1/users/email-verification': true
};

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth token to non-auth requests
  if (!AUTH_ENDPOINTS[request.url]) {
    const token = authService.getToken();
    const isAuthenticated = authService.isAuthenticated();

    if (token) {
      // Attach Bearer token if available
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
} 