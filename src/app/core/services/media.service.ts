import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { MediaRepository } from '../../domains/media/repositories/media.repository';
import { Media as DomainMedia } from '../../domains/media/models/media.model';
import { UploadOptionsDto, MediaUpdateDto, MediaVariantGenerateDto } from '../../domains/media/models/media.dto';
import { 
  Media, 
  MediaUploadResponse, 
  MediaList, 
  MediaStats,
  MediaDelete,
  SocialMediaOptimization,
  SocialMediaOptimizationResponse
} from '../models';
import { tap, map, catchError } from 'rxjs/operators';

export interface MediaState {
  media: Media[];
  currentMedia: Media | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

export interface UploadOptions {
  compression?: number;
  removeBackground?: boolean;
  generateVariants?: boolean;
  isPublic?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private mediaRepository = inject(MediaRepository);
  
  private mediaStateSubject = new BehaviorSubject<MediaState>({
    media: [],
    currentMedia: null,
    isLoading: false,
    error: null,
    uploadProgress: 0
  });

  public mediaState$ = this.mediaStateSubject.asObservable();

  constructor() {}

  // ============================================================================
  // MEDIA OPERATIONS
  // ============================================================================

  /**
   * Convert domain Media to old Media interface (for backward compatibility)
   */
  private domainToOldFormat(domainMedia: DomainMedia): Media {
    return {
      id: domainMedia.id.toString(),
      user_id: domainMedia.userId,
      original_filename: domainMedia.originalFilename,
      original_url: domainMedia.originalUrl,
      url: domainMedia.originalUrl,
      media_type: domainMedia.mediaType,
      width: domainMedia.width,
      height: domainMedia.height,
      file_size: domainMedia.fileSize,
      mime_type: domainMedia.mimeType,
      processing_status: domainMedia.processingStatus,
      storage_key: domainMedia.storageKey,
      created_at: domainMedia.createdAt,
      updated_at: domainMedia.updatedAt,
      thumbnail_url: domainMedia.thumbnailUrl,
      mobile_url: domainMedia.mobileUrl,
      tablet_url: domainMedia.tabletUrl,
      desktop_url: domainMedia.desktopUrl,
      social_square_url: domainMedia.socialSquareUrl,
      social_post_url: domainMedia.socialPostUrl,
      social_story_url: domainMedia.socialStoryUrl,
      duration: domainMedia.duration,
      alt_text: domainMedia.altText,
      caption: domainMedia.caption,
      is_public: domainMedia.isPublic,
      background_removed: domainMedia.backgroundRemoved,
      compression_quality: domainMedia.compressionQuality
    } as Media;
  }

  /**
   * Upload single media file
   * Uses MediaRepository (DDD pattern)
   */
  uploadMedia(file: File, options?: UploadOptions): Observable<any> {
    this.setLoading(true);
    this.setUploadProgress(0);
    
    const uploadOptions: UploadOptionsDto = {
      compression: options?.compression,
      remove_background: options?.removeBackground,
      generate_variants: options?.generateVariants,
      is_public: options?.isPublic
    };
    
    return this.mediaRepository.upload(file, uploadOptions).pipe(
      map((domainMedia: DomainMedia) => {
        const newMedia = this.domainToOldFormat(domainMedia);
            const currentMedia = this.getMediaState().media;
            
            this.updateMediaState({
              media: [newMedia, ...currentMedia],
              currentMedia: newMedia,
              isLoading: false,
              error: null,
              uploadProgress: 100
            });
        return {
          success: true,
          data: newMedia
        };
      }),
      catchError((error: any) => {
          console.error('Error uploading media:', error);
          this.setError(error.message);
          this.setLoading(false);
          this.setUploadProgress(0);
        throw error;
      })
    );
  }

  /**
   * Upload multiple media files
   */
  uploadMultiple(files: File[], options?: any): Observable<Media[]> {
    // Use single file upload for multiple files
    const uploads = files.map(file => this.uploadMedia(file, options));
    return forkJoin(uploads);
  }

