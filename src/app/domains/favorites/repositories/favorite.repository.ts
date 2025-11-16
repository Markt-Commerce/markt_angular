/**
 * Favorite Repository
 *
 * Handles all favorite-related API calls.
 * Uses ApiClientService for HTTP requests.
 * Converts DTOs to domain models.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  FavoriteDto,
  FavoriteCreateDto,
  FavoriteSearchParamsDto,
  FavoritesResponseDto,
} from '../models/favorite.dto';
import { Favorite } from '../models/favorite.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/users/favorites';

  /**
   * Convert FavoriteDto to Favorite domain model
   */
  private toDomain(dto: FavoriteDto): Favorite {
    return Favorite.fromDto(dto);
  }

  /**
   * Map paginated favorites response
   */
  private mapPaginatedFavorites(
    data: FavoritesResponseDto | null | undefined
  ): PaginatedResponse<Favorite> {
    if (!data) {
      return {
        items: [],
        pagination: {
          page: 1,
          per_page: 0,
          total_items: 0,
          total_pages: 0,
          first_page: 1,
          last_page: 1,
          previous_page: null,
          next_page: null,
          has_next: false,
          has_prev: false,
        },
      };
    }

    const items = data.items ?? data.favorites ?? [];

    return {
      items: items.map((dto) => this.toDomain(dto)),
      pagination: data.pagination,
    };
  }

  /**
   * Get user favorites
   */
  findAll(params?: FavoriteSearchParamsDto): Observable<PaginatedResponse<Favorite>> {
    return this.apiClient
      .get<FavoritesResponseDto>(this.baseEndpoint, params as Record<string, unknown>)
      .pipe(map((response) => this.mapPaginatedFavorites(response.data)));
  }

  /**
   * Check if product is favorited
   */
  isFavorited(productId: string): Observable<boolean> {
    return this.apiClient
      .get<{ is_favorited: boolean }>(`${this.baseEndpoint}/check`, {
        product_id: productId,
      })
      .pipe(map((response) => response.data.is_favorited));
  }

  /**
   * Add product to favorites
   */
  create(data: FavoriteCreateDto): Observable<Favorite> {
    return this.apiClient
      .post<FavoriteDto>(this.baseEndpoint, data)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Remove product from favorites
   */
  delete(productId: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${productId}`)
      .pipe(map(() => undefined));
  }

  /**
   * Toggle favorite status
   */
  toggle(productId: string): Observable<Favorite | null> {
    return this.isFavorited(productId).pipe(
      switchMap((isFavorited) => {
        if (isFavorited) {
          return this.delete(productId).pipe(map(() => null));
        } else {
          return this.create({ product_id: productId });
        }
      })
    );
  }
}

