import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule],
  template: `
    <div class="onboarding-container">
      <div class="onboarding-header">
        <h1>Welcome to Markt!</h1>
        <p>Let's get you set up in just a few steps</p>
        <div class="progress-bar">
          <div class="progress" [style.width.%]="(currentStep / totalSteps) * 100"></div>
        </div>
        <span class="step-indicator">{{ currentStep }} of {{ totalSteps }}</span>
      </div>

      <div class="onboarding-content">
        <!-- Step 1: Basic Information -->
        <div *ngIf="currentStep === 1" class="step">
          <h2>Tell us about yourself</h2>
          <form [formGroup]="basicInfoForm" (ngSubmit)="nextStep()">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName"
                placeholder="Enter your first name"
              >
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName"
                placeholder="Enter your last name"
              >
            </div>
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone"
                placeholder="Enter your phone number"
              >
            </div>
            <div class="form-group">
              <label for="location">Location</label>
              <input 
                type="text" 
                id="location" 
                formControlName="location"
                placeholder="Enter your location"
              >
            </div>
            <button type="submit" [disabled]="basicInfoForm.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Next' }}
            </button>
          </form>
        </div>

        <!-- Step 2: Account Type -->
        <div *ngIf="currentStep === 2" class="step">
          <h2>What type of account do you want?</h2>
          <form [formGroup]="accountTypeForm" (ngSubmit)="nextStep()">
            <div class="account-options">
              <div class="account-option" [class.selected]="accountTypeForm.value.accountType === 'buyer'">
                <input 
                  type="radio" 
                  id="buyer" 
                  formControlName="accountType" 
                  value="buyer"
                >
                <label for="buyer">
                  <h3>Buyer</h3>
                  <p>I want to buy products and services</p>
                </label>
              </div>
              <div class="account-option" [class.selected]="accountTypeForm.value.accountType === 'seller'">
                <input 
                  type="radio" 
                  id="seller" 
                  formControlName="accountType" 
                  value="seller"
                >
                <label for="seller">
                  <h3>Seller</h3>
                  <p>I want to sell products and services</p>
                </label>
              </div>
              <div class="account-option" [class.selected]="accountTypeForm.value.accountType === 'both'">
                <input 
                  type="radio" 
                  id="both" 
                  formControlName="accountType" 
                  value="both"
                >
                <label for="both">
                  <h3>Both</h3>
                  <p>I want to buy and sell</p>
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" (click)="previousStep()">Back</button>
              <button type="submit" [disabled]="accountTypeForm.invalid || submitting">
                {{ submitting ? 'Saving...' : 'Next' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3: Profile Picture -->
        <div *ngIf="currentStep === 3" class="step">
          <h2>Add a profile picture</h2>
          <form [formGroup]="profilePictureForm" (ngSubmit)="nextStep()">
            <div class="profile-picture-upload">
              <div class="upload-area" (click)="fileInput.click()">
                <img *ngIf="profilePicture" [src]="profilePicture" alt="Profile picture">
                <div *ngIf="!profilePicture" class="upload-placeholder">
                  <i class="fas fa-camera"></i>
                  <p>Click to upload a profile picture</p>
                </div>
              </div>
              <input 
                #fileInput
                type="file" 
                accept="image/*" 
                (change)="onFileSelected($event)"
                style="display: none;"
              >
            </div>
            <div class="form-actions">
              <button type="button" (click)="previousStep()">Back</button>
              <button type="submit" [disabled]="submitting">
                {{ submitting ? 'Saving...' : 'Next' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Step 4: Interests -->
        <div *ngIf="currentStep === 4" class="step">
          <h2>What interests you?</h2>
          <form [formGroup]="interestsForm" (ngSubmit)="nextStep()">
            <div class="interests-grid">
              <div 
                class="interest-item" 
                *ngFor="let interest of availableInterests"
                [class.selected]="selectedInterests.includes(interest)"
                (click)="toggleInterest(interest)"
              >
                {{ interest }}
              </div>
            </div>
            <div class="form-actions">
              <button type="button" (click)="previousStep()">Back</button>
              <button type="submit" [disabled]="submitting">
                {{ submitting ? 'Saving...' : 'Next' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Step 5: Complete -->
        <div *ngIf="currentStep === 5" class="step">
          <h2>You're all set!</h2>
          <div class="completion-message">
            <i class="fas fa-check-circle"></i>
            <p>Welcome to Markt! Your account is ready to go.</p>
          </div>

          <!-- Hybrid roles banner -->
          <div class="hybrid-banner">
            <h3>One account. Two roles.</h3>
            <p>You can add the other role anytime. Start now:</p>
            <div class="banner-actions">
              <button class="outline" (click)="goCreate('buyer')">Create Buyer</button>
              <button class="primary" (click)="goCreate('seller')">Create Seller</button>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button (click)="completeOnboarding()" [disabled]="submitting">
            {{ submitting ? 'Completing...' : 'Get Started' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .onboarding-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }
    .step {
      animation: fadeIn 0.3s ease;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
    }
    .account-options {
      display: grid;
      gap: 15px;
      margin-bottom: 30px;
    }
    .account-option {
      border: 2px solid #eee;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .account-option.selected {
      border-color: #007bff;
      background: #f8f9ff;
    }
    .account-option input[type="radio"] {
      display: none;
    }
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: space-between;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      background: #007bff;
      color: white;
      cursor: pointer;
      font-size: 16px;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .profile-picture-upload {
      text-align: center;
      margin-bottom: 30px;
    }
    .upload-area {
      width: 150px;
      height: 150px;
      border: 2px dashed #ddd;
      border-radius: 50%;
      margin: 0 auto;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .upload-area img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .upload-placeholder {
      text-align: center;
      color: #666;
    }
    .interests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 10px;
      margin-bottom: 30px;
    }
    .interest-item {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .interest-item.selected {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    .completion-message {
      text-align: center;
      margin-bottom: 30px;
    }
    .completion-message i {
      font-size: 48px;
      color: #28a745;
      margin-bottom: 15px;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hybrid-banner {
      border: 1px solid #e5dddc;
      background: #f9f7f6;
      border-radius: 12px;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .hybrid-banner h3 { margin: 0 0 6px 0; }
    .hybrid-banner p { margin: 0 0 12px 0; color: #6b5c56; }
    .banner-actions { display: flex; gap: 10px; justify-content: center; }
    .banner-actions .outline { background: white; color: #181211; border: 1px solid #e5dddc; border-radius: 8px; padding: 8px 12px; }
    .banner-actions .primary { background: #e85530; color: white; border: none; border-radius: 8px; padding: 8px 12px; }
    .error-message {
      background: #fee;
      color: #c33;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
      border: 1px solid #fcc;
    }
  `]
})
export class OnboardingComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Form properties
  basicInfoForm!: FormGroup;
  accountTypeForm!: FormGroup;
  profilePictureForm!: FormGroup;
  interestsForm!: FormGroup;

  // Step management
  currentStep = 1;
  totalSteps = 5;
  submitting = false;
  errorMessage = '';

  // Data properties
  profilePicture: string | null = null;
  selectedInterests: string[] = [];
  availableInterests = [
    'Technology', 'Fashion', 'Home & Garden', 'Sports', 'Books', 
    'Electronics', 'Beauty', 'Food', 'Travel', 'Art', 'Music', 'Gaming'
  ];

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    this.basicInfoForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]+$/)]],
      location: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.accountTypeForm = this.formBuilder.group({
      accountType: ['', Validators.required]
    });

    this.profilePictureForm = this.formBuilder.group({
      profilePicture: ['']
    });

    this.interestsForm = this.formBuilder.group({
      interests: [[]]
    });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicture = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleInterest(interest: string): void {
    const index = this.selectedInterests.indexOf(interest);
    if (index > -1) {
      this.selectedInterests.splice(index, 1);
    } else {
      this.selectedInterests.push(interest);
    }
  }

  completeOnboarding(): void {
    if (this.basicInfoForm.valid && this.accountTypeForm.valid) {
      this.submitting = true;
      this.errorMessage = '';

      const formData = this.basicInfoForm.value;
      const onboardingData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        account_type: this.accountTypeForm.value.accountType,
        interests: this.selectedInterests,
        profile_picture: this.profilePicture
      };

      this.apiService.completeOnboarding(onboardingData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.router.navigate(['/app/dashboard']);
        },
        error: (error) => {
          console.error('Onboarding error:', error);
          this.submitting = false;
          this.errorMessage = error.error?.message || 'An error occurred during onboarding. Please try again.';
        }
      });
    }
  }

  goCreate(type: 'buyer' | 'seller'): void {
    const query = type === 'buyer' ? { createBuyer: '1' } : { createSeller: '1' };
    this.router.navigate(['/app/profile'], { queryParams: query });
  }
} 