/**
 * Favorites Domain
 *
 * Exports all favorites-related models, repositories, and services.
 */

// Domain Models
export { Favorite } from './models/favorite.model';

// DTOs
export type {
  FavoriteDto,
  FavoriteCreateDto,
  FavoriteSearchParamsDto,
  FavoritesResponseDto,
} from './models/favorite.dto';

// Repository
export { FavoriteRepository } from './repositories/favorite.repository';

// Service
export { FavoriteService } from './services/favorite.service';

