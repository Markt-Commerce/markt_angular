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
import { ROUTES_ABSOLUTE } from '../config/routes.config';

const AUTH_ENDPOINTS: Record<string, boolean> = {
  '/api/v1/users/login': true,
  '/api/v1/users/register': true,
  '/api/v1/users/password-reset': true,
  '/api/v1/users/email-verification': true
};

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth token and role header to non-auth requests
  if (!AUTH_ENDPOINTS[request.url]) {
    const token = authService.getToken();
    const role = authService.getCurrentRole();

    const setHeaders: Record<string, string> = {};
    if (token) setHeaders['Authorization'] = `Bearer ${token}`;
    if (role) setHeaders['X-Markt-Role'] = role;

    if (Object.keys(setHeaders).length) {
      request = request.clone({ setHeaders });
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isAuthenticated = authService.isAuthenticated();
        if (isAuthenticated) {
          authService.logout();
          router.navigate([ROUTES_ABSOLUTE.AUTH.LOGIN]);
        }
      }
      return throwError(() => error);
    })
  );
} 