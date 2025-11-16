/**
 * Media Domain Service
 * 
 * Manages media uploads, processing, and optimization.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { MediaRepository } from '../repositories/media.repository';
import { Media } from '../models/media.model';
import {
  UploadOptionsDto,
  SocialMediaOptimizationDto,
  MediaDeleteResponseDto,
  MediaBackgroundRemovalResponseDto,
  MediaDownloadResponseDto,
  MediaStatusDto,
  MediaUrlsDto,
  MediaVariantTypeDto,
  MediaVariantGenerationResponseDto,
  ProductImageDto,
  SocialMediaPostDto,
  RequestImageDto,
  MediaUpdateDto
} from '../models/media.dto';
import { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';

export interface MediaState {
  media: Media[];
  currentMedia: Media | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
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

  /**
   * Upload media file
   * Business logic: Validate file before upload
   */
  uploadMedia(file: File, options?: UploadOptionsDto): Observable<Media> {
    this.setLoading(true);
    this.setUploadProgress(0);

    // Business validation
    if (!file) {
      throw new Error('File is required');
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size cannot exceed 50MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Allowed types: JPEG, PNG, GIF, WebP, MP4, WebM');
    }

    return this.mediaRepository.upload(file, options).pipe(
      tap({
        next: (media) => {
          const currentMedia = this.getState().media;
          this.updateState({
            media: [media, ...currentMedia],
            currentMedia: media,
            isLoading: false,
            error: null,
            uploadProgress: 100
          });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to upload media');
          this.setLoading(false);
          this.setUploadProgress(0);
        }
      })
    );
  }

  /**
   * Get media by ID
   */
  getMedia(id: string): Observable<Media> {
    return this.mediaRepository.findById(id).pipe(
      tap({
        next: (media) => {
          this.updateState({ currentMedia: media });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load media');
        }
      })
    );
  }

  /**
   * Get all media
   */
  getMediaList(params?: Record<string, unknown>): Observable<Media[]> {
    this.setLoading(true);
    
    return this.mediaRepository.findAll(params).pipe(
      tap({
        next: (media) => {
          this.updateState({
            media,
            isLoading: false,
            error: null
          });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to load media list');
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get media with pagination
   */
  getMediaPaginated(params?: Record<string, unknown>): Observable<PaginatedResponse<Media>> {
    return this.mediaRepository.findPaginated(params);
  }

  getMediaUrls(id: string, includeVariants = true): Observable<MediaUrlsDto> {
    return this.mediaRepository.getUrls(id, includeVariants);
  }

  getMediaStatus(id: string): Observable<MediaStatusDto> {
    return this.mediaRepository.getStatus(id);
  }

  generateVariants(
    id: string,
    request?: {
      platform?: SocialMediaOptimizationDto['platform'];
      postType?: SocialMediaOptimizationDto['post_type'];
      variantTypes?: MediaVariantTypeDto[];
    }
  ): Observable<MediaVariantGenerationResponseDto> {
    const payload = request
      ? {
          platform: request.platform,
          post_type: request.postType,
          variant_types: request.variantTypes
        }
      : undefined;
    return this.mediaRepository.generateVariants(id, payload);
  }

  downloadMedia(id: string): Observable<MediaDownloadResponseDto> {
    return this.mediaRepository.download(id);
  }

  /**
   * Delete media
   * Business logic: Check if media can be deleted
   */
  deleteMedia(id: string): Observable<MediaDeleteResponseDto> {
    // Business rule: Check if media is still processing
    return this.getMedia(id).pipe(
      tap((media) => {
        if (media.isProcessing()) {
          throw new Error('Cannot delete media that is currently being processed');
        }
      }),
      switchMap(() => this.mediaRepository.delete(id)),
      tap({
        next: () => {
          const currentMedia = this.getState().media;
          const numericId = Number(id);
          const updatedMedia = Number.isNaN(numericId)
            ? currentMedia
            : currentMedia.filter((mediaItem) => mediaItem.id !== numericId);
          this.updateState({ media: updatedMedia });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to delete media');
        }
      })
    );
  }

  updateMedia(id: string, data: MediaUpdateDto): Observable<Media> {
    return this.mediaRepository.update(id, data).pipe(
      tap((media) => {
        const currentMedia = this.getState().media;
        const updatedMedia = currentMedia.map((item) =>
          item.id === media.id ? media : item
        );
        this.updateState({
          media: updatedMedia,
          currentMedia: media
        });
      })
    );
  }

  /**
   * Optimize for social media
   */
  optimizeForSocial(id: string, optimization: SocialMediaOptimizationDto): Observable<any> {
    if (!optimization.platform) {
      throw new Error('Platform is required');
    }

    if (!optimization.post_type) {
      throw new Error('Post type is required');
    }

    return this.mediaRepository.optimizeForSocial(id, optimization);
  }

  /**
   * Remove background from image
   */
  removeBackground(id: string): Observable<Media> {
    return this.mediaRepository.findById(id).pipe(
      tap((media) => {
          if (!media.isImage()) {
            throw new Error('Background removal is only available for images');
          }
      }),
      switchMap(() => this.mediaRepository.removeBackground(id)),
      switchMap(() => this.mediaRepository.findById(id)),
      tap((media) => {
          this.updateState({ currentMedia: media });
      })
    );
  }

  /**
   * Buyer request media helpers
   */
  uploadRequestImage(requestId: string, file: File, options?: { isPrimary?: boolean }): Observable<RequestImageDto> {
    return this.mediaRepository.uploadRequestImage(requestId, file, {
      is_primary: options?.isPrimary
    });
  }

  deleteRequestImage(requestId: string, imageId: number): Observable<MediaBackgroundRemovalResponseDto> {
    return this.mediaRepository.deleteRequestImage(requestId, imageId);
  }

  getRequestImages(requestId: string): Observable<RequestImageDto[]> {
    return this.mediaRepository.getRequestImages(requestId);
  }

  /**
   * Get media statistics
   */
  getStats(): Observable<any> {
    return this.mediaRepository.getStats();
  }

  uploadProductImage(
    productId: string,
    file: File,
    options?: { sortOrder?: number; isFeatured?: boolean; altText?: string }
  ): Observable<ProductImageDto> {
    return this.mediaRepository.uploadProductImage(productId, file, {
      sort_order: options?.sortOrder,
      is_featured: options?.isFeatured,
      alt_text: options?.altText
    });
  }

  getProductImages(productId: string): Observable<ProductImageDto[]> {
    return this.mediaRepository.getProductImages(productId);
  }

  deleteProductImage(productId: string, imageId: number): Observable<MediaBackgroundRemovalResponseDto> {
    return this.mediaRepository.deleteProductImage(productId, imageId);
  }

  /**
   * Private helper methods
   */
  private getState(): MediaState {
    return this.mediaStateSubject.value;
  }

  private updateState(partial: Partial<MediaState>): void {
    this.mediaStateSubject.next({
      ...this.mediaStateSubject.value,
      ...partial
    });
  }

  private setLoading(loading: boolean): void {
    this.updateState({ isLoading: loading });
  }

  private setError(error: string): void {
    this.updateState({ error, isLoading: false });
  }

  private setUploadProgress(progress: number): void {
    this.updateState({ uploadProgress: progress });
  }

  /**
   * Social post media helpers
   */
  uploadSocialPostMedia(postId: string, file: File, options?: { platform?: string; postType?: string; aspectRatio?: string }): Observable<SocialMediaPostDto> {
    return this.mediaRepository.uploadSocialPostMedia(postId, file, {
      platform: options?.platform,
      post_type: options?.postType,
      aspect_ratio: options?.aspectRatio
    });
  }

  deleteSocialPostMedia(postId: string, mediaId: number): Observable<MediaBackgroundRemovalResponseDto> {
    return this.mediaRepository.deleteSocialPostMedia(postId, mediaId);
  }

  getSocialPostMediaList(postId: string): Observable<SocialMediaPostDto[]> {
    return this.mediaRepository.getSocialPostMedia(postId);
  }
}

