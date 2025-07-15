import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ListingProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Listing {
  id: string;
  product: ListingProduct;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  location: string;
  createdAt: Date;
  views: number;
  favorites: number;
  sales: number;
  rating: number;
  reviews: number;
  tags?: string[];
}

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.css',
})
export class ListingCardComponent {
  @Input() listing!: Listing;
  @Input() canEdit: boolean = true;
  @Input() canDuplicate: boolean = true;
  @Input() canDelete: boolean = true;
  @Input() canPromote: boolean = true;

  @Output() edit = new EventEmitter<Listing>();
  @Output() duplicate = new EventEmitter<Listing>();
  @Output() delete = new EventEmitter<Listing>();
  @Output() view = new EventEmitter<Listing>();
  @Output() promote = new EventEmitter<Listing>();
  @Output() viewAnalytics = new EventEmitter<Listing>();
  @Output() share = new EventEmitter<Listing>();

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onEdit() {
    this.edit.emit(this.listing);
  }

  onDuplicate() {
    this.duplicate.emit(this.listing);
  }

  onDelete() {
    this.delete.emit(this.listing);
  }

  onView() {
    this.view.emit(this.listing);
  }

  onPromote() {
    this.promote.emit(this.listing);
  }

  onViewAnalytics() {
    this.viewAnalytics.emit(this.listing);
  }

  onShare() {
    this.share.emit(this.listing);
  }
}
