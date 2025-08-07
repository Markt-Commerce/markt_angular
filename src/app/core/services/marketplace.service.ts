import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
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
  BulkProductResult
} from '../models';
import { CartService } from './cart.service';
import { map } from 'rxjs/operators';

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
  providedIn: 'root'
})
export class MarketplaceService {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  
  private searchResultsSubject = new BehaviorSubject<ProductSearchResult | null>(null);
  public searchResults$ = this.searchResultsSubject.asObservable();

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  /**
   * Get all products with filters
   */
  getProducts(params?: ProductSearchParams): Observable<any> {
    return this.apiService.getProducts(params);
  }

  /**
   * Get single product by ID
   */
  getProduct(productId: string): Observable<any> {
    return this.apiService.getProduct(productId);
  }

  /**
   * Create new product
   */
  createProduct(productData: ProductCreate): Observable<any> {
    return this.apiService.createProduct(productData);
  }

  /**
   * Update existing product
   */
  updateProduct(productId: string, productData: ProductUpdate): Observable<any> {
    // Filter out undefined values to match ProductData interface
    const filteredData: any = {};
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    });
    return this.apiService.updateProduct(productId, filteredData);
  }

  /**
   * Delete product
   */
  deleteProduct(productId: string): Observable<any> {
    return this.apiService.deleteProduct(productId);
  }

  /**
   * Bulk create products
   */
  bulkCreateProducts(products: ProductCreate[]): Observable<any> {
    return this.apiService.bulkCreateProducts(products);
  }

  /**
   * Get trending products
   */
  getTrendingProducts(params?: any): Observable<any> {
    return this.apiService.getTrendingProducts(params);
  }

  /**
   * Get recommended products
   */
  getRecommendedProducts(params?: any): Observable<any> {
    return this.apiService.getRecommendedProducts(params);
  }

  /**
   * Get seller's products
   */
  getMyProducts(params?: any): Observable<any> {
    return this.apiService.getMyProducts(params);
  }

  /**
   * Track product view
   */
  trackProductView(productId: string): Observable<any> {
    return this.apiService.trackProductView(productId);
  }

  /**
   * Share product
   */
  shareProduct(productId: string): Observable<any> {
    return this.apiService.shareProduct(productId);
  }

  // ============================================================================
  // PRODUCT REVIEWS
  // ============================================================================

  /**
   * Get product reviews
   */
  getProductReviews(productId: string, params?: any): Observable<any> {
    return this.apiService.getProductReviews(productId, params);
  }

  /**
   * Create product review
   */
  createProductReview(productId: string, reviewData: any): Observable<any> {
    return this.apiService.addProductReview(productId, reviewData);
  }

  /**
   * Upvote review
   */
  upvoteReview(reviewId: string): Observable<any> {
    return this.apiService.upvoteReview(reviewId);
  }

  // ============================================================================
  // CATEGORY OPERATIONS
  // ============================================================================

  /**
   * Get all categories
   */
  getCategories(): Observable<any> {
    return this.apiService.getCategories();
  }

  /**
   * Get single category
   */
  getCategory(categoryId: number): Observable<any> {
    return this.apiService.getCategory(categoryId);
  }

  /**
   * Create category
   */
  createCategory(categoryData: any): Observable<any> {
    return this.apiService.createCategory(categoryData);
  }

  /**
   * Update category
   */
  updateCategory(categoryId: number, categoryData: any): Observable<any> {
    return this.apiService.updateCategory(categoryId, categoryData);
  }

  /**
   * Get products by category
   */
  getCategoryProducts(categoryId: number, params?: any): Observable<any> {
    return this.apiService.getCategoryProducts(categoryId, params);
  }

  /**
   * Get popular tags
   */
  getPopularTags(): Observable<any> {
    return this.apiService.getPopularTags();
  }

  /**
   * Create tag
   */
  createTag(tagData: any): Observable<any> {
    return this.apiService.createTag(tagData);
  }

  // ============================================================================
  // SEARCH & FILTERING
  // ============================================================================

  /**
   * Search products
   */
  searchProducts(searchParams: ProductSearchParams): Observable<any> {
    return this.apiService.getProducts(searchParams).pipe(
      map(response => {
        if (response.success) {
          this.searchResultsSubject.next(response.data);
        }
        return response;
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
  buildSearchParams(filters: ProductFilters, page: number = 1, perPage: number = 20): ProductSearchParams {
    return {
      ...filters,
      page,
      per_page: perPage
    };
  }

  /**
   * Get default filters
   */
  getDefaultFilters(): ProductFilters {
    return {
      status: 'active',
      sort_by: 'created_at',
      sort_order: 'desc'
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
      currency: currency
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
    return !!(product.compare_at_price && product.compare_at_price > product.price);
  }

  /**
   * Get product availability status
   */
  getProductAvailability(product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' {
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
  validateProduct(product: ProductCreate): { isValid: boolean; errors: string[] } {
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
      errors
    };
  }

  /**
   * Generate product SKU
   */
  generateProductSku(productName: string, categoryId: number): string {
    const timestamp = Date.now().toString().slice(-6);
    const namePrefix = productName.substring(0, 3).toUpperCase().replace(/\s/g, '');
    return `${namePrefix}-${categoryId}-${timestamp}`;
  }

  /**
   * Get product image URL
   */
  getProductImageUrl(product: Product, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    if (product.images && product.images.length > 0) {
      const featuredImage = product.images.find(img => img.is_featured) || product.images[0];
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
    
    return product.images.map(img => img.media?.url || '/Logo.png').filter(url => url);
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
    return product.tag_ids?.map(id => id.toString()) || [];
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: string): boolean {
    const cart = this.cartService.getCurrentCart();
    return cart?.items.some((item: any) => item.product_id === productId) || false;
  }

  /**
   * Add to favorites
   */
  addToFavorites(productId: string): Observable<any> {
    return this.apiService.post<any>(`/products/${productId}/favorite`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Remove from favorites
   */
  removeFromFavorites(productId: string): Observable<any> {
    return this.apiService.delete<any>(`/products/${productId}/favorite`).pipe(
      map(response => response.data)
    );
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
      'new': 'text-green-600',
      'like_new': 'text-blue-600',
      'good': 'text-yellow-600',
      'fair': 'text-orange-600',
      'poor': 'text-red-600'
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
   */
  loadCategories(): Observable<Category[]> {
    return this.apiService.getCategories().pipe(
      map(response => response.data || [])
    );
  }
} 