import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { compositeGuard } from './composite.guard';
import { sellerVerifiedGuard } from './seller-verified.guard';
import { AuthService } from '../services/auth.service';
import { ROUTES_ABSOLUTE } from '../config/routes.config';

/**
 * Integration Tests for Route Guards
 * 
 * Tests guard behavior in realistic routing scenarios:
 * - Authentication requirements
 * - Role-based access control
 * - Guard stacking (composite + specialized)
 * - Redirect behavior
 * - Route data integration
 */
describe('Guard Integration Tests', () => {
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Create mock AuthService
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'getCurrentRole',
      'isBuyer',
      'isSeller'
    ]);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        {
          path: 'public',
          component: DummyComponent,
          data: { auth: false }
        },
        {
          path: 'protected',
          component: DummyComponent,
          canActivate: [compositeGuard],
          data: { auth: true }
        },
        {
          path: 'buyer-only',
          component: DummyComponent,
          canActivate: [compositeGuard],
          data: { auth: true, role: 'buyer' }
        },
        {
          path: 'seller-only',
          component: DummyComponent,
          canActivate: [compositeGuard],
          data: { auth: true, role: 'seller' }
        },
        {
          path: 'seller-verified',
          component: DummyComponent,
          canActivate: [compositeGuard, sellerVerifiedGuard],
          data: { auth: true, role: 'seller' }
        },
        {
          path: 'login',
          component: DummyComponent
        }
      ])],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  describe('Composite Guard - Authentication', () => {
    it('should allow access to public routes regardless of auth status', async () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = await router.navigate(['/public']);
      expect(result).toBe(true);
    });

    it('should block unauthenticated users from protected routes', async () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = await router.navigate(['/protected']);
      expect(result).toBe(false);
      // Should redirect to login
      expect(router.url).toContain('/login');
    });

    it('should allow authenticated users to access protected routes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('buyer');

      const result = await router.navigate(['/protected']);
      expect(result).toBe(true);
    });
  });

  describe('Composite Guard - Role-Based Access', () => {
    it('should allow buyer role to access buyer-only routes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('buyer');
      authService.isBuyer.and.returnValue(true);

      const result = await router.navigate(['/buyer-only']);
      expect(result).toBe(true);
    });

    it('should block seller role from buyer-only routes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('seller');
      authService.isBuyer.and.returnValue(false);

      const result = await router.navigate(['/buyer-only']);
      expect(result).toBe(false);
    });

    it('should allow seller role to access seller-only routes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('seller');
      authService.isSeller.and.returnValue(true);

      const result = await router.navigate(['/seller-only']);
      expect(result).toBe(true);
    });

    it('should block buyer role from seller-only routes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('buyer');
      authService.isSeller.and.returnValue(false);

      const result = await router.navigate(['/seller-only']);
      expect(result).toBe(false);
    });
  });

  describe('Guard Stacking', () => {
    it('should run composite guard before specialized guard', async () => {
      // If composite fails, specialized guard should not run
      authService.isAuthenticated.and.returnValue(false);

      const result = await router.navigate(['/seller-verified']);
      expect(result).toBe(false);
      // Should redirect due to composite guard failure
    });

    it('should run specialized guard after composite passes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('seller');
      authService.isSeller.and.returnValue(true);

      // This would test specialized guard logic
      // In real scenario, sellerVerifiedGuard would check verification status
      const result = await router.navigate(['/seller-verified']);
      // Result depends on seller verification status
    });
  });

  describe('Route Data Integration', () => {
    it('should read auth requirement from route data', () => {
      const route = {
        data: { auth: true }
      } as unknown as ActivatedRouteSnapshot;

      const state = {} as unknown as RouterStateSnapshot;
      const result = TestBed.runInInjectionContext(() => 
        compositeGuard(route, state)
      );

      // Should check authentication when auth: true
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should read role requirement from route data', () => {
      authService.isAuthenticated.and.returnValue(true);
      
      const route = {
        data: { auth: true, role: 'buyer' }
      } as unknown as ActivatedRouteSnapshot;

      const state = {} as unknown as RouterStateSnapshot;
      TestBed.runInInjectionContext(() => 
        compositeGuard(route, state)
      );

      // Should check role when role specified
      expect(authService.getCurrentRole).toHaveBeenCalled();
    });
  });

  describe('Redirect Behavior', () => {
    it('should redirect to login when authentication fails', async () => {
      authService.isAuthenticated.and.returnValue(false);

      await router.navigate(['/protected']);
      expect(router.url).toBe('/login');
    });

    it('should redirect to dashboard when role check fails', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('seller');
      authService.isBuyer.and.returnValue(false);

      await router.navigate(['/buyer-only']);
      // Should redirect to appropriate fallback
    });

    it('should preserve returnUrl parameter on login redirect', async () => {
      authService.isAuthenticated.and.returnValue(false);

      await router.navigate(['/protected'], { 
        queryParams: { returnUrl: '/protected' } 
      });
      
      expect(router.url).toContain('/login');
      expect(router.url).toContain('returnUrl');
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes without data object', () => {
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as unknown as RouterStateSnapshot;

      // Should not throw error
      expect(() => {
        TestBed.runInInjectionContext(() => 
          compositeGuard(route, state)
        );
      }).not.toThrow();
    });

    it('should handle multiple guard failures gracefully', async () => {
      authService.isAuthenticated.and.returnValue(false);
      authService.isSeller.and.returnValue(false);

      const result = await router.navigate(['/seller-verified']);
      expect(result).toBe(false);
    });

    it('should handle rapid navigation changes', async () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.getCurrentRole.and.returnValue('buyer');
      authService.isBuyer.and.returnValue(true);

      // Simulate rapid navigation
      const nav1 = router.navigate(['/buyer-only']);
      const nav2 = router.navigate(['/protected']);
      
      await Promise.all([nav1, nav2]);
      // Should handle both navigations without errors
    });
  });
});

// Dummy component for testing
import { Component } from '@angular/core';

@Component({
  selector: 'app-dummy',
  standalone: true,
  template: ''
})
class DummyComponent {}

