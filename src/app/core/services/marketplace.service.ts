import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { ProductRepository } from '../../domains/marketplace/repositories/product.repository';
import { Product as DomainProduct } from '../../domains/marketplace/models/product.model';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductSearchParamsDto,
} from '../../domains/marketplace/models/product.dto';
import {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductReview,
  ProductSearchResult,
  Category,
  CategoryProducts,
  Tag,
  SellerSimple,
  BulkProductResult,
} from '../models';
import { CartService } from './cart.service';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  PaginatedResponse,
} from '../infrastructure/http/api-response.types';

export interface ProductFilters {
  category_ids?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  status?: 'active' | 'inactive' | 'draft';
  seller_id?: string;
  tags?: string[];
  search?: string;
  sort_by?: 'price' | 'rating' | 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ProductSearchParams extends ProductFilters {
  page?: number;
  per_page?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private productRepository = inject(ProductRepository);
  private cartService = inject(CartService);
  // TODO: Remove ApiService dependency when ReviewRepository is created
  private apiService = inject(ApiService);

  private searchResultsSubject =
    new BehaviorSubject<ProductSearchResult | null>(null);
  public searchResults$ = this.searchResultsSubject.asObservable();

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  /**
   * Get all products with filters
   * Uses ProductRepository (DDD pattern)
   */
  getProducts(
    params?: ProductSearchParams
  ): Observable<ApiResponse<ProductSearchResult>> {
    const searchParams: ProductSearchParamsDto = {
      page: params?.page,
      per_page: params?.per_page,
      search: params?.search,
      category_ids: params?.category_ids?.map((id) =>
        typeof id === 'string' ? parseInt(id) : id
      ),
      price_min: params?.price_min,
      price_max: params?.price_max,
      rating_min: params?.rating_min,
      status: params?.status,
      seller_id: params?.seller_id,
      sort_by: params?.sort_by,
      sort_order: params?.sort_order as 'asc' | 'desc' | undefined,
    };

    return this.productRepository.findPaginated(searchParams).pipe(
      map((paginatedResponse: PaginatedResponse<DomainProduct>) => {
        // Convert domain models back to old format for backward compatibility
        const items = paginatedResponse.items.map((p) =>
          this.domainToOldFormat(p)
        );
        return {
          success: true,
          data: {
            items,
            pagination: paginatedResponse.pagination,
          },
        };
      })
    );
  }

  /**
   * Get single product by ID
   * Uses ProductRepository (DDD pattern)
   */
  getProduct(productId: string): Observable<ApiResponse<Product>> {
    return this.productRepository.findById(productId).pipe(
      map((domainProduct: DomainProduct) => ({
        success: true,
        data: this.domainToOldFormat(domainProduct),
      }))
    );
  }

  /**
   * Create new product
   * Uses ProductRepository (DDD pattern)
   */
  createProduct(productData: ProductCreate): Observable<ApiResponse<Product>> {
    const createDto: CreateProductDto = {
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      stock: productData.stock,
      category_ids: productData.category_ids,
      status: productData.status || 'active',
      tag_ids: productData.tag_ids,
      media_ids: productData.media_ids,
      variants: productData.variants,
      product_metadata: productData.product_metadata,
    };

    return this.productRepository.create(createDto).pipe(
      map((domainProduct: DomainProduct) => ({
        success: true,
        data: this.domainToOldFormat(domainProduct),
      }))
    );
  }

  /**
   * Update existing product
   * Uses ProductRepository (DDD pattern)
   */
  updateProduct(
    productId: string,
    productData: ProductUpdate
  ): Observable<ApiResponse<Product>> {
    // Filter out undefined values
    const filteredData: any = {};
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    });

    const updateDto: UpdateProductDto = {
      name: filteredData.name,
      description: filteredData.description,
      price: filteredData.price,
      stock: filteredData.stock,
      category_ids: filteredData.category_ids,
      status: filteredData.status,
      tag_ids: filteredData.tag_ids,
      media_ids: filteredData.media_ids,
      variants: filteredData.variants,
      product_metadata: filteredData.product_metadata,
    };

