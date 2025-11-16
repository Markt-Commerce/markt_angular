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
import { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Product } from '../models/product.model';
import {
  BulkProductResultDto,
  CreateProductDto,
  ProductDto,
  ProductPaginationDto,
  ProductReviewDto,
  ProductReviewsResponseDto,
  ProductSearchParamsDto,
  ProductSearchResultDto,
  ReviewUpvoteResponseDto,
  ShareProductResponseDto,
  UpdateProductDto,
  WishlistToggleResponseDto,
} from '../models/product.dto';
import type { Pagination } from '../../../core/infrastructure/http/api-response.types';

interface ProductReviewsResult {
  reviews: ProductReviewDto[];
  items: ProductReviewDto[];
  pagination: Pagination;
}

@Injectable({
  providedIn: 'root',
})
export class ProductRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/products';

  /**
   * Convert ProductDto to Product domain model
   * This is where we transform API data into business objects
   */
  private toDomain(dto: ProductDto): Product {
    return Product.fromDto(dto);
  }

  private toPagination(dto?: ProductPaginationDto | null): Pagination {
    const page = dto?.page ?? 1;
    const totalPages = dto?.total_pages ?? 0;
    return {
      page,
      per_page: dto?.per_page ?? 0,
      total_items: dto?.total ?? 0,
      total_pages: totalPages,
      first_page: 1,
      last_page: totalPages,
      previous_page: page > 1 ? page - 1 : null,
      next_page: page < totalPages ? page + 1 : null,
      has_next: dto?.has_next ?? page < totalPages,
      has_prev: dto?.has_prev ?? page > 1,
    };
  }

  /**
   * Find product by ID
   * Returns domain model, not DTO
   */
  findById(id: string): Observable<Product> {
    return this.apiClient
      .get<ProductDto>(`${this.baseEndpoint}/${id}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Find all products with optional search parameters
   * Returns array of domain models
   */
  findAll(params?: ProductSearchParamsDto): Observable<Product[]> {
    return this.findPaginated(params).pipe(map((response) => response.items));
  }

  /**
   * Find products with pagination
   * Returns paginated response with domain models
   */
  findPaginated(
    params?: ProductSearchParamsDto
  ): Observable<PaginatedResponse<Product>> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient
      .get<ProductSearchResultDto>(this.baseEndpoint, queryParams)
      .pipe(
        map((response) => ({
          items: (response.data.items ?? []).map((dto) => this.toDomain(dto)),
          pagination: this.toPagination(response.data.pagination),
        }))
      );
  }

  /**
   * Create new product
   * Accepts DTO, returns domain model
   */
  create(dto: CreateProductDto): Observable<Product> {
    return this.apiClient
      .post<ProductDto>(`${this.baseEndpoint}`, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Update existing product
   * Accepts DTO, returns updated domain model
   */
  update(id: string, dto: UpdateProductDto): Observable<Product> {
    return this.apiClient
      .put<ProductDto>(`${this.baseEndpoint}/${id}`, dto)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Delete product
   */
  delete(id: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${id}`)
      .pipe(map(() => undefined));
  }

  /**
   * Get seller's products
   */
  findMyProducts(
    params?: ProductSearchParamsDto
  ): Observable<PaginatedResponse<Product>> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient
      .get<ProductSearchResultDto>(
        `${this.baseEndpoint}/seller/my-products`,
        queryParams
      )
      .pipe(
        map((response) => ({
          items: (response.data.items ?? []).map((dto) => this.toDomain(dto)),
          pagination: this.toPagination(response.data.pagination),
        }))
      );
  }

  /**
   * Get trending products
   */
  findTrending(params?: ProductSearchParamsDto): Observable<Product[]> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient
      .get<ProductDto[]>(`${this.baseEndpoint}/trending`, queryParams)
      .pipe(
        map((response) =>
          (response.data ?? []).map((dto) => this.toDomain(dto))
        )
      );
  }

  /**
   * Get recommended products
   */
  findRecommended(params?: ProductSearchParamsDto): Observable<Product[]> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient
      .get<ProductDto[]>(`${this.baseEndpoint}/recommended`, queryParams)
      .pipe(
        map((response) =>
          (response.data ?? []).map((dto) => this.toDomain(dto))
        )
      );
  }

  /**
   * Convert ProductSearchParamsDto to query params format
   */
  private convertToQueryParams(
    params: ProductSearchParamsDto
  ): Record<string, unknown> {
    const queryParams: Record<string, unknown> = {};

    const normalizedEntries = Object.entries(params ?? {});

    normalizedEntries.forEach(([rawKey, rawValue]) => {
      if (rawValue === undefined || rawValue === null) {
        return;
      }

      const key = this.mapQueryKey(rawKey);

      // Avoid overriding existing explicit per_page when mapping limit -> per_page
      if (
        key === 'per_page' &&
        queryParams[key] !== undefined &&
        rawKey !== key
      ) {
        return;
      }

      let value: unknown = rawValue;

      if (Array.isArray(rawValue)) {
        value = rawValue;
      } else if (typeof rawValue === 'boolean') {
        value = rawValue ? 'true' : 'false';
      }

      queryParams[key] = value;
    });

    const minPrice = params.min_price ?? params.price_min;
    const maxPrice = params.max_price ?? params.price_max;
    if (minPrice !== undefined) queryParams['min_price'] = minPrice;
    if (maxPrice !== undefined) queryParams['max_price'] = maxPrice;

    return queryParams;
  }

  private mapQueryKey(key: string): string {
    switch (key) {
      case 'price_min':
        return 'min_price';
      case 'price_max':
        return 'max_price';
      case 'limit':
        return 'per_page';
      default:
        return key;
    }
  }

  /**
   * Bulk create products
   */
  bulkCreate(dtos: CreateProductDto[]): Observable<BulkProductResultDto> {
    return this.apiClient
      .post<BulkProductResultDto>(`${this.baseEndpoint}/bulk`, dtos)
      .pipe(map((response) => response.data));
  }

  trackView(productId: string): Observable<void> {
    return this.apiClient
      .post<void>(`${this.baseEndpoint}/${productId}/view`)
      .pipe(map(() => undefined));
  }

  share(productId: string): Observable<ShareProductResponseDto> {
    return this.apiClient
      .post<ShareProductResponseDto>(`${this.baseEndpoint}/${productId}/share`)
      .pipe(map((response) => response.data));
  }

  toggleWishlist(productId: string): Observable<WishlistToggleResponseDto> {
    return this.apiClient
      .post<WishlistToggleResponseDto>(
        `${this.baseEndpoint}/${productId}/wishlist`
      )
      .pipe(map((response) => response.data));
  }

  getReviews(
    productId: string,
    params?: ProductSearchParamsDto
  ): Observable<ProductReviewsResult> {
    const queryParams = params ? this.convertToQueryParams(params) : undefined;
    return this.apiClient
      .get<ProductReviewsResponseDto>(
        `${this.baseEndpoint}/${productId}/reviews`,
        queryParams
      )
      .pipe(
        map((response) => {
          const data = response.data ?? { reviews: [], pagination: null };
          const reviews = data.reviews ?? data.items ?? [];
          const rawPagination = data.pagination ?? null;
          const pagination = rawPagination ?? this.toPagination(null);
          return {
            reviews,
            items: reviews,
            pagination,
          };
        })
      );
  }

  addReview(
    productId: string,
    payload: { rating: number; title?: string; content: string }
  ): Observable<ProductReviewDto> {
    return this.apiClient
      .post<ProductReviewDto>(
        `${this.baseEndpoint}/${productId}/reviews`,
        payload
      )
      .pipe(map((response) => response.data));
  }

  upvoteReview(reviewId: string): Observable<ReviewUpvoteResponseDto> {
    return this.apiClient
      .post<ReviewUpvoteResponseDto>(
        `${this.baseEndpoint}/reviews/${reviewId}/upvote`
      )
      .pipe(map((response) => response.data));
  }
}
