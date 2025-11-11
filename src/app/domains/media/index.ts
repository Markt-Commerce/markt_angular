/**
 * Media Domain - Public API
 */

export { Media, MediaVariant } from './models/media.model';
export type {
  MediaType,
  MediaVariantType,
  ProcessingStatus
} from './models/media.model';
export type {
  MediaDto,
  MediaVariantDto,
  MediaUploadResponseDto,
  MediaListDto,
  MediaStatsDto,
  SocialMediaOptimizationDto,
  SocialMediaOptimizationResponseDto,
  UploadOptionsDto,
  MediaUrlsDto,
  MediaStatusDto,
  MediaDeleteResponseDto,
  MediaDownloadResponseDto,
  ProductImageDto,
  SocialMediaPostDto,
  RequestImageDto,
  MediaVariantRequestDto,
  MediaBackgroundRemovalResponseDto,
  MediaVariantGenerationResponseDto
} from './models/media.dto';
export { MediaService } from './services/media.service';
export type { MediaState } from './services/media.service';
export { MediaRepository } from './repositories/media.repository';

