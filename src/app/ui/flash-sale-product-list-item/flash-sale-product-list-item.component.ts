import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-flash-sale-product-list-item',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './flash-sale-product-list-item.component.html',
  styleUrl: './flash-sale-product-list-item.component.css',
})
export class FlashSaleProductListItemComponent {
  @Input() imgSrc!: string;
  @Input() originalPrice!: number;
  @Input() discountedPrice!: number;
  @Input() ratingValue!: string;
  @Input() productName!: string;

  stars: number[] = [1, 2, 3, 4, 5];
  hover: boolean = false;

  calculateDiscountPercentage(): number {
    if (this.originalPrice > 0 && this.discountedPrice > 0) {
      return Math.round(
        ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
      );
    }
    return 0;
  }
}