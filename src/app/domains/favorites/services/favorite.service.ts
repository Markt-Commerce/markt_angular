/**
 * Favorite Service
 *
 * Domain service for managing favorites.
 * Uses FavoriteRepository for data access.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FavoriteRepository } from '../repositories/favorite.repository';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Favorite } from '../models/favorite.model';
import {
  FavoriteCreateDto,
  FavoriteSearchParamsDto,
} from '../models/favorite.dto';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly favoriteRepository = inject(FavoriteRepository);

  /**
   * Get user favorites
   */
  getFavorites(
    params?: FavoriteSearchParamsDto
  ): Observable<PaginatedResponse<Favorite>> {
    return this.favoriteRepository.findAll(params);
  }

  /**
   * Check if product is favorited
   */
  isFavorited(productId: string): Observable<boolean> {
    return this.favoriteRepository.isFavorited(productId);
  }

  /**
   * Add product to favorites
   */
  addFavorite(data: FavoriteCreateDto): Observable<Favorite> {
    return this.favoriteRepository.create(data);
  }

  /**
   * Remove product from favorites
   */
  removeFavorite(productId: string): Observable<void> {
    return this.favoriteRepository.delete(productId);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(productId: string): Observable<Favorite | null> {
    return this.favoriteRepository.toggle(productId);
  }
}

