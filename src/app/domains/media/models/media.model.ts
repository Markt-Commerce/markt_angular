/**
 * Media Domain Models
 * 
 * Domain entities for media management.
 */

export type MediaType = 'image' | 'video' | 'document' | 'audio';
export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'uploaded'
  | 'completed'
  | 'failed';
export type MediaVariantType =
  | 'original'
  | 'thumbnail'
  | 'small'
  | 'medium'
  | 'large'
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'social_square'
  | 'social_story'
  | 'social_post';

/**
 * Media Variant - Value Object
 */
export class MediaVariant {
  constructor(
    public readonly id: number,
    public readonly variantType: MediaVariantType,
    public readonly storageKey: string,
    public readonly width: number | null,
    public readonly height: number | null,
    public readonly fileSize: number | null,
    public readonly quality: number | null,
    public readonly format: string | null,
    public readonly url: string | null,
    public readonly processingTime: number | null
  ) {}

  /**
   * Business Rule: Check if variant is optimized
   */
  isOptimized(): boolean {
    return (this.processingTime ?? 0) > 0;
  }

  /**
   * Business Rule: Get file size in MB
   */
  getFileSizeMB(): number {
    if (!this.fileSize) {
      return 0;
    }
    return this.fileSize / (1024 * 1024);
  }

  /**
   * Business Rule: Get aspect ratio
   */
  getAspectRatio(): number {
    if (!this.width || !this.height || this.height === 0) {
      return 0;
    }
    return this.width / this.height;
  }
}

/**
 * Media - Domain Entity
 */
export class Media {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly storageKey: string,
    public readonly mediaType: MediaType,
    public readonly mimeType: string,
    public readonly width: number | null,
    public readonly height: number | null,
    public readonly fileSize: number,
    public readonly originalUrl: string | null,
    public readonly processingStatus: ProcessingStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly mobileUrl: string | null,
    public readonly tabletUrl: string | null,
    public readonly desktopUrl: string | null,
    public readonly socialSquareUrl: string | null,
    public readonly socialPostUrl: string | null,
    public readonly socialStoryUrl: string | null,
    public readonly duration: number | null,
    public readonly altText: string | null,
    public readonly caption: string | null,
    public readonly isPublic: boolean,
    public readonly backgroundRemoved: boolean,
    public readonly compressionQuality: number | null,
    public readonly originalFilename: string | null,
    public readonly processingError: string | null,
    public readonly variants: MediaVariant[] = [],
    public readonly exifData?: Record<string, unknown> | null
  ) {}

  /**
   * Business Rule: Check if media is processed
   */
  isProcessed(): boolean {
    return this.processingStatus === 'completed';
  }

  /**
   * Business Rule: Check if media is processing
   */
  isProcessing(): boolean {
    return this.processingStatus === 'processing';
  }

  /**
   * Business Rule: Check if media processing failed
   */
  hasFailed(): boolean {
    return this.processingStatus === 'failed';
  }

  /**
   * Business Rule: Get best URL for display context
   */
  getBestUrl(
    context:
      | 'thumbnail'
      | 'mobile'
      | 'tablet'
      | 'desktop'
      | 'social-square'
      | 'social-post'
      | 'social-story' = 'desktop'
  ): string {
    switch (context) {
      case 'thumbnail':
        return this.thumbnailUrl ?? this.originalUrl ?? '';
      case 'mobile':
        return this.mobileUrl ?? this.originalUrl ?? '';
      case 'tablet':
        return this.tabletUrl ?? this.originalUrl ?? '';
      case 'desktop':
        return this.desktopUrl ?? this.originalUrl ?? '';
      case 'social-square':
        return this.socialSquareUrl ?? this.originalUrl ?? '';
      case 'social-post':
        return this.socialPostUrl ?? this.originalUrl ?? '';
      case 'social-story':
        return this.socialStoryUrl ?? this.originalUrl ?? '';
      default:
        return this.originalUrl ?? '';
    }
  }

  /**
   * Business Rule: Get file size in MB
   */
  getFileSizeMB(): number {
    return this.fileSize / (1024 * 1024);
  }

  /**
   * Business Rule: Get aspect ratio
   */
  getAspectRatio(): number {
    if (!this.width || !this.height || this.height === 0) {
      return 0;
    }
    return this.width / this.height;
  }

  /**
   * Business Rule: Check if media is image
   */
  isImage(): boolean {
    return this.mediaType === 'image';
  }

  /**
   * Business Rule: Check if media is video
   */
  isVideo(): boolean {
    return this.mediaType === 'video';
  }

  /**
   * Business Rule: Check if media is optimized for social
   */
  isOptimizedForSocial(): boolean {
    return !!(this.socialSquareUrl || this.socialPostUrl || this.socialStoryUrl);
  }
}

