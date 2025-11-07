import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ROUTES_ABSOLUTE } from '../../../../core/config/routes.config';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { MarketplaceService } from '../../../../domains/marketplace/services/marketplace.service';
import { Product } from '../../../../core/models';

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
          
          <div class="current-images" *ngIf="product?.images?.length">
            <div class="image-item">
              <img [src]="product?.images?.[0]?.media?.url || '/Logo.png'" [alt]="product?.name || 'Product image'">
              <div class="image-overlay">
                <span>Current Image</span>
              </div>
            </div>
          </div>

          <div class="no-images" *ngIf="!product?.images?.length">
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
            [routerLink]="[ROUTES_ABSOLUTE.APP.SELLER.LISTINGS]"
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
  // Expose route constants to template
  readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;
  
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private marketplaceService = inject(MarketplaceService);

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
    
    if (productId) {
      this.loading = true;
      
      // Domain service returns Product directly, not wrapped in ApiResponse
      this.marketplaceService.getProduct(productId).subscribe({
        next: (product) => {
          // Convert domain Product to component format
          this.product = this.convertDomainProductToComponentFormat(product);
          this.populateForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loading = false;
        }
      });
    }
  }

  private populateForm(): void {
    if (this.product) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock,
        category: this.product.category?.name || '',
        sku: this.product.sku || '',
        weight: this.product.weight || 0,
        tags: this.product.tag_ids?.join(', ') || '',
        freeShipping: false, // Default value since not in API model
        shippingCost: 0, // Default value since not in API model
        returnPolicy: false, // Default value since not in API model
        returnDays: 30, // Default value since not in API model
        status: this.product.status
      });
      
      // this.variants = this.product.variants || []; // This line was removed from the new_code, so it's removed here.
      // this.selectedImages = this.product.images?.map((url: string) => ({ file: null, preview: url })) || []; // This line was removed from the new_code, so it's removed here.
    }
  }

  /**
   * Convert domain Product model to component format
   * Domain Product model is simpler and doesn't include all UI properties
   */
  private convertDomainProductToComponentFormat(domainProduct: any): any {
    // If it's already in the component format (has images, description, seller), return as-is
    if (domainProduct && (domainProduct.images || domainProduct.description || domainProduct.seller)) {
      return domainProduct;
    }

    // Convert domain Product model to component format
    return {
      id: domainProduct.id,
      name: domainProduct.name,
      description: domainProduct.description || '',
      price: typeof domainProduct.getPrice === 'function' 
        ? domainProduct.getPrice() 
        : (domainProduct.price || 0),
      compare_at_price: domainProduct.compare_at_price,
      stock: typeof domainProduct.getStock === 'function' 
        ? domainProduct.getStock() 
        : (domainProduct.stock || 0),
      status: domainProduct.status,
      seller_id: domainProduct.sellerId || domainProduct.seller_id,
      category_ids: domainProduct.categoryIds || domainProduct.category_ids || [],
      category_id: (domainProduct.categoryIds?.[0] || domainProduct.category_ids?.[0] || domainProduct.category_id),
      tag_ids: domainProduct.tag_ids || [],
      media_ids: domainProduct.media_ids || [],
      variants: domainProduct.variants || [],
      images: domainProduct.images || [],
      seller: domainProduct.seller || {},
      average_rating: domainProduct.averageRating || domainProduct.average_rating || 0,
      rating: domainProduct.averageRating || domainProduct.average_rating || 0,
      review_count: domainProduct.reviewCount || domainProduct.review_count || 0,
      view_count: domainProduct.view_count || 0,
      created_at: domainProduct.createdAt || domainProduct.created_at,
      updated_at: domainProduct.updatedAt || domainProduct.updated_at,
      product_metadata: domainProduct.product_metadata,
      is_verified: domainProduct.is_verified,
      is_featured: domainProduct.is_featured,
      condition: domainProduct.condition,
      currency: domainProduct.currency || 'USD',
      category: domainProduct.category,
      sku: domainProduct.sku,
      weight: domainProduct.weight,
      // Preserve any additional properties
      ...Object.fromEntries(
        Object.entries(domainProduct).filter(([key]) => 
          !['id', 'name', 'status', 'sellerId', 'categoryIds', 'averageRating', 
            'reviewCount', 'createdAt', 'updatedAt'].includes(key)
        )
      )
    };
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
    if (this.productForm.valid && this.product) {
      this.saving = true;
      
      const formData = this.productForm.value;
      
      // Prepare the product data for API
      // Note: updateProduct() will convert this to UpdateProductDto format
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category, // Category name - will be converted to category_ids in updateProduct()
        sku: formData.sku,
        weight: formData.weight,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: formData.status,
        freeShipping: formData.freeShipping,
        shippingCost: formData.shippingCost,
        returnPolicy: formData.returnPolicy,
        returnDays: formData.returnDays
      };

      this.updateProduct(productData);
    }
  }

  private updateProduct(productData: any): void {
    // Domain service returns Product directly, not wrapped in ApiResponse
    // Convert form data to UpdateProductDto format
    const updateDto: any = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      weight: productData.weight,
      sku: productData.sku,
      status: productData.status || this.product?.status || 'active',
      // Preserve existing category_ids if category name wasn't changed
      // Note: In a real implementation, you'd map category names to IDs
      category_ids: this.product?.category_ids || [],
      // Preserve existing tag_ids or convert tags array to tag_ids
      // Note: In a real implementation, you'd map tag names to IDs
      tag_ids: this.product?.tag_ids || [],
      // Store additional metadata in product_metadata
      product_metadata: {
        ...(this.product?.product_metadata || {}),
        freeShipping: productData.freeShipping,
        shippingCost: productData.shippingCost,
        returnPolicy: productData.returnPolicy,
        returnDays: productData.returnDays,
        category: productData.category // Store category name in metadata for reference
      }
    };

    this.marketplaceService.updateProduct(this.product!.id, updateDto).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate([ROUTES_ABSOLUTE.APP.SELLER.LISTINGS]);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.saving = false;
      }
    });
  }
} 