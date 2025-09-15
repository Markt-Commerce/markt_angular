import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-sans">
      <div class="layout-container flex h-full grow flex-col">
        <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f1f0] px-10">
          <div class="flex items-center gap-6 text-[#181211]">
           
            <div class="h-12 lg:h-16 xl:h-20">
              <img src="/markt-text-logo.png" alt="Markt" class="h-full w-auto object-contain drop-shadow-lg">
            </div>
        </div>
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f4f1f0] text-[#181211] text-sm font-bold leading-normal tracking-[0.015em]"
            [routerLink]="['/auth/register']"
          >
            <span class="truncate">Don't have an account? Sign up</span>
          </button>
        </header>
        
        <div class="px-4 lg:px-40 flex flex-1 justify-center py-5">
          <div class="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 class="text-[#181211] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Welcome back</h2>
            <p class="text-[#181211] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">Access your account to continue exploring</p>
            
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <!-- Email Address -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label for="email" class="flex flex-col min-w-40 flex-1">
                  <input
                    id="email"
                    formControlName="email"
              type="email"
                    placeholder="Email Address"
                    class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border-none bg-[#f4f1f0] focus:border-none h-14 placeholder:text-[#886a63] p-4 text-base font-normal leading-normal"
                    [class.border-red-500]="getErrorMessage('email')"
                  />
                  <div *ngIf="getErrorMessage('email')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('email') }}
                  </div>
                </label>
          </div>
          
              <!-- Password -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label for="password" class="flex flex-col min-w-40 flex-1">
                  <div class="flex w-full flex-1 items-stretch rounded-lg">
                    <input
              id="password"
              formControlName="password"
                      [type]="showPassword ? 'text' : 'password'"
                      placeholder="Password"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border-none bg-[#f4f1f0] focus:border-none h-14 placeholder:text-[#886a63] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                      [class.border-red-500]="getErrorMessage('password')"
                    />
                    <div
                      class="text-[#886a63] flex border-none bg-[#f4f1f0] items-center justify-center pr-4 rounded-r-lg border-l-0 cursor-pointer hover:text-[#181211] transition-colors duration-200"
                      (click)="togglePasswordVisibility()"
                      (keyup.enter)="togglePasswordVisibility()"
                      (keyup.space)="togglePasswordVisibility()"
                      tabindex="0"
                      role="button"
                      [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                      [attr.aria-pressed]="showPassword"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path *ngIf="!showPassword"
                          d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"
                        ></path>
                        <path *ngIf="showPassword"
                          d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div *ngIf="getErrorMessage('password')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('password') }}
                  </div>
                </label>
          </div>
          
              <!-- Account Type -->
              <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label for="accountType" class="flex flex-col min-w-40 flex-1">
                  <select
                    id="accountType"
                    formControlName="accountType"
                    class="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border-none bg-[#f4f1f0] focus:border-none h-14 placeholder:text-[#886a63] p-4 text-base font-normal leading-normal"
                  >
                    <option value="">Select Account Type</option>
                    <option value="buyer">Buyer Account</option>
                    <option value="seller">Seller Account</option>
                  </select>
                  <div *ngIf="getErrorMessage('accountType')" class="text-red-500 text-sm mt-1">
                    {{ getErrorMessage('accountType') }}
                  </div>
                </label>
          </div>
          
              <!-- Remember Me -->
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div class="flex size-7 items-center justify-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    formControlName="rememberMe"
                    class="h-5 w-5 rounded border-[#e5dddc] border-2 bg-transparent text-[#e85530] checked:bg-[#e85530] checked:border-[#e85530] focus:ring-0 focus:ring-offset-0 focus:border-[#e5dddc] focus:outline-none"
                  />
            </div>
                <label for="rememberMe" class="text-[#181211] text-base font-normal leading-normal flex-1 truncate cursor-pointer">Remember me</label>
          </div>
          
              <!-- Forgot Password -->
              <p class="text-[#886a63] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer hover:text-[#181211] transition-colors duration-200" [routerLink]="['/auth/forgot-password']">Forgot password?</p>
              
              <!-- Error Message -->
              <div *ngIf="errorMessage" class="mx-4 my-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {{ errorMessage }}
          </div>
          
              <!-- Sign In Button -->
              <div class="flex px-4 py-3">
                <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
                  class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#e85530] text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d64426] transition-colors duration-200"
                >
                  <span class="truncate" *ngIf="!loading">Sign In</span>
                  <span class="truncate" *ngIf="loading">Signing In...</span>
                </button>
              </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .login-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .login-header p {
      color: #7f8c8d;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #2c3e50;
    }
    
    .checkbox-label input {
      width: auto;
    }
    
    .forgot-link {
      color: #3498db;
      text-decoration: none;
      font-size: 0.9rem;
    }
    
    .forgot-link:hover {
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
    
    .login-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #ecf0f1;
    }
    
    .login-footer a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    
    .login-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  ngOnInit(): void {
    this.initForm();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      accountType: ['buyer'],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const credentials: any = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      if (this.loginForm.value.accountType) {
        credentials.account_type = this.loginForm.value.accountType;
      }

      console.log('Attempting login with credentials:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', response ? Object.keys(response) : 'No response');
          
          // Check if response has data (successful login)
          // Handle both ApiResponse wrapper and direct data response
          const userData = response?.data || response;
          
          if (userData && userData.id) {
            console.log('Login successful, navigating...');
            // Navigate to smart dashboard for all users
            this.router.navigate(['/app/dashboard']);
          } else {
            console.log('Login failed - no valid user data in response');
            this.errorMessage = response?.message || 'Login failed';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.message || 'Login failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
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
    }
    
    return '';
  }
} 