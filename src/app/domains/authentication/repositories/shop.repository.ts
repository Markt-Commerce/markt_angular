/**
 * Shop Repository
 *
 * Handles all shop/seller discovery API calls.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  ShopDto,
  ShopListDto,
  ShopDetailDto,
  ShopSearchParamsDto,
  ShopCategoryDto,
} from '../models/user.dto';
import { Shop, ShopDetail, ShopCategory } from '../models/shop.model';

@Injectable({
  providedIn: 'root',
})
export class ShopRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/users/shops';

  /**
   * Convert ShopDto to Shop domain model
   */
  private toDomain(dto: ShopDto): Shop {
    return new Shop(
      dto.id,
      dto.shop_name,
      dto.shop_slug,
      dto.description,
      dto.categories,
      dto.verification_status,
      dto.is_active,
      dto.total_rating,
      dto.total_raters,
      dto.average_rating,
      dto.user,
      dto.stats,
      dto.is_followed
    );
  }

  /**
   * Convert ShopDetailDto to ShopDetail domain model
   */
  private toDetailDomain(dto: ShopDetailDto): ShopDetail {
    return new ShopDetail(
      dto.id,
      dto.shop_name,
      dto.shop_slug,
      dto.description,
      dto.categories,
      dto.verification_status,
      dto.is_active,
      dto.total_rating,
      dto.total_raters,
      dto.average_rating,
      dto.user,
      dto.policies,
      dto.recent_products,
      dto.recent_posts,
      dto.stats,
      dto.is_followed,
      dto.can_follow
    );
  }

  /**
   * Search shops with filters and pagination
   */
  searchShops(
    params?: ShopSearchParamsDto
  ): Observable<PaginatedResponse<Shop>> {
    return this.apiClient
      .get<ShopListDto>(this.baseEndpoint, params as Record<string, unknown>)
      .pipe(
        map((response) => ({
          items: response.data.shops.map((shop) => this.toDomain(shop)),
          pagination: {
            page: response.data.pagination.page,
            per_page: response.data.pagination.per_page,
            total_items: response.data.pagination.total,
            total_pages: response.data.pagination.pages,
            first_page: 1,
            last_page: response.data.pagination.pages,
            previous_page: response.data.pagination.has_prev
              ? response.data.pagination.page - 1
              : null,
            next_page: response.data.pagination.has_next
              ? response.data.pagination.page + 1
              : null,
            has_next: response.data.pagination.has_next,
            has_prev: response.data.pagination.has_prev,
          },
        }))
      );
  }

  /**
   * Get trending shops
   */
  getTrendingShops(limit: number = 10): Observable<Shop[]> {
    return this.apiClient
      .get<{ shops: ShopDto[] }>(`${this.baseEndpoint}/trending`, {
        limit,
      } as Record<string, unknown>)
      .pipe(
        map((response) =>
          response.data.shops.map((shop) => this.toDomain(shop))
        )
      );
  }

  /**
   * Get shop categories for filtering
   */
  getShopCategories(): Observable<ShopCategory[]> {
    return this.apiClient
      .get<{ categories: ShopCategoryDto[] }>(`${this.baseEndpoint}/categories`)
      .pipe(map((response) => response.data.categories));
  }

  /**
   * Get detailed shop information
   */
  getShopDetails(shopId: number): Observable<ShopDetail> {
    return this.apiClient
      .get<ShopDetailDto>(`${this.baseEndpoint}/${shopId}`)
      .pipe(map((response) => this.toDetailDomain(response.data)));
  }
}
