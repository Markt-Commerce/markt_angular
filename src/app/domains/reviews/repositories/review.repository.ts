/**
 * Review Repository
 *
 * Handles all review-related API calls.
 * Uses ApiClientService for HTTP requests.
 * Converts DTOs to domain models.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  ReviewDto,
  ReviewCreateDto,
  ReviewUpdateDto,
  ReviewSearchParamsDto,
  ReviewsResponseDto,
} from '../models/review.dto';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/users/reviews';

  /**
   * Convert ReviewDto to Review domain model
   */
  private toDomain(dto: ReviewDto): Review {
    return Review.fromDto(dto);
  }

  /**
   * Map paginated reviews response
   */
  private mapPaginatedReviews(
    data: ReviewsResponseDto | null | undefined
  ): PaginatedResponse<Review> {
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

    const items = data.items ?? data.reviews ?? [];

    return {
      items: items.map((dto) => this.toDomain(dto)),
      pagination: data.pagination,
    };
  }

  /**
   * Get my reviews
   */
  findMyReviews(
    params?: ReviewSearchParamsDto
  ): Observable<PaginatedResponse<Review>> {
    return this.apiClient
      .get<ReviewsResponseDto>(`${this.baseEndpoint}/my`, params as Record<string, unknown>)
      .pipe(map((response) => this.mapPaginatedReviews(response.data)));
  }

  /**
   * Get user reviews
   */
  findUserReviews(
    userId: string,
    params?: ReviewSearchParamsDto
  ): Observable<PaginatedResponse<Review>> {
    return this.apiClient
      .get<ReviewsResponseDto>(`${this.baseEndpoint}/${userId}`, params as Record<string, unknown>)
      .pipe(map((response) => this.mapPaginatedReviews(response.data)));
  }

  /**
   * Get review by ID
   */
  findById(reviewId: string): Observable<Review> {
    return this.apiClient
      .get<ReviewDto>(`${this.baseEndpoint}/${reviewId}`)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Create review
   */
  create(data: ReviewCreateDto): Observable<Review> {
    return this.apiClient
      .post<ReviewDto>(this.baseEndpoint, data)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Update review
   */
  update(reviewId: string, data: ReviewUpdateDto): Observable<Review> {
    return this.apiClient
      .patch<ReviewDto>(`${this.baseEndpoint}/${reviewId}`, data)
      .pipe(map((response) => this.toDomain(response.data)));
  }

  /**
   * Delete review
   */
  delete(reviewId: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/${reviewId}`)
      .pipe(map(() => undefined));
  }
}

