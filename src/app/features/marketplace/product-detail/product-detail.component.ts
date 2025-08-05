import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { MarketplaceService, Product } from '../../../core/services/marketplace.service';
import { CartService } from '../../../core/services/cart.service';
import { AppStateService } from '../../../core/services/app-state.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="product-detail-container" *ngIf="!(loading$ | async)">
      <div class="product-content" *ngIf="product$ | async as product">
        <!-- Product Images -->
        <div class="product-images">
          <div class="main-image">
            <img 
              [src]="selectedImage || product.images[0] || '/assets/placeholder-product.jpg'" 
              [alt]="product.title"
              class="main-image-img"
            >
            <div class="image-badges">
              <span class="badge condition" *ngIf="product.condition">{{ product.condition }}</span>
              <span class="badge featured" *ngIf="product.is_featured">Featured</span>
              <span class="badge negotiable" *ngIf="product.is_negotiable">Negotiable</span>
            </div>
          </div>
          
          <div class="image-thumbnails" *ngIf="product.images.length > 1">
            <div 
              class="thumbnail" 
              *ngFor="let image of product.images; let i = index"
              [class.active]="selectedImage === image"
              (click)="selectImage(image)"
            >
              <img [src]="image" [alt]="product.title + ' - Image ' + (i + 1)">
            </div>
          </div>
        </div>

        <!-- Product Information -->
        <div class="product-info">
          <div class="product-header">
            <h1 class="product-title">{{ product.title }}</h1>
            <div class="product-meta">
              <span class="price">{{ product.price | currency:product.currency:'symbol':'1.0-0' }}</span>
              <span class="location">{{ product.location }}</span>
            </div>
          </div>

          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-details">
            <div class="detail-item">
              <span class="label">Category:</span>
              <span class="value">{{ product.category_name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Condition:</span>
              <span class="value">{{ product.condition }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Location:</span>
              <span class="value">{{ product.location }}</span>
            </div>
            <div class="detail-item" *ngIf="product.tags.length > 0">
              <span class="label">Tags:</span>
              <div class="tags">
                <span class="tag" *ngFor="let tag of product.tags">{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- Purchase Section -->
          <div class="purchase-section">
            <div class="quantity-selector">
              <label for="quantity">Quantity:</label>
              <div class="quantity-controls">
                <button 
                  class="quantity-btn"
                  (click)="decreaseQuantity()"
                  [disabled]="quantity <= 1"
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="quantity"
                  [(ngModel)]="quantity"
                  min="1"
                  max="99"
                  class="quantity-input"
                >
                <button 
                  class="quantity-btn"
                  (click)="increaseQuantity()"
                  [disabled]="quantity >= 99"
                >
                  +
                </button>
              </div>
            </div>

            <div class="total-price">
              <span class="label">Total:</span>
              <span class="price">{{ (product.price * quantity) | currency:product.currency:'symbol':'1.0-0' }}</span>
            </div>

            <div class="purchase-actions">
              <app-button
                variant="primary"
                size="lg"
                [fullWidth]="true"
                (clicked)="addToCart()"
                [loading]="addingToCart"
                [disabled]="addingToCart || cartService.isProductInCart(product.id)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {{ cartService.isProductInCart(product.id) ? 'In Cart' : 'Add to Cart' }}
              </app-button>
              
              <app-button
                variant="secondary"
                size="lg"
                [fullWidth]="true"
                (clicked)="buyNow()"
                [loading]="buyingNow"
                [disabled]="buyingNow"
              >
                Buy Now
              </app-button>
            </div>

            <div class="secondary-actions">
              <button 
                class="action-btn favorite-btn"
                [class.favorited]="product.is_favorited"
                (click)="toggleFavorite()"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {{ product.is_favorited ? 'Favorited' : 'Add to Favorites' }}
              </button>
              
              <button class="action-btn share-btn" (click)="shareProduct()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Seller Information -->
      <div class="seller-section" *ngIf="product$ | async as product">
        <div class="seller-card">
          <div class="seller-header">
            <h3>Seller Information</h3>
            <a [routerLink]="['/seller', product.seller_id]" class="view-profile-btn">
              View Profile
            </a>
          </div>
          
          <div class="seller-info">
            <div class="seller-avatar">
              <img 
                [src]="product.seller_avatar || '/assets/placeholder-avatar.jpg'" 
                [alt]="product.seller_name"
              >
            </div>
            <div class="seller-details">
              <h4>{{ product.seller_name }}</h4>
              <p class="seller-location">{{ product.location }}</p>
              <div class="seller-stats">
                <span class="stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  {{ product.views_count }} views
                </span>
                <span class="stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {{ product.favorites_count }} favorites
                </span>
              </div>
            </div>
          </div>
          
          <div class="seller-actions">
            <app-button
              variant="secondary"
              size="md"
              [fullWidth]="true"
              (clicked)="contactSeller()"
            >
              Contact Seller
            </app-button>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="related-products" *ngIf="relatedProducts$ | async as relatedProducts">
        <h3>Related Products</h3>
        <div class="products-grid">
          <div 
            class="product-card" 
            *ngFor="let relatedProduct of relatedProducts"
            [routerLink]="['/marketplace/product', relatedProduct.id]"
          >
            <div class="product-image">
              <img 
                [src]="relatedProduct.images[0] || '/assets/placeholder-product.jpg'" 
                [alt]="relatedProduct.title"
              >
            </div>
            <div class="product-info">
              <h4>{{ relatedProduct.title }}</h4>
              <p class="price">{{ relatedProduct.price | currency:relatedProduct.currency:'symbol':'1.0-0' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-state" *ngIf="loading$ | async">
      <div class="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div class="error-state" *ngIf="!(loading$ | async) && !(product$ | async)">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist or has been removed.</p>
      <app-button variant="primary" (clicked)="goToMarketplace()">
        Back to Marketplace
      </app-button>
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    /* Product Images */
    .product-images {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #f9fafb;
    }

    .main-image-img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      transition: transform 0.2s;
    }

    .main-image:hover .main-image-img {
      transform: scale(1.05);
    }

    .image-badges {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.condition {
      background: #10b981;
      color: white;
    }

    .badge.featured {
      background: #f59e0b;
      color: white;
    }

    .badge.negotiable {
      background: #3b82f6;
      color: white;
    }

    .image-thumbnails {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .thumbnail.active {
      border-color: #3b82f6;
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail:hover {
      transform: scale(1.05);
    }

    /* Product Information */
    .product-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .product-header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1.5rem;
    }

    .product-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 1rem 0;
      line-height: 1.3;
    }

    .product-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .price {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .location {
      font-size: 1rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .product-description h3 {
      margin: 0 0 1rem 0;
      color: #374151;
      font-size: 1.25rem;
    }

    .product-description p {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .label {
      font-weight: 600;
      color: #374151;
      min-width: 80px;
    }

    .value {
      color: #6b7280;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      color: #374151;
      border-radius: 20px;
      font-size: 0.875rem;
    }

    /* Purchase Section */
    .purchase-section {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      background: #f9fafb;
    }

    .quantity-selector {
      margin-bottom: 1.5rem;
    }

    .quantity-selector label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      overflow: hidden;
      width: fit-content;
    }

    .quantity-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: #f3f4f6;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quantity-btn:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-input {
      width: 60px;
      height: 40px;
      border: none;
      text-align: center;
      font-size: 1rem;
      outline: none;
    }

    .total-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .total-price .label {
      font-size: 1.125rem;
      color: #374151;
    }

    .total-price .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .purchase-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .secondary-actions {
      display: flex;
      gap: 1rem;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .action-btn:hover {
      background: #f3f4f6;
    }

    .favorite-btn.favorited {
      background: #fef2f2;
      border-color: #ef4444;
      color: #ef4444;
    }

    .favorite-btn.favorited:hover {
      background: #fee2e2;
    }

    /* Seller Section */
    .seller-section {
      margin-bottom: 3rem;
    }

    .seller-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 2rem;
      background: white;
    }

    .seller-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .seller-header h3 {
      margin: 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .view-profile-btn {
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .view-profile-btn:hover {
      text-decoration: underline;
    }

    .seller-info {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .seller-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
    }

    .seller-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .seller-details h4 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.125rem;
    }

    .seller-location {
      margin: 0 0 1rem 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .seller-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    /* Related Products */
    .related-products {
      margin-bottom: 3rem;
    }

    .related-products h3 {
      margin: 0 0 2rem 0;
      color: #1f2937;
      font-size: 1.5rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      color: inherit;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .product-card .product-image {
      height: 200px;
      overflow: hidden;
    }

    .product-card .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-card .product-info {
      padding: 1rem;
    }

    .product-card .product-info h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #1f2937;
    }

    .product-card .product-info .price {
      font-weight: 600;
      color: #1f2937;
      font-size: 1.125rem;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: #6b7280;
    }

    .error-state svg {
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .error-state h2 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .error-state p {
      margin: 0 0 2rem 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .product-title {
        font-size: 1.5rem;
      }

      .price {
        font-size: 1.5rem;
      }

      .main-image-img {
        height: 300px;
      }

      .secondary-actions {
        flex-direction: column;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private marketplaceService = inject(MarketplaceService);
  public cartService = inject(CartService);
  private appStateService = inject(AppStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Observables
  product$ = this.marketplaceService.currentProduct$;
  loading$ = this.marketplaceService.loading$;
  relatedProducts$ = this.marketplaceService.relatedProducts$;

  // Local state
  selectedImage: string | null = null;
  quantity = 1;
  addingToCart = false;
  buyingNow = false;

  ngOnInit(): void {
    // Get product ID from route
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const productId = parseInt(params['id']);
      if (productId) {
        this.loadProduct(productId);
        this.loadRelatedProducts(productId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(productId: number): void {
    this.marketplaceService.getProduct(productId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (product) => {
        this.selectedImage = product.images[0] || null;
        // Increment view count
        this.marketplaceService.incrementViewCount(productId).subscribe();
      },
      error: (error) => {
        console.error('Load product error:', error);
        this.appStateService.addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load product details.'
        });
      }
    });
  }

  loadRelatedProducts(productId: number): void {
    this.marketplaceService.getRelatedProducts(productId, 4).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    this.product$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((product: Product | null) => {
      if (product) {
        this.addingToCart = true;
        
        this.cartService.addToCart({
          product_id: product.id,
          quantity: this.quantity
        }).subscribe({
          next: () => {
            this.addingToCart = false;
            this.appStateService.addNotification({
              type: 'success',
              title: 'Added to Cart',
              message: `${product.title} has been added to your cart.`
            });
          },
          error: (error) => {
            this.addingToCart = false;
            console.error('Add to cart error:', error);
            this.appStateService.addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to add item to cart. Please try again.'
            });
          }
        });
      }
    });
  }

  buyNow(): void {
    this.product$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((product: Product | null) => {
      if (product) {
        this.buyingNow = true;
        
        // Add to cart first, then redirect to checkout
        this.cartService.addToCart({
          product_id: product.id,
          quantity: this.quantity
        }).subscribe({
          next: () => {
            this.buyingNow = false;
            this.router.navigate(['/checkout']);
          },
          error: (error) => {
            this.buyingNow = false;
            console.error('Buy now error:', error);
            this.appStateService.addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to process purchase. Please try again.'
            });
          }
        });
      }
    });
  }

  toggleFavorite(): void {
    this.product$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((product: Product | null) => {
      if (product) {
        if (product.is_favorited) {
          this.marketplaceService.removeFromFavorites(product.id).subscribe({
            next: () => {
              product.is_favorited = false;
              product.favorites_count--;
              this.appStateService.addNotification({
                type: 'success',
                title: 'Removed from Favorites',
                message: `${product.title} has been removed from your favorites.`
              });
            },
            error: (error) => {
              console.error('Remove from favorites error:', error);
            }
          });
        } else {
          this.marketplaceService.addToFavorites(product.id).subscribe({
            next: () => {
              product.is_favorited = true;
              product.favorites_count++;
              this.appStateService.addNotification({
                type: 'success',
                title: 'Added to Favorites',
                message: `${product.title} has been added to your favorites.`
              });
            },
            error: (error) => {
              console.error('Add to favorites error:', error);
            }
          });
        }
      }
    });
  }

  shareProduct(): void {
    this.product$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((product: Product | null) => {
      if (product && navigator.share) {
        navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href
        });
      } else if (product) {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.appStateService.addNotification({
            type: 'success',
            title: 'Link Copied',
            message: 'Product link has been copied to clipboard.'
          });
        });
      }
    });
  }

  contactSeller(): void {
    this.product$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((product: Product | null) => {
      if (product) {
        // Navigate to chat or contact page
        this.router.navigate(['/chat', product.seller_id]);
      }
    });
  }

  goToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }
} 