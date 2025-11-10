/**
 * Marketplace Domain Service
 * 
 * Contains business logic that doesn't belong to a single Product entity.
 * Uses ProductRepository to access data.
 * 
 * Components interact with domain services, not repositories directly.
 * This keeps business logic centralized and testable.
 */

import { Injectable, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../models/product.model';
import { CreateProductDto, UpdateProductDto, ProductSearchParamsDto } from '../models/product.dto';
import { ApiResponse, PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { CartService } from '../../cart';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private productRepository = inject(ProductRepository);
  private cartService = inject(CartService);
  private apiService = inject(ApiService);
  
  // Reactive state using Angular signals
  private searchResultsSubject = new BehaviorSubject<PaginatedResponse<Product> | null>(null);
  public searchResults$ = this.searchResultsSubject.asObservable();

  // Current search filters (using signals for reactive state)
  public readonly searchFilters = signal<ProductSearchParamsDto>({});

  /**
   * Get all products
   * Returns domain models with business logic
   */
  getProducts(params?: ProductSearchParamsDto): Observable<Product[]> {
    return this.productRepository.findAll(params);
  }

  /**
   * Get products with pagination
   */
  getProductsPaginated(params?: ProductSearchParamsDto): Observable<PaginatedResponse<Product>> {
    return this.productRepository.findPaginated(params);
  }

  /**
   * Get single product by ID
   */
  getProduct(productId: string): Observable<Product> {
    return this.productRepository.findById(productId);
  }

  /**
   * Search products with filters
   * Updates reactive state for UI components
   */
  searchProducts(params: ProductSearchParamsDto): Observable<PaginatedResponse<Product>> {
    // Update filters signal
    this.searchFilters.set(params);
    
    return this.productRepository.findPaginated(params).pipe(
      tap(results => {
        // Update reactive state for components that subscribe to searchResults$
        this.searchResultsSubject.next(results);
      })
    );
  }

  /**
   * Create new product
   * Business logic: Validate product before creation
   */
  createProduct(productData: CreateProductDto): Observable<Product> {
    // Business rule: Validate product data
    if (!productData.name || productData.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (productData.price <= 0) {
      throw new Error('Product price must be greater than 0');
    }

    if (productData.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }

    if (!productData.category_ids || productData.category_ids.length === 0) {
      throw new Error('Product must have at least one category');
    }

    return this.productRepository.create(productData);
  }

  /**
   * Update product
   * Business logic: Validate updates
   */
  updateProduct(productId: string, productData: UpdateProductDto): Observable<Product> {
    // Business rule: Validate price if provided
    if (productData.price !== undefined && productData.price <= 0) {
      throw new Error('Product price must be greater than 0');
    }

    // Business rule: Validate stock if provided
    if (productData.stock !== undefined && productData.stock < 0) {
      throw new Error('Product stock cannot be negative');
    }
    
    return this.productRepository.update(productId, productData);
  }

  /**
   * Delete product
   * Business logic: Can only delete if product is not in any active orders
   */
  deleteProduct(productId: string): Observable<void> {
    // Business rule: Check if product is in active orders
    // In real implementation, you'd check order service
    // For now, we'll allow deletion
    
    return this.productRepository.delete(productId);
  }

  /**
   * Get trending products
   */
  getTrendingProducts(params?: ProductSearchParamsDto): Observable<Product[]> {
    return this.productRepository.findTrending(params);
  }

  /**
   * Get recommended products
   */
  getRecommendedProducts(params?: ProductSearchParamsDto): Observable<Product[]> {
    return this.productRepository.findRecommended(params);
  }

  /**
   * Track a product view (analytics hook)
   * TODO: Replace direct ApiService call when analytics repository exists
   */
  trackProductView(productId: string): Observable<ApiResponse<void>> {
    return this.apiService.trackProductView(productId);
  }

  /**
   * Upvote a product review
   * TODO: Move to review domain service once repository exists
   */
  upvoteReview(
    reviewId: string
  ): Observable<ApiResponse<{ success: boolean; new_count: number }>> {
    return this.apiService.upvoteReview(reviewId);
  }

  /**
   * Get seller's products
   */
  getMyProducts(params?: ProductSearchParamsDto): Observable<Product[]> {
    return this.productRepository.findBySeller('current-seller-id', params);
    // In real implementation, get seller ID from auth service
  }

  /**
   * Get user's products (by user ID)
   * TODO: Migrate to proper repository method when available
   * Temporary: uses findBySeller with user ID
   */
  getUserProducts(userId: string, params?: ProductSearchParamsDto): Observable<Product[]> {
    return this.productRepository.findBySeller(userId, params);
  }

  /**
   * Check if product can be purchased
   * Business logic method
   */
  canPurchaseProduct(productId: string, quantity: number): Observable<boolean> {
    return this.productRepository.findById(productId).pipe(
      map(product => product.canPurchase(quantity))
    );
  }

  /**
   * Validate product purchase
   * Business logic: Check if product can be purchased, throw error if not
   */
  validatePurchase(productId: string, quantity: number): Observable<Product> {
    return this.productRepository.findById(productId).pipe(
      map(product => {
        if (!product.canPurchase(quantity)) {
          if (!product.isAvailable()) {
            throw new Error('Product is not available');
          }
          if (product.getStock() < quantity) {
            throw new Error(`Only ${product.getStock()} items available`);
          }
          throw new Error('Cannot purchase product');
        }
        return product;
      })
    );
  }
}

