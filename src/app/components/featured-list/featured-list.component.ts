import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FeaturedSeller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

export interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviews: number;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isFavorited?: boolean;
  seller: FeaturedSeller;
  views: number;
  favorites: number;
  sales: number;
}

@Component({
  selector: 'app-featured-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-list.component.html',
  styleUrl: './featured-list.component.css',
})
export class FeaturedListComponent {
  @Input() title: string = 'Featured Products';
  @Input() subtitle: string = 'Discover amazing products from trusted sellers';
  @Input() items: FeaturedItem[] = [];
  @Input() itemsPerSlide: number = 4;

  @Output() itemClick = new EventEmitter<FeaturedItem>();
  @Output() quickView = new EventEmitter<FeaturedItem>();
  @Output() toggleFavorite = new EventEmitter<FeaturedItem>();
  @Output() addToCart = new EventEmitter<FeaturedItem>();
  @Output() makeOffer = new EventEmitter<FeaturedItem>();
  @Output() viewAll = new EventEmitter<void>();

  currentIndex: number = 0;
  maxIndex: number = 0;
  totalSlides: number = 0;
  visibleSlides: FeaturedItem[][] = [];

  ngOnInit() {
    this.initializeCarousel();
  }

  ngOnChanges() {
    this.initializeCarousel();
  }

  private initializeCarousel() {
    this.totalSlides = Math.ceil(this.items.length / this.itemsPerSlide);
    this.maxIndex = Math.max(0, this.totalSlides - 1);
    this.currentIndex = 0;

    this.visibleSlides = [];
    for (let i = 0; i < this.totalSlides; i++) {
      const startIndex = i * this.itemsPerSlide;
      const endIndex = startIndex + this.itemsPerSlide;
      this.visibleSlides.push(this.items.slice(startIndex, endIndex));
    }
  }

  onPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  onNext() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    }
  }

  onIndicatorClick(index: number) {
    this.currentIndex = index;
  }

  onItemClick(item: FeaturedItem) {
    this.itemClick.emit(item);
  }

  onQuickView(item: FeaturedItem) {
    this.quickView.emit(item);
  }

  onToggleFavorite(item: FeaturedItem) {
    item.isFavorited = !item.isFavorited;
    this.toggleFavorite.emit(item);
  }

  onAddToCart(item: FeaturedItem) {
    this.addToCart.emit(item);
  }

  onMakeOffer(item: FeaturedItem) {
    this.makeOffer.emit(item);
  }

  onViewAll() {
    this.viewAll.emit();
  }

  get totalViews(): number {
    return this.items.reduce((sum, item) => sum + item.views, 0);
  }

  get totalFavorites(): number {
    return this.items.reduce((sum, item) => sum + item.favorites, 0);
  }

  get totalSales(): number {
    return this.items.reduce((sum, item) => sum + item.sales, 0);
  }
}
