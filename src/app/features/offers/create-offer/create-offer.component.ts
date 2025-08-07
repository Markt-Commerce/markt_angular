import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ApiService } from '../../../core/services/api.service';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  budget: number;
  buyerName: string;
  category: string;
  buyerAvatar?: string;
  buyerId?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  buyer?: any;
  category_ids?: string[];
  budget_min?: number;
  budget_max?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
}

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="create-offer-container">
      <div class="create-offer-header">
        <h1>Make an Offer</h1>
        <p>Submit your product offer to the buyer</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <p>Loading request details...</p>
      </div>

      <div *ngIf="!loading && request" class="offer-content">
        <!-- Request Information -->
        <div class="request-info">
          <h2>Request Details</h2>
          <div class="request-card">
            <h3>{{ request.title }}</h3>
            <p>{{ request.description }}</p>
            <div class="request-meta">
              <div class="meta-item">
                <strong>Budget:</strong>
                <span>₦{{ request.budget.toLocaleString() }}</span>
              </div>
              <div class="meta-item">
                <strong>Category:</strong>
                <span>{{ request.category }}</span>
              </div>
              <div class="meta-item">
                <strong>Buyer:</strong>
                <span>{{ request.buyerName }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Offer Form -->
        <form [formGroup]="offerForm" (ngSubmit)="onSubmit()" class="offer-form">
          <div class="form-section">
            <h2>Select Product</h2>
            
            <div class="product-selection">
              <div class="search-box">
                <input 
                  type="text" 
                  placeholder="Search your products..."
                  [(ngModel)]="productSearch"
                  (input)="filterProducts()"
                  class="search-input"
                >
              </div>

              <div class="products-grid" *ngIf="filteredProducts.length > 0">
                <div class="product-card" 
                     *ngFor="let product of filteredProducts"
                     [class.selected]="selectedProduct?.id === product.id"
                     (click)="selectProduct(product)">
                  <img [src]="product.imageUrl" [alt]="product.name" class="product-image">
                  <div class="product-info">
                    <h4>{{ product.name }}</h4>
                    <p class="product-price">₦{{ product.price.toLocaleString() }}</p>
                    <p class="product-stock">Stock: {{ product.stock }}</p>
                  </div>
                </div>
              </div>

              <div class="no-products" *ngIf="filteredProducts.length === 0">
                <p>No products found matching your search.</p>
                <app-button 
                  variant="primary" 
                  size="md"
                  [routerLink]="['/app/seller/listings/new']"
                >
                  Create New Product
                </app-button>
              </div>
            </div>
          </div>

          <div class="form-section" *ngIf="selectedProduct">
            <h2>Offer Details</h2>
            
            <div class="selected-product">
              <img [src]="selectedProduct.imageUrl" [alt]="selectedProduct.name" class="selected-product-image">
              <div class="selected-product-info">
                <h4>{{ selectedProduct.name }}</h4>
                <p class="original-price">Original Price: ₦{{ selectedProduct.price.toLocaleString() }}</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <app-input
                  id="price"
                  name="price"
                  type="number"
                  label="Offer Price (₦)"
                  [placeholder]="selectedProduct.price.toString()"
                  formControlName="price"
                  [required]="true"
                  [errorMessage]="getErrorMessage('price')"
                  [fullWidth]="true"
                ></app-input>
              </div>
              
              <div class="form-group">
                <app-input
                  id="quantity"
                  name="quantity"
                  type="number"
                  label="Quantity Available"
                  [placeholder]="selectedProduct.stock.toString()"
                  formControlName="quantity"
                  [required]="true"
                  [errorMessage]="getErrorMessage('quantity')"
                  [fullWidth]="true"
                ></app-input>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="message" class="form-label">Message to Buyer</label>
                <textarea
                  id="message"
                  formControlName="message"
                  placeholder="Tell the buyer why your product is perfect for their request..."
                  class="form-textarea"
                  rows="4"
                ></textarea>
                <div class="error-message" *ngIf="getErrorMessage('message')">
                  {{ getErrorMessage('message') }}
                </div>
              </div>
            </div>

            <div class="offer-summary">
              <h3>Offer Summary</h3>
              <div class="summary-item">
                <span>Product:</span>
                <span>{{ selectedProduct.name }}</span>
              </div>
              <div class="summary-item">
                <span>Offer Price:</span>
                <span>₦{{ offerForm.get('price')?.value?.toLocaleString() || '0' }}</span>
              </div>
              <div class="summary-item">
                <span>Quantity:</span>
                <span>{{ offerForm.get('quantity')?.value || '0' }}</span>
              </div>
              <div class="summary-item total">
                <span>Total Value:</span>
                <span>₦{{ getTotalValue().toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <app-button
              type="button"
              variant="secondary"
              size="lg"
              [routerLink]="['/app/requests', request.id]"
            >
              Cancel
            </app-button>
            
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [loading]="submitting"
              [disabled]="offerForm.invalid || submitting || !selectedProduct"
            >
              Submit Offer
            </app-button>
          </div>
        </form>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !request" class="error-state">
        <div class="error-icon">❌</div>
        <h3>Request Not Found</h3>
        <p>The request you're trying to make an offer on doesn't exist.</p>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/requests']"
        >
          Back to Requests
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .create-offer-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .create-offer-header {
      margin-bottom: 2rem;
    }

    .create-offer-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .create-offer-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .offer-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .request-info {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .request-info h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .request-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .request-card h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .request-card p {
      color: #495057;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .request-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 4px;
    }

    .meta-item strong {
      color: #495057;
    }

    .offer-form {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .product-selection {
      margin-bottom: 1.5rem;
    }

    .search-box {
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: #007bff;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .product-card {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: border-color 0.2s ease, transform 0.2s ease;
    }

    .product-card:hover {
      border-color: #007bff;
      transform: translateY(-2px);
    }

    .product-card.selected {
      border-color: #28a745;
      background: #f8fff9;
    }

    .product-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .product-info h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .product-price {
      font-weight: 600;
      color: #28a745;
      margin: 0 0 0.25rem 0;
    }

    .product-stock {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }

    .no-products {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .no-products p {
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .selected-product {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .selected-product-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .selected-product-info h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .original-price {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }

    .form-textarea {
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      resize: vertical;
      min-height: 100px;
      transition: border-color 0.2s ease;
    }

    .form-textarea:focus {
      border-color: #007bff;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .offer-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .offer-summary h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.total {
      font-weight: 700;
      font-size: 1.1rem;
      color: #2c3e50;
      border-top: 2px solid #e9ecef;
      padding-top: 1rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .error-state p {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .create-offer-container {
        padding: 1rem;
      }

      .request-meta {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .selected-product {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CreateOfferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  loading = true;
  submitting = false;
  request: BuyerRequest | null = null;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productSearch = '';
  selectedImages: Array<{ file: File; preview: string }> = [];

  offerForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadRequest();
    this.loadProducts();
  }

  private initForm(): void {
    this.offerForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  private loadRequest(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    
    if (requestId) {
      this.loading = true;
      
      this.apiService.getRequest(requestId).subscribe({
        next: (response) => {
          this.request = response.data as any;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.loading = false;
        }
      });
    }
  }

  private loadProducts(): void {
    // TODO: Load seller's products from API
    this.products = [
      {
        id: '1',
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling headphones with 30-hour battery life',
        price: 22000,
        imageUrl: '""',
        stock: 5,
        category: 'Electronics'
      },
      {
        id: '2',
        name: 'Noise Cancelling Headphones',
        description: 'Industry-leading noise cancellation with premium comfort',
        price: 24000,
        imageUrl: '""',
        stock: 3,
        category: 'Electronics'
      },
      {
        id: '3',
        name: 'Wireless Earbuds',
        description: 'Wireless earbuds with active noise cancellation',
        price: 15000,
        imageUrl: '""',
        stock: 8,
        category: 'Electronics'
      }
    ];
    this.filteredProducts = [...this.products];
  }

  filterProducts(): void {
    if (this.productSearch.trim()) {
      const query = this.productSearch.toLowerCase();
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    } else {
      this.filteredProducts = [...this.products];
    }
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.offerForm.patchValue({
      price: product.price,
      quantity: Math.min(product.stock, 1)
    });
  }

  getErrorMessage(field: string): string {
    const control = this.offerForm.get(field);
    
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control.errors['min'].min}`;
      }
    }
    
    return '';
  }

  getTotalValue(): number {
    const price = this.offerForm.get('price')?.value || 0;
    const quantity = this.offerForm.get('quantity')?.value || 0;
    return price * quantity;
  }

  onSubmit(): void {
    if (this.offerForm.valid && this.request) {
      this.submitting = true;
      
      const formData = this.offerForm.value;
      
      // Prepare the offer data for API
      const offerData: any = {
        request_id: this.request.id,
        product_name: formData.productName,
        product_description: formData.productDescription,
        price: formData.price,
        quantity: formData.quantity,
        delivery_time: formData.deliveryTime,
        delivery_cost: formData.deliveryCost,
        message: formData.message,
        images: this.selectedImages.map(img => img.file)
      };

      // First upload images if any
      if (this.selectedImages.length > 0) {
        const uploadPromises = this.selectedImages.map(img => 
          this.apiService.uploadMedia(img.file).toPromise()
        );
        
        Promise.all(uploadPromises).then(uploadResponses => {
          const imageUrls = uploadResponses.map(response => response?.data?.url).filter(url => url);
          offerData['images'] = imageUrls;
          
          // Now create the offer
          this.createOffer(offerData);
        }).catch(error => {
          console.error('Error uploading images:', error);
          this.submitting = false;
        });
      } else {
        // Create offer without images
        this.createOffer(offerData);
      }
    }
  }

  private createOffer(offerData: any): void {
    this.apiService.createOffer(offerData.request_id, offerData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.router.navigate(['/app/offers', response.data.id]);
      },
      error: (error) => {
        console.error('Error creating offer:', error);
        this.submitting = false;
      }
    });
  }
} 