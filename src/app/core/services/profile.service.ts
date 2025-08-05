import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './auth.service';

export interface UserProfile extends User {
  bio?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  preferences?: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
    newsletter: boolean;
    language: string;
    timezone: string;
    currency: string;
  };
  statistics?: {
    total_products: number;
    total_sales: number;
    total_orders: number;
    total_reviews: number;
    average_rating: number;
    member_since_days: number;
  };
}

export interface ProfileUpdateRequest {
  full_name?: string;
  phone?: string;
  bio?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  newsletter: boolean;
  product_updates: boolean;
  order_updates: boolean;
  chat_notifications: boolean;
  marketing_emails: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  allow_messages: boolean;
  allow_friend_requests: boolean;
  show_online_status: boolean;
}

export interface UserActivity {
  id: number;
  type: 'login' | 'product_view' | 'product_create' | 'order_placed' | 'review_posted' | 'message_sent';
  description: string;
  created_at: string;
  metadata?: any;
}

export interface UserReview {
  id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  product_id?: number;
  product_title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiService = inject(ApiService);
  
  // BehaviorSubjects for state management
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  private activitiesSubject = new BehaviorSubject<UserActivity[]>([]);
  private reviewsSubject = new BehaviorSubject<UserReview[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public profile$ = this.profileSubject.asObservable();
  public activities$ = this.activitiesSubject.asObservable();
  public reviews$ = this.reviewsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Get current user's profile
   */
  getProfile(): Observable<UserProfile> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<UserProfile>('/users/profile').pipe(
      tap(response => {
        if (response.data) {
          this.profileSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get user profile by ID (for viewing other users)
   */
  getUserProfile(userId: number): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`/users/${userId}/profile`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: ProfileUpdateRequest): Observable<UserProfile> {
    this.loadingSubject.next(true);
    
    return this.apiService.put<UserProfile>('/users/profile', profileData).pipe(
      tap(response => {
        if (response.data) {
          this.profileSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Change password
   */
  changePassword(passwordData: PasswordChangeRequest): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<any>('/users/change-password', passwordData).pipe(
      tap(() => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload profile avatar
   */
  uploadAvatar(file: File): Observable<{ avatar_url: string }> {
    this.loadingSubject.next(true);
    
    return this.apiService.upload<{ avatar_url: string }>('/users/avatar', file).pipe(
      tap(response => {
        if (response.data) {
          const currentProfile = this.profileSubject.value;
          if (currentProfile) {
            this.profileSubject.next({
              ...currentProfile,
              avatar_url: response.data.avatar_url
            });
          }
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Delete profile avatar
   */
  deleteAvatar(): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.apiService.delete<any>('/users/avatar').pipe(
      tap(() => {
        const currentProfile = this.profileSubject.value;
        if (currentProfile) {
          this.profileSubject.next({
            ...currentProfile,
            avatar_url: undefined
          });
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get notification preferences
   */
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.apiService.get<NotificationPreferences>('/users/notifications/preferences').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Update notification preferences
   */
  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    this.loadingSubject.next(true);
    
    return this.apiService.put<NotificationPreferences>('/users/notifications/preferences', preferences).pipe(
      tap(() => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get privacy settings
   */
  getPrivacySettings(): Observable<PrivacySettings> {
    return this.apiService.get<PrivacySettings>('/users/privacy/settings').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: Partial<PrivacySettings>): Observable<PrivacySettings> {
    this.loadingSubject.next(true);
    
    return this.apiService.put<PrivacySettings>('/users/privacy/settings', settings).pipe(
      tap(() => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get user activities
   */
  getUserActivities(page = 1, perPage = 20): Observable<{ data: UserActivity[], pagination: any }> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<{ data: UserActivity[], pagination: any }>('/users/activities', { page, per_page: perPage }).pipe(
      tap(response => {
        if (response.data) {
          this.activitiesSubject.next(response.data.data || []);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get user reviews
   */
  getUserReviews(page = 1, perPage = 10): Observable<{ data: UserReview[], pagination: any }> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<{ data: UserReview[], pagination: any }>('/users/reviews', { page, per_page: perPage }).pipe(
      tap(response => {
        if (response.data) {
          this.reviewsSubject.next(response.data.data || []);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<any> {
    return this.apiService.get<any>('/users/statistics').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Delete user account
   */
  deleteAccount(password: string): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<any>('/users/account/delete', { password }).pipe(
      tap(() => {
        this.profileSubject.next(null);
        this.activitiesSubject.next([]);
        this.reviewsSubject.next([]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Export user data
   */
  exportUserData(): Observable<{ download_url: string }> {
    return this.apiService.post<{ download_url: string }>('/users/export-data').pipe(
      map(response => response.data!)
    );
  }

  /**
   * Get current profile
   */
  get currentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Get current activities
   */
  get currentActivities(): UserActivity[] {
    return this.activitiesSubject.value;
  }

  /**
   * Get current reviews
   */
  get currentReviews(): UserReview[] {
    return this.reviewsSubject.value;
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Refresh profile data
   */
  refreshProfile(): void {
    this.getProfile().subscribe();
  }

  /**
   * Clear profile data (on logout)
   */
  clearProfile(): void {
    this.profileSubject.next(null);
    this.activitiesSubject.next([]);
    this.reviewsSubject.next([]);
  }
} 