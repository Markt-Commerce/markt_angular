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
import { AddressDto } from '../../../core/shared/value-objects/address.value-object';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Media, MediaVariant } from '../../media/models/media.model';
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
  RoleSwitchDto,
  UserSettingsDto,
  UserSettingsUpdateDto,
  PublicProfileDto,
  UserSearchParamsDto,
  UserPaginationDto
} from '../models/user.dto';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';

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
        const variants = (dto.variants ?? []).map(
          (variant) =>
            new MediaVariant(
              variant.id,
              variant.variant_type,
              variant.storage_key,
              variant.width ?? null,
              variant.height ?? null,
              variant.file_size ?? null,
              variant.quality ?? null,
              variant.format ?? null,
              variant.url ?? null,
              variant.processing_time ?? null
            )
        );

        return new Media(
          dto.id,
          dto.user_id,
          dto.storage_key,
          dto.media_type,
          dto.mime_type,
          dto.width ?? null,
          dto.height ?? null,
          dto.file_size,
          dto.original_url ?? null,
          dto.processing_status,
          dto.created_at,
          dto.updated_at ?? null,
          dto.thumbnail_url ?? null,
          dto.mobile_url ?? null,
          dto.tablet_url ?? null,
          dto.desktop_url ?? null,
          dto.social_square_url ?? null,
          dto.social_post_url ?? null,
          dto.social_story_url ?? null,
          dto.duration ?? null,
          dto.alt_text ?? null,
          dto.caption ?? null,
          dto.is_public,
          dto.background_removed,
          dto.compression_quality ?? null,
          dto.original_filename ?? null,
          dto.processing_error ?? null,
          variants,
          dto.exif_data ?? null
        );
      })
    );
  }

  /**
   * Get user settings
   */
  getUserSettings(): Observable<UserSettingsDto> {
    return this.apiClient.get<UserSettingsDto>(`${this.baseEndpoint}/settings`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update user settings
   */
  updateUserSettings(settings: UserSettingsUpdateDto): Observable<UserSettingsDto> {
    return this.apiClient.patch<UserSettingsDto>(`${this.baseEndpoint}/settings`, settings).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get public profile
   */
  getPublicProfile(userId: string): Observable<PublicProfileDto> {
    return this.apiClient.get<PublicProfileDto>(`${this.baseEndpoint}/${userId}/public`).pipe(
      map(response => response.data)
    );
  }

  /**
   * List users with pagination and filters
   */
  listUsers(params?: UserSearchParamsDto): Observable<PaginatedResponse<User>> {
    return this.apiClient.get<UserPaginationDto>(this.baseEndpoint, params as Record<string, unknown>).pipe(
      map(response => ({
        items: response.data.items.map(user => this.toDomain(user)),
        pagination: response.data.pagination
      }))
    );
  }

  /**
   * Get user addresses
   * Returns list of user shipping addresses
   */
  getUserAddresses(): Observable<Address[]> {
    return this.apiClient.get<{ addresses: AddressDto[] }>(`${this.baseEndpoint}/addresses`).pipe(
      map(response => (response.data.addresses ?? []).map(addressDto => Address.fromDto(addressDto)))
    );
  }

  /**
   * Add user address
   */
  addUserAddress(address: AddressDto): Observable<Address> {
    return this.apiClient.post<AddressDto>(`${this.baseEndpoint}/addresses`, address).pipe(
      map(response => Address.fromDto(response.data))
    );
  }

  /**
   * Update user address
   */
  updateUserAddress(addressId: string, address: AddressDto): Observable<Address> {
    return this.apiClient.patch<AddressDto>(`${this.baseEndpoint}/addresses/${addressId}`, address).pipe(
      map(response => Address.fromDto(response.data))
    );
  }

  /**
   * Delete user address
   */
  deleteUserAddress(addressId: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/addresses/${addressId}`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Search users (admin/search functionality)
   * Alias for listUsers with search params
   */
  searchUsers(params?: UserSearchParamsDto): Observable<PaginatedResponse<User>> {
    return this.listUsers(params);
  }

  /**
   * Get users (admin/search)
   * Alias for listUsers for backward compatibility
   */
  getUsers(params?: UserSearchParamsDto): Observable<PaginatedResponse<User>> {
    return this.listUsers(params);
  }
}

