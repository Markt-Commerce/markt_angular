/**
 * Authentication Domain - Public API
 */

// Models
export { User, UserSession } from './models/user.model';
export type { UserRole, Address, BuyerAccountData, SellerAccountData } from './models/user.model';

export { Shop, ShopDetail } from './models/shop.model';
export type { ShopCategory, ShopStats, ShopUser, ShopRecentProduct, ShopRecentPost } from './models/shop.model';

export { SellerAnalyticsOverview, SellerAnalyticsTimeseries } from './models/seller-analytics.model';
export type { AnalyticsTimeseriesPoint, AnalyticsTimeseriesTotals } from './models/seller-analytics.model';

export { StartCard, StartCardsResponse, StartCardsMetadata } from './models/seller-start-cards.model';
export type { StartCardCTA, StartCardProgress } from './models/seller-start-cards.model';

// DTOs
export type {
  UserDto,
  LoginDto,
  RegisterDto,
  RegisterResponseDto,
  ProfileUpdateDto,
  BuyerAccountCreateDto,
  SellerAccountCreateDto,
  BuyerAccountUpdateDto,
  SellerAccountUpdateDto,
  UserSettingsDto,
  UserSettingsUpdateDto,
  PublicProfileDto,
  UserSearchParamsDto,
  UserPaginationDto,
  ShopDto,
  ShopSearchParamsDto,
  ShopListDto,
  ShopDetailDto,
  ShopCategoryDto,
  SellerAnalyticsOverviewDto,
  SellerAnalyticsOverviewQueryDto,
  SellerAnalyticsTimeseriesDto,
  SellerAnalyticsTimeseriesQueryDto,
  StartCardDto,
  StartCardCTADto,
  StartCardProgressDto,
  StartCardsResponseDto,
  StartCardsMetadataDto
} from './models/user.dto';

// Services
export { AuthService } from './services/auth.service';
export type { AuthState } from './services/auth.service';

export { ShopService } from './services/shop.service';
export { SellerAnalyticsService } from './services/seller-analytics.service';
export { SellerStartCardsService } from './services/seller-start-cards.service';

// Repositories
export { UserRepository } from './repositories/user.repository';
export { ShopRepository } from './repositories/shop.repository';
export { SellerAnalyticsRepository } from './repositories/seller-analytics.repository';
export { SellerStartCardsRepository } from './repositories/seller-start-cards.repository';