  /**
   * Get media by ID
   * Uses MediaRepository (DDD pattern)
   */
  getMedia(mediaId: string): Observable<any> {
    return this.mediaRepository.findById(mediaId).pipe(
      map((domainMedia: DomainMedia) => {
        const media = this.domainToOldFormat(domainMedia);
        this.updateMediaState({ currentMedia: media });
        return {
          success: true,
          data: media
        };
      }),
      catchError((error: any) => {
          console.error('Error fetching media:', error);
        throw error;
      })
    );
  }

  /**
   * Delete media
   * Uses MediaRepository (DDD pattern)
   */
  deleteMedia(mediaId: string): Observable<any> {
    return this.mediaRepository.delete(mediaId).pipe(
      map(() => {
          const currentMedia = this.getMediaState().media;
          const updatedMedia = currentMedia.filter((m: Media) => m.id !== mediaId);
          this.updateMediaState({ media: updatedMedia });
        return { success: true };
      }),
      catchError((error: any) => {
          console.error('Error deleting media:', error);
        throw error;
      })
    );
  }

  /**
   * Get media URLs
   * Note: Repository doesn't have this method yet
   */
  getMediaUrls(mediaId: string): Observable<any> {
    // TODO: Add getMediaUrls method to MediaRepository
    return this.getMedia(mediaId);
  }

  /**
   * Get media status
   * Uses MediaRepository (DDD pattern)
   */
  getMediaStatus(mediaId: string): Observable<any> {
    return this.mediaRepository.getStatus(mediaId).pipe(
      map((status) => ({ success: true, data: status }))
    );
  }

  /**
   * Optimize for social media
   * Uses MediaRepository (DDD pattern)
   */
  optimizeForSocial(mediaId: string, optimizationData: SocialMediaOptimization): Observable<any> {
    return this.mediaRepository.optimizeForSocial(mediaId, optimizationData).pipe(
      map((response) => ({ success: true, data: response }))
    );
  }

  /**
   * Remove background
   * Uses MediaRepository (DDD pattern)
   */
  removeBackground(mediaId: string): Observable<any> {
    return this.mediaRepository.removeBackground(mediaId).pipe(
      map((domainMedia: DomainMedia) => {
        const media = this.domainToOldFormat(domainMedia);
        return { success: true, data: media };
      })
    );
  }

  /**
   * Get media list
   * Uses MediaRepository (DDD pattern)
   */
  getMediaList(params?: any): Observable<any> {
    this.setLoading(true);
    
    return this.mediaRepository.findAll(params).pipe(
      map((domainMediaList: DomainMedia[]) => {
        const media = domainMediaList.map(m => this.domainToOldFormat(m));
            this.updateMediaState({
          media,
              isLoading: false,
              error: null
            });
        return {
          success: true,
          data: { media }
        };
      }),
      catchError((error: any) => {
          console.error('Error fetching media list:', error);
          this.setError(error.message);
          this.setLoading(false);
        return of({ success: false, data: { media: [] } });
      })
    );
  }

  /**
   * Get media statistics
   * Uses MediaRepository (DDD pattern)
   */
  getMediaStats(): Observable<any> {
    return this.mediaRepository.getStats().pipe(
      map((stats) => ({ success: true, data: stats }))
    );
  }

  // ============================================================================
  // PRODUCT MEDIA OPERATIONS
  // ============================================================================
  // Note: These are cross-domain operations that may need ApiService
  // or be handled through domain repositories (ProductRepository, PostRepository, etc.)

  /**
   * Get product images
   * Note: Cross-domain operation - may need ProductRepository or stay in ApiService
   */
  getProductImages(productId: string): Observable<any> {
    // TODO: Consider using ProductRepository or keeping in ApiService for cross-domain
    throw new Error('getProductImages: Needs repository implementation or ApiService');
  }

  /**
   * Add product image
   * Note: Cross-domain operation - may need ProductRepository or stay in ApiService
   */
  addProductImage(productId: string, file: File): Observable<any> {
    // TODO: Consider using ProductRepository or keeping in ApiService for cross-domain
    throw new Error('addProductImage: Needs repository implementation or ApiService');
  }

  /**
   * Delete product image
   * Note: Cross-domain operation - may need ProductRepository or stay in ApiService
   */
  deleteProductImage(productId: string, imageId: number): Observable<any> {
    // TODO: Consider using ProductRepository or keeping in ApiService for cross-domain
    throw new Error('deleteProductImage: Needs repository implementation or ApiService');
  }

