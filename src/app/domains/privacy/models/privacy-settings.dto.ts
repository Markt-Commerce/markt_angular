/**
 * Privacy Settings DTOs (Data Transfer Objects)
 *
 * These types match the EXACT structure of API requests and responses.
 * They contain NO business logic - just data shape.
 */

/**
 * Privacy Settings as returned from API
 */
export interface PrivacySettingsDto {
  readonly profile_visibility: 'public' | 'friends' | 'private';
  readonly show_email: boolean;
  readonly show_phone: boolean;
  readonly show_address: boolean;
  readonly allow_messages_from: 'everyone' | 'friends' | 'none';
  readonly show_online_status: boolean;
  readonly show_last_seen: boolean;
  readonly allow_profile_views: boolean;
  readonly allow_friend_requests: boolean;
  readonly allow_tagging: boolean;
  readonly allow_sharing: boolean;
  readonly search_visibility: 'public' | 'friends' | 'private';
}

/**
 * Update Privacy Settings request
 */
export interface PrivacySettingsUpdateDto {
  readonly profile_visibility?: 'public' | 'friends' | 'private';
  readonly show_email?: boolean;
  readonly show_phone?: boolean;
  readonly show_address?: boolean;
  readonly allow_messages_from?: 'everyone' | 'friends' | 'none';
  readonly show_online_status?: boolean;
  readonly show_last_seen?: boolean;
  readonly allow_profile_views?: boolean;
  readonly allow_friend_requests?: boolean;
  readonly allow_tagging?: boolean;
  readonly allow_sharing?: boolean;
  readonly search_visibility?: 'public' | 'friends' | 'private';
}

