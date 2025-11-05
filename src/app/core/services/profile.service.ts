import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { UserRepository } from '../../domains/authentication/repositories/user.repository';
import { User as DomainUser } from '../../domains/authentication/models/user.model';
import { ProfileUpdateDto, BuyerAccountUpdateDto, SellerAccountUpdateDto } from '../../domains/authentication/models/user.dto';
import { 
  User, 
  UserProfile, 
  UserUpdate, 
  BuyerAccount, 
  SellerAccount,
  BuyerUpdate,
  SellerUpdate
} from '../models';
import { tap, map, catchError } from 'rxjs/operators';

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
}

export interface ProfileSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_email: boolean;
    show_phone: boolean;
    show_location: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private userRepository = inject(UserRepository);
  
  private profileStateSubject = new BehaviorSubject<ProfileState>({
    profile: null,
    isLoading: false,
    error: null,
    isEditing: false
  });

  public profileState$ = this.profileStateSubject.asObservable();

  constructor() {}

  // ============================================================================
  // PROFILE OPERATIONS
  // ============================================================================

  /**
   * Convert domain User to UserProfile (for backward compatibility)
   */
  private domainToUserProfile(domainUser: DomainUser): UserProfile {
    return {
      ...domainUser as any,
      address: domainUser.address ? {
        latitude: domainUser.address.latitude,
        longitude: domainUser.address.longitude,
        street: domainUser.address.street,
        house_number: domainUser.address.houseNumber,
        city: domainUser.address.city,
        state: domainUser.address.state,
        country: domainUser.address.country,
        postal_code: domainUser.address.postalCode
      } : {
        latitude: 0,
        longitude: 0,
        street: '',
        house_number: '',
        city: '',
        state: '',
        country: '',
        postal_code: ''
      }
    } as UserProfile;
  }

  /**
   * Get user profile
   * Uses UserRepository (DDD pattern)
   */
  getProfile(): Observable<any> {
    return this.userRepository.getProfile().pipe(
      map((domainUser: DomainUser) => {
        const profile = this.domainToUserProfile(domainUser);
          this.updateProfileState({
          profile,
            isLoading: false,
            error: null
          });
        return { success: true, data: profile };
      }),
      catchError((error: any) => {
          this.updateProfileState({
            isLoading: false,
            error: error.message || 'Failed to load profile'
          });
        throw error;
      })
    );
  }

  private convertUserToUserProfile(user: User): UserProfile {
    return {
      ...user,
      address: user.address || {
        latitude: 0,
        longitude: 0,
        street: '',
        house_number: '',
        city: '',
        state: '',
        country: '',
        postal_code: ''
      }
    };
  }

  updateProfile(profileData: any): Observable<any> {
    const updateDto: ProfileUpdateDto = {
      username: profileData.username,
      email: profileData.email,
      phone_number: profileData.phone_number,
      profile_picture_url: profileData.profile_picture_url
    };
    
    return this.userRepository.updateProfile(updateDto).pipe(
      map((domainUser: DomainUser) => {
        const profile = this.domainToUserProfile(domainUser);
          this.updateProfileState({
          profile,
            isLoading: false,
            error: null
          });
        return { success: true, data: profile };
      }),
      catchError((error: any) => {
          this.updateProfileState({
            isLoading: false,
            error: error.message || 'Failed to update profile'
          });
        throw error;
      })
    );
  }

  /**
   * Update buyer profile
   * Uses UserRepository (DDD pattern)
   */
  updateBuyerProfile(buyerData: any): Observable<any> {
    this.setLoading(true);
    
    const updateDto: BuyerAccountUpdateDto = {
      buyername: buyerData.buyername,
      shipping_address: buyerData.shipping_address
    };
    
    return this.userRepository.updateBuyerAccount(updateDto).pipe(
      map((domainUser: DomainUser) => {
        const profile = this.domainToUserProfile(domainUser);
          this.updateProfileState({
          profile,
            isLoading: false,
            error: null
          });
        return { success: true, data: profile };
      }),
      catchError((error: any) => {
          this.updateProfileState({
            isLoading: false,
            error: error.message || 'Failed to update buyer profile'
          });
        throw error;
      })
    );
  }

  /**
   * Update seller profile
   * Uses UserRepository (DDD pattern)
   */
  updateSellerProfile(sellerData: any): Observable<any> {
    const updateDto: SellerAccountUpdateDto = {
      shop_name: sellerData.shop_name,
      description: sellerData.description,
      policies: sellerData.policies,
      category_ids: sellerData.category_ids
    };
    
    return this.userRepository.updateSellerAccount(updateDto).pipe(
      map((domainUser: DomainUser) => {
        const profile = this.domainToUserProfile(domainUser);
          this.updateProfileState({
          profile,
            isLoading: false,
            error: null
          });
        return { success: true, data: profile };
      }),
      catchError((error: any) => {
          this.updateProfileState({
            isLoading: false,
            error: error.message || 'Failed to update seller profile'
          });
        throw error;
      })
    );
  }

  /**
   * Upload profile picture
   * Uses UserRepository (DDD pattern)
   */
  uploadProfilePicture(file: File): Observable<any> {
    return this.userRepository.uploadProfilePicture(file).pipe(
      map((media) => {
        return {
          success: true,
          data: {
            profile_picture_url: media.originalUrl,
            media: {
              id: media.id,
              url: media.originalUrl,
              thumbnail_url: media.thumbnailUrl
              }
          }
        };
      }),
      catchError((error: any) => {
          console.error('Error uploading profile picture:', error);
        return of({
          success: false,
          error: error.message
        });
      })
    );
  }

  /**
   * Get public profile
   * Uses UserRepository (DDD pattern)
   */
  getPublicProfile(userId: string): Observable<any> {
    return this.userRepository.findById(userId).pipe(
      map((domainUser: DomainUser) => {
        const profile = this.domainToUserProfile(domainUser);
        return { success: true, data: profile };
      })
    );
  }

  /**
   * Get user settings
   * Uses UserRepository (DDD pattern)
   */
  getUserSettings(): Observable<any> {
    return this.userRepository.getUserSettings().pipe(
      map((settings) => ({
        success: true,
        data: settings
      })),
      catchError((error: any) => {
        console.error('Error getting user settings:', error);
        return of({
          success: false,
          data: {},
          error: error.message
        });
      })
    );
  }

  /**
   * Update user settings
   * Uses UserRepository (DDD pattern)
   */
  updateUserSettings(settings: any): Observable<any> {
    return this.userRepository.updateUserSettings(settings).pipe(
      map((updatedSettings) => ({
        success: true,
        data: updatedSettings
      })),
      catchError((error: any) => {
        console.error('Error updating user settings:', error);
        return of({
          success: false,
          error: error.message
        });
      })
    );
  }

  /**
   * Check username availability
   * Uses UserRepository (DDD pattern)
   */
  checkUsername(username: string): Observable<any> {
    return this.userRepository.checkUsername(username).pipe(
      map((result) => ({
        success: true,
        data: result
      })),
      catchError((error: any) => {
        console.error('Error checking username:', error);
        return of({
          success: false,
          data: { available: false },
          error: error.message
        });
      })
    );
  }

  // ============================================================================
  // PROFILE UTILITIES
  // ============================================================================

  /**
   * Get current profile state
   */
  getProfileState(): ProfileState {
    return this.profileStateSubject.value;
  }

  /**
   * Get current profile
   */
  getCurrentProfile(): UserProfile | null {
    return this.getProfileState().profile;
  }

  /**
   * Get profile observable
   */
  getProfile$(): Observable<UserProfile | null> {
    return this.profileState$.pipe(
      map(state => state.profile)
    );
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.profileState$.pipe(
      map(state => state.isLoading)
    );
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.profileState$.pipe(
      map(state => state.error)
    );
  }

  /**
   * Get editing state observable
   */
  getEditing$(): Observable<boolean> {
    return this.profileState$.pipe(
      map(state => state.isEditing)
    );
  }

  /**
   * Update profile state
   */
  private updateProfileState(partial: Partial<ProfileState>): void {
    const currentState = this.getProfileState();
    const newState = { ...currentState, ...partial };
    this.profileStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateProfileState({ isLoading });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updateProfileState({ error });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updateProfileState({ error: null });
  }

  /**
   * Set editing state
   */
  setEditing(isEditing: boolean): void {
    this.updateProfileState({ isEditing });
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user: User): string {
    if (user.current_role === 'buyer' && user.buyer_account) {
      return user.buyer_account.buyername;
    } else if (user.current_role === 'seller' && user.seller_account) {
      return user.seller_account.shop_name;
    }
    return user.username;
  }

  /**
   * Get user role display
   */
  getUserRoleDisplay(user: User): string {
    if (user.current_role === 'buyer') {
      return 'Buyer';
    } else if (user.current_role === 'seller') {
      return 'Seller';
    }
    return 'User';
  }

  /**
   * Get user role color
   */
  getUserRoleColor(user: User): string {
    if (user.current_role === 'buyer') {
      return 'text-blue-600';
    } else if (user.current_role === 'seller') {
      return 'text-green-600';
    }
    return 'text-gray-600';
  }

  /**
   * Get user verification status
   */
  getUserVerificationStatus(user: User): {
    isVerified: boolean;
    status: string;
    color: string;
  } {
    if (user.current_role === 'seller' && user.seller_account) {
      const status = user.seller_account.verification_status;
      const isVerified = status === 'verified';
      
      return {
        isVerified,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        color: isVerified ? 'text-green-600' : 'text-yellow-600'
      };
    }
    
    return {
      isVerified: user.email_verified,
      status: user.email_verified ? 'Verified' : 'Unverified',
      color: user.email_verified ? 'text-green-600' : 'text-red-600'
    };
  }

  /**
   * Get user rating display
   */
  getUserRatingDisplay(user: User): string {
    if (user.current_role === 'seller' && user.seller_account) {
      return user.seller_account.average_rating.toFixed(1);
    }
    return 'N/A';
  }

  /**
   * Get user rating stars
   */
  getUserRatingStars(user: User): Array<'full' | 'half' | 'empty'> {
    if (user.current_role !== 'seller' || !user.seller_account) {
      return Array(5).fill('empty');
    }
    
    const rating = user.seller_account.average_rating;
    const stars: Array<'full' | 'half' | 'empty'> = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('full');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    
    return stars;
  }

  /**
   * Get user stats
   */
  getUserStats(user: User): {
    totalOrders: number;
    totalProducts: number;
    totalSales: number;
    memberSince: string;
  } {
    const stats = {
      totalOrders: 0,
      totalProducts: 0,
      totalSales: 0,
      memberSince: user.created_at
    };
    
    if (user.current_role === 'buyer' && user.buyer_account) {
      stats.totalOrders = user.buyer_account.total_orders;
    } else if (user.current_role === 'seller' && user.seller_account) {
      stats.totalProducts = user.seller_account.total_products;
      stats.totalSales = user.seller_account.total_sales;
    }
    
    return stats;
  }

  /**
   * Format user join date
   */
  formatUserJoinDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    
    if (diffInMonths < 1) {
      return 'Less than a month';
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get default profile settings
   */
  getDefaultProfileSettings(): ProfileSettings {
    return {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profile_visibility: 'public',
        show_email: false,
        show_phone: false,
        show_location: false
      },
      preferences: {
        language: 'en',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        theme: 'light'
      }
    };
  }

  /**
   * Validate profile data
   */
  validateProfileData(profileData: UserUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (profileData.phone_number && !this.isValidPhoneNumber(profileData.phone_number)) {
      errors.push('Invalid phone number format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate buyer profile data
   */
  validateBuyerProfileData(buyerData: BuyerUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!buyerData.buyername || buyerData.buyername.trim().length === 0) {
      errors.push('Buyer name is required');
    }
    
    if (buyerData.buyername && buyerData.buyername.length > 50) {
      errors.push('Buyer name must be less than 50 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate seller profile data
   */
  validateSellerProfileData(sellerData: SellerUpdate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!sellerData.shop_name || sellerData.shop_name.trim().length === 0) {
      errors.push('Shop name is required');
    }
    
    if (sellerData.shop_name && sellerData.shop_name.length > 100) {
      errors.push('Shop name must be less than 100 characters');
    }
    
    if (!sellerData.description || sellerData.description.trim().length === 0) {
      errors.push('Shop description is required');
    }
    
    if (sellerData.description && sellerData.description.length > 500) {
      errors.push('Shop description must be less than 500 characters');
    }
    
    if (!sellerData.category_ids || sellerData.category_ids.length === 0) {
      errors.push('At least one category must be selected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if phone number is valid
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation for Nigerian numbers
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(user: User): number {
    let completedFields = 0;
    let totalFields = 0;
    
    // Basic profile fields
    totalFields += 4;
    if (user.username) completedFields++;
    if (user.email) completedFields++;
    if (user.profile_picture_url) completedFields++;
    if (user.phone_number) completedFields++;
    
    // Role-specific fields
    if (user.current_role === 'buyer' && user.buyer_account) {
      totalFields += 2;
      if (user.buyer_account.buyername) completedFields++;
      if (user.buyer_account.shipping_address) completedFields++;
    } else if (user.current_role === 'seller' && user.seller_account) {
      totalFields += 3;
      if (user.seller_account.shop_name) completedFields++;
      if (user.seller_account.description) completedFields++;
      if (user.seller_account.categories && user.seller_account.categories.length > 0) completedFields++;
    }
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }

  /**
   * Get profile completion status
   */
  getProfileCompletionStatus(user: User): {
    percentage: number;
    status: 'incomplete' | 'basic' | 'complete';
    missingFields: string[];
  } {
    const percentage = this.getProfileCompletionPercentage(user);
    const missingFields: string[] = [];
    
    if (!user.username) missingFields.push('Username');
    if (!user.email) missingFields.push('Email');
    if (!user.profile_picture_url) missingFields.push('Profile Picture');
    if (!user.phone_number) missingFields.push('Phone Number');
    
    if (user.current_role === 'buyer' && user.buyer_account) {
      if (!user.buyer_account.buyername) missingFields.push('Buyer Name');
      if (!user.buyer_account.shipping_address) missingFields.push('Shipping Address');
    } else if (user.current_role === 'seller' && user.seller_account) {
      if (!user.seller_account.shop_name) missingFields.push('Shop Name');
      if (!user.seller_account.description) missingFields.push('Shop Description');
      if (!user.seller_account.categories || user.seller_account.categories.length === 0) {
        missingFields.push('Shop Categories');
      }
    }
    
    let status: 'incomplete' | 'basic' | 'complete';
    if (percentage < 50) {
      status = 'incomplete';
    } else if (percentage < 80) {
      status = 'basic';
    } else {
      status = 'complete';
    }
    
    return {
      percentage,
      status,
      missingFields
    };
  }

  /**
   * Clear current profile
   */
  clearCurrentProfile(): void {
    this.updateProfileState({ profile: null });
  }

  /**
   * Refresh profile
   */
  refreshProfile(): void {
    this.getProfile().subscribe();
  }
} 