  // ============================================================================
  // SOCIAL POST MEDIA OPERATIONS
  // ============================================================================

  /**
   * Get social post media
   * Note: Cross-domain operation - may need PostRepository or stay in ApiService
   */
  getSocialPostMedia(postId: string): Observable<any> {
    // TODO: Consider using PostRepository or keeping in ApiService for cross-domain
    throw new Error('getSocialPostMedia: Needs repository implementation or ApiService');
  }

  /**
   * Add social post media
   * Note: Cross-domain operation - may need PostRepository or stay in ApiService
   */
  addSocialPostMedia(postId: string, file: File): Observable<any> {
    // TODO: Consider using PostRepository or keeping in ApiService for cross-domain
    throw new Error('addSocialPostMedia: Needs repository implementation or ApiService');
  }

  /**
   * Delete social post media
   * Note: Cross-domain operation - may need PostRepository or stay in ApiService
   */
  deleteSocialPostMedia(postId: string, mediaId: number): Observable<any> {
    // TODO: Consider using PostRepository or keeping in ApiService for cross-domain
    throw new Error('deleteSocialPostMedia: Needs repository implementation or ApiService');
  }

  // ============================================================================
  // REQUEST MEDIA OPERATIONS
  // ============================================================================

  /**
   * Get request images
   * Note: Cross-domain operation - may need RequestRepository or stay in ApiService
   */
  getRequestImages(requestId: string): Observable<any> {
    // TODO: Consider using RequestRepository or keeping in ApiService for cross-domain
    throw new Error('getRequestImages: Needs repository implementation or ApiService');
  }

  /**
   * Add request image
   * Note: Cross-domain operation - may need RequestRepository or stay in ApiService
   */
  addRequestImage(requestId: string, file: File): Observable<any> {
    // TODO: Consider using RequestRepository or keeping in ApiService for cross-domain
    throw new Error('addRequestImage: Needs repository implementation or ApiService');
  }

  /**
   * Delete request image
   * Note: Cross-domain operation - may need RequestRepository or stay in ApiService
   */
  deleteRequestImage(requestId: string, imageId: number): Observable<any> {
    // TODO: Consider using RequestRepository or keeping in ApiService for cross-domain
    throw new Error('deleteRequestImage: Needs repository implementation or ApiService');
  }

  // ============================================================================
  // MEDIA UTILITIES
  // ============================================================================

  /**
   * Get current media state
   */
  getMediaState(): MediaState {
    return this.mediaStateSubject.value;
  }

  /**
   * Get current media
   */
  getCurrentMedia(): Media | null {
    return this.getMediaState().currentMedia;
  }

  /**
   * Get media observable
   */
  getMedia$(): Observable<Media[]> {
    return this.mediaState$.pipe(
      map(state => state.media)
    );
  }

  /**
   * Get current media observable
   */
  getCurrentMedia$(): Observable<Media | null> {
    return this.mediaState$.pipe(
      map(state => state.currentMedia)
    );
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.mediaState$.pipe(
      map(state => state.isLoading)
    );
  }

  /**
   * Get error state observable
   */
  getError$(): Observable<string | null> {
    return this.mediaState$.pipe(
      map(state => state.error)
    );
  }

  /**
   * Get upload progress observable
   */
  getUploadProgress$(): Observable<number> {
    return this.mediaState$.pipe(
      map(state => state.uploadProgress)
    );
  }

  /**
   * Update media state
   */
  private updateMediaState(partial: Partial<MediaState>): void {
    const currentState = this.getMediaState();
    const newState = { ...currentState, ...partial };
    this.mediaStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateMediaState({ isLoading });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updateMediaState({ error });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updateMediaState({ error: null });
  }

  /**
   * Set upload progress
   */
  private setUploadProgress(progress: number): void {
    this.updateMediaState({ uploadProgress: progress });
  }

