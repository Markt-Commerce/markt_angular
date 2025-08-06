import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

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
            <img src="/Logo.png" alt="Markt" class="h-12 w-auto" />
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-gray-900">Join Markt</h2>
          <p class="mt-2 text-sm text-gray-600">
            Become part of a vibrant community of buyers and sellers.
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
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
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
      
      // Remove confirmPassword and terms from the API payload
      const registerData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        account_type: formData.account_type
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          // AuthService will handle navigation to email verification
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.loading = false;
          
          // Handle different error types
          if (error.status === 422 && error.error?.errors) {
            // Backend validation errors
            const validationErrors = error.error.errors;
            if (validationErrors.json?.password) {
              this.errorMessage = validationErrors.json.password[0];
            } else if (validationErrors.json?.email) {
              this.errorMessage = validationErrors.json.email[0];
            } else if (validationErrors.json?.username) {
              this.errorMessage = validationErrors.json.username[0];
            } else {
              this.errorMessage = 'Please check your information and try again.';
            }
          } else if (error.status === 409) {
            this.errorMessage = 'An account with this email or username already exists.';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
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
} 