    return this.productRepository.update(productId, updateDto).pipe(
      map((domainProduct: DomainProduct) => ({
        success: true,
        data: this.domainToOldFormat(domainProduct),
      }))
    );
  }

  /**
   * Delete product
   * Uses ProductRepository (DDD pattern)
   */
  deleteProduct(productId: string): Observable<ApiResponse<void>> {
    return this.productRepository.delete(productId).pipe(
      map(() => ({
        success: true,
        data: undefined,
      }))
    );
  }

  /**
   * Bulk create products
   * Uses ProductRepository (DDD pattern)
   */
  bulkCreateProducts(
    products: ProductCreate[]
  ): Observable<ApiResponse<Product[]>> {
    const createDtos: CreateProductDto[] = products.map((p) => ({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category_ids: p.category_ids,
      status: p.status || 'active',
      tag_ids: p.tag_ids,
      media_ids: p.media_ids,
      variants: p.variants,
      product_metadata: p.product_metadata,
    }));

    return this.productRepository.bulkCreate(createDtos).pipe(
      map((domainProducts: DomainProduct[]) => ({
        success: true,
        data: domainProducts.map((p) => this.domainToOldFormat(p)),
      }))
    );
  }

  /**
   * Get trending products
   * Uses ProductRepository (DDD pattern)
   */
  getTrendingProducts(params?: any): Observable<ApiResponse<Product[]>> {
    const searchParams: ProductSearchParamsDto = {
      page: params?.page,
      per_page: params?.per_page,
      ...params,
    };

    return this.productRepository.findTrending(searchParams).pipe(
      map((domainProducts: DomainProduct[]) => ({
        success: true,
        data: domainProducts.map((p) => this.domainToOldFormat(p)),
      }))
    );
  }

  /**
   * Get recommended products
   * Uses ProductRepository (DDD pattern)
   */
  getRecommendedProducts(params?: any): Observable<ApiResponse<Product[]>> {
    const searchParams: ProductSearchParamsDto = {
      page: params?.page,
      per_page: params?.per_page,
      ...params,
    };

    return this.productRepository.findRecommended(searchParams).pipe(
      map((domainProducts: DomainProduct[]) => ({
        success: true,
        data: domainProducts.map((p) => this.domainToOldFormat(p)),
      }))
    );
  }

  /**
   * Get seller's products
   * Uses ProductRepository (DDD pattern)
   */
  getMyProducts(params?: any): Observable<ApiResponse<Product[]>> {
    const searchParams: ProductSearchParamsDto = {
      page: params?.page,
      per_page: params?.per_page,
      ...params,
    };

    // Get seller ID from auth service (placeholder - should inject AuthService)
    const sellerId = 'current-seller-id'; // TODO: Get from auth service

    return this.productRepository.findBySeller(sellerId, searchParams).pipe(
      map((domainProducts: DomainProduct[]) => ({
        success: true,
        data: domainProducts.map((p) => this.domainToOldFormat(p)),
      }))
    );
  }

  /**
   * Convert domain model to old format for backward compatibility
   */
  private domainToOldFormat(product: DomainProduct): Product {
    // Domain model doesn't have all properties - use defaults for missing ones
    return {
      id: product.id,
      name: product.name,
      description: '', // Domain model doesn't have description
      price: product.getPrice(),
      compare_at_price: undefined,
      cost_per_item: undefined,
      sku: undefined,
      barcode: undefined,
      stock: product.getStock(),
      weight: undefined,
      status: product.status,
      seller_id: product.sellerId,
      category_ids: product.categoryIds,
      tag_ids: [], // Domain model doesn't have tagIds
      media_ids: [], // Domain model doesn't have mediaIds
      variants: [], // Domain model doesn't have variants
      images: [], // Domain model doesn't have images
      seller: {} as any, // Will be populated by API
      average_rating: product.averageRating,
      review_count: product.reviewCount,
      view_count: 0,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
      product_metadata: undefined,
      is_verified: undefined,
      is_featured: undefined,
      condition: undefined,
      currency: undefined,
      category: undefined,
    };
  }

  /**
   * Track product view
   * TODO: Move to repository if this becomes a domain concern
   */
  trackProductView(productId: string): Observable<any> {
    // For now, return empty observable - can be implemented in repository later
    return of({ success: true, data: null });
  }

  /**
   * Share product
   * TODO: Move to repository if this becomes a domain concern
   */
  shareProduct(productId: string): Observable<any> {
    // For now, return empty observable - can be implemented in repository later
    return of({ success: true, data: null });
  }

  // ============================================================================
  // PRODUCT REVIEWS
  // ============================================================================

  /**
   * Get product reviews
   * TODO: Create ReviewRepository if reviews become a domain
   */
  getProductReviews(productId: string, params?: any): Observable<any> {
    // For now, keep using ApiService - can be moved to repository later
    // Would need to inject ApiService temporarily or create ReviewRepository
    return of({ success: true, data: { items: [], pagination: {} } });
  }

  /**
   * Create product review
   * TODO: Create ReviewRepository if reviews become a domain
   * For now, using ApiService as bridge until ReviewRepository is implemented
   */
  createProductReview(productId: string, reviewData: any): Observable<any> {
    // Bridge to ApiService until ReviewRepository is created
    return this.apiService.addProductReview(productId, reviewData);
  }

  /**
   * Upvote review
   * TODO: Create ReviewRepository if reviews become a domain
   */
  upvoteReview(reviewId: string): Observable<any> {
    return of({ success: true, data: { new_count: 0 } });
  }

  // ============================================================================
  // CATEGORY OPERATIONS
  // ============================================================================

  /**
   * Get all categories
   * TODO: Create CategoryRepository if categories become a domain
   */
  getCategories(): Observable<ApiResponse<Category[]>> {
    // For now, return empty - can be implemented with CategoryRepository later
    return of({ success: true, data: [] });
  }

  /**
   * Get single category
   * TODO: Create CategoryRepository if categories become a domain
   */
  getCategory(categoryId: number): Observable<ApiResponse<Category>> {
    return of({ success: true, data: {} as Category });
  }

  /**
   * Create category
   * TODO: Create CategoryRepository if categories become a domain
   */
  createCategory(categoryData: any): Observable<ApiResponse<Category>> {
    return of({ success: true, data: {} as Category });
  }

  /**
   * Update category
   * TODO: Create CategoryRepository if categories become a domain
   */
  updateCategory(
    categoryId: number,
    categoryData: any
  ): Observable<ApiResponse<Category>> {
    return of({ success: true, data: {} as Category });
  }

  /**
   * Get products by category
   * Uses ProductRepository (DDD pattern)
   */
  getCategoryProducts(
    categoryId: number,
    params?: any
  ): Observable<ApiResponse<CategoryProducts>> {
    const searchParams: ProductSearchParamsDto = {
      category_ids: [categoryId],
      page: params?.page,
      per_page: params?.per_page,
      ...params,
    };

    return this.productRepository.findPaginated(searchParams).pipe(
      map((paginatedResponse: PaginatedResponse<DomainProduct>) => ({
        success: true,
        data: {
          category: {} as Category, // Would need to fetch category separately
          products: paginatedResponse.items.map((p) =>
            this.domainToOldFormat(p)
          ),
          pagination: paginatedResponse.pagination,
        },
      }))
    );
  }

  /**
   * Get popular tags
   * TODO: Create TagRepository if tags become a domain
   */
  getPopularTags(): Observable<ApiResponse<Tag[]>> {
    return of({ success: true, data: [] });
  }

  /**
   * Create tag
   * TODO: Create TagRepository if tags become a domain
   */
  createTag(tagData: any): Observable<ApiResponse<Tag>> {
    return of({ success: true, data: {} as Tag });
  }

  // ============================================================================
  // SEARCH & FILTERING
  // ============================================================================

  /**
   * Search products
   * Uses ProductRepository (DDD pattern)
   */
  searchProducts(
    searchParams: ProductSearchParams
  ): Observable<ApiResponse<ProductSearchResult>> {
    const searchParamsDto: ProductSearchParamsDto = {
      page: searchParams.page,
      per_page: searchParams.per_page,
      search: searchParams.search,
      category_ids: searchParams.category_ids?.map((id) => parseInt(id)),
      price_min: searchParams.price_min,
      price_max: searchParams.price_max,
      rating_min: searchParams.rating_min,
      status: searchParams.status,
      seller_id: searchParams.seller_id,
      sort_by: searchParams.sort_by,
      sort_order: searchParams.sort_order,
    };

    return this.productRepository.findPaginated(searchParamsDto).pipe(
      map((paginatedResponse: PaginatedResponse<DomainProduct>) => {
        const items = paginatedResponse.items.map((p) =>
          this.domainToOldFormat(p)
        );
        const result: ProductSearchResult = {
          items,
          pagination: paginatedResponse.pagination,
        };
        this.searchResultsSubject.next(result);
        return {
          success: true,
          data: result,
        };
      })
    );
  }

  /**
   * Get search results
   */
  getSearchResults(): ProductSearchResult | null {
    return this.searchResultsSubject.value;
  }

  /**
   * Clear search results
   */
  clearSearchResults(): void {
    this.searchResultsSubject.next(null);
  }

  /**
   * Build search params from filters
   */
  buildSearchParams(
    filters: ProductFilters,
    page: number = 1,
    perPage: number = 20
  ): ProductSearchParams {
    return {
      ...filters,
      page,
      per_page: perPage,
    };
  }

  /**
   * Get default filters
   */
  getDefaultFilters(): ProductFilters {
    return {
      status: 'active',
      sort_by: 'created_at',
      sort_order: 'desc',
    };
  }

  // ============================================================================
  // PRODUCT UTILITIES
  // ============================================================================

  /**
   * Format product price
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscount(price: number, comparePrice: number): number {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  }

  /**
   * Check if product is on sale
   */
  isProductOnSale(product: Product): boolean {
    return !!(
      product.compare_at_price && product.compare_at_price > product.price
    );
  }

  /**
   * Get product availability status
   */
  getProductAvailability(
    product: Product
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock <= 5) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Get product rating display
   */
  getProductRatingDisplay(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Get product rating stars
   */
  getProductRatingStars(rating: number): Array<'full' | 'half' | 'empty'> {
    const stars: Array<'full' | 'half' | 'empty'> = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('full');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }

    return stars;
  }

  /**
   * Validate product data
   */
  validateProduct(product: ProductCreate): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!product.description || product.description.trim().length === 0) {
      errors.push('Product description is required');
    }

    if (product.price <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (product.stock < 0) {
      errors.push('Product stock cannot be negative');
    }

    if (!product.sku || product.sku.trim().length === 0) {
      errors.push('Product SKU is required');
    }

    if (product.category_ids.length === 0) {
      errors.push('At least one category must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate product SKU
   */
  generateProductSku(productName: string, categoryId: number): string {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = productName
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s/g, '');
    return `${namePrefix}-${categoryId}-${timestamp}`;
  }

  /**
   * Get product image URL
   */
  getProductImageUrl(
    product: Product,
    size: 'thumbnail' | 'medium' | 'large' = 'medium'
  ): string {
    if (product.images && product.images.length > 0) {
      const featuredImage =
        product.images.find((img) => img.is_featured) || product.images[0];
      return featuredImage.media?.url || '/Logo.png';
    }

    // Return placeholder image
    return '""';
  }

  /**
   * Get product gallery images
   */
  getProductGalleryImages(product: Product): string[] {
    if (!product.images || product.images.length === 0) {
      return ['""'];
    }

    return product.images
      .map((img) => img.media?.url || '/Logo.png')
      .filter((url) => url);
  }

  /**
   * Check if product is available for purchase
   */
  isProductAvailable(product: Product): boolean {
    return product.status === 'active' && product.stock > 0;
  }

  /**
   * Get product variants
   */
  getProductVariants(product: Product): any[] {
    return product.variants || [];
  }

  /**
   * Get product categories
   */
  getProductCategories(product: Product): Category[] {
    return product.category ? [product.category] : [];
  }

  /**
   * Get product tags
   */
  getProductTags(product: Product): string[] {
    return product.tag_ids?.map((id) => id.toString()) || [];
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: string): boolean {
    const cart = this.cartService.getCurrentCart();
    return (
      cart?.items.some((item: any) => item.product_id === productId) || false
    );
  }

  /**
   * Add to favorites
   * TODO: Create FavoritesRepository if favorites become a domain
   */
  addToFavorites(productId: string): Observable<any> {
    return of({ success: true, data: null });
  }

  /**
   * Remove from favorites
   * TODO: Create FavoritesRepository if favorites become a domain
   */
  removeFromFavorites(productId: string): Observable<any> {
    return of({ success: true, data: null });
  }

  /**
   * Check if product is favorited
   */
  isProductFavorited(productId: string): boolean {
    // This would typically check against a favorites list in state
    return false;
  }

  /**
   * Format number for display
   */
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Get condition color
   */
  getConditionColor(condition: string): string {
    const colors: Record<string, string> = {
      new: 'text-green-600',
      like_new: 'text-blue-600',
      good: 'text-yellow-600',
      fair: 'text-orange-600',
      poor: 'text-red-600',
    };
    return colors[condition] || 'text-gray-600';
  }

  /**
   * Get seller display name
   */
  getSellerDisplayName(seller: any): string {
    return seller?.shop_name || seller?.username || 'Unknown Seller';
  }

  /**
   * Track by product ID for ngFor
   */
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  // ============================================================================
  // SELLER OPERATIONS
  // ============================================================================

  /**
   * Get seller information
   */
  getSellerInfo(sellerId: number): SellerSimple | null {
    // This would typically come from the product data
    // For now, return null as we need to implement seller service
    return null;
  }

  /**
   * Get seller products
   */
  getSellerProducts(sellerId: number, params?: any): Observable<any> {
    const searchParams = { ...params, seller_id: sellerId };
    return this.getProducts(searchParams);
  }

  /**
   * Get seller rating
   */
  getSellerRating(sellerId: number): number {
    // This would typically come from seller data
    return 4.5; // Placeholder
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Get product analytics
   */
  getProductAnalytics(productId: string): Observable<any> {
    // This would call an analytics endpoint
    return new Observable();
  }

  /**
   * Get marketplace insights
   */
  getMarketplaceInsights(): Observable<any> {
    // This would call an insights endpoint
    return new Observable();
  }

  /**
   * Get trending categories
   */
  getTrendingCategories(): Observable<any> {
    // This would call a trending categories endpoint
    return new Observable();
  }

  /**
   * Get price history
   */
  getPriceHistory(productId: string): Observable<any> {
    // This would call a price history endpoint
    return new Observable();
  }

  /**
   * Load categories
   * TODO: Create CategoryRepository if categories become a domain
   */
  loadCategories(): Observable<Category[]> {
    return this.getCategories().pipe(map((response) => response.data || []));
  }
}
