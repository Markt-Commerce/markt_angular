/**
 * Review Service
 *
 * Domain service for managing user reviews.
 * Uses ReviewRepository for data access.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReviewRepository } from '../repositories/review.repository';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { Review } from '../models/review.model';
import {
  ReviewCreateDto,
  ReviewUpdateDto,
  ReviewSearchParamsDto,
} from '../models/review.dto';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly reviewRepository = inject(ReviewRepository);

  /**
   * Get my reviews
   */
  getMyReviews(
    params?: ReviewSearchParamsDto
  ): Observable<PaginatedResponse<Review>> {
    return this.reviewRepository.findMyReviews(params);
  }

  /**
   * Get user reviews
   */
  getUserReviews(
    userId: string,
    params?: ReviewSearchParamsDto
  ): Observable<PaginatedResponse<Review>> {
    return this.reviewRepository.findUserReviews(userId, params);
  }

  /**
   * Get review by ID
   */
  getReview(reviewId: string): Observable<Review> {
    return this.reviewRepository.findById(reviewId);
  }

  /**
   * Create review
   */
  createReview(data: ReviewCreateDto): Observable<Review> {
    return this.reviewRepository.create(data);
  }

  /**
   * Update review
   */
  updateReview(reviewId: string, data: ReviewUpdateDto): Observable<Review> {
    return this.reviewRepository.update(reviewId, data);
  }

  /**
   * Delete review
   */
  deleteReview(reviewId: string): Observable<void> {
    return this.reviewRepository.delete(reviewId);
  }
}

