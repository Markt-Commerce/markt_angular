import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, of } from 'rxjs';
import {
  map,
  tap,
  switchMap,
  catchError,
  timeout,
  finalize,
} from 'rxjs/operators';
import { UserRepository } from '../../domains/authentication/repositories/user.repository';
import { User as DomainUser } from '../../domains/authentication/models/user.model';
import {
  LoginDto,
  RegisterDto,
  ProfileUpdateDto,
  BuyerAccountCreateDto,
  SellerAccountCreateDto,
  BuyerAccountUpdateDto,
  SellerAccountUpdateDto,
  PasswordResetConfirmDto,
  EmailVerificationDto,
} from '../../domains/authentication/models/user.dto';
import { User, UserLogin, UserRegister } from '../models';
import { ErrorHandlerService } from './error-handler.service';
import { ApiResponse } from '../infrastructure/http/api-response.types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userRepository = inject(UserRepository);
  private errorHandler = inject(ErrorHandlerService);

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  public authState$ = this.authStateSubject.asObservable();
  public roleSwitched$ = new Subject<'buyer' | 'seller'>();

  /**
   * Get current user observable
   */
  get currentUser$(): Observable<User | null> {
    return this.authStateSubject
      .asObservable()
      .pipe(map((state) => state.user));
  }

  /**
   * Get loading state observable
   */
  get loading$(): Observable<boolean> {
    return this.authStateSubject
      .asObservable()
      .pipe(map((state) => state.isLoading));
  }

  /**
   * Forgot password
   * Uses UserRepository (DDD pattern)
   */
  forgotPassword(email: string): Observable<ApiResponse<{ message: string }>> {
    return this.userRepository.passwordReset(email).pipe(
      map((result) => ({
        success: true,
        data: result,
      }))
    );
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
          error: null,
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
   * Uses UserRepository (DDD pattern)
   */
  register(userData: UserRegister): Observable<ApiResponse<User>> {
    this.setLoading(true);

    const registerDto: RegisterDto = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone_number: userData.phone_number,
      account_type: (userData as any).account_type || 'buyer', // Default to buyer if not specified
    };

    return this.userRepository.register(registerDto).pipe(
      map((result) => {
        const user = this.domainToOldFormat(result.user);
        if (result.token) {
          localStorage.setItem('markt_token', result.token);
        }
        this.setUser(user);
        this.setLoading(false);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Registration failed');
          this.setLoading(false);
        },
      })
    );
  }

  /**
   * Login user
   * Uses UserRepository (DDD pattern)
   */
  login(credentials: UserLogin): Observable<ApiResponse<User>> {
    this.setLoading(true);

    const loginDto: LoginDto = {
      email: credentials.email,
      password: credentials.password,
    };

    return this.userRepository.login(loginDto).pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        // Note: UserRepository.login doesn't return token, so we don't store it here
        // Token would be handled by HTTP interceptor or separate endpoint
        this.setUser(user);
        this.setLoading(false);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          const errorMessage =
            error?.message || 'Login failed. Please try again.';
          this.setError(errorMessage);
          this.setLoading(false);

          try {
            this.errorHandler.logError(error, 'Login error in auth service');
          } catch (logError) {
            // Silent error logging failure
          }
        },
      })
    );
  }

  /**
   * Logout user
   * Uses UserRepository (DDD pattern)
   */
  logout(): Observable<ApiResponse<void>> {
    return this.userRepository.logout().pipe(
      map(() => {
        this.clearAuth();
        return {
          success: true,
          data: undefined,
        };
      }),
      tap({
        error: (error: any) => {
          this.errorHandler.logError(error, 'Logout error');
          // Clear auth even if logout fails
          this.clearAuth();
        },
      })
    );
  }

  /**
   * Get user profile
   * Uses UserRepository (DDD pattern)
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.userRepository.getProfile().pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        this.setUser(user);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Failed to get profile');
        },
      })
    );
  }

  /**
   * Update user profile
   * Uses UserRepository (DDD pattern)
   */
  updateProfile(profileData: any): Observable<ApiResponse<User>> {
    const updateDto: ProfileUpdateDto = {
      username: profileData.username,
      email: profileData.email,
      phone_number: profileData.phone_number,
      profile_picture:
        profileData.profile_picture_url || profileData.profile_picture,
    };

    return this.userRepository.updateProfile(updateDto).pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        this.setUser(user);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Failed to update profile');
        },
      })
    );
  }

  /**
   * Create buyer account for existing user
   * Uses UserRepository (DDD pattern)
   */
  createBuyerAccount(buyerData: any): Observable<ApiResponse<User>> {
    const createDto: BuyerAccountCreateDto = {
      buyername: buyerData.buyername,
      shipping_address: buyerData.shipping_address,
    };

    return this.userRepository.createBuyerAccount(createDto).pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        this.setUser(user);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Failed to create buyer account');
        },
      })
    );
  }

  /**
   * Create seller account for existing user
   * Uses UserRepository (DDD pattern)
   */
  createSellerAccount(sellerData: any): Observable<ApiResponse<User>> {
    const createDto: SellerAccountCreateDto = {
      shop_name: sellerData.shop_name,
      description: sellerData.description,
      category_ids:
        sellerData.category_ids ||
        sellerData.categories?.map((c: any) =>
          typeof c === 'object' ? c.id : c
        ) ||
        [],
      policies: sellerData.policies || {},
    };

    return this.userRepository.createSellerAccount(createDto).pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        this.setUser(user);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Failed to create seller account');
        },
      })
    );
  }

  /**
   * Update buyer profile
   * Uses UserRepository (DDD pattern)
   */
  updateBuyerProfile(buyerData: any): Observable<ApiResponse<User>> {
    const updateDto: BuyerAccountUpdateDto = {
      buyername: buyerData.buyername,
      shipping_address: buyerData.shipping_address,
    };

    return this.userRepository.updateBuyerProfile(updateDto).pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        this.setUser(user);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Failed to update buyer profile');
        },
      })
    );
  }

  /**
   * Update seller profile
   * Uses UserRepository (DDD pattern)
   */
  updateSellerProfile(sellerData: any): Observable<ApiResponse<User>> {
    const updateDto: SellerAccountUpdateDto = {
      shop_name: sellerData.shop_name,
      description: sellerData.description,
      category_ids:
        sellerData.category_ids ||
        sellerData.categories?.map((c: any) =>
          typeof c === 'object' ? c.id : c
        ),
      policies: sellerData.policies,
    };

    return this.userRepository.updateSellerProfile(updateDto).pipe(
      map((domainUser: DomainUser) => {
        const user = this.domainToOldFormat(domainUser);
        this.setUser(user);
        return {
          success: true,
          data: user,
        };
      }),
      tap({
        error: (error: any) => {
          this.setError(error.message || 'Failed to update seller profile');
        },
      })
    );
  }

  /**
   * Switch between buyer and seller roles
   * Uses UserRepository (DDD pattern)
   */
  switchRole(targetRole?: 'buyer' | 'seller'): Observable<ApiResponse<User>> {
    return this.userRepository.switchRole(targetRole).pipe(
      timeout({ each: 5000, with: () => of(null as DomainUser | null) }),
      switchMap((domainUser: DomainUser | null) => {
        if (domainUser) {
          const user = this.domainToOldFormat(domainUser);
          this.setUser(user);
          const role = user.current_role as 'buyer' | 'seller';
          this.roleSwitched$.next(role);
          return of({ success: true, data: user });
        }
        // Fallback: switch locally if user has both roles
        const currentUser = this.getCurrentUser();
        const hasBoth = !!(currentUser?.is_buyer && currentUser?.is_seller);
        if (currentUser && hasBoth) {
          const current = currentUser.current_role;
          const nextRole: 'buyer' | 'seller' =
            targetRole || (current === 'buyer' ? 'seller' : 'buyer');
          const updatedUser = {
            ...currentUser,
            current_role: nextRole,
          } as User;
          this.setUser(updatedUser);
          this.roleSwitched$.next(nextRole);
          return of({ success: true, data: updatedUser });
        }
        return of({
          success: false,
          data: null as any,
          message: 'Cannot switch role',
        });
      }),
      catchError((error: any) => {
        const methodNotAllowed = error?.status === 405;
        const redirectedToLogin =
          typeof error?.url === 'string' && error.url.includes('/users/login');
        const unauthorized = error?.status === 401;
        const currentUser = this.getCurrentUser();
        const hasBoth = !!(currentUser?.is_buyer && currentUser?.is_seller);
        if (
          (methodNotAllowed || redirectedToLogin || unauthorized) &&
          currentUser &&
          hasBoth
        ) {
          const current = currentUser.current_role;
          const nextRole: 'buyer' | 'seller' =
            targetRole || (current === 'buyer' ? 'seller' : 'buyer');
          const updatedUser = {
            ...currentUser,
            current_role: nextRole,
          } as User;
          this.setUser(updatedUser);
          this.roleSwitched$.next(nextRole);
          return of({ success: true, data: updatedUser });
        }
        this.setError(error.message || 'Failed to switch role');
        return of({ success: false, data: null as any });
      })
    );
  }

  /**
   * Password reset
   * Uses UserRepository (DDD pattern)
   */
  passwordReset(email: string): Observable<ApiResponse<{ message: string }>> {
    return this.forgotPassword(email);
  }

  /**
   * Confirm password reset
   * Uses UserRepository (DDD pattern)
   */
  passwordResetConfirm(data: {
    code: string;
    email: string;
    new_password: string;
  }): Observable<ApiResponse<{ message: string }>> {
    const confirmDto: PasswordResetConfirmDto = {
      code: data.code,
      email: data.email,
      new_password: data.new_password,
    };

    return this.userRepository.passwordResetConfirm(confirmDto).pipe(
      map((result) => ({
        success: true,
        data: result,
      }))
    );
  }

  /**
   * Send email verification
   * Uses UserRepository (DDD pattern)
   */
  sendEmailVerification(
    email: string
  ): Observable<ApiResponse<{ message: string }>> {
    return this.userRepository.sendEmailVerification(email).pipe(
      map((result) => ({
        success: true,
        data: result,
      }))
    );
  }

  /**
   * Verify email with code
   * Uses UserRepository (DDD pattern)
   */
  verifyEmail(data: {
    email: string;
    verification_code: string;
  }): Observable<ApiResponse<{ message: string }>> {
    const verifyDto: EmailVerificationDto = {
      email: data.email,
      verification_code: data.verification_code,
    };

    return this.userRepository.verifyEmail(verifyDto).pipe(
      map((result) => ({
        success: true,
        data: result,
      }))
    );
  }

  /**
   * Upload profile picture
   * TODO: Use MediaRepository when media domain is integrated
   */
  uploadProfilePicture(file: File): Observable<ApiResponse<{ url: string }>> {
    return of({
      success: false,
      data: null as any,
      message: 'Upload profile picture not implemented yet',
    });
  }

  /**
   * Check username availability
   * Uses UserRepository (DDD pattern)
   */
  checkUsername(
    username: string
  ): Observable<ApiResponse<{ available: boolean; message?: string }>> {
    return this.userRepository.checkUsernameAvailability(username).pipe(
      map((result) => ({
        success: true,
        data: result,
      }))
    );
  }

  /**
   * Get user settings
   * TODO: Create SettingsRepository if settings become a domain
   */
  getUserSettings(): Observable<ApiResponse<any>> {
    return of({ success: true, data: {} });
  }

  /**
   * Update user settings
   * TODO: Create SettingsRepository if settings become a domain
   */
  updateUserSettings(settings: any): Observable<ApiResponse<any>> {
    return of({ success: true, data: settings });
  }

  /**
   * Get public profile
   * TODO: Add to UserRepository if needed
   */
  getPublicProfile(userId: string): Observable<ApiResponse<User>> {
    return of({
      success: false,
      data: null as any,
      message: 'Get public profile not implemented yet',
    });
  }

  /**
   * Get shops
   * TODO: Create ShopRepository if shops become a domain
   */
  getShops(params?: any): Observable<ApiResponse<any>> {
    return of({ success: true, data: { items: [], pagination: {} } });
  }

  /**
   * Get trending shops
   * TODO: Create ShopRepository if shops become a domain
   */
  getTrendingShops(): Observable<ApiResponse<any>> {
    return of({ success: true, data: [] });
  }

  /**
   * Get shop categories
   * TODO: Create ShopRepository if shops become a domain
   */
  getShopCategories(): Observable<ApiResponse<any>> {
    return of({ success: true, data: [] });
  }

  /**
   * Get shop details
   * TODO: Create ShopRepository if shops become a domain
   */
  getShopDetails(shopId: number): Observable<ApiResponse<any>> {
    return of({ success: true, data: {} });
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
      error: null,
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
      error: null,
    });
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading,
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
      isLoading: false,
    });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      error: null,
    });
  }

  /**
   * Convert domain user to old format for backward compatibility
   */
  private domainToOldFormat(domainUser: DomainUser): User {
    const addressDto = domainUser.address?.toDto();
    return {
      id: domainUser.id,
      username: domainUser.username,
      email: domainUser.email,
      phone_number: domainUser.phoneNumber,
      profile_picture: domainUser.profilePictureUrl,
      profile_picture_url: domainUser.profilePictureUrl,
      current_role: domainUser.currentRole,
      is_buyer: !!domainUser.buyerAccount,
      is_seller: !!domainUser.sellerAccount,
      email_verified: domainUser.emailVerified,
      address: addressDto
        ? {
            latitude: addressDto.latitude,
            longitude: addressDto.longitude,
            street: addressDto.street,
            house_number: addressDto.house_number,
            city: addressDto.city,
            state: addressDto.state,
            country: addressDto.country,
            postal_code: addressDto.postal_code,
          }
        : undefined,
      buyer_account: domainUser.buyerAccount
        ? {
            id: domainUser.buyerAccount.id,
            buyername: domainUser.buyerAccount.buyername,
            shipping_address: {
              latitude: domainUser.buyerAccount.shipping_address.latitude,
              longitude: domainUser.buyerAccount.shipping_address.longitude,
              street: domainUser.buyerAccount.shipping_address.street,
              house_number:
                domainUser.buyerAccount.shipping_address.houseNumber,
              city: domainUser.buyerAccount.shipping_address.city,
              state: domainUser.buyerAccount.shipping_address.state,
              country: domainUser.buyerAccount.shipping_address.country,
              postal_code: domainUser.buyerAccount.shipping_address.postalCode,
            },
            total_orders: domainUser.buyerAccount.total_orders,
            pending_orders: domainUser.buyerAccount.pending_orders,
            last_order_date: domainUser.buyerAccount.last_order_date,
            is_active: domainUser.buyerAccount.is_active,
            created_at: domainUser.buyerAccount.created_at,
          }
        : undefined,
      seller_account: domainUser.sellerAccount
        ? {
            id: domainUser.sellerAccount.id,
            shop_name: domainUser.sellerAccount.shop_name,
            shop_slug: domainUser.sellerAccount.shop_slug,
            description: domainUser.sellerAccount.description,
            policies: domainUser.sellerAccount.policies,
            categories: domainUser.sellerAccount.categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: '',
              description: '',
              parent_id: null,
              image_url: undefined,
              is_active: true,
              sort_order: 0,
              created_at: '',
              updated_at: '',
            })),
            total_products: domainUser.sellerAccount.total_products,
            total_sales: domainUser.sellerAccount.total_sales,
            total_rating: domainUser.sellerAccount.total_rating,
            average_rating: domainUser.sellerAccount.average_rating,
            total_raters: domainUser.sellerAccount.total_raters,
            verification_status: domainUser.sellerAccount.verification_status,
            is_active: domainUser.sellerAccount.is_active,
            joined_date: domainUser.sellerAccount.joined_date,
            profile_picture_url: domainUser.sellerAccount.profile_picture_url,
          }
        : undefined,
      created_at: domainUser.createdAt,
      updated_at: domainUser.updatedAt,
    };
  }

  /**
   * Login with Google (placeholder implementation)
   */
  loginWithGoogle(): Observable<any> {
    // TODO: Implement Google OAuth integration
    return of({
      success: false,
      message: 'Google login not implemented yet',
    });
  }

  /**
   * Login with Facebook (placeholder implementation)
   */
  loginWithFacebook(): Observable<any> {
    // TODO: Implement Facebook OAuth integration
    return of({
      success: false,
      message: 'Facebook login not implemented yet',
    });
  }
}
