import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Media, 
  MediaUploadResponse, 
  MediaList, 
  MediaStats,
  MediaDelete,
  SocialMediaOptimization,
  SocialMediaOptimizationResponse
} from '../models';
import { tap, map } from 'rxjs/operators';

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
  private apiService = inject(ApiService);
  
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
   * Upload single media file
   */
  uploadMedia(file: File, options?: UploadOptions): Observable<any> {
    this.setLoading(true);
    this.setUploadProgress(0);
    
    return this.apiService.uploadMedia(file).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            const newMedia = response.data;
            const currentMedia = this.getMediaState().media;
            
            this.updateMediaState({
              media: [newMedia, ...currentMedia],
              currentMedia: newMedia,
              isLoading: false,
              error: null,
              uploadProgress: 100
            });
          }
        },
        error: (error: any) => {
          console.error('Error uploading media:', error);
          this.setError(error.message);
          this.setLoading(false);
          this.setUploadProgress(0);
        }
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
   */
  getMedia(mediaId: string): Observable<any> {
    return this.apiService.getMedia(parseInt(mediaId)).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateMediaState({ currentMedia: response.data });
          }
        },
        error: (error: any) => {
          console.error('Error fetching media:', error);
        }
      })
    );
  }

  /**
   * Delete media
   */
  deleteMedia(mediaId: string): Observable<any> {
    return this.apiService.deleteMedia(parseInt(mediaId)).pipe(
      tap({
        next: () => {
          const currentMedia = this.getMediaState().media;
          const updatedMedia = currentMedia.filter((m: Media) => m.id !== mediaId);
          this.updateMediaState({ media: updatedMedia });
        },
        error: (error: any) => {
          console.error('Error deleting media:', error);
        }
      })
    );
  }

  /**
   * Get media URLs
   */
  getMediaUrls(mediaId: string): Observable<any> {
    return this.apiService.getMediaUrls(parseInt(mediaId));
  }

  /**
   * Get media status
   */
  getMediaStatus(mediaId: string): Observable<any> {
    return this.apiService.getMediaStatus(parseInt(mediaId));
  }

  /**
   * Optimize for social media
   */
  optimizeForSocial(mediaId: string, optimizationData: SocialMediaOptimization): Observable<any> {
    return this.apiService.optimizeForSocial(parseInt(mediaId), optimizationData);
  }

  /**
   * Remove background
   */
  removeBackground(mediaId: string): Observable<any> {
    return this.apiService.removeBackground(parseInt(mediaId));
  }

  /**
   * Get media list
   */
  getMediaList(params?: any): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.getMediaList(params).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateMediaState({
              media: response.data.media,
              isLoading: false,
              error: null
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching media list:', error);
          this.setError(error.message);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get media statistics
   */
  getMediaStats(): Observable<any> {
    return this.apiService.getMediaStats();
  }

  // ============================================================================
  // PRODUCT MEDIA OPERATIONS
  // ============================================================================

  /**
   * Get product images
   */
  getProductImages(productId: string): Observable<any> {
    return this.apiService.getProductImages(productId);
  }

  /**
   * Add product image
   */
  addProductImage(productId: string, file: File): Observable<any> {
    return this.apiService.addProductImage(productId, file);
  }

  /**
   * Delete product image
   */
  deleteProductImage(productId: string, imageId: number): Observable<any> {
    return this.apiService.deleteProductImage(productId, imageId);
  }

  // ============================================================================
  // SOCIAL POST MEDIA OPERATIONS
  // ============================================================================

  /**
   * Get social post media
   */
  getSocialPostMedia(postId: string): Observable<any> {
    return this.apiService.getSocialPostMedia(postId);
  }

  /**
   * Add social post media
   */
  addSocialPostMedia(postId: string, file: File): Observable<any> {
    return this.apiService.addSocialPostMedia(postId, file);
  }

  /**
   * Delete social post media
   */
  deleteSocialPostMedia(postId: string, mediaId: number): Observable<any> {
    return this.apiService.deleteSocialPostMedia(postId, mediaId);
  }

  // ============================================================================
  // REQUEST MEDIA OPERATIONS
  // ============================================================================

  /**
   * Get request images
   */
  getRequestImages(requestId: string): Observable<any> {
    return this.apiService.getRequestImages(requestId);
  }

  /**
   * Add request image
   */
  addRequestImage(requestId: string, file: File): Observable<any> {
    return this.apiService.addRequestImage(requestId, file);
  }

  /**
   * Delete request image
   */
  deleteRequestImage(requestId: string, imageId: number): Observable<any> {
    return this.apiService.deleteRequestImage(requestId, Number(imageId));
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
   */
  downloadMedia(mediaId: number): Observable<any> {
    return this.apiService.downloadMedia(mediaId);
  }

  /**
   * Get media variants
   */
  getMediaVariants(mediaId: number): Observable<any> {
    return this.apiService.getMediaVariants(mediaId);
  }

  /**
   * Generate media variants
   */
  generateVariants(mediaId: number, variantData: any): Observable<any> {
    return this.apiService.generateVariants(mediaId, variantData);
  }

  updateMedia(mediaId: string, updateData: any): Observable<any> {
    return this.apiService.updateMedia(parseInt(mediaId), updateData).pipe(
      tap({
        next: (response: any) => {
          const currentMedia = this.getMediaState().media;
          const updatedMedia = currentMedia.map(m => 
            m.id === mediaId ? { ...m, ...response.data } : m
          );
          this.updateMediaState({ media: updatedMedia });
        },
        error: (error: any) => {
          console.error('Error updating media:', error);
        }
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