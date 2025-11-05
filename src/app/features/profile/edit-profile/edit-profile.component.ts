import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="edit-profile-container">
      <div class="edit-profile-header">
        <div class="header-content">
          <h1>Edit Profile</h1>
          <p>Update your personal information and preferences</p>
        </div>
        <div class="header-actions">
          <app-button
            variant="secondary"
            size="md"
            [outline]="true"
            (click)="goBack()"
          >
            Cancel
          </app-button>
        </div>
      </div>

      <div class="edit-profile-content">
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-section">
            <h2>Basic Information</h2>
            
            <div class="form-row">
              <div class="form-group">
                <app-input
                  id="username"
                  name="username"
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  formControlName="username"
                  [required]="true"
                  [errorMessage]="getErrorMessage('username')"
                  [fullWidth]="true"
                ></app-input>
              </div>
              
              <div class="form-group">
                <app-input
                  id="full_name"
                  name="full_name"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  formControlName="full_name"
                  [required]="true"
                  [errorMessage]="getErrorMessage('full_name')"
                  [fullWidth]="true"
                ></app-input>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <app-input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  formControlName="email"
                  [required]="true"
                  [errorMessage]="getErrorMessage('email')"
                  [fullWidth]="true"
                ></app-input>
              </div>
              
              <div class="form-group">
                <app-input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  formControlName="phone_number"
                  [errorMessage]="getErrorMessage('phone_number')"
                  [fullWidth]="true"
                ></app-input>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Profile Details</h2>
            
            <div class="form-group">
              <label for="bio" class="form-label">Bio</label>
              <textarea
                id="bio"
                name="bio"
                formControlName="bio"
                placeholder="Tell us about yourself..."
                rows="4"
                class="form-textarea"
                [class.error]="getErrorMessage('bio')"
              ></textarea>
              <div *ngIf="getErrorMessage('bio')" class="error-text">
                {{ getErrorMessage('bio') }}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="location" class="form-label">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  formControlName="location"
                  placeholder="Enter your location"
                  class="form-input"
                  [class.error]="getErrorMessage('location')"
                >
                <div *ngIf="getErrorMessage('location')" class="error-text">
                  {{ getErrorMessage('location') }}
                </div>
              </div>
              
              <div class="form-group">
                <label for="website" class="form-label">Website</label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  formControlName="website"
                  placeholder="https://yourwebsite.com"
                  class="form-input"
                  [class.error]="getErrorMessage('website')"
                >
                <div *ngIf="getErrorMessage('website')" class="error-text">
                  {{ getErrorMessage('website') }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Social Media</h2>
            
            <div class="form-row">
              <div class="form-group">
                <label for="twitter" class="form-label">Twitter</label>
                <input
                  id="twitter"
                  name="twitter"
                  type="text"
                  formControlName="twitter"
                  placeholder="@username"
                  class="form-input"
                  [class.error]="getErrorMessage('twitter')"
                >
                <div *ngIf="getErrorMessage('twitter')" class="error-text">
                  {{ getErrorMessage('twitter') }}
                </div>
              </div>
              
              <div class="form-group">
                <label for="instagram" class="form-label">Instagram</label>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  formControlName="instagram"
                  placeholder="@username"
                  class="form-input"
                  [class.error]="getErrorMessage('instagram')"
                >
                <div *ngIf="getErrorMessage('instagram')" class="error-text">
                  {{ getErrorMessage('instagram') }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="linkedin" class="form-label">LinkedIn</label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                formControlName="linkedin"
                placeholder="https://linkedin.com/in/username"
                class="form-input"
                [class.error]="getErrorMessage('linkedin')"
              >
              <div *ngIf="getErrorMessage('linkedin')" class="error-text">
                {{ getErrorMessage('linkedin') }}
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Preferences</h2>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="email_notifications">
                <span>Receive email notifications</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="public_profile">
                <span>Make profile public</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="show_contact_info">
                <span>Show contact information to other users</span>
              </label>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [loading]="loading"
              [disabled]="profileForm.invalid || loading"
            >
              Save Changes
            </app-button>
            
            <app-button
              type="button"
              variant="secondary"
              size="lg"
              [outline]="true"
              (click)="resetForm()"
              [disabled]="loading"
            >
              Reset
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .edit-profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .edit-profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .header-content p {
      color: #718096;
      margin: 0;
    }

    .edit-profile-content {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .profile-form {
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .form-input.error {
      border-color: #e53e3e;
    }

    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      transition: border-color 0.2s ease;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .form-textarea.error {
      border-color: #e53e3e;
    }

    .error-text {
      color: #e53e3e;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: #4a5568;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: #4299e1;
    }

    .error-message {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .success-message {
      background: #c6f6d5;
      color: #2f855a;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .edit-profile-container {
        padding: 1rem;
      }

      .edit-profile-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .profile-form {
        padding: 1rem;
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
export class EditProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private profileService = inject(ProfileService);

  profileForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  profile: any; // Added to store profile data

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      bio: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(100)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      twitter: ['', [Validators.pattern(/^@?[\w]+$/)]],
      instagram: ['', [Validators.pattern(/^@?[\w]+$/)]],
      linkedin: ['', [Validators.pattern(/^https?:\/\/linkedin\.com\/in\/[\w\-]+$/)]],
      email_notifications: [true],
      public_profile: [true],
      show_contact_info: [false]
    });
  }

  private loadProfile(): void {
    this.loading = true;
    
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.data;
        this.populateForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  private populateForm(): void {
    if (this.profile) {
      this.profileForm.patchValue({
        full_name: this.profile.full_name,
        username: this.profile.username,
        bio: this.profile.bio,
        location: this.profile.location,
        website: this.profile.website,
        twitter: this.profile.twitter,
        instagram: this.profile.instagram,
        linkedin: this.profile.linkedin
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.profileForm.value;
      
      this.profileService.updateProfile(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loading = false;
            this.successMessage = 'Profile updated successfully!';
          this.router.navigate([ROUTES_ABSOLUTE.APP.PROFILE]);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.loading = false;
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      });
    }
  }

  resetForm(): void {
    this.loadProfile();
    this.errorMessage = '';
    this.successMessage = '';
  }

  getErrorMessage(field: string): string {
    const control = this.profileForm.get(field);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return `${field.replace('_', ' ')} is required`;
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors?.['minlength']) {
        return `${field.replace('_', ' ')} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors?.['maxlength']) {
        return `${field.replace('_', ' ')} must be no more than ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors?.['pattern']) {
        return `Please enter a valid ${field.replace('_', ' ')}`;
      }
    }
    return '';
  }

  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.PROFILE]);
  }
} 