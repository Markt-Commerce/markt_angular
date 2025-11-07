/**
 * User Repository
 * 
 * Handles all user-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse } from '../../../core/infrastructure/http/api-response.types';
import { User, UserRole, BuyerAccountData, SellerAccountData, Address } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Media } from '../../media/models/media.model';
import { MediaDto } from '../../media/models/media.dto';
import {
  UserDto,
  LoginDto,
  RegisterDto,
  RegisterResponseDto,
  ProfileUpdateDto,
  BuyerAccountCreateDto,
  SellerAccountCreateDto,
  BuyerAccountUpdateDto,
  SellerAccountUpdateDto,
  PasswordResetDto,
  PasswordResetConfirmDto,
  EmailVerificationDto,
  RoleSwitchDto
} from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserRepository {
  private apiClient = inject(ApiClientService);
  private http = inject(HttpClient);
  private readonly baseEndpoint = '/api/v1/users';

  /**
   * Convert UserDto to User domain model
   */
  private toDomain(dto: UserDto): User {
    const buyerAccount: BuyerAccountData | undefined = dto.buyer_account ? {
      id: dto.buyer_account.id,
      buyername: dto.buyer_account.buyername,
      shipping_address: Address.fromDto(dto.buyer_account.shipping_address),
      total_orders: dto.buyer_account.total_orders,
      pending_orders: dto.buyer_account.pending_orders,
      last_order_date: dto.buyer_account.last_order_date,
      is_active: dto.buyer_account.is_active,
      created_at: dto.buyer_account.created_at
    } : undefined;

    const sellerAccount: SellerAccountData | undefined = dto.seller_account ? {
      id: dto.seller_account.id,
      shop_name: dto.seller_account.shop_name,
      shop_slug: dto.seller_account.shop_slug,
      description: dto.seller_account.description,
      policies: dto.seller_account.policies,
      categories: dto.seller_account.categories,
      total_products: dto.seller_account.total_products,
      total_sales: dto.seller_account.total_sales,
      total_rating: dto.seller_account.total_rating,
      average_rating: dto.seller_account.average_rating,
      total_raters: dto.seller_account.total_raters,
      verification_status: dto.seller_account.verification_status,
      is_active: dto.seller_account.is_active,
      joined_date: dto.seller_account.joined_date,
      profile_picture_url: dto.seller_account.profile_picture_url
    } : undefined;

    return new User(
      dto.id,
      dto.username,
      dto.email,
      dto.phone_number,
      dto.current_role,
      dto.email_verified,
      dto.created_at,
      dto.updated_at,
      dto.profile_picture_url || dto.profile_picture,
      dto.address ? Address.fromDto(dto.address) : undefined,
      buyerAccount,
      sellerAccount
    );
  }

  /**
   * Register new user
   */
  register(data: RegisterDto): Observable<{ user: User; token: string }> {
    return this.apiClient.post<RegisterResponseDto>(`${this.baseEndpoint}/register`, data).pipe(
      map(response => ({
        user: this.toDomain(response.data.user),
        token: response.data.token
      }))
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginDto): Observable<User> {
    return this.apiClient.post<UserDto>(`${this.baseEndpoint}/login`, credentials).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<void> {
    return this.apiClient.post<void>(`${this.baseEndpoint}/logout`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<User> {
    return this.apiClient.get<UserDto>(`${this.baseEndpoint}/profile`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Update user profile
   */
  updateProfile(data: ProfileUpdateDto): Observable<User> {
    return this.apiClient.patch<UserDto>(`${this.baseEndpoint}/profile`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Create buyer account
   */
  createBuyerAccount(data: BuyerAccountCreateDto): Observable<User> {
    return this.apiClient.post<UserDto>(`${this.baseEndpoint}/create-buyer`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Create seller account
   */
  createSellerAccount(data: SellerAccountCreateDto): Observable<User> {
    return this.apiClient.post<UserDto>(`${this.baseEndpoint}/create-seller`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Update buyer profile
   */
  updateBuyerProfile(data: BuyerAccountUpdateDto): Observable<User> {
    return this.apiClient.patch<UserDto>(`${this.baseEndpoint}/profile/buyer`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Update seller profile
   */
  updateSellerProfile(data: SellerAccountUpdateDto): Observable<User> {
    return this.apiClient.patch<UserDto>(`${this.baseEndpoint}/profile/seller`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Switch user role
   */
  switchRole(targetRole?: UserRole): Observable<User> {
    const body = targetRole ? { role: targetRole } : undefined;
    return this.apiClient.post<RoleSwitchDto>(`${this.baseEndpoint}/switch-role`, body).pipe(
      map(response => this.toDomain(response.data.user))
    );
  }

  /**
   * Request password reset
   */
  passwordReset(email: string): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.baseEndpoint}/password-reset`, { email }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Confirm password reset
   */
  passwordResetConfirm(data: PasswordResetConfirmDto): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.baseEndpoint}/password-reset/confirm`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Send email verification
   */
  sendEmailVerification(email: string): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.baseEndpoint}/email-verification/send`, { email }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Verify email
   */
  verifyEmail(data: EmailVerificationDto): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }>(`${this.baseEndpoint}/email-verification/verify`, data).pipe(
      map(response => response.data)
    );
  }

  /**
   * Check username availability
   */
  checkUsernameAvailability(username: string): Observable<{ available: boolean; message?: string }> {
    return this.apiClient.get<{ available: boolean; message?: string }>(`${this.baseEndpoint}/check-username`, { username }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Check username availability (alias for consistency)
   */
  checkUsername(username: string): Observable<{ available: boolean; message?: string }> {
    return this.checkUsernameAvailability(username);
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);

    const apiBaseUrl = environment.apiBaseUrl;
    const isAbsolute = /^https?:\/\//i.test(apiBaseUrl);
    const baseUrl = isAbsolute ? apiBaseUrl : apiBaseUrl;

    return this.http.post<ApiResponse<MediaDto>>(
      `${baseUrl}${this.baseEndpoint}/profile/picture`,
      formData,
      {
        withCredentials: true,
        reportProgress: true
      }
    ).pipe(
      map(response => {
        // Convert MediaDto to Media domain model
        const dto = response.data;
        return new Media(
          dto.id,
          dto.user_id,
          dto.original_filename,
          dto.original_url,
          dto.media_type,
          dto.width,
          dto.height,
          dto.file_size,
          dto.mime_type,
          dto.processing_status,
          dto.storage_key,
          dto.created_at,
          dto.updated_at,
          dto.thumbnail_url,
          dto.mobile_url,
          dto.tablet_url,
          dto.desktop_url,
          dto.social_square_url,
          dto.social_post_url,
          dto.social_story_url,
          dto.duration,
          dto.alt_text,
          dto.caption,
          dto.is_public,
          dto.background_removed,
          dto.compression_quality,
          // Variants mapping: cast to domain type for now until a MediaVariant factory is introduced
          (dto.variants as unknown as any[]).map(v => ({
            id: v.id,
            variantType: (v as any).variant_type,
            quality: v.quality,
            width: v.width,
            height: v.height,
            format: v.format,
            fileSize: (v as any).file_size,
            url: v.url,
            storageKey: (v as any).storage_key,
            processingTime: (v as any).processing_time
          })) as unknown as import('../../media/models/media.model').MediaVariant[],
          dto.exif_data
        );
      })
    );
  }

  /**
   * Get user settings
   */
  getUserSettings(): Observable<Record<string, unknown>> {
    return this.apiClient.get<Record<string, unknown>>(`${this.baseEndpoint}/settings`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update user settings
   */
  updateUserSettings(settings: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.apiClient.put<Record<string, unknown>>(`${this.baseEndpoint}/settings`, settings).pipe(
      map(response => response.data)
    );
  }
}