  /**
   * Remove media from state
   */
  private removeMediaFromState(mediaId: string): void {
    const currentMedia = this.getMediaState().media;
    const updatedMedia = currentMedia.filter(m => m.id !== mediaId);
    
    this.updateMediaState({ media: updatedMedia });
    
    // Clear current media if it matches
    const currentMediaItem = this.getCurrentMedia();
    if (currentMediaItem && currentMediaItem.id === mediaId) {
      this.updateMediaState({ currentMedia: null });
    }
  }

  /**
   * Get media by ID
   */
  getMediaById(mediaId: string): Media | null {
    const media = this.getMediaState().media;
    return media.find((m: Media) => m.id === mediaId) || null;
  }

  /**
   * Get media by type
   */
  getMediaByType(mediaType: string): Media[] {
    const media = this.getMediaState().media;
    return media.filter(m => m.media_type === mediaType);
  }

  /**
   * Get images
   */
  getImages(): Media[] {
    return this.getMediaByType('image');
  }

  /**
   * Get videos
   */
  getVideos(): Media[] {
    return this.getMediaByType('video');
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get media type icon
   */
  getMediaTypeIcon(mediaType: string): string {
    const iconMap: Record<string, string> = {
      'image': 'image',
      'video': 'video',
      'document': 'file-text',
      'audio': 'music'
    };
    
    return iconMap[mediaType] || 'file';
  }

  /**
   * Get media type color
   */
  getMediaTypeColor(mediaType: string): string {
    const colorMap: Record<string, string> = {
      'image': 'text-blue-600',
      'video': 'text-purple-600',
      'document': 'text-green-600',
      'audio': 'text-orange-600'
    };
    
    return colorMap[mediaType] || 'text-gray-600';
  }

  /**
   * Check if media is image
   */
  isImage(media: Media): boolean {
    return media.media_type === 'image';
  }

  /**
   * Check if media is video
   */
  isVideo(media: Media): boolean {
    return media.media_type === 'video';
  }

  /**
   * Check if media is document
   */
  isDocument(media: Media): boolean {
    return media.media_type === 'image' && media.mime_type.includes('document');
  }

  /**
   * Check if media is audio
   */
  isAudio(media: Media): boolean {
    return media.media_type === 'video' && media.mime_type.includes('audio');
  }

  /**
   * Get media thumbnail URL
   */
  getMediaThumbnailUrl(media: Media): string {
    return media.thumbnail_url || media.url || '/Logo.png';
  }

  /**
   * Get media URL by size
   */
  getMediaUrlBySize(media: Media, size: 'thumbnail' | 'mobile' | 'tablet' | 'desktop'): string {
    switch (size) {
      case 'thumbnail':
        return media.thumbnail_url || media.url || '/Logo.png';
      case 'mobile':
        return media.mobile_url || media.url || '/Logo.png';
      case 'tablet':
        return media.tablet_url || media.url || '/Logo.png';
      case 'desktop':
        return media.desktop_url || media.url || '/Logo.png';
      default:
        return media.url || '/Logo.png';
    }
  }

  /**
   * Get social media URL
   */
  getSocialMediaUrl(media: Media, platform: 'story' | 'square' | 'post'): string {
    switch (platform) {
      case 'story':
        return media.social_story_url || media.url || '/Logo.png';
      case 'square':
        return media.social_square_url || media.url || '/Logo.png';
      case 'post':
        return media.social_post_url || media.url || '/Logo.png';
      default:
        return media.url || '/Logo.png';
    }
  }

  /**
   * Validate file for upload
   */
  validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
    
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please use JPEG, PNG, GIF, WebP, MP4, AVI, or MOV');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get media processing status display
   */
  getProcessingStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed'
    };
    
    return statusMap[status] || 'Unknown';
  }

