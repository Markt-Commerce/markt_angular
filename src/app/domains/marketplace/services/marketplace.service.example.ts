/**
 * Example Component Usage
 * 
 * This file shows how components should use the MarketplaceService.
 * It demonstrates the DDD pattern in action.
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketplaceService } from './marketplace.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-list-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="products$ | async as products">
      <div *ngFor="let product of products">
        <h3>{{ product.name }}</h3>
        <p>Price: ${{ product.getPrice() }}</p>
        <p>Stock: {{ product.getStockStatus() }}</p>
        <button 
          [disabled]="!product.isAvailable()"
          (click)="addToCart(product)">
          Add to Cart
        </button>
      </div>
    </div>
  `
})
export class ProductListExampleComponent implements OnInit {
  private marketplaceService = inject(MarketplaceService);
  
  // Components subscribe to domain services, not repositories
  products$ = this.marketplaceService.getProducts();

  ngOnInit(): void {
    // Load products - business logic is in the service
    this.marketplaceService.searchProducts({
      page: 1,
      per_page: 20
    }).subscribe();
  }

  addToCart(product: Product): void {
    // Use business logic method to validate purchase
    this.marketplaceService.validatePurchase(product.id, 1).subscribe({
      next: () => {
        // Product can be purchased - add to cart
        // This would call CartService
        console.log('Product can be added to cart');
      },
      error: (error) => {
        // Business rule validation failed
        console.error('Cannot add to cart:', error.message);
      }
    });
  }
}


