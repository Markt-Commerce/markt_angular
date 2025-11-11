/**
 * Media Repository
 *
 * Handles all media-related API calls.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../../core/infrastructure/http/api-response.types';
import { Media, MediaVariant } from '../models/media.model';
import {
  MediaBackgroundRemovalResponseDto,
  MediaDeleteResponseDto,
  MediaDownloadResponseDto,
  MediaDto,
  MediaListDto,
  MediaStatusDto,
  MediaStatsDto,
  MediaUploadResponseDto,
  MediaUpdateDto,
  MediaUrlsDto,
  MediaVariantDto,
  MediaVariantRequestDto,
  MediaVariantGenerationResponseDto,
  ProductImageDto,
  RequestImageDto,
  SocialMediaOptimizationDto,
  SocialMediaOptimizationResponseDto,
  SocialMediaPostDto,
  UploadOptionsDto,
} from '../models/media.dto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MediaRepository {
  private readonly baseEndpoint = '/media';
  private readonly apiClient = inject(ApiClientService);
  private readonly http = inject(HttpClient);

  private resolveApiBaseUrl(): string {
    const apiBaseUrl = environment.apiBaseUrl;
    const isAbsolute = /^https?:\/\//i.test(apiBaseUrl);
    return isAbsolute ? apiBaseUrl : apiBaseUrl;
  }

  private variantToDomain(dto: MediaVariantDto): MediaVariant {
    return new MediaVariant(
      dto.id,
      dto.variant_type,
      dto.storage_key,
      dto.width ?? null,
      dto.height ?? null,
      dto.file_size ?? null,
      dto.quality ?? null,
      dto.format ?? null,
      dto.url ?? null,
      dto.processing_time ?? null
    );
  }

  private toDomain(dto: MediaDto): Media {
    const variants = (dto.variants ?? []).map((variantDto) =>
      this.variantToDomain(variantDto)
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
  }

  private appendUploadOptions(
    formData: FormData,
    options?: UploadOptionsDto
  ): void {
    if (!options) return;

    if (options.alt_text) {
      formData.append('alt_text', options.alt_text);
    }

    if (options.caption) {
      formData.append('caption', options.caption);
    }

    if (options.is_public !== undefined) {
      formData.append('is_public', String(options.is_public));
    }

    if (options.remove_background !== undefined) {
      formData.append('remove_background', String(options.remove_background));
    }

    if (options.compression_quality !== undefined) {
      formData.append(
        'compression_quality',
        String(options.compression_quality)
      );
    }

    if (options.optimize_for_social !== undefined) {
      formData.append(
        'optimize_for_social',
        String(options.optimize_for_social)
      );
    }
  }

  private toFormData(
    file: File,
    extraFields?: Record<string, string | Blob>
  ): FormData {
    const formData = new FormData();
    formData.append('file', file);
    if (extraFields) {
      Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return formData;
  }

  upload(file: File, options?: UploadOptionsDto): Observable<Media> {
    const formData = this.toFormData(file);
    this.appendUploadOptions(formData, options);

    const baseUrl = this.resolveApiBaseUrl();

    return this.http
      .post<ApiResponse<MediaUploadResponseDto>>(
        `${baseUrl}${this.baseEndpoint}/upload`,
        formData,
        {
          withCredentials: true,
        }
      )
      .pipe(map((response) => this.toDomain(response.data.media)));
  }

  findById(id: string | number): Observable<Media> {
    return this.apiClient
      .get<MediaDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  findAll(params?: Record<string, unknown>): Observable<Media[]> {
    return this.findPaginated(params).pipe(map((result) => result.items));
  }

  findPaginated(
    params?: Record<string, unknown>
  ): Observable<PaginatedResponse<Media>> {
    return this.apiClient.get<MediaListDto>(this.baseEndpoint, params).pipe(
      map((response) => ({
        items: response.data.media.map((dto) => this.toDomain(dto)),
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
          has_prev: response.data.has_prev,
        },
      }))
    );
  }

  getUrls(
    id: string | number,
    includeVariants = true
  ): Observable<MediaUrlsDto> {
    const params = {
      include_variants: String(includeVariants),
    };
    return this.apiClient
      .get<MediaUrlsDto>(`${this.baseEndpoint}/${id}/urls`, params)
      .pipe(map((response) => response.data));
  }

  delete(id: string | number): Observable<MediaDeleteResponseDto> {
    return this.apiClient
      .delete<MediaDeleteResponseDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => response.data));
  }

  getStats(): Observable<MediaStatsDto> {
    return this.apiClient
      .get<MediaStatsDto>(`${this.baseEndpoint}/stats`)
      .pipe(map((response) => response.data));
  }

  optimizeForSocial(
    id: string | number,
    optimization: SocialMediaOptimizationDto
  ): Observable<SocialMediaOptimizationResponseDto> {
    return this.apiClient
      .post<SocialMediaOptimizationResponseDto>(
        `${this.baseEndpoint}/${id}/social-optimize`,
        optimization
      )
      .pipe(map((response) => response.data));
  }

  removeBackground(
    id: string | number
  ): Observable<MediaBackgroundRemovalResponseDto> {
    return this.apiClient
      .post<MediaBackgroundRemovalResponseDto>(
        `${this.baseEndpoint}/${id}/remove-background`
      )
      .pipe(map((response) => response.data));
  }

  getStatus(id: string | number): Observable<MediaStatusDto> {
    return this.apiClient
      .get<MediaStatusDto>(`${this.baseEndpoint}/${id}/status`)
      .pipe(map((response) => response.data));
  }

  download(id: string | number): Observable<MediaDownloadResponseDto> {
    return this.apiClient
      .get<MediaDownloadResponseDto>(`${this.baseEndpoint}/${id}/download`)
      .pipe(map((response) => response.data));
  }

  generateVariants(
    id: string | number,
    request?: MediaVariantRequestDto
  ): Observable<MediaVariantGenerationResponseDto> {
    return this.apiClient
      .post<MediaVariantGenerationResponseDto>(
        `${this.baseEndpoint}/${id}/generate-variants`,
        request ?? {}
      )
      .pipe(map((response) => response.data));
  }

  update(id: string | number, data: MediaUpdateDto): Observable<Media> {
    return this.apiClient
      .put<MediaDto>(`${this.baseEndpoint}/${id}`, data)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  uploadProductImage(
    productId: string,
    file: File,
    options?: { sort_order?: number; is_featured?: boolean; alt_text?: string }
  ): Observable<ProductImageDto> {
    const extra: Record<string, string> = {};
    if (options?.sort_order !== undefined) {
      extra['sort_order'] = String(options.sort_order);
    }
    if (options?.is_featured !== undefined) {
      extra['is_featured'] = String(options.is_featured);
    }
    if (options?.alt_text) {
      extra['alt_text'] = options.alt_text;
    }

    const formData = this.toFormData(file, extra);
    const baseUrl = this.resolveApiBaseUrl();

    return this.http
      .post<ApiResponse<ProductImageDto>>(
        `${baseUrl}${this.baseEndpoint}/products/${productId}/images`,
        formData,
        {
          withCredentials: true,
        }
      )
      .pipe(map((response) => response.data));
  }

  getProductImages(productId: string): Observable<ProductImageDto[]> {
    return this.apiClient
      .get<ProductImageDto[]>(
        `${this.baseEndpoint}/products/${productId}/images`
      )
      .pipe(map((response) => response.data));
  }

  deleteProductImage(
    productId: string,
    imageId: number
  ): Observable<MediaBackgroundRemovalResponseDto> {
    return this.apiClient
      .delete<MediaBackgroundRemovalResponseDto>(
        `${this.baseEndpoint}/products/${productId}/images/${imageId}`
      )
      .pipe(map((response) => response.data));
  }

  uploadSocialPostMedia(
    postId: string,
    file: File,
    options?: { platform?: string; post_type?: string; aspect_ratio?: string }
  ): Observable<SocialMediaPostDto> {
    const extra: Record<string, string> = {};
    if (options?.platform) {
      extra['platform'] = options.platform;
    }
    if (options?.post_type) {
      extra['post_type'] = options.post_type;
    }
    if (options?.aspect_ratio) {
      extra['aspect_ratio'] = options.aspect_ratio;
    }

    const formData = this.toFormData(file, extra);
    const baseUrl = this.resolveApiBaseUrl();

    return this.http
      .post<ApiResponse<SocialMediaPostDto>>(
        `${baseUrl}${this.baseEndpoint}/social-posts/${postId}/media`,
        formData,
        {
          withCredentials: true,
        }
      )
      .pipe(map((response) => response.data));
  }

  getSocialPostMedia(postId: string): Observable<SocialMediaPostDto[]> {
    return this.apiClient
      .get<SocialMediaPostDto[]>(
        `${this.baseEndpoint}/social-posts/${postId}/media`
      )
      .pipe(map((response) => response.data));
  }

  deleteSocialPostMedia(
    postId: string,
    mediaId: number
  ): Observable<MediaBackgroundRemovalResponseDto> {
    return this.apiClient
      .delete<MediaBackgroundRemovalResponseDto>(
        `${this.baseEndpoint}/social-posts/${postId}/media/${mediaId}`
      )
      .pipe(map((response) => response.data));
  }

  uploadRequestImage(
    requestId: string,
    file: File,
    options?: { is_primary?: boolean }
  ): Observable<RequestImageDto> {
    const extra: Record<string, string> = {};
    if (options?.is_primary !== undefined) {
      extra['is_primary'] = String(options.is_primary);
    }

    const formData = this.toFormData(file, extra);
    const baseUrl = this.resolveApiBaseUrl();

    return this.http
      .post<ApiResponse<RequestImageDto>>(
        `${baseUrl}${this.baseEndpoint}/requests/${requestId}/images`,
        formData,
        {
          withCredentials: true,
        }
      )
      .pipe(map((response) => response.data));
  }

  getRequestImages(requestId: string): Observable<RequestImageDto[]> {
    return this.apiClient
      .get<RequestImageDto[]>(
        `${this.baseEndpoint}/requests/${requestId}/images`
      )
      .pipe(map((response) => response.data));
  }

  deleteRequestImage(
    requestId: string,
    imageId: number
  ): Observable<MediaBackgroundRemovalResponseDto> {
    return this.apiClient
      .delete<MediaBackgroundRemovalResponseDto>(
        `${this.baseEndpoint}/requests/${requestId}/images/${imageId}`
      )
      .pipe(map((response) => response.data));
  }
}
