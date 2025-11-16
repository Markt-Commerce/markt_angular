/**
 * Privacy Settings Domain Models
 *
 * Immutable domain models with business logic.
 */

import { PrivacySettingsDto } from './privacy-settings.dto';

/**
 * Privacy Settings domain model
 */
export class PrivacySettings {
  private constructor(
    public readonly profileVisibility: 'public' | 'friends' | 'private',
    public readonly showEmail: boolean,
    public readonly showPhone: boolean,
    public readonly showAddress: boolean,
    public readonly allowMessagesFrom: 'everyone' | 'friends' | 'none',
    public readonly showOnlineStatus: boolean,
    public readonly showLastSeen: boolean,
    public readonly allowProfileViews: boolean,
    public readonly allowFriendRequests: boolean,
    public readonly allowTagging: boolean,
    public readonly allowSharing: boolean,
    public readonly searchVisibility: 'public' | 'friends' | 'private'
  ) {}

  static fromDto(dto: PrivacySettingsDto): PrivacySettings {
    return new PrivacySettings(
      dto.profile_visibility,
      dto.show_email,
      dto.show_phone,
      dto.show_address,
      dto.allow_messages_from,
      dto.show_online_status,
      dto.show_last_seen,
      dto.allow_profile_views,
      dto.allow_friend_requests,
      dto.allow_tagging,
      dto.allow_sharing,
      dto.search_visibility
    );
  }

  isPublicProfile(): boolean {
    return this.profileVisibility === 'public';
  }

  isPrivateProfile(): boolean {
    return this.profileVisibility === 'private';
  }

  allowsMessagesFromEveryone(): boolean {
    return this.allowMessagesFrom === 'everyone';
  }

  get profile_visibility(): 'public' | 'friends' | 'private' {
    return this.profileVisibility;
  }

  get show_email(): boolean {
    return this.showEmail;
  }

  get show_phone(): boolean {
    return this.showPhone;
  }

  get show_address(): boolean {
    return this.showAddress;
  }

  get allow_messages_from(): 'everyone' | 'friends' | 'none' {
    return this.allowMessagesFrom;
  }

  get show_online_status(): boolean {
    return this.showOnlineStatus;
  }

  get show_last_seen(): boolean {
    return this.showLastSeen;
  }

  get allow_profile_views(): boolean {
    return this.allowProfileViews;
  }

  get allow_friend_requests(): boolean {
    return this.allowFriendRequests;
  }

  get allow_tagging(): boolean {
    return this.allowTagging;
  }

  get allow_sharing(): boolean {
    return this.allowSharing;
  }

  get search_visibility(): 'public' | 'friends' | 'private' {
    return this.searchVisibility;
  }
}

