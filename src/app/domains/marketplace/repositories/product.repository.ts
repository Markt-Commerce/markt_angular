/**
 * Product Repository
 * 
 * Repository pattern abstracts data access:
 * - Handles API calls using ApiClientService
 * - Converts DTOs to domain models
 * - Provides a clean interface for domain services
 * 
 * Components and domain services use repositories, not ApiClientService directly.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse, PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Product } from '../models/product.model';
import {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductSearchParamsDto,
  ProductSearchResultDto
} from '../models/product.dto';

@Injectable({
  providedIn: 'root'
})
export class ProductRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/products';

  /**
   * Convert ProductDto to Product domain model
   * This is where we transform API data into business objects
   */
  private toDomain(dto: ProductDto): Product {
    return new Product(
      dto.id,
      dto.name,
      dto.price,
      dto.stock,
      dto.status,
      dto.seller_id,
      dto.category_ids,
      dto.average_rating,
      dto.review_count,
      dto.created_at,
      dto.updated_at
    );
  }

  /**
   * Find product by ID
   * Returns domain model, not DTO
   */
  findById(id: string): Observable<Product> {
    return this.apiClient.get<ProductDto>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Find all products with optional search parameters
   * Returns array of domain models
   */
  findAll(params?: ProductSearchParamsDto): Observable<Product[]> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient.get<ProductDto[]>(this.baseEndpoint, queryParams).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  /**
   * Find products with pagination
   * Returns paginated response with domain models
   */
  findPaginated(params?: ProductSearchParamsDto): Observable<PaginatedResponse<Product>> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient.get<ProductSearchResultDto>(this.baseEndpoint, queryParams).pipe(
      map(response => ({
        items: response.data.items.map(dto => this.toDomain(dto)),
        pagination: response.data.pagination
      }))
    );
  }

  /**
   * Create new product
   * Accepts DTO, returns domain model
   */
  create(dto: CreateProductDto): Observable<Product> {
    return this.apiClient.post<ProductDto>(this.baseEndpoint, dto).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Update existing product
   * Accepts DTO, returns updated domain model
   */
  update(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.apiClient.patch<ProductDto>(`${this.baseEndpoint}/${id}`, dto).pipe(
      map(response => this.toDomain(response.data))
    );
  }

  /**
   * Delete product
   */
  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/${id}`).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get seller's products
   */
  findBySeller(sellerId: string, params?: ProductSearchParamsDto): Observable<Product[]> {
    const searchParams = { ...params, seller_id: sellerId };
    return this.findAll(searchParams);
  }

  /**
   * Get trending products
   */
  findTrending(params?: ProductSearchParamsDto): Observable<Product[]> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient.get<ProductDto[]>(`${this.baseEndpoint}/trending`, queryParams).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  /**
   * Get recommended products
   */
  findRecommended(params?: ProductSearchParamsDto): Observable<Product[]> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient.get<ProductDto[]>(`${this.baseEndpoint}/recommended`, queryParams).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  /**
   * Convert ProductSearchParamsDto to query params format
   */
  private convertToQueryParams(params: ProductSearchParamsDto): Record<string, unknown> {
    const queryParams: Record<string, unknown> = {};
    
    if (params.page !== undefined) queryParams['page'] = params.page;
    if (params.per_page !== undefined) queryParams['per_page'] = params.per_page;
    if (params.search) queryParams['search'] = params.search;
    if (params.sort_by) queryParams['sort_by'] = params.sort_by;
    if (params.sort_order) queryParams['sort_order'] = params.sort_order;
    if (params.category_ids && params.category_ids.length > 0) {
      queryParams['category_ids'] = params.category_ids.join(',');
    }
    if (params.price_min !== undefined) queryParams['price_min'] = params.price_min;
    if (params.price_max !== undefined) queryParams['price_max'] = params.price_max;
    if (params.rating_min !== undefined) queryParams['rating_min'] = params.rating_min;
    if (params.status) queryParams['status'] = params.status;
    if (params.seller_id) queryParams['seller_id'] = params.seller_id;
    if (params.tags && params.tags.length > 0) {
      queryParams['tags'] = params.tags.join(',');
    }
    
    return queryParams;
  }

  /**
   * Bulk create products
   */
  bulkCreate(dtos: CreateProductDto[]): Observable<Product[]> {
    return this.apiClient.post<ProductDto[]>(`${this.baseEndpoint}/bulk`, { products: dtos }).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }
}


