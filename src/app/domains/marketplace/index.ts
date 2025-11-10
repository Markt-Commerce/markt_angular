/**
 * Marketplace Domain - Public API
 * 
 * This index file exports the public API of the marketplace domain.
 * Other parts of the application should only import from this file.
 */

// Domain Models
export { Product } from './models/product.model';

// DTOs (only if needed for component forms)
export type { 
  ProductDto, 
  CreateProductDto, 
  UpdateProductDto,
  ProductSearchParamsDto 
} from './models/product.dto';

// Services
export { MarketplaceService } from './services/marketplace.service';

// Repositories (usually not exported, but available if needed)
export { ProductRepository } from './repositories/product.repository';
