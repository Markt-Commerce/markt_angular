import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h1>Shopping Cart</h1>
        <p *ngIf="cartItemCount > 0">
          {{ cartItemCount }} {{ cartItemCount === 1 ? 'item' : 'items' }} in your cart
        </p>
      </div>

      <div class="cart-content" *ngIf="!(loading$ | async)">
        <!-- Cart Items -->
        <div class="cart-items" *ngIf="(cartItems$ | async) && (cartItems$ | async)!.length > 0; else emptyCart">
          <div class="cart-item" *ngFor="let item of cartItems$ | async; trackBy: trackByItem">
            <div class="item-image">
              <img 
                [src]="item.product.images[0] || '/assets/placeholder-product.jpg'" 
                [alt]="item.product.title"
                [routerLink]="['/marketplace/product', item.product.id]"
              >
            </div>

            <div class="item-details">
              <div class="item-info">
                <h3 class="item-title" [routerLink]="['/marketplace/product', item.product.id]">
                  {{ item.product.title }}
                </h3>
                <p class="item-description">{{ item.product.description | slice:0:100 }}{{ item.product.description.length > 100 ? '...' : '' }}</p>
                
                <div class="item-meta">
                  <span class="seller">Sold by {{ item.product.seller_name }}</span>
                  <span class="condition">{{ item.product.condition }}</span>
                  <span class="location">{{ item.product.location }}</span>
                </div>

                <div class="item-notes" *ngIf="item.notes">
                  <strong>Notes:</strong> {{ item.notes }}
                </div>
              </div>

              <div class="item-actions">
                <div class="quantity-controls">
                  <label for="quantity-{{ item.id }}">Quantity:</label>
                  <div class="quantity-input">
                    <button 
                      class="quantity-btn"
                      (click)="updateQuantity(item, item.quantity - 1)"
                      [disabled]="item.quantity <= 1"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      [id]="'quantity-' + item.id"
                      [value]="item.quantity"
                      min="1"
                      max="99"
                      (change)="onQuantityChange(item, $event)"
                      class="quantity-field"
                    >
                    <button 
                      class="quantity-btn"
                      (click)="updateQuantity(item, item.quantity + 1)"
                      [disabled]="item.quantity >= 99"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="item-price">
                  <span class="price">{{ item.total_price | currency:item.product.currency:'symbol':'1.0-0' }}</span>
                  <span class="unit-price">({{ item.price | currency:item.product.currency:'symbol':'1.0-0' }} each)</span>
                </div>

                <div class="item-actions-buttons">
                  <button class="action-btn remove-btn" (click)="removeItem(item)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                    Remove
                  </button>
                  
                  <button class="action-btn save-btn" (click)="saveForLater(item)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Cart -->
        <ng-template #emptyCart>
          <div class="empty-cart">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <app-button variant="primary" (clicked)="goToMarketplace()">
              Start Shopping
            </app-button>
          </div>
        </ng-template>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading$ | async">
        <div class="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>

      <!-- Cart Summary -->
      <div class="cart-summary" *ngIf="(cartItems$ | async) && (cartItems$ | async)!.length > 0">
        <div class="summary-content">
          <div class="summary-section">
            <h3>Order Summary</h3>
            
            <div class="summary-row">
              <span>Subtotal ({{ cartItemCount }} items)</span>
              <span>{{ (cartSummary$ | async)?.subtotal | currency:'NGN':'symbol':'1.0-0' }}</span>
            </div>
            
            <div class="summary-row" *ngIf="(cartSummary$ | async) && (cartSummary$ | async)!.tax > 0">
              <span>Tax</span>
              <span>{{ (cartSummary$ | async)!.tax | currency:'NGN':'symbol':'1.0-0' }}</span>
            </div>
            
            <div class="summary-row" *ngIf="(cartSummary$ | async) && (cartSummary$ | async)!.shipping > 0">
              <span>Shipping</span>
              <span>{{ (cartSummary$ | async)!.shipping | currency:'NGN':'symbol':'1.0-0' }}</span>
            </div>
            
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ (cartSummary$ | async) && (cartSummary$ | async)!.total | currency:'NGN':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <div class="summary-actions">
            <app-button
              variant="primary"
              size="lg"
              [fullWidth]="true"
              (clicked)="proceedToCheckout()"
              [loading]="checkoutLoading"
            >
              Proceed to Checkout
            </app-button>
            
            <app-button
              variant="secondary"
              size="lg"
              [fullWidth]="true"
              (clicked)="continueShopping()"
            >
              Continue Shopping
            </app-button>
          </div>

          <div class="summary-info">
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Secure checkout with SSL encryption
            </p>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Free returns within 30 days
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    /* Header */
    .cart-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .cart-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .cart-header p {
      font-size: 1.125rem;
      color: #6b7280;
    }

    /* Content Layout */
    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      align-items: start;
    }

    /* Cart Items */
    .cart-items {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 1.5rem;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;
    }

    .cart-item:hover {
      background: #f9fafb;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s;
    }

    .item-image:hover img {
      transform: scale(1.05);
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-info {
      flex: 1;
    }

    .item-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
      cursor: pointer;
      transition: color 0.2s;
    }

    .item-title:hover {
      color: #3b82f6;
    }

    .item-description {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .item-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .item-meta span {
      font-size: 0.75rem;
      color: #6b7280;
      padding: 0.25rem 0.5rem;
      background: #f3f4f6;
      border-radius: 4px;
    }

    .item-notes {
      font-size: 0.875rem;
      color: #374151;
      background: #fef3c7;
      padding: 0.5rem;
      border-radius: 6px;
      border-left: 3px solid #f59e0b;
    }

    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-controls label {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
    }

    .quantity-input {
      display: flex;
      align-items: center;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      overflow: hidden;
    }

    .quantity-btn {
      width: 32px;
      height: 32px;
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

    .quantity-field {
      width: 50px;
      height: 32px;
      border: none;
      text-align: center;
      font-size: 0.875rem;
      outline: none;
    }

    .item-price {
      text-align: right;
    }

    .price {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }

    .unit-price {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .item-actions-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f3f4f6;
    }

    .remove-btn {
      color: #ef4444;
      border-color: #fecaca;
    }

    .remove-btn:hover {
      background: #fef2f2;
    }

    .save-btn {
      color: #3b82f6;
      border-color: #dbeafe;
    }

    .save-btn:hover {
      background: #eff6ff;
    }

    /* Empty Cart */
    .empty-cart {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-cart svg {
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .empty-cart h2 {
      margin: 0 0 0.5rem 0;
      color: #374151;
      font-size: 1.5rem;
    }

    .empty-cart p {
      margin: 0 0 2rem 0;
      color: #6b7280;
    }

    /* Loading State */
    .loading-state {
      grid-column: 1 / -1;
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

    /* Cart Summary */
    .cart-summary {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .summary-section {
      margin-bottom: 1.5rem;
    }

    .summary-section h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }

    .summary-row.total {
      border-top: 1px solid #e5e7eb;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-info {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .summary-info p {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.5rem 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .summary-info p:last-child {
      margin-bottom: 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .item-image {
        width: 100%;
        height: 200px;
      }

      .item-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .item-price {
        text-align: left;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private appStateService = inject(AppStateService);
  private router = inject(Router);

  // Observables
  cartItems$ = this.cartService.cartItems$;
  cartSummary$ = this.cartService.cartSummary$;
  loading$ = this.cartService.loading$;

  // Local state
  checkoutLoading = false;

  // Computed properties
  get cartItemCount(): number {
    return this.cartService.cartItemCount;
  }

  ngOnInit(): void {
    // Load cart data
    this.cartService.loadCart();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > 99) {
      return;
    }

    this.cartService.updateCartItem(item.id, {
      quantity: newQuantity,
      notes: item.notes
    }).subscribe({
      next: () => {
        this.appStateService.addNotification({
          type: 'success',
          title: 'Quantity Updated',
          message: `Quantity updated for ${item.product.title}`
        });
      },
      error: (error) => {
        console.error('Update quantity error:', error);
        this.appStateService.addNotification({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update quantity. Please try again.'
        });
      }
    });
  }

  onQuantityChange(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = target.valueAsNumber;
    this.updateQuantity(item, newQuantity);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.appStateService.addNotification({
          type: 'success',
          title: 'Item Removed',
          message: `${item.product.title} has been removed from your cart`
        });
      },
      error: (error) => {
        console.error('Remove item error:', error);
        this.appStateService.addNotification({
          type: 'error',
          title: 'Remove Failed',
          message: 'Failed to remove item. Please try again.'
        });
      }
    });
  }

  saveForLater(item: CartItem): void {
    // This would typically move the item to a "saved items" list
    // For now, we'll just show a notification
    this.appStateService.addNotification({
      type: 'info',
      title: 'Saved for Later',
      message: `${item.product.title} has been saved for later`
    });
  }

  proceedToCheckout(): void {
    this.checkoutLoading = true;
    
    // Navigate to checkout
    this.router.navigate(['/checkout']).finally(() => {
      this.checkoutLoading = false;
    });
  }

  continueShopping(): void {
    this.router.navigate(['/marketplace']);
  }

  goToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }

  trackByItem(index: number, item: CartItem): number {
    return item.id;
  }
} 