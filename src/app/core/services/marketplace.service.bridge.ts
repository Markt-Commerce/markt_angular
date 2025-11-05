/**
 * Marketplace Service - Bridge to DDD Domain Service
 *
 * This service bridges the old API to the new DDD domain service.
 * It maintains backward compatibility while delegating to the domain service.
 *
 * DEPRECATED: Use domains/marketplace/services/marketplace.service.ts directly
 * This bridge will be removed once all components are migrated.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MarketplaceService as DomainMarketplaceService } from '../../domains/marketplace/services/marketplace.service';
import { Product } from '../../domains/marketplace/models/product.model';
import { ProductCreate, ProductUpdate } from '../models';
import { ProductSearchParams, ProductFilters } from './marketplace.service';

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private domainService = inject(DomainMarketplaceService);

  private searchResultsSubject = new BehaviorSubject<any>(null);
  public searchResults$ = this.searchResultsSubject.asObservable();

  /**
   * Get all products with filters
   * Bridge: Converts domain models to old format
   */
  getProducts(params?: ProductSearchParams): Observable<any> {
    return this.domainService.getProducts(params).pipe(
      map((products) => {
        // Convert domain models to old format for backward compatibility
        return {
          success: true,
          data: {
            items: products.map((p) => this.domainToOldFormat(p)),
            pagination: {}, // Add pagination if needed
          },
        };
      })
    );
  }

  /**
   * Get single product by ID
   */
  getProduct(productId: string): Observable<any> {
    return this.domainService.getProduct(productId).pipe(
      map((product) => ({
        success: true,
        data: this.domainToOldFormat(product),
      }))
    );
  }

  /**
   * Create new product
   */
  createProduct(productData: ProductCreate): Observable<any> {
    // Convert old format to domain DTO
    const createDto = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category_ids: productData.category_ids,
      // ... map other fields
    };

    return this.domainService.createProduct(createDto).pipe(
      map((product) => ({
        success: true,
        data: this.domainToOldFormat(product),
      }))
    );
  }

  /**
   * Update existing product
   */
  updateProduct(
    productId: string,
    productData: ProductUpdate
  ): Observable<any> {
    const updateDto = {
      ...productData,
      // Map fields as needed
    };

    return this.domainService.updateProduct(productId, updateDto).pipe(
      map((product) => ({
        success: true,
        data: this.domainToOldFormat(product),
      }))
    );
  }

  /**
   * Delete product
   */
  deleteProduct(productId: string): Observable<any> {
    return this.domainService.deleteProduct(productId).pipe(
      map(() => ({
        success: true,
        data: null,
      }))
    );
  }

  /**
   * Convert domain model to old format (for backward compatibility)
   */
  private domainToOldFormat(product: Product): any {
    return {
      id: product.id,
      name: product.name,
      price: product.getPrice(),
      stock: product.getStock(),
      status: product.status,
      seller_id: product.sellerId,
      category_ids: product.categoryIds,
      average_rating: product.averageRating,
      review_count: product.reviewCount,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
      // Add other fields as needed
    };
  }
}
