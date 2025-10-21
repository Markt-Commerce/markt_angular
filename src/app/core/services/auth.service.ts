import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, of } from 'rxjs';
import { map, tap, switchMap, catchError, timeout, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, UserLogin, UserRegister } from '../models';
import { ErrorHandlerService } from './error-handler.service';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private errorHandler = inject(ErrorHandlerService);
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();
  public roleSwitched$ = new Subject<'buyer' | 'seller'>();

  /**
   * Get current user observable
   */
  get currentUser$(): Observable<User | null> {
    return this.authStateSubject.asObservable().pipe(map(state => state.user));
  }

  /**
   * Get loading state observable
   */
  get loading$(): Observable<boolean> {
    return this.authStateSubject.asObservable().pipe(map(state => state.isLoading));
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<any> {
    return this.apiService.passwordReset(email);
  }

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const userData = localStorage.getItem('markt_user');
    const token = localStorage.getItem('markt_token');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // If we have user data, consider user authenticated even without token
        // (some APIs might not return tokens or use different auth mechanisms)
        this.authStateSubject.next({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        this.errorHandler.logError(error, 'Error parsing user data');
        this.clearAuth();
      }
    }
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get authentication token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('markt_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Check if user is a buyer
   */
  isBuyer(): boolean {
    const user = this.getCurrentUser();
    return user?.is_buyer || false;
  }

  /**
   * Check if user is a seller
   */
  isSeller(): boolean {
    const user = this.getCurrentUser();
    return user?.is_seller || false;
  }

  /**
   * Get current role
   */
  getCurrentRole(): 'buyer' | 'seller' | null {
    const user = this.getCurrentUser();
    return user?.current_role || null;
  }

  /**
   * Register new user
   */
  register(userData: UserRegister): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.register(userData).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
          this.setLoading(false);
        },
        error: (error: any) => {
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Login user
   */
  login(credentials: UserLogin): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.login(credentials).pipe(
      tap({
        next: (response: any) => {
          // Handle both ApiResponse wrapper and direct data response
          const userData = response?.data || response;
          
          // Check if response has valid user data (successful login)
          if (userData && userData.id) {
            // Store token if provided (check both data and top level)
            let token = null;
            if (userData.token || userData.access_token) {
              token = userData.token || userData.access_token;
            } else if (response.token || response.access_token) {
              token = response.token || response.access_token;
            }
            
            if (token) {
              localStorage.setItem('markt_token', token);
            }
            
            // Set user regardless of token (some APIs don't return tokens)
            this.setUser(userData);
          } else {
            this.setError('Invalid response from server');
          }
          this.setLoading(false);
        },
        error: (error: any) => {
          // Use the formatted error message from the interceptor
          const errorMessage = error?.message || 'Login failed. Please try again.';
          this.setError(errorMessage);
          this.setLoading(false);
          
          // Log error safely
          try {
            this.errorHandler.logError(error, 'Login error in auth service');
          } catch (logError) {
            // Silent error logging failure
          }
        }
      }),
      // Return the original response so the component can access it
      map((response: any) => response)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.apiService.logout().pipe(
      tap({
        next: () => {
          this.clearAuth();
        },
        error: (error: any) => {
          this.errorHandler.logError(error, 'Logout error');
          // Clear auth even if logout fails
          this.clearAuth();
        }
      })
    );
  }

  /**
   * Get user profile
   */
  getProfile(): Observable<any> {
    return this.apiService.getProfile().pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: any): Observable<any> {
    return this.apiService.updateProfile(profileData).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Create buyer account for existing user
   */
  createBuyerAccount(buyerData: any): Observable<any> {
    return this.apiService.createBuyerAccount(buyerData).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Create seller account for existing user
   */
  createSellerAccount(sellerData: any): Observable<any> {
    return this.apiService.createSellerAccount(sellerData).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Update buyer profile
   */
  updateBuyerProfile(buyerData: any): Observable<any> {
    return this.apiService.updateBuyerProfile(buyerData).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Update seller profile
   */
  updateSellerProfile(sellerData: any): Observable<any> {
    return this.apiService.updateSellerProfile(sellerData).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Switch between buyer and seller roles
   */
  switchRole(targetRole?: 'buyer' | 'seller'): Observable<any> {
    return this.apiService.switchRole(targetRole).pipe(
      timeout({ each: 5000, with: () => of({ success: false }) }),
      // Handle success or fallback when backend can't switch
      switchMap((response: any) => {
        if (response && response.success) {
          const newUser = response.data?.user || response.data || response.user;
          if (newUser) {
            this.setUser(newUser);
            const role = newUser.current_role as 'buyer' | 'seller';
            this.roleSwitched$.next(role);
          }
          return of(response);
        }
        const currentUser = this.getCurrentUser();
        const hasBoth = !!(currentUser?.is_buyer && currentUser?.is_seller);
        if (currentUser && hasBoth) {
          const current = currentUser.current_role;
          const nextRole: 'buyer' | 'seller' = targetRole || (current === 'buyer' ? 'seller' : 'buyer');
          const updatedUser = { ...currentUser, current_role: nextRole } as User;
          this.setUser(updatedUser);
          this.roleSwitched$.next(nextRole);
          return of({ success: true, data: { user: updatedUser } });
        }
        return of(response);
      }),
      catchError((error: any) => {
        const methodNotAllowed = error?.status === 405;
        const redirectedToLogin = typeof error?.url === 'string' && error.url.includes('/users/login');
        const unauthorized = error?.status === 401;
        const currentUser = this.getCurrentUser();
        const hasBoth = !!(currentUser?.is_buyer && currentUser?.is_seller);
        if ((methodNotAllowed || redirectedToLogin || unauthorized) && currentUser && hasBoth) {
          const current = currentUser.current_role;
          const nextRole: 'buyer' | 'seller' = targetRole || (current === 'buyer' ? 'seller' : 'buyer');
          const updatedUser = { ...currentUser, current_role: nextRole } as User;
          this.setUser(updatedUser);
          this.roleSwitched$.next(nextRole);
          return of({ success: true, data: { user: updatedUser } });
        }
        this.setError(error.message);
        return of({ success: false });
      })
    );
  }

  /**
   * Password reset
   */
  passwordReset(email: string): Observable<any> {
    return this.apiService.passwordReset(email);
  }

  /**
   * Confirm password reset
   */
  passwordResetConfirm(data: { code: string; email: string; new_password: string }): Observable<any> {
    return this.apiService.passwordResetConfirm(data);
  }

  /**
   * Send email verification
   */
  sendEmailVerification(email: string): Observable<any> {
    return this.apiService.sendEmailVerification(email);
  }

  /**
   * Verify email with code
   */
  verifyEmail(data: { email: string; verification_code: string }): Observable<any> {
    return this.apiService.verifyEmail(data);
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(file: File): Observable<any> {
    return this.apiService.uploadProfilePicture(file).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            // Update user profile picture
            const currentUser = this.getCurrentUser();
            if (currentUser) {
              const updatedUser = { ...currentUser, profile_picture_url: response.data.url };
              this.setUser(updatedUser);
            }
          }
        },
        error: (error: any) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Check username availability
   */
  checkUsername(username: string): Observable<any> {
    return this.apiService.checkUsername(username);
  }

  /**
   * Get user settings
   */
  getUserSettings(): Observable<any> {
    return this.apiService.getUserSettings();
  }

  /**
   * Update user settings
   */
  updateUserSettings(settings: any): Observable<any> {
    return this.apiService.updateUserSettings(settings);
  }

  /**
   * Get public profile
   */
  getPublicProfile(userId: string): Observable<any> {
    return this.apiService.getPublicProfile(userId);
  }

  /**
   * Get shops
   */
  getShops(params?: any): Observable<any> {
    return this.apiService.getShops(params);
  }

  /**
   * Get trending shops
   */
  getTrendingShops(): Observable<any> {
    return this.apiService.getTrendingShops();
  }

  /**
   * Get shop categories
   */
  getShopCategories(): Observable<any> {
    return this.apiService.getShopCategories();
  }

  /**
   * Get shop details
   */
  getShopDetails(shopId: number): Observable<any> {
    return this.apiService.getShopDetails(shopId);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Set user and update auth state
   */
  private setUser(user: User): void {
    localStorage.setItem('markt_user', JSON.stringify(user));
    this.authStateSubject.next({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    localStorage.removeItem('markt_user');
    localStorage.removeItem('markt_token');
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      error,
      isLoading: false
    });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      error: null
    });
  }

  /**
   * Login with Google (placeholder implementation)
   */
  loginWithGoogle(): Observable<any> {
    // TODO: Implement Google OAuth integration
    return of({
      success: false,
      message: 'Google login not implemented yet'
    });
  }

  /**
   * Login with Facebook (placeholder implementation)
   */
  loginWithFacebook(): Observable<any> {
    // TODO: Implement Facebook OAuth integration
    return of({
      success: false,
      message: 'Facebook login not implemented yet'
    });
  }
} 