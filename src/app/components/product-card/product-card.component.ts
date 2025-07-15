import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  ratingCount: number;
  discount?: number;
  isNew?: boolean;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isFavorited: boolean = false;

  @Output() quickView = new EventEmitter<Product>();
  @Output() toggleFavorite = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  getStars() {
    const stars = [];
    const rating = this.product.rating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push({ filled: true, half: false });
      } else if (i === fullStars && hasHalfStar) {
        stars.push({ filled: false, half: true });
      } else {
        stars.push({ filled: false, half: false });
      }
    }
    return stars;
  }

  onQuickView() {
    this.quickView.emit(this.product);
  }

  onToggleFavorite() {
    this.toggleFavorite.emit(this.product);
  }

  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}
