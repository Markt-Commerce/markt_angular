import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, UserLogin, UserRegister } from '../models';

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
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

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
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.authStateSubject.next({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
          this.setLoading(false);
        },
        error: (error) => {
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
          this.setLoading(false);
        },
        error: (error) => {
          this.setError(error.message);
          this.setLoading(false);
        }
      })
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
        error: (error) => {
          console.error('Logout error:', error);
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error) => {
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error) => {
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error) => {
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error) => {
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error) => {
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
        next: (response) => {
          if (response.success && response.data) {
            this.setUser(response.data);
          }
        },
        error: (error) => {
          this.setError(error.message);
        }
      })
    );
  }

  /**
   * Switch between buyer and seller roles
   */
  switchRole(): Observable<any> {
    return this.apiService.switchRole().pipe(
      tap({
        next: (response) => {
          if (response.success && response.data?.user) {
            this.setUser(response.data.user);
          }
        },
        error: (error) => {
          this.setError(error.message);
        }
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
        next: (response) => {
          if (response.success && response.data) {
            // Update user profile picture
            const currentUser = this.getCurrentUser();
            if (currentUser) {
              const updatedUser = { ...currentUser, profile_picture_url: response.data.url };
              this.setUser(updatedUser);
            }
          }
        },
        error: (error) => {
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
} 