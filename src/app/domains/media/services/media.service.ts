/**
 * Media Domain Service
 * 
 * Manages media uploads, processing, and optimization.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { MediaRepository } from '../repositories/media.repository';
import { Media } from '../models/media.model';
import {
  UploadOptionsDto,
  SocialMediaOptimizationDto
} from '../models/media.dto';
import { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { ApiService } from '../../../core/services/api.service';

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
  private apiService = inject(ApiService); // Temporary: for methods not yet migrated to repository
  
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

  /**
   * Delete media
   * Business logic: Check if media can be deleted
   */
  deleteMedia(id: string): Observable<void> {
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
          const updatedMedia = currentMedia.filter(m => m.id !== id);
          this.updateState({ media: updatedMedia });
        },
        error: (error) => {
          this.setError(error.message || 'Failed to delete media');
        }
      }),
      map(() => undefined)
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
    return this.getMedia(id).pipe(
      tap({
        next: (media) => {
          if (!media.isImage()) {
            throw new Error('Background removal is only available for images');
          }
        }
      })
    ).pipe(
      // Switch to remove background operation
      tap(() => {
        return this.mediaRepository.removeBackground(id);
      })
    ) as Observable<Media>;

    // Simplified version
    return this.mediaRepository.removeBackground(id).pipe(
      tap({
        next: (media) => {
          this.updateState({ currentMedia: media });
        }
      })
    );
  }

  /**
   * Get media statistics
   */
  getStats(): Observable<any> {
    return this.mediaRepository.getStats();
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
   * Upload media for social post
   * TODO: Migrate to MediaRepository when method is added
   * Temporary: delegates to ApiService
   * Note: This overloads the existing uploadMedia method for social posts
   */
  uploadSocialPostMedia(postId: string, file: File): Observable<any> {
    return this.apiService.addSocialPostMedia(postId, file);
  }

  /**
   * Delete media for social post
   * TODO: Migrate to MediaRepository when method is added
   * Temporary: delegates to ApiService
   * Note: This is separate from deleteMedia(id) which deletes by media ID
   */
  deleteSocialPostMedia(postId: string, mediaId: number): Observable<any> {
    return this.apiService.deleteSocialPostMedia(postId, mediaId);
  }

  /**
   * Get media list for social post
   * TODO: Migrate to MediaRepository when method is added
   * Temporary: delegates to ApiService
   * Note: This overloads the existing getMediaList method for social posts
   */
  getSocialPostMediaList(postId: string): Observable<any> {
    return this.apiService.getSocialPostMedia(postId);
  }
}

