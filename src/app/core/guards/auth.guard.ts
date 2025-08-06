import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, CanMatch, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Check if user can activate a route
   */
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        } else {
          // Redirect to login page with return URL
          return this.router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }
      })
    );
  }

  /**
   * Check if user can activate child routes
   */
  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate();
  }

  /**
   * Check if user can match a route (for lazy loading)
   */
  canMatch(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => !!user)
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class EmailVerificationGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Check if user has verified their email
   */
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.email_verified) {
          return true;
        } else if (user && !user.email_verified) {
          // Redirect to email verification page
          return this.router.createUrlTree(['/auth/verify-email'], {
            queryParams: { email: user.email }
          });
        } else {
          // No user, redirect to login
          return this.router.createUrlTree(['/auth/login']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Check if user can access guest-only routes (login, register, etc.)
   */
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return true;
        } else {
          // Redirect authenticated users to app
          return this.router.createUrlTree(['/app']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class SellerGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Check if user is a verified seller
   */
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.is_seller && user.email_verified) {
          return true;
        } else if (user && !user.email_verified) {
          // Redirect to email verification if not verified
          return this.router.createUrlTree(['/auth/verify-email'], {
            queryParams: { email: user.email }
          });
        } else {
          // Redirect non-sellers to app home
          return this.router.createUrlTree(['/app']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class BuyerGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Check if user is a verified buyer
   */
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user && user.is_buyer && user.email_verified) {
          return true;
        } else if (user && !user.email_verified) {
          // Redirect to email verification if not verified
          return this.router.createUrlTree(['/auth/verify-email'], {
            queryParams: { email: user.email }
          });
        } else {
          // Redirect non-buyers to app home
          return this.router.createUrlTree(['/app']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  /**
   * Check if component can be deactivated
   */
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> | Promise<boolean> | boolean {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
} 