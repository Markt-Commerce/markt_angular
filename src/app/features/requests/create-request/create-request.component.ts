import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ApiService } from '../../../core/services/api.service';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MediaFile {
  file: File;
  preview: string;
  id?: string;
}

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="create-request-container">
      <div class="create-request-header">
        <h1>Create Buyer Request</h1>
        <p>Tell sellers what you're looking for</p>
      </div>

      <form [formGroup]="requestForm" (ngSubmit)="onSubmit()" class="request-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h2>Request Details</h2>
          
          <div class="form-row">
            <div class="form-group">
              <app-input
                id="title"
                name="title"
                type="text"
                label="Request Title"
                placeholder="What are you looking for?"
                formControlName="title"
                [required]="true"
                [errorMessage]="getErrorMessage('title')"
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
                placeholder="Describe what you're looking for in detail..."
                class="form-textarea"
                rows="6"
              ></textarea>
              <div class="error-message" *ngIf="getErrorMessage('description')">
                {{ getErrorMessage('description') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Category & Budget -->
        <div class="form-section">
          <h2>Category & Budget</h2>
          
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
            
            <div class="form-group">
              <app-input
                id="budget"
                name="budget"
                type="number"
                label="Budget (₦)"
                placeholder="0"
                formControlName="budget"
                [required]="true"
                [errorMessage]="getErrorMessage('budget')"
                [fullWidth]="true"
              ></app-input>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="form-section">
          <h2>Timeline</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="expiresAt" class="form-label">Request Expires On</label>
              <input
                id="expiresAt"
                type="datetime-local"
                formControlName="expiresAt"
                class="form-input"
                [min]="minDate"
              >
              <div class="error-message" *ngIf="getErrorMessage('expiresAt')">
                {{ getErrorMessage('expiresAt') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Media Upload -->
        <div class="form-section">
          <h2>Reference Images (Optional)</h2>
          
          <div class="media-upload-area">
            <div class="upload-zone" (click)="triggerFileInput()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
              <div class="upload-content">
                <div class="upload-icon">📷</div>
                <h3>Upload Reference Images</h3>
                <p>Add images to help sellers understand what you want</p>
                <p class="upload-hint">Supports: JPG, PNG, GIF (Max 5MB each)</p>
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

            <div class="media-preview" *ngIf="selectedMedia.length > 0">
              <div class="media-item" *ngFor="let media of selectedMedia; let i = index">
                <img [src]="media.preview" [alt]="'Reference image ' + (i + 1)">
                <button type="button" class="remove-media" (click)="removeMedia(i)">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Details -->
        <div class="form-section">
          <h2>Additional Details</h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="location" class="form-label">Preferred Location</label>
              <input
                id="location"
                type="text"
                formControlName="location"
                placeholder="e.g., Lagos, Nigeria"
                class="form-input"
              >
              <div class="error-message" *ngIf="getErrorMessage('location')">
                {{ getErrorMessage('location') }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="urgency" class="form-label">Urgency Level</label>
              <select
                id="urgency"
                formControlName="urgency"
                class="form-select"
              >
                <option value="low">Low - No rush</option>
                <option value="medium">Medium - Within a week</option>
                <option value="high">High - ASAP</option>
              </select>
              <div class="error-message" *ngIf="getErrorMessage('urgency')">
                {{ getErrorMessage('urgency') }}
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

        <!-- Form Actions -->
        <div class="form-actions">
          <app-button
            type="button"
            variant="secondary"
            size="lg"
            [routerLink]="['/app/requests']"
          >
            Cancel
          </app-button>
          
          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [loading]="submitting"
            [disabled]="requestForm.invalid || submitting"
          >
            Create Request
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-request-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .create-request-header {
      margin-bottom: 2rem;
    }

    .create-request-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .create-request-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .request-form {
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
      min-height: 120px;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .media-upload-area {
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

    .media-preview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .media-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .media-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .remove-media {
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

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    @media (max-width: 768px) {
      .create-request-container {
        padding: 1rem;
      }

      .request-form {
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
export class CreateRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);

  requestForm!: FormGroup;
  submitting = false;
  selectedMedia: MediaFile[] = [];
  minDate = new Date().toISOString().slice(0, 16);

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
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', [Validators.required]],
      budget: ['', [Validators.required, Validators.min(100)]],
      expiresAt: ['', [Validators.required]],
      location: ['', [Validators.maxLength(100)]],
      urgency: ['medium', [Validators.required]],
      tags: [''],
      mediaIds: [[]]
    });

    // Set default expiration date (7 days from now)
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7);
    this.requestForm.patchValue({
      expiresAt: defaultExpiry.toISOString().slice(0, 16)
    });
  }

  getErrorMessage(field: string): string {
    const control = this.requestForm.get(field);
    
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
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedMedia.push({
            file,
            preview: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeMedia(index: number): void {
    this.selectedMedia.splice(index, 1);
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      this.submitting = true;
      
      const formData = this.requestForm.value;
      
      // Prepare the request data for API
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget_min: formData.budgetMin,
        budget_max: formData.budgetMax,
        location: formData.location,
        urgency: formData.urgency,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
        expires_at: formData.expiryDate
      };

      this.apiService.createRequest(requestData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.router.navigate(['/app/requests', response.data.id]);
        },
        error: (error) => {
          console.error('Error creating request:', error);
          this.submitting = false;
        }
      });
    }
  }

  // Request image endpoint integrations
  addRequestImage(requestId: string, imageFile: File): void {
    this.apiService.addRequestImage(requestId, imageFile).subscribe({
      next: (response) => {
        console.log('Request image added:', response.data);
      },
      error: (error) => {
        console.error('Error adding request image:', error);
      }
    });
  }

  deleteRequestImage(requestId: string, imageId: string): void {
    this.apiService.deleteRequestImage(requestId, parseInt(imageId)).subscribe({
      next: (response) => {
        console.log('Request image deleted:', response.data);
      },
      error: (error) => {
        console.error('Error deleting request image:', error);
      }
    });
  }

  getRequestImages(requestId: string): void {
    this.apiService.getRequestImages(requestId).subscribe({
      next: (response) => {
        console.log('Request images loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading request images:', error);
      }
    });
  }
} 