/**
 * Authentication Domain Service
 * 
 * Manages user authentication, session, and profile operations.
 */

import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '../models/user.model';
import {
  LoginDto,
  RegisterDto,
  ProfileUpdateDto,
  BuyerAccountCreateDto,
  SellerAccountCreateDto,
  BuyerAccountUpdateDto,
  SellerAccountUpdateDto
} from '../models/user.dto';
import { ApiService } from '../../../core/services/api.service';

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
  private userRepository = inject(UserRepository);
  private apiService = inject(ApiService); // Temporary: for methods not yet migrated to repository
  
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();
  public roleSwitched$ = new Subject<UserRole>();

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
        const userDto = JSON.parse(userData);
        // Convert DTO to domain model
        // Note: This is a simplified conversion - in production, use proper DTO conversion
        const user = new User(
          userDto.id,
          userDto.username,
          userDto.email,
          userDto.phone_number,
          userDto.current_role,
          userDto.email_verified,
          userDto.created_at,
          userDto.updated_at,
          userDto.profile_picture_url,
          userDto.address,
          userDto.buyer_account,
          userDto.seller_account
        );
        
        this.authStateSubject.next({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
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
   * Get current role
   */
  getCurrentRole(): UserRole | null {
    return this.authStateSubject.value.user?.currentRole || null;
  }

  /**
   * Check authentication status
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Compatibility helper for legacy code
   */
  getAccessToken(): string | null {
    return this.getToken();
  }

  /**
   * Register new user
   * Business logic: Validate registration data
   */
  register(data: RegisterDto): Observable<{ user: User; token: string }> {
    this.setLoading(true);
    
    // Business validation
    if (!data.email || !data.email.includes('@')) {
      this.setError('Invalid email address');
      throw new Error('Invalid email address');
    }

    if (!data.password || data.password.length < 8) {
      this.setError('Password must be at least 8 characters');
      throw new Error('Password must be at least 8 characters');
    }

    if (data.account_type === 'buyer' && !data.buyer_data) {
      this.setError('Buyer data is required for buyer account');
      throw new Error('Buyer data is required for buyer account');
    }

    if (data.account_type === 'seller' && !data.seller_data) {
      this.setError('Seller data is required for seller account');
      throw new Error('Seller data is required for seller account');
    }

    return this.userRepository.register(data).pipe(
      tap({
        next: ({ user, token }) => {
          this.setUser(user);
          this.setToken(token);
          this.setLoading(false);
        },
        error: (error) => {
          this.setError(error.message || 'Registration failed');
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Login user
   * Business logic: Validate credentials
   */
  login(credentials: LoginDto): Observable<User> {
    this.setLoading(true);

    if (!credentials.email || !credentials.password) {
      this.setError('Email and password are required');
      this.setLoading(false);
      throw new Error('Email and password are required');
    }

    return this.userRepository.login(credentials).pipe(
      tap({
        next: (user) => {
          this.setUser(user);
          this.setLoading(false);
        },
        error: (error) => {
          this.setError(error.message || 'Login failed');
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<void> {
    return this.userRepository.logout().pipe(
      tap(() => {
        this.clearAuth();
      }),
      catchError(() => {
        // Even if API call fails, clear local auth
        this.clearAuth();
        return [];
      })
    );
  }

  /**
   * Get user profile
   */
  getProfile(): Observable<User> {
    this.setLoading(true);
    
    return this.userRepository.getProfile().pipe(
      tap({
        next: (user) => {
          this.setUser(user);
          this.setLoading(false);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load profile');
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Update user profile
   * Business logic: Validate profile updates
   */
  updateProfile(data: ProfileUpdateDto): Observable<User> {
    if (data.email && !data.email.includes('@')) {
      throw new Error('Invalid email address');
    }

    return this.userRepository.updateProfile(data).pipe(
      tap({
        next: (user) => {
          this.setUser(user);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to update profile');
        }
      })
    );
  }

  /**
   * Switch user role
   * Business logic: Validate role switch
   */
  switchRole(targetRole: UserRole): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be authenticated to switch roles');
    }

    if (!currentUser.canSwitchRole(targetRole)) {
      throw new Error(`Cannot switch to ${targetRole} role. Account not set up.`);
    }

    return this.userRepository.switchRole(targetRole).pipe(
      tap({
        next: (user) => {
          this.setUser(user);
          this.roleSwitched$.next(targetRole);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to switch role');
        }
      })
    );
  }

  /**
   * Create buyer account
   */
  createBuyerAccount(data: BuyerAccountCreateDto): Observable<User> {
    if (!data.buyername || data.buyername.trim().length === 0) {
      throw new Error('Buyer name is required');
    }

    if (!data.shipping_address) {
      throw new Error('Shipping address is required');
    }

    return this.userRepository.createBuyerAccount(data).pipe(
      tap({
        next: (user) => {
          this.setUser(user);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to create buyer account');
        }
      })
    );
  }

  /**
   * Create seller account
   */
  createSellerAccount(data: SellerAccountCreateDto): Observable<User> {
    if (!data.shop_name || data.shop_name.trim().length === 0) {
      throw new Error('Shop name is required');
    }

    if (!data.category_ids || data.category_ids.length === 0) {
      throw new Error('At least one category is required');
    }

    return this.userRepository.createSellerAccount(data).pipe(
      tap({
        next: (user) => {
          this.setUser(user);
        },
        error: (error) => {
          this.setError(error.message || 'Failed to create seller account');
        }
      })
    );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    return this.userRepository.passwordReset(email);
  }

  /**
   * Confirm password reset
   */
  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return this.userRepository.passwordResetConfirm({ email, code, new_password: newPassword });
  }

  /**
   * Send email verification
   */
  sendEmailVerification(email: string): Observable<{ message: string }> {
    return this.userRepository.sendEmailVerification(email);
  }

  /**
   * Verify email
   */
  verifyEmail(email: string, code: string): Observable<{ message: string }> {
    return this.userRepository.verifyEmail({ email, verification_code: code });
  }

  /**
   * Check username availability
   */
  checkUsername(username: string): Observable<{ available: boolean; message?: string }> {
    return this.userRepository.checkUsernameAvailability(username);
  }

  /**
   * Get user addresses
   * TODO: Migrate to UserRepository when address methods are added
   * Temporary: delegates to ApiService
   */
  getUserAddresses(): Observable<any> {
    return this.apiService.getUserAddresses();
  }

  /**
   * Get privacy settings
   * TODO: Migrate to UserRepository when settings methods are added
   * Temporary: delegates to ApiService
   */
  getPrivacySettings(): Observable<any> {
    return this.apiService.getPrivacySettings();
  }

  /**
   * Update privacy settings
   * TODO: Migrate to UserRepository when settings methods are added
   * Temporary: delegates to ApiService
   */
  updatePrivacySettings(data: any): Observable<any> {
    return this.apiService.updatePrivacySettings(data);
  }

  /**
   * Get my reviews
   * TODO: Migrate to ReviewRepository when created
   * Temporary: delegates to ApiService
   */
  getMyReviews(): Observable<any> {
    return this.apiService.getMyReviews();
  }

  /**
   * Get user reviews
   * TODO: Migrate to ReviewRepository when created
   * Temporary: delegates to ApiService
   */
  getUserReviews(userId: string): Observable<any> {
    return this.apiService.getUserReviews(userId);
  }

  /**
   * Get users (admin/search)
   * TODO: Migrate to UserRepository when search methods are added
   * Temporary: delegates to ApiService
   */
  getUsers(params?: any): Observable<any> {
    return this.apiService.getUsers(params);
  }

  /**
   * Get shop categories
   * TODO: Migrate to MarketplaceService or CategoryRepository when created
   * Temporary: delegates to ApiService
   */
  getShopCategories(): Observable<any> {
    return this.apiService.getShopCategories();
  }

  /**
   * Private helper methods
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

  private setToken(token: string): void {
    localStorage.setItem('markt_token', token);
  }

  private setLoading(loading: boolean): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading: loading
    });
  }

  private setError(error: string): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      error,
      isLoading: false
    });
  }

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
}

