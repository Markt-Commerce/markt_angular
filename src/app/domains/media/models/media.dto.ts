/**
 * Media DTOs
 * 
 * API request/response types for media.
 */

export interface MediaVariantDto {
  id: string;
  variant_type: string;
  quality: string;
  width: number;
  height: number;
  format: string;
  file_size: number;
  url: string;
  storage_key: string;
  processing_time: number;
}

export interface MediaDto {
  id: string;
  user_id: string;
  original_filename: string;
  original_url: string;
  thumbnail_url: string;
  mobile_url: string;
  tablet_url: string;
  desktop_url: string;
  social_square_url: string;
  social_post_url: string;
  social_story_url: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video';
  duration?: number;
  alt_text?: string;
  caption?: string;
  is_public: boolean;
  background_removed: boolean;
  compression_quality?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  storage_key: string;
  exif_data?: Record<string, unknown>;
  variants: MediaVariantDto[];
  created_at: string;
  updated_at: string;
  url?: string;
}

export interface MediaUploadResponseDto {
  success: boolean;
  message: string;
  media: MediaDto;
  urls: Record<string, string>;
  variants: MediaVariantDto[];
  processing_time: number;
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
  platform: string;
  post_type: string;
  aspect_ratio?: number;
}

export interface SocialMediaOptimizationResponseDto {
  original_url: string;
  optimized_url: string;
  platform: string;
  post_type: string;
  dimensions: { width: number; height: number };
  file_size: number;
}

export interface UploadOptionsDto {
  compression?: number;
  remove_background?: boolean;
  generate_variants?: boolean;
  is_public?: boolean;
}

export interface MediaUpdateDto {
  alt_text?: string;
  caption?: string;
  is_public?: boolean;
}

export interface MediaVariantGenerateDto {
  variant_type: string;
  quality?: string;
  width?: number;
  height?: number;
  format?: string;
}

