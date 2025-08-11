import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div class="w-full max-w-md space-y-8">
        <!-- Header -->
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <img src="/markt-text-logo.png" alt="Markt" class="h-12 w-auto" />
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Join Markt</h2>
          <p class="mt-2 text-sm text-gray-600">
            Become part of a vibrant community of buyers and sellers.
          </p>
          <p class="mt-1 text-xs text-gray-600">
            Choose a starting role below. You can add the other role anytime and switch with a tap.
          </p>
        </div>

        <!-- Registration Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              formControlName="username"
              type="text"
              required
              placeholder="Choose a unique username"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
              [class.border-red-500]="getErrorMessage('username')"
            />
            <div *ngIf="getErrorMessage('username')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('username') }}
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              formControlName="email"
              type="email"
              required
              placeholder="Enter your email address"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
              [class.border-red-500]="getErrorMessage('email')"
            />
            <div *ngIf="getErrorMessage('email')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('email') }}
            </div>
          </div>

          <!-- Phone Number -->
          <div>
            <label for="phone_number" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              id="phone_number"
              formControlName="phone_number"
              type="tel"
              required
              placeholder="+1234567890"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
              [class.border-red-500]="getErrorMessage('phone_number')"
            />
            <div *ngIf="getErrorMessage('phone_number')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('phone_number') }}
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              formControlName="password"
              type="password"
              required
              placeholder="Create a strong password"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
              [class.border-red-500]="getErrorMessage('password')"
            />
            <div *ngIf="getErrorMessage('password')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('password') }}
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Must contain at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              formControlName="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
              [class.border-red-500]="getErrorMessage('confirmPassword')"
            />
            <div *ngIf="getErrorMessage('confirmPassword')" class="mt-1 text-sm text-red-600">
              {{ getErrorMessage('confirmPassword') }}
            </div>
          </div>

          <!-- Account Type -->
          <div>
            <label for="account_type" class="block text-sm font-medium text-gray-700">Account Type</label>
            <select
              id="account_type"
              formControlName="account_type"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <!-- Seller Fields (shown only for seller accounts) -->
          <div *ngIf="isSellerAccount" class="space-y-4 border-t pt-4">
            <h3 class="text-lg font-medium text-gray-900">Shop Information</h3>
            
            <!-- Shop Name -->
            <div>
              <label for="shop_name" class="block text-sm font-medium text-gray-700">Shop Name</label>
              <input
                id="shop_name"
                formControlName="shop_name"
                type="text"
                required
                placeholder="Enter your shop name"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                [class.border-red-500]="getErrorMessage('shop_name')"
              />
              <div *ngIf="getErrorMessage('shop_name')" class="mt-1 text-sm text-red-600">
                {{ getErrorMessage('shop_name') }}
              </div>
            </div>

            <!-- Shop Description -->
            <div>
              <label for="shop_description" class="block text-sm font-medium text-gray-700">Shop Description</label>
              <textarea
                id="shop_description"
                formControlName="shop_description"
                rows="3"
                placeholder="Describe your shop and what you sell"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                [class.border-red-500]="getErrorMessage('shop_description')"
              ></textarea>
              <div *ngIf="getErrorMessage('shop_description')" class="mt-1 text-sm text-red-600">
                {{ getErrorMessage('shop_description') }}
              </div>
            </div>

            <!-- Shop Categories -->
            <div>
              <label for="shop_categories" class="block text-sm font-medium text-gray-700">Shop Categories</label>
              <select
                id="shop_categories"
                formControlName="shop_categories"
                multiple
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
              >
                <option value="1">Electronics</option>
                <option value="2">Fashion</option>
                <option value="3">Home & Garden</option>
                <option value="4">Sports</option>
                <option value="5">Books</option>
                <option value="6">Beauty</option>
                <option value="7">Food & Beverages</option>
                <option value="8">Automotive</option>
              </select>
              <div *ngIf="getErrorMessage('shop_categories')" class="mt-1 text-sm text-red-600">
                {{ getErrorMessage('shop_categories') }}
              </div>
            </div>
          </div>

          <!-- Buyer Fields (shown only for buyer accounts) -->
          <div *ngIf="!isSellerAccount" class="space-y-4 border-t pt-4">
            <h3 class="text-lg font-medium text-gray-900">Buyer Information</h3>
            
            <!-- Buyer Name -->
            <div>
              <label for="buyer_name" class="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="buyer_name"
                formControlName="buyer_name"
                type="text"
                required
                placeholder="Enter your full name"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                [class.border-red-500]="getErrorMessage('buyer_name')"
              />
              <div *ngIf="getErrorMessage('buyer_name')" class="mt-1 text-sm text-red-600">
                {{ getErrorMessage('buyer_name') }}
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="space-y-3">
              <h4 class="text-md font-medium text-gray-800">Shipping Address</h4>
              
              <!-- Street -->
              <div>
                <label for="street" class="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  id="street"
                  formControlName="street"
                  type="text"
                  required
                  placeholder="Enter street address"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                  [class.border-red-500]="getErrorMessage('street')"
                />
                <div *ngIf="getErrorMessage('street')" class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('street') }}
                </div>
              </div>

              <!-- House Number -->
              <div>
                <label for="house_number" class="block text-sm font-medium text-gray-700">House/Apartment Number</label>
                <input
                  id="house_number"
                  formControlName="house_number"
                  type="text"
                  required
                  placeholder="Enter house/apartment number"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                  [class.border-red-500]="getErrorMessage('house_number')"
                />
                <div *ngIf="getErrorMessage('house_number')" class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('house_number') }}
                </div>
              </div>

              <!-- City -->
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                <input
                  id="city"
                  formControlName="city"
                  type="text"
                  required
                  placeholder="Enter city"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                  [class.border-red-500]="getErrorMessage('city')"
                />
                <div *ngIf="getErrorMessage('city')" class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('city') }}
                </div>
              </div>

              <!-- State -->
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700">State/Province</label>
                <input
                  id="state"
                  formControlName="state"
                  type="text"
                  required
                  placeholder="Enter state/province"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                  [class.border-red-500]="getErrorMessage('state')"
                />
                <div *ngIf="getErrorMessage('state')" class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('state') }}
                </div>
              </div>

              <!-- Country -->
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
                <input
                  id="country"
                  formControlName="country"
                  type="text"
                  required
                  placeholder="Enter country"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                  [class.border-red-500]="getErrorMessage('country')"
                />
                <div *ngIf="getErrorMessage('country')" class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('country') }}
                </div>
              </div>

              <!-- Postal Code -->
              <div>
                <label for="postal_code" class="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  id="postal_code"
                  formControlName="postal_code"
                  type="text"
                  required
                  placeholder="Enter postal code"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#E94C2A] focus:outline-none focus:ring-[#E94C2A] sm:text-sm"
                  [class.border-red-500]="getErrorMessage('postal_code')"
                />
                <div *ngIf="getErrorMessage('postal_code')" class="mt-1 text-sm text-red-600">
                  {{ getErrorMessage('postal_code') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <input
              id="terms"
              formControlName="terms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-[#E94C2A] focus:ring-[#E94C2A]"
            />
            <label for="terms" class="ml-2 text-sm text-gray-700">
              I agree to the 
              <a href="#" class="text-[#E94C2A] hover:underline">Terms of Service</a> 
              and 
              <a href="#" class="text-[#E94C2A] hover:underline">Privacy Policy</a>
            </label>
          </div>
          <div *ngIf="getErrorMessage('terms')" class="text-sm text-red-600">
            {{ getErrorMessage('terms') }}
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">{{ errorMessage }}</div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="w-full flex justify-center rounded-md border border-transparent bg-[#E94C2A] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#d63924] focus:outline-none focus:ring-2 focus:ring-[#E94C2A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading">Creating Account...</span>
          </button>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account? 
              <a routerLink="/auth/login" class="font-medium text-[#E94C2A] hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .register-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .register-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .register-header p {
      color: #7f8c8d;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-options {
      margin-bottom: 2rem;
    }
    
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #2c3e50;
      line-height: 1.4;
    }
    
    .checkbox-label input {
      width: auto;
      margin-top: 0.1rem;
    }
    
    .terms-link {
      color: #3498db;
      text-decoration: none;
    }
    
    .terms-link:hover {
      text-decoration: underline;
    }
    
    .error-message {
      background: #fee;
      color: #c53030;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      border: 1px solid #fed7d7;
    }
    
    .register-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #ecf0f1;
    }
    
    .register-footer a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    
    .register-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  usernameChecking = false;

  get isSellerAccount(): boolean {
    return this.registerForm?.get('account_type')?.value === 'seller';
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) // Must contain digit, lowercase, uppercase
      ]],
      confirmPassword: ['', Validators.required],
      phone_number: ['', [
        Validators.required,
        Validators.pattern(/^\+?[1-9]\d{1,14}$/)
      ]],
      account_type: ['buyer', Validators.required],
      
      // Seller fields
      shop_name: [''],
      shop_description: [''],
      shop_categories: [[]],
      
      // Buyer fields
      buyer_name: [''],
      street: [''],
      house_number: [''],
      city: [''],
      state: [''],
      country: [''],
      postal_code: [''],
      
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    // Add conditional validators based on account type
    this.registerForm.get('account_type')?.valueChanges.subscribe(accountType => {
      if (accountType === 'seller') {
        this.registerForm.get('shop_name')?.setValidators([Validators.required]);
        this.registerForm.get('shop_description')?.setValidators([Validators.required]);
        this.registerForm.get('shop_categories')?.setValidators([Validators.required]);
        
        // Clear buyer validators
        this.registerForm.get('buyer_name')?.clearValidators();
        this.registerForm.get('street')?.clearValidators();
        this.registerForm.get('house_number')?.clearValidators();
        this.registerForm.get('city')?.clearValidators();
        this.registerForm.get('state')?.clearValidators();
        this.registerForm.get('country')?.clearValidators();
        this.registerForm.get('postal_code')?.clearValidators();
      } else {
        this.registerForm.get('buyer_name')?.setValidators([Validators.required]);
        this.registerForm.get('street')?.setValidators([Validators.required]);
        this.registerForm.get('house_number')?.setValidators([Validators.required]);
        this.registerForm.get('city')?.setValidators([Validators.required]);
        this.registerForm.get('state')?.setValidators([Validators.required]);
        this.registerForm.get('country')?.setValidators([Validators.required]);
        this.registerForm.get('postal_code')?.setValidators([Validators.required]);
        
        // Clear seller validators
        this.registerForm.get('shop_name')?.clearValidators();
        this.registerForm.get('shop_description')?.clearValidators();
        this.registerForm.get('shop_categories')?.clearValidators();
      }
      
      // Update validation
      this.registerForm.get('shop_name')?.updateValueAndValidity();
      this.registerForm.get('shop_description')?.updateValueAndValidity();
      this.registerForm.get('shop_categories')?.updateValueAndValidity();
      this.registerForm.get('buyer_name')?.updateValueAndValidity();
      this.registerForm.get('street')?.updateValueAndValidity();
      this.registerForm.get('house_number')?.updateValueAndValidity();
      this.registerForm.get('city')?.updateValueAndValidity();
      this.registerForm.get('state')?.updateValueAndValidity();
      this.registerForm.get('country')?.updateValueAndValidity();
      this.registerForm.get('postal_code')?.updateValueAndValidity();
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';

      const formData = this.registerForm.value;
      
      // Build the register data according to API structure
      const registerData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        account_type: formData.account_type
      };

      // Add seller data if seller account
      if (formData.account_type === 'seller') {
        registerData.seller_data = {
          shop_name: formData.shop_name,
          description: formData.shop_description,
          category_ids: formData.shop_categories.map((id: string) => parseInt(id)),
          policies: {
            return_policy: 'Standard return policy',
            shipping_policy: 'Standard shipping policy',
            payment_policy: 'Standard payment policy'
          }
        };
      }

      // Add buyer data if buyer account
      if (formData.account_type === 'buyer') {
        registerData.buyer_data = {
          buyername: formData.buyer_name,
          shipping_address: {
            street: formData.street,
            house_number: formData.house_number,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postal_code,
            latitude: 0, // Default value, can be updated later
            longitude: 0 // Default value, can be updated later
          }
        };
      }

      this.apiService.register(registerData).subscribe({
        next: (response) => {
          if (response.success) {
            // Store user data and token
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Navigate to onboarding
            this.router.navigate(['/onboarding']);
          } else {
            this.errorMessage = response.message || 'Registration failed';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.message || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        if (field === 'username') {
          return 'Username can only contain letters, numbers, and underscores';
        }
        if (field === 'password') {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        if (field === 'phone') {
          return 'Please enter a valid phone number';
        }
      }
      if (control.errors['requiredTrue'] && field === 'agreeToTerms') {
        return 'You must agree to the Terms of Service and Privacy Policy';
      }
    }
    
    // Check for password mismatch
    if (field === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch'] && control?.touched) {
      return 'Passwords do not match';
    }
    
    return '';
  }

  checkUsername(): void {
    const username = this.registerForm.value.username;
    if (username && username.length >= 3) {
      this.apiService.checkUsername(username).subscribe({
        next: (response) => {
          // Assuming response.success is true if username is available
          // You might need to adjust this based on your API response structure
          // For now, we'll just set a flag to indicate availability
          // this.usernameAvailable = response.success; 
          this.usernameChecking = false;
        },
        error: (error) => {
          console.error('Username check error:', error);
          this.usernameChecking = false;
        }
      });
    }
  }
} 