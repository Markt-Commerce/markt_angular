import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-sans">
      <div class="layout-container flex h-full grow flex-col">
        <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f1f0] px-10 ">
          <div class="flex items-center gap-6 text-[#181211]">
          
            <div class="h-12 lg:h-16 xl:h-20">
              <img src="/markt-text-logo.png" alt="Markt" class="h-full w-auto object-contain drop-shadow-lg">
            </div>
          </div>
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f4f1f0] text-[#181211] text-sm font-bold leading-normal tracking-[0.015em]"
            [routerLink]="['/auth/login']"
          >
            <span class="truncate">Already have an account? Sign in</span>
          </button>
        </header>
        
        <div class="px-4 lg:px-40 flex flex-1 justify-center py-5">
          <div class="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 class="text-[#181211] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Join Markt</h2>
            <p class="text-[#181211] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">Become part of a vibrant community of buyers and sellers.</p>
            
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <!-- Full Name -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label class="flex flex-col min-w-40 flex-1">
                  <p class="text-[#181211] text-base font-medium leading-normal pb-2">Full Name</p>
                  <input
                    formControlName="fullName"
                    placeholder="Enter your full name"
                    class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                    [class.border-red-500]="getErrorMessage('fullName')"
                  />
                  <div *ngIf="getErrorMessage('fullName')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('fullName') }}
                  </div>
                </label>
              </div>
              
              <!-- Email Address -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label class="flex flex-col min-w-40 flex-1">
                  <p class="text-[#181211] text-base font-medium leading-normal pb-2">Email Address</p>
                  <input
                    formControlName="email"
                    type="email"
                    placeholder="Enter your email address"
                    class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                    [class.border-red-500]="getErrorMessage('email')"
                  />
                  <div *ngIf="getErrorMessage('email')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('email') }}
                  </div>
                </label>
              </div>
              
              <!-- Phone Number -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label class="flex flex-col min-w-40 flex-1">
                  <p class="text-[#181211] text-base font-medium leading-normal pb-2">Phone Number (Optional)</p>
                  <input
                    formControlName="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                    [class.border-red-500]="getErrorMessage('phone')"
                  />
                  <div *ngIf="getErrorMessage('phone')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('phone') }}
                  </div>
                </label>
              </div>
              
              <!-- Password -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label class="flex flex-col min-w-40 flex-1">
                  <p class="text-[#181211] text-base font-medium leading-normal pb-2">Password</p>
                  <input
                    formControlName="password"
                    type="password"
                    placeholder="Create a password"
                    class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                    [class.border-red-500]="getErrorMessage('password')"
                  />
                  <div *ngIf="getErrorMessage('password')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('password') }}
                  </div>
                </label>
              </div>
              
              <!-- Confirm Password -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label class="flex flex-col min-w-40 flex-1">
                  <p class="text-[#181211] text-base font-medium leading-normal pb-2">Confirm Password</p>
                  <input
                    formControlName="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                    [class.border-red-500]="getErrorMessage('confirmPassword')"
                  />
                  <div *ngIf="getErrorMessage('confirmPassword')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('confirmPassword') }}
                  </div>
                </label>
              </div>
              
              <!-- Account Type -->
              <div class="flex flex-wrap gap-3 p-4">
                <label
                  class="text-sm font-medium leading-normal flex items-center justify-center rounded-lg border border-[#e5dddc] px-4 h-11 text-[#181211] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#e85530] relative cursor-pointer"
                >
                  I'm a Buyer
                  <input type="radio" formControlName="account_type" value="buyer" class="invisible absolute" />
                </label>
                <label
                  class="text-sm font-medium leading-normal flex items-center justify-center rounded-lg border border-[#e5dddc] px-4 h-11 text-[#181211] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#e85530] relative cursor-pointer"
                >
                  I'm a Seller
                  <input type="radio" formControlName="account_type" value="seller" class="invisible absolute" />
                </label>
              </div>
              
              <!-- Seller Fields (conditional) -->
              <div *ngIf="isSellerAccount">
                <!-- Shop/Business Name -->
                <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label class="flex flex-col min-w-40 flex-1">
                    <p class="text-[#181211] text-base font-medium leading-normal pb-2">Shop/Business Name</p>
                    <input
                      formControlName="shopName"
                      placeholder="Enter your shop or business name"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                      [class.border-red-500]="getErrorMessage('shopName')"
                    />
                    <div *ngIf="getErrorMessage('shopName')" class="text-red-500 text-sm mt-1">
                      {{ getErrorMessage('shopName') }}
                    </div>
                  </label>
                </div>
                
                <!-- Business Description -->
                <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label class="flex flex-col min-w-40 flex-1">
                    <p class="text-[#181211] text-base font-medium leading-normal pb-2">Business Description</p>
                    <textarea
                      formControlName="businessDescription"
                      placeholder="Describe your business"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] min-h-36 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                      [class.border-red-500]="getErrorMessage('businessDescription')"
                    ></textarea>
                    <div *ngIf="getErrorMessage('businessDescription')" class="text-red-500 text-sm mt-1">
                      {{ getErrorMessage('businessDescription') }}
                    </div>
                  </label>
                </div>
                
                <!-- Business Category -->
                <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label class="flex flex-col min-w-40 flex-1">
                    <p class="text-[#181211] text-base font-medium leading-normal pb-2">Business Category</p>
                    <select
                      formControlName="businessCategory"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 p-[15px] text-base font-normal leading-normal"
                      [class.border-red-500]="getErrorMessage('businessCategory')"
                    >
                      <option value="">Select a category</option>
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion & Clothing</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports & Outdoors</option>
                      <option value="books">Books & Media</option>
                      <option value="health">Health & Beauty</option>
                      <option value="food">Food & Beverages</option>
                      <option value="services">Services</option>
                      <option value="other">Other</option>
                    </select>
                    <div *ngIf="getErrorMessage('businessCategory')" class="text-red-500 text-sm mt-1">
                      {{ getErrorMessage('businessCategory') }}
                    </div>
                  </label>
                </div>
              </div>
              
              <!-- Terms & Privacy -->
              <div class="px-4">
                <label class="flex gap-x-3 py-3 flex-row cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="agreeToTerms"
                    class="h-5 w-5 rounded border-[#e5dddc] border-2 bg-transparent text-[#e85530] checked:bg-[#e85530] checked:border-[#e85530] focus:ring-0 focus:ring-offset-0 focus:border-[#e5dddc] focus:outline-none"
                  />
                  <p class="text-[#181211] text-base font-normal leading-normal">I agree to the <a href="#" class="text-[#e85530] hover:underline">Terms & Privacy Policy</a></p>
                </label>
                <div *ngIf="getErrorMessage('agreeToTerms')" class="text-red-500 text-sm">
                  {{ getErrorMessage('agreeToTerms') }}
                </div>
              </div>
              
              <!-- Error Message -->
              <div *ngIf="errorMessage" class="mx-4 my-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {{ errorMessage }}
              </div>
              
              <!-- Submit Button -->
              <div class="flex px-4 py-3">
                <button
                  type="submit"
                  [disabled]="registerForm.invalid || loading"
                  class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#e85530] text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d64426] transition-colors duration-200"
                >
                  <span class="truncate" *ngIf="!loading">Create Account</span>
                  <span class="truncate" *ngIf="loading">Creating Account...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';

  get isSellerAccount(): boolean {
    return this.registerForm?.get('account_type')?.value === 'seller';
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      fullName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      phone: ['', [
        Validators.pattern(/^\+?[\d\s\-\(\)]+$/)
      ]],
      account_type: ['buyer', [
        Validators.required
      ]],
      // Seller-specific fields
      shopName: [''],
      businessDescription: [''],
      businessCategory: [''],
      agreeToTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Add conditional validators for seller fields
    this.registerForm.get('account_type')?.valueChanges.subscribe(accountType => {
      const shopNameControl = this.registerForm.get('shopName');
      const businessDescriptionControl = this.registerForm.get('businessDescription');
      const businessCategoryControl = this.registerForm.get('businessCategory');

      if (accountType === 'seller') {
        shopNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
        businessDescriptionControl?.setValidators([Validators.required, Validators.minLength(10)]);
        businessCategoryControl?.setValidators([Validators.required]);
      } else {
        shopNameControl?.clearValidators();
        businessDescriptionControl?.clearValidators();
        businessCategoryControl?.clearValidators();
      }

      shopNameControl?.updateValueAndValidity();
      businessDescriptionControl?.updateValueAndValidity();
      businessCategoryControl?.updateValueAndValidity();
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
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const userData = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        account_type: this.registerForm.value.account_type,
        phone_number: this.registerForm.value.phone || undefined
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Registration successful:', response);
          
          // Redirect to onboarding or dashboard
          this.router.navigate(['/onboarding']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Registration error:', error);
          
          if (error.status === 409) {
            this.errorMessage = 'Username or email already exists. Please choose different credentials.';
          } else if (error.status === 422) {
            this.errorMessage = 'Please check your input and try again.';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = error.message || 'An error occurred during registration. Please try again.';
          }
        }
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
          return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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
} 