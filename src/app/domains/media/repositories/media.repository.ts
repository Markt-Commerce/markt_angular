/**
 * Media Repository
 * 
 * Handles all media-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse, PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Media, MediaVariant } from '../models/media.model';
import {
  MediaDto,
  MediaVariantDto,
  MediaUploadResponseDto,
  MediaListDto,
  MediaStatsDto,
  SocialMediaOptimizationDto,
  SocialMediaOptimizationResponseDto,
  UploadOptionsDto,
  MediaUpdateDto,
  MediaVariantGenerateDto
} from '../models/media.dto';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaRepository {
  private apiClient = inject(ApiClientService);
  private http = inject(HttpClient);
  private readonly baseEndpoint = '/api/v1/media';

  /**
   * Convert MediaVariantDto to MediaVariant domain model
   */
  private variantToDomain(dto: MediaVariantDto): MediaVariant {
    return new MediaVariant(
      dto.id,
      dto.variant_type,
      dto.quality,
      dto.width,
      dto.height,
      dto.format,
      dto.file_size,
      dto.url,
      dto.storage_key,
      dto.processing_time
    );
  }

  /**
   * Convert MediaDto to Media domain model
   */
  private toDomain(dto: MediaDto): Media {
    const variants = dto.variants.map(variantDto => this.variantToDomain(variantDto));

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
      variants,
      dto.exif_data
    );
  }

  /**
   * Upload media file
   * Uses HttpClient directly for file upload with progress tracking
   */
  upload(file: File, options?: UploadOptionsDto): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      if (options.compression !== undefined) {
        formData.append('compression', options.compression.toString());
      }
      if (options.remove_background !== undefined) {
        formData.append('remove_background', options.remove_background.toString());
      }
      if (options.generate_variants !== undefined) {
        formData.append('generate_variants', options.generate_variants.toString());
      }
      if (options.is_public !== undefined) {
        formData.append('is_public', options.is_public.toString());
      }
    }

    const apiBaseUrl = environment.apiBaseUrl;
    const isAbsolute = /^https?:\/\//i.test(apiBaseUrl);
    const baseUrl = isAbsolute ? apiBaseUrl : apiBaseUrl;

    return this.http.post<ApiResponse<MediaUploadResponseDto>>(
      `${baseUrl}${this.baseEndpoint}/upload`,
      formData,
      {
        withCredentials: true,
        reportProgress: true
      }
    ).pipe(
      map(response => this.toDomain(response.data.media))
    );
  }

  /**
   * Get media by ID
   */
  findById(id: string): Observable<Media> {
    return this.apiClient.get<MediaDto>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Get all media with pagination
   */
  findAll(params?: Record<string, unknown>): Observable<Media[]> {
    return this.apiClient.get<MediaDto[]>(this.baseEndpoint, params).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  /**
   * Get media with pagination
   */
  findPaginated(params?: Record<string, unknown>): Observable<PaginatedResponse<Media>> {
    return this.apiClient.get<MediaListDto>(this.baseEndpoint, params).pipe(
      map(response => ({
        items: response.data.media.map(dto => this.toDomain(dto)),
        pagination: {
          page: response.data.page,
          per_page: response.data.per_page,
          total_items: response.data.total,
          total_pages: Math.ceil(response.data.total / response.data.per_page),
          first_page: 1,
          last_page: Math.ceil(response.data.total / response.data.per_page),
          previous_page: response.data.has_prev ? response.data.page - 1 : null,
          next_page: response.data.has_next ? response.data.page + 1 : null,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev
        }
      }))
    );
  }

  /**
   * Delete media
   */
  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/${id}`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get media statistics
   */
  getStats(): Observable<MediaStatsDto> {
    return this.apiClient.get<MediaStatsDto>(`${this.baseEndpoint}/stats`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Optimize for social media
   */
  optimizeForSocial(id: string, optimization: SocialMediaOptimizationDto): Observable<SocialMediaOptimizationResponseDto> {
    return this.apiClient.post<SocialMediaOptimizationResponseDto>(
      `${this.baseEndpoint}/${id}/optimize-social`,
      optimization
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove background
   */
  removeBackground(id: string): Observable<Media> {
    return this.apiClient.post<MediaDto>(`${this.baseEndpoint}/${id}/remove-background`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Get media status
   */
  getStatus(id: string): Observable<{ processing_status: string }> {
    return this.apiClient.get<{ processing_status: string }>(`${this.baseEndpoint}/${id}/status`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Download media file
   */
  download(id: string): Observable<Blob> {
    const apiBaseUrl = environment.apiBaseUrl;
    const isAbsolute = /^https?:\/\//i.test(apiBaseUrl);
    const baseUrl = isAbsolute ? apiBaseUrl : apiBaseUrl;

    return this.http.get(
      `${baseUrl}${this.baseEndpoint}/${id}/download`,
      {
        responseType: 'blob',
        withCredentials: true
      }
    );
  }

  /**
   * Get media variants
   */
  getVariants(id: string): Observable<MediaVariant[]> {
    return this.apiClient.get<MediaVariantDto[]>(`${this.baseEndpoint}/${id}/variants`).pipe(
      map(response => response.data.map(dto => this.variantToDomain(dto)))
    );
  }

  /**
   * Generate media variants
   */
  generateVariants(id: string, variantData: MediaVariantGenerateDto): Observable<MediaVariant[]> {
    return this.apiClient.post<MediaVariantDto[]>(`${this.baseEndpoint}/${id}/variants`, variantData).pipe(
      map(response => response.data.map(dto => this.variantToDomain(dto)))
    );
  }

  /**
   * Update media metadata
   */
  update(id: string, data: MediaUpdateDto): Observable<Media> {
    return this.apiClient.put<MediaDto>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => this.toDomain(response.data))
    );
  }
}