  /**
   * Get media processing status color
   */
  getProcessingStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'pending': 'text-yellow-600',
      'processing': 'text-blue-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600'
    };
    
    return colorMap[status] || 'text-gray-600';
  }

  /**
   * Check if media is processed
   */
  isMediaProcessed(media: Media): boolean {
    return media.processing_status === 'completed';
  }

  /**
   * Check if media is processing
   */
  isMediaProcessing(media: Media): boolean {
    return media.processing_status === 'processing';
  }

  /**
   * Check if media processing failed
   */
  isMediaProcessingFailed(media: Media): boolean {
    return media.processing_status === 'failed';
  }

  /**
   * Calculate media statistics
   */
  getMediaStatistics(): {
    total: number;
    images: number;
    videos: number;
    totalSize: number;
  } {
    const media = this.getMediaState().media;
    
    const total = media.length;
    const images = media.filter(m => m.media_type === 'image').length;
    const videos = media.filter(m => m.media_type === 'video').length;
    const totalSize = media.reduce((sum, m) => sum + m.file_size, 0);
    
    return {
      total,
      images,
      videos,
      totalSize
    };
  }

  /**
   * Clear current media
   */
  clearCurrentMedia(): void {
    this.updateMediaState({ currentMedia: null });
  }

  /**
   * Refresh media list
   */
  refreshMediaList(): void {
    this.getMediaList().subscribe();
  }

  /**
   * Download media
   * Uses MediaRepository (DDD pattern)
   */
  downloadMedia(mediaId: number): Observable<Blob> {
    return this.mediaRepository.download(mediaId.toString());
  }

  /**
   * Get media variants
   * Uses MediaRepository (DDD pattern)
   */
  getMediaVariants(mediaId: number): Observable<any> {
    return this.mediaRepository.getVariants(mediaId.toString()).pipe(
      map((variants) => {
        // Convert domain variants to old format
        return variants.map(variant => ({
          id: variant.id,
          variant_type: variant.variantType,
          quality: variant.quality,
          width: variant.width,
          height: variant.height,
          format: variant.format,
          file_size: variant.fileSize,
          url: variant.url,
          storage_key: variant.storageKey,
          processing_time: variant.processingTime
        }));
      })
    );
  }

  /**
   * Generate media variants
   * Uses MediaRepository (DDD pattern)
   */
  generateVariants(mediaId: number, variantData: any): Observable<any> {
    const variantDto: MediaVariantGenerateDto = {
      variant_type: variantData.variant_type,
      quality: variantData.quality,
      width: variantData.width,
      height: variantData.height,
      format: variantData.format
    };

    return this.mediaRepository.generateVariants(mediaId.toString(), variantDto).pipe(
      map((variants) => {
        // Convert domain variants to old format
        return variants.map(variant => ({
          id: variant.id,
          variant_type: variant.variantType,
          quality: variant.quality,
          width: variant.width,
          height: variant.height,
          format: variant.format,
          file_size: variant.fileSize,
          url: variant.url,
          storage_key: variant.storageKey,
          processing_time: variant.processingTime
        }));
      })
    );
  }

  /**
   * Update media
   * Uses MediaRepository (DDD pattern)
   */
  updateMedia(mediaId: string, updateData: any): Observable<any> {
    const updateDto: MediaUpdateDto = {
      alt_text: updateData.alt_text,
      caption: updateData.caption,
      is_public: updateData.is_public
    };

    return this.mediaRepository.update(mediaId, updateDto).pipe(
      map((domainMedia: DomainMedia) => {
        const media = this.domainToOldFormat(domainMedia);
          const currentMedia = this.getMediaState().media;
          const updatedMedia = currentMedia.map(m => 
          m.id === mediaId ? media : m
          );
          this.updateMediaState({ media: updatedMedia });
        return {
          success: true,
          data: media
        };
      }),
      catchError((error: any) => {
          console.error('Error updating media:', error);
        throw error;
      })
    );
  }

  getMediaUrl(media: Media, type: 'thumbnail' | 'mobile' | 'tablet' | 'desktop' | 'social' | 'social_story' | 'social_square' | 'social_post' = 'desktop'): string {
    switch (type) {
      case 'thumbnail':
        return media.thumbnail_url || media.original_url || '/Logo.png';
      case 'mobile':
        return media.mobile_url || media.original_url || '/Logo.png';
      case 'tablet':
        return media.tablet_url || media.original_url || '/Logo.png';
      case 'desktop':
        return media.desktop_url || media.original_url || '/Logo.png';
      case 'social_story':
        return media.social_story_url || media.original_url || '/Logo.png';
      case 'social_square':
        return media.social_square_url || media.original_url || '/Logo.png';
      case 'social_post':
        return media.social_post_url || media.original_url || '/Logo.png';
      default:
        return media.original_url || '/Logo.png';
    }
  }
} 