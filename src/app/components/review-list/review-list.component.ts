import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  date: Date;
  helpful: number;
  isVerified: boolean;
  productId?: string;
  sellerId?: string;
}

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css',
})
export class ReviewListComponent {
  @Input() reviews: Review[] = [];
  @Input() showFilters = true;
  @Input() maxReviews?: number;
  @Input() loading = false;
  @Output() reviewHelpful = new EventEmitter<{
    reviewId: string;
    helpful: boolean;
  }>();
  @Output() reportReview = new EventEmitter<string>();
  @Output() replyToReview = new EventEmitter<Review>();

  filteredReviews: Review[] = [];
  selectedRating: number = 0;
  sortBy: 'date' | 'rating' | 'helpful' = 'date';
  showReplies = false;

  ngOnInit() {
    this.updateFilteredReviews();
  }

  ngOnChanges() {
    this.updateFilteredReviews();
  }

  updateFilteredReviews() {
    let filtered = [...this.reviews];

    // Filter by rating
    if (this.selectedRating > 0) {
      filtered = filtered.filter(
        (review) => review.rating === this.selectedRating
      );
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

    // Limit reviews if maxReviews is set
    if (this.maxReviews) {
      filtered = filtered.slice(0, this.maxReviews);
    }

    this.filteredReviews = filtered;
  }

  onRatingFilterChange(rating: number) {
    this.selectedRating = this.selectedRating === rating ? 0 : rating;
    this.updateFilteredReviews();
  }

  onSortChange(sortBy: 'date' | 'rating' | 'helpful') {
    this.sortBy = sortBy;
    this.updateFilteredReviews();
  }

  onHelpfulClick(reviewId: string, helpful: boolean) {
    this.reviewHelpful.emit({ reviewId, helpful });
  }

  onReportReview(reviewId: string) {
    this.reportReview.emit(reviewId);
  }

  onReplyToReview(review: Review) {
    this.replyToReview.emit(review);
  }

  getRatingText(rating: number): string {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || 'Good';
  }

  getRatingColor(rating: number): string {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  getRatingDistribution(): { [key: number]: number } {
    const distribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    this.reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  }
}
