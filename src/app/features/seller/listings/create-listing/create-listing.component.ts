import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductVariant {
  name: string;
  options: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
}

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="create-listing-container">
      <div class="create-listing-header">
        <h1>Create New Product</h1>
        <p>Add a new product to your shop</p>
      </div>

      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
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
                <option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </option>
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

        <!-- Images -->
        <div class="form-section">
          <h2>Product Images</h2>
          
          <div class="image-upload-area">
            <div class="upload-zone" (click)="triggerFileInput()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
              <div class="upload-content">
                <div class="upload-icon">📷</div>
                <h3>Upload Product Images</h3>
                <p>Drag and drop images here or click to browse</p>
                <p class="upload-hint">Supports: JPG, PNG, GIF (Max 10MB each)</p>
              </div>
              <input
                #fileInput
                type="file"
                multiple
                accept="image/*"
                (change)="onFileSelected($event)"
                style="display: none;"
              >
            </div>

            <div class="image-preview" *ngIf="selectedImages.length > 0">
              <div class="image-item" *ngFor="let image of selectedImages; let i = index">
                <img [src]="image.preview" [alt]="'Product image ' + (i + 1)">
                <button type="button" class="remove-image" (click)="removeImage(i)">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Variants -->
        <div class="form-section">
          <h2>Product Variants (Optional)</h2>
          
          <div class="variants-container">
            <div class="variant-item" *ngFor="let variant of variants; let i = index">
              <div class="variant-header">
                <h4>Variant {{ i + 1 }}</h4>
                <button type="button" class="remove-variant" (click)="removeVariant(i)">Remove</button>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Variant Name</label>
                  <input
                    type="text"
                    [(ngModel)]="variant.name"
                    placeholder="e.g., Color, Size"
                    class="form-input"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">Price (₦)</label>
                  <input
                    type="number"
                    [(ngModel)]="variant.price"
                    placeholder="0.00"
                    class="form-input"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">Stock</label>
                  <input
                    type="number"
                    [(ngModel)]="variant.stock"
                    placeholder="0"
                    class="form-input"
                  >
                </div>
              </div>
            </div>
            
            <app-button
              type="button"
              variant="secondary"
              size="md"
              (clicked)="addVariant()"
            >
              ➕ Add Variant
            </app-button>
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
            [loading]="loading"
            [disabled]="productForm.invalid || loading"
          >
            Create Product
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-listing-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .create-listing-header {
      margin-bottom: 2rem;
    }

    .create-listing-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .create-listing-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
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

    .image-upload-area {
      margin-bottom: 1.5rem;
    }

    .upload-zone {
      border: 2px dashed #e9ecef;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s ease, background-color 0.2s ease;
    }

    .upload-zone:hover {
      border-color: #007bff;
      background-color: #f8f9fa;
    }

    .upload-zone.dragover {
      border-color: #007bff;
      background-color: #e3f2fd;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-content h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .upload-content p {
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .upload-hint {
      font-size: 0.9rem;
      color: #adb5bd;
    }

    .image-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(220, 53, 69, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .variants-container {
      margin-bottom: 1.5rem;
    }

    .variant-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .variant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .variant-header h4 {
      margin: 0;
      color: #2c3e50;
    }

    .remove-variant {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 0.9rem;
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
      .create-listing-container {
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

      .upload-zone {
        padding: 2rem 1rem;
      }
    }
  `]
})
export class CreateListingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  productForm!: FormGroup;
  loading = false;
  selectedImages: { file: File; preview: string }[] = [];
  variants: ProductVariant[] = [];

  categories: Category[] = [
    { id: 1, name: 'Electronics', slug: 'electronics' },
    { id: 2, name: 'Fashion', slug: 'fashion' },
    { id: 3, name: 'Home & Garden', slug: 'home' },
    { id: 4, name: 'Sports', slug: 'sports' },
    { id: 5, name: 'Books', slug: 'books' },
    { id: 6, name: 'Beauty', slug: 'beauty' }
  ];

  ngOnInit(): void {
    this.initForm();
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
      returnDays: ['', [Validators.min(1), Validators.max(365)]]
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

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const uploadZone = event.currentTarget as HTMLElement;
    uploadZone.classList.add('dragover');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const uploadZone = event.currentTarget as HTMLElement;
    uploadZone.classList.remove('dragover');
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private handleFiles(files: File[]): void {
    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImages.push({
            file,
            preview: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  addVariant(): void {
    this.variants.push({
      name: '',
      options: {},
      price: 0,
      stock: 0,
      sku: ''
    });
  }

  removeVariant(index: number): void {
    this.variants.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      
      const formData = {
        ...this.productForm.value,
        images: this.selectedImages.map(img => img.file),
        variants: this.variants
      };

      // TODO: Submit to API
      console.log('Creating product:', formData);
      
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/app/seller/listings']);
      }, 2000);
    }
  }
} 