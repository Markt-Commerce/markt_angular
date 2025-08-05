import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_seller: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  account_type: 'buyer' | 'seller';
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  account_type: 'buyer' | 'seller';
  phone_number?: string;
  seller_data?: {
    policies: Record<string, string>;
    description: string;
    shop_name: string;
    category_ids: number[];
  };
  buyer_data?: {
    shipping_address: Record<string, string>;
    buyername: string;
  };
}

export interface AuthResponse {
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_BASE_URL = 'https://test.api.marktcommerce.com/api/v1';
  private readonly MOCK_MODE = false; // Set to false to use real backend
  
  // BehaviorSubject to track authentication state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // BehaviorSubject to track loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    // Check if user is already logged in on app initialization
    this.checkAuthStatus();
  }

  /**
   * Check if user is currently authenticated
   */
  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get current user
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/users/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.status === 404) {
          return throwError(() => new Error('Login endpoint not implemented yet. Backend is still under development.'));
        }
        
        if (error.status === 0 || error.statusText === 'Unknown Error') {
          return throwError(() => new Error('Unable to connect to server. Please check your internet connection.'));
        }
        
        if (error.status === 400) {
          return throwError(() => new Error('Invalid login credentials. Please check your email and password.'));
        }
        
        if (error.status === 401) {
          return throwError(() => new Error('Invalid email or password. Please try again.'));
        }
        
        // Generic error
        const errorMessage = error.error?.message || error.message || 'Login failed. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/users/register`, userData, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.status === 404) {
          return throwError(() => new Error('Registration endpoint not implemented yet. Backend is still under development.'));
        }
        
        if (error.status === 0 || error.statusText === 'Unknown Error') {
          return throwError(() => new Error('Unable to connect to server. Please check your internet connection.'));
        }
        
        if (error.status === 400) {
          return throwError(() => new Error('Invalid registration data. Please check your information.'));
        }
        
        if (error.status === 409) {
          return throwError(() => new Error('User already exists with this email or username.'));
        }
        
        // Generic error
        const errorMessage = error.error?.message || error.message || 'Registration failed. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/users/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/home']);
      }),
      catchError(error => {
        // Even if logout fails, clear local state
        this.currentUserSubject.next(null);
        this.router.navigate(['/home']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check authentication status
   */
  checkAuthStatus(): void {
    this.http.get<User>(`${this.API_BASE_URL}/users/profile`, {
      withCredentials: true
    }).pipe(
      catchError(() => {
        // If check fails, user is not authenticated
        this.currentUserSubject.next(null);
        return throwError(() => new Error('Not authenticated'));
      })
    ).subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/users/password-reset`, { email }, {
      withCredentials: true
    });
  }

  /**
   * Reset password
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/users/password-reset/confirm`, {
      code: token,
      new_password: newPassword
    }, {
      withCredentials: true
    });
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_BASE_URL}/users/profile`, userData, {
      withCredentials: true
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/users/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    }, {
      withCredentials: true
    });
  }

  /**
   * Delete account
   */
  deleteAccount(password: string): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/users/account`, {
      body: { password },
      withCredentials: true
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/home']);
      })
    );
  }
} 