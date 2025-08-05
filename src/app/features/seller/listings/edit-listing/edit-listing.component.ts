import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  category: string;
  imageUrl: string;
  sku: string;
  weight: number;
  tags: string[];
  freeShipping: boolean;
  shippingCost: number;
  returnPolicy: boolean;
  returnDays: number;
}

@Component({
  selector: 'app-edit-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="edit-listing-container">
      <div class="edit-listing-header">
        <h1>Edit Product</h1>
        <p>Update your product information</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <p>Loading product data...</p>
      </div>

      <form *ngIf="!loading" [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h2>Basic Information</h2>
          
          <div class="form-row">
            <div class="form-group">
              <app-input
                id="name"
                name="name"
                type="text"
                label="Product Name"
                placeholder="Enter product name"
                formControlName="name"
                [required]="true"
                [errorMessage]="getErrorMessage('name')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                formControlName="description"
                placeholder="Describe your product..."
                class="form-textarea"
                rows="4"
              ></textarea>
              <div class="error-message" *ngIf="getErrorMessage('description')">
                {{ getErrorMessage('description') }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <app-input
                id="sku"
                name="sku"
                type="text"
                label="SKU (Stock Keeping Unit)"
                placeholder="Enter SKU"
                formControlName="sku"
                [errorMessage]="getErrorMessage('sku')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>
        </div>

        <!-- Pricing & Inventory -->
        <div class="form-section">
          <h2>Pricing & Inventory</h2>
          
          <div class="form-row">
            <div class="form-group">
              <app-input
                id="price"
                name="price"
                type="number"
                label="Price (₦)"
                placeholder="0.00"
                formControlName="price"
                [required]="true"
                [errorMessage]="getErrorMessage('price')"
                [fullWidth]="true"
              ></app-input>
            </div>
            
            <div class="form-group">
              <app-input
                id="stock"
                name="stock"
                type="number"
                label="Stock Quantity"
                placeholder="0"
                formControlName="stock"
                [required]="true"
                [errorMessage]="getErrorMessage('stock')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <app-input
                id="weight"
                name="weight"
                type="number"
                label="Weight (kg)"
                placeholder="0.0"
                formControlName="weight"
                [errorMessage]="getErrorMessage('weight')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>
        </div>

        <!-- Categories & Tags -->
        <div class="form-section">
          <h2>Categories & Tags</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category" class="form-label">Category</label>
              <select
                id="category"
                formControlName="category"
                class="form-select"
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports</option>
                <option value="books">Books</option>
                <option value="beauty">Beauty</option>
              </select>
              <div class="error-message" *ngIf="getErrorMessage('category')">
                {{ getErrorMessage('category') }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tags" class="form-label">Tags (comma separated)</label>
              <input
                id="tags"
                type="text"
                formControlName="tags"
                placeholder="electronics, wireless, bluetooth"
                class="form-input"
              >
              <div class="error-message" *ngIf="getErrorMessage('tags')">
                {{ getErrorMessage('tags') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Current Images -->
        <div class="form-section">
          <h2>Current Images</h2>
          
          <div class="current-images" *ngIf="product?.imageUrl">
            <div class="image-item">
              <img [src]="product?.imageUrl" [alt]="product?.name || 'Product image'">
              <div class="image-overlay">
                <span>Current Image</span>
              </div>
            </div>
          </div>

          <div class="no-images" *ngIf="!product?.imageUrl">
            <p>No images uploaded yet</p>
          </div>
        </div>

        <!-- Shipping & Policies -->
        <div class="form-section">
          <h2>Shipping & Policies</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <input
                  type="checkbox"
                  formControlName="freeShipping"
                  class="form-checkbox"
                >
                Free Shipping
              </label>
            </div>
            
            <div class="form-group" *ngIf="!productForm.get('freeShipping')?.value">
              <app-input
                id="shippingCost"
                name="shippingCost"
                type="number"
                label="Shipping Cost (₦)"
                placeholder="0.00"
                formControlName="shippingCost"
                [errorMessage]="getErrorMessage('shippingCost')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <input
                  type="checkbox"
                  formControlName="returnPolicy"
                  class="form-checkbox"
                >
                Accept Returns
              </label>
            </div>
            
            <div class="form-group" *ngIf="productForm.get('returnPolicy')?.value">
              <app-input
                id="returnDays"
                name="returnDays"
                type="number"
                label="Return Period (days)"
                placeholder="30"
                formControlName="returnDays"
                [errorMessage]="getErrorMessage('returnDays')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>
        </div>

        <!-- Product Status -->
        <div class="form-section">
          <h2>Product Status</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="status" class="form-label">Status</label>
              <select
                id="status"
                formControlName="status"
                class="form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
              <div class="error-message" *ngIf="getErrorMessage('status')">
                {{ getErrorMessage('status') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <app-button
            type="button"
            variant="secondary"
            size="lg"
            [routerLink]="['/app/seller/listings']"
          >
            Cancel
          </app-button>
          
          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [loading]="saving"
            [disabled]="productForm.invalid || saving"
          >
            Update Product
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .edit-listing-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .edit-listing-header {
      margin-bottom: 2rem;
    }

    .edit-listing-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .edit-listing-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .product-form {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 3rem;
    }

    .form-section h2 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 0.5rem;
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

    .form-input,
    .form-select,
    .form-textarea {
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: #007bff;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-checkbox {
      margin-right: 0.5rem;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .current-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e9ecef;
    }

    .image-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem;
      text-align: center;
      font-size: 0.9rem;
    }

    .no-images {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #6c757d;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    @media (max-width: 768px) {
      .edit-listing-container {
        padding: 1rem;
      }

      .product-form {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class EditListingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productForm!: FormGroup;
  loading = true;
  saving = false;
  product: Product | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadProduct();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      sku: ['', [Validators.maxLength(50)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      weight: ['', [Validators.min(0)]],
      category: ['', [Validators.required]],
      tags: [''],
      freeShipping: [false],
      shippingCost: ['', [Validators.min(0)]],
      returnPolicy: [false],
      returnDays: ['', [Validators.min(1), Validators.max(365)]],
      status: ['active', [Validators.required]]
    });

    // Conditional validation
    this.productForm.get('freeShipping')?.valueChanges.subscribe(freeShipping => {
      const shippingCostControl = this.productForm.get('shippingCost');
      if (freeShipping) {
        shippingCostControl?.clearValidators();
      } else {
        shippingCostControl?.setValidators([Validators.required, Validators.min(0)]);
      }
      shippingCostControl?.updateValueAndValidity();
    });

    this.productForm.get('returnPolicy')?.valueChanges.subscribe(returnPolicy => {
      const returnDaysControl = this.productForm.get('returnDays');
      if (returnPolicy) {
        returnDaysControl?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
      } else {
        returnDaysControl?.clearValidators();
      }
      returnDaysControl?.updateValueAndValidity();
    });
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    // TODO: Load product from API
    // For now, using mock data
    setTimeout(() => {
      this.product = {
        id: productId || '1',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and long battery life.',
        price: 15000,
        stock: 25,
        status: 'active',
        category: 'electronics',
        imageUrl: 'https://via.placeholder.com/300x200?text=Headphones',
        sku: 'WH-001',
        weight: 0.5,
        tags: ['electronics', 'wireless', 'bluetooth'],
        freeShipping: true,
        shippingCost: 0,
        returnPolicy: true,
        returnDays: 30
      };

      this.populateForm();
      this.loading = false;
    }, 1000);
  }

  private populateForm(): void {
    if (this.product) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        sku: this.product.sku,
        price: this.product.price,
        stock: this.product.stock,
        weight: this.product.weight,
        category: this.product.category,
        tags: this.product.tags?.join(', ') || '',
        freeShipping: this.product.freeShipping,
        shippingCost: this.product.shippingCost,
        returnPolicy: this.product.returnPolicy,
        returnDays: this.product.returnDays,
        status: this.product.status
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.productForm.get(field);
    
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
      if (control.errors['max']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${control.errors['max'].max}`;
      }
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.saving = true;
      
      const formData = {
        ...this.productForm.value,
        tags: this.productForm.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      };

      // TODO: Submit to API
      console.log('Updating product:', formData);
      
      setTimeout(() => {
        this.saving = false;
        this.router.navigate(['/app/seller/listings']);
      }, 2000);
    }
  }
} 