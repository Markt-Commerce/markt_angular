/**
 * Media Domain Models
 * 
 * Domain entities for media management.
 */

export type MediaType = 'image' | 'video';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Media Variant - Value Object
 */
export class MediaVariant {
  constructor(
    public readonly id: string,
    public readonly variantType: string,
    public readonly quality: string,
    public readonly width: number,
    public readonly height: number,
    public readonly format: string,
    public readonly fileSize: number,
    public readonly url: string,
    public readonly storageKey: string,
    public readonly processingTime: number
  ) {}

  /**
   * Business Rule: Check if variant is optimized
   */
  isOptimized(): boolean {
    return this.processingTime > 0;
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
    if (this.height === 0) return 0;
    return this.width / this.height;
  }
}

/**
 * Media - Domain Entity
 */
export class Media {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly originalFilename: string,
    public readonly originalUrl: string,
    public readonly mediaType: MediaType,
    public readonly width: number,
    public readonly height: number,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly processingStatus: ProcessingStatus,
    public readonly storageKey: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly thumbnailUrl?: string,
    public readonly mobileUrl?: string,
    public readonly tabletUrl?: string,
    public readonly desktopUrl?: string,
    public readonly socialSquareUrl?: string,
    public readonly socialPostUrl?: string,
    public readonly socialStoryUrl?: string,
    public readonly duration?: number,
    public readonly altText?: string,
    public readonly caption?: string,
    public readonly isPublic: boolean = false,
    public readonly backgroundRemoved: boolean = false,
    public readonly compressionQuality?: number,
    public readonly variants: MediaVariant[] = [],
    public readonly exifData?: Record<string, unknown>
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
  getBestUrl(context: 'thumbnail' | 'mobile' | 'tablet' | 'desktop' | 'social-square' | 'social-post' | 'social-story' = 'desktop'): string {
    switch (context) {
      case 'thumbnail':
        return this.thumbnailUrl || this.originalUrl;
      case 'mobile':
        return this.mobileUrl || this.originalUrl;
      case 'tablet':
        return this.tabletUrl || this.originalUrl;
      case 'desktop':
        return this.desktopUrl || this.originalUrl;
      case 'social-square':
        return this.socialSquareUrl || this.originalUrl;
      case 'social-post':
        return this.socialPostUrl || this.originalUrl;
      case 'social-story':
        return this.socialStoryUrl || this.originalUrl;
      default:
        return this.originalUrl;
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
    if (this.height === 0) return 0;
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

