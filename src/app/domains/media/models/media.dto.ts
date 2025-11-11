/**
 * Media DTOs
 * 
 * API request/response types for media.
 */

export type MediaTypeDto = 'image' | 'video' | 'document' | 'audio';

export type MediaVariantTypeDto =
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

export type MediaProcessingStatusDto =
  | 'pending'
  | 'processing'
  | 'uploaded'
  | 'completed'
  | 'failed';

export interface MediaVariantDto {
  id: number;
  variant_type: MediaVariantTypeDto;
  storage_key: string;
  width: number;
  height: number;
  file_size: number;
  quality?: number | null;
  format?: string | null;
  processing_time?: number | null;
  url?: string | null;
}

export interface MediaDto {
  id: number;
  user_id: string;
  storage_key: string;
  media_type: MediaTypeDto;
  mime_type: string;
  width: number | null;
  height: number | null;
  file_size: number;
  duration?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  is_public: boolean;
  original_filename?: string | null;
  processing_status: MediaProcessingStatusDto;
  processing_error?: string | null;
  background_removed: boolean;
  compression_quality?: number | null;
  exif_data?: Record<string, unknown> | null;
  original_url?: string | null;
  thumbnail_url?: string | null;
  mobile_url?: string | null;
  tablet_url?: string | null;
  desktop_url?: string | null;
  social_square_url?: string | null;
  social_story_url?: string | null;
  social_post_url?: string | null;
  variants?: MediaVariantDto[];
  created_at: string;
  updated_at: string | null;
}

export interface MediaUploadResponseDto {
  success: boolean;
  message: string;
  media: MediaDto;
  urls: Record<string, unknown>;
  variants: MediaVariantDto[];
  upload_time?: number;
  processing_note?: string;
}

export interface MediaListDto {
  media: MediaDto[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface MediaStatsDto {
  total_media: number;
  total_images: number;
  total_videos: number;
  total_size: number;
  average_file_size: number;
  processing_time_avg: number;
  variants_generated: number;
}

export interface SocialMediaOptimizationDto {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  post_type: 'story' | 'post' | 'reel' | 'carousel';
  aspect_ratio?: string;
}

export interface SocialMediaOptimizationResponseDto {
  platform: SocialMediaOptimizationDto['platform'];
  post_type: SocialMediaOptimizationDto['post_type'];
  optimized_url: string | null;
  original_url: string | null;
  dimensions: Record<string, unknown>;
  file_size: number;
  message?: string;
}

export interface UploadOptionsDto {
  alt_text?: string;
  caption?: string;
  is_public?: boolean;
  remove_background?: boolean;
  compression_quality?: number;
  optimize_for_social?: boolean;
}

export interface MediaUpdateDto {
  alt_text?: string;
  caption?: string;
  is_public?: boolean;
}

export interface MediaVariantRequestDto {
  platform?: SocialMediaOptimizationDto['platform'];
  post_type?: SocialMediaOptimizationDto['post_type'];
  variant_types?: MediaVariantTypeDto[];
}

export interface MediaVariantGenerationResponseDto {
  success: boolean;
  message: string;
  media_id: number;
  variants_generated: number;
}

export interface MediaUrlsDto {
  original: string | null;
  type: MediaTypeDto;
  mime_type: string;
  variants?: Record<
    string,
    {
      url: string | null;
      width: number | null;
      height: number | null;
      file_size: number | null;
    }
  >;
}

export interface MediaStatusDto {
  media_id: number;
  processing_status: MediaProcessingStatusDto;
  processing_error?: string | null;
  variants_count: number;
  variants: MediaVariantDto[];
  urls: MediaUrlsDto;
  created_at: string;
  updated_at?: string | null;
}

export interface MediaDeleteResponseDto {
  success: boolean;
  message: string;
  deleted_files: number;
}

export interface MediaBackgroundRemovalResponseDto {
  success: boolean;
  message: string;
}

export interface MediaDownloadResponseDto {
  download_url: string;
}

export interface ProductImageDto {
  id: number;
  product_id: string;
  media_id: number;
  sort_order: number;
  is_featured: boolean;
  alt_text?: string | null;
  media?: MediaDto;
}

export interface SocialMediaPostDto {
  id: number;
  post_id: string;
  media_id: number;
  platform?: SocialMediaOptimizationDto['platform'];
  post_type?: SocialMediaOptimizationDto['post_type'];
  sort_order: number;
  aspect_ratio?: string | null;
  optimized_for_platform: boolean;
  media?: MediaDto;
}

export interface RequestImageDto {
  id: number;
  request_id: string;
  media_id: number;
  is_primary: boolean;
  sort_order?: number;
  media?: MediaDto;
}

