import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faShield,
  faCheckCircle,
  faUsers,
  faStar,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../domains/authentication';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FontAwesomeModule
  ],
  template: `
    <main class="min-h-screen flex font-sans bg-light">
      
      <!-- Hero Background Section -->
      <section class="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-dark/80 via-dark/60 to-dark/40 z-10"></div>
        <img 
          class="w-full h-full object-cover" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/e5bd52eb93-f7b7d497391e6b30c9df.png" 
          alt="modern university campus with students using laptops and tablets, bright natural lighting, contemporary architecture, social learning environment" />
        
        <!-- Hero Content Overlay -->
        <div class="absolute inset-0 z-20 flex flex-col justify-center px-16">
          <div class="max-w-lg">
            <div class="mb-8">
              <h1 class="text-4xl font-bold text-white mb-2">MARKT</h1>
              <div class="w-12 h-1 bg-primary"></div>
            </div>
            
            <h2 class="text-3xl font-bold text-white mb-6 leading-tight">
              Your Campus Marketplace Awaits
            </h2>
            
            <p class="text-lg text-white/90 mb-8 leading-relaxed">
              Connect with your campus community. Buy, sell, and discover amazing products from fellow students and local businesses.
            </p>
            
            <div class="flex items-center space-x-6">
              <div class="flex items-center text-white/80">
                <fa-icon [icon]="faShieldCheck" class="text-primary mr-2"></fa-icon>
                <span class="text-sm">Verified Students</span>
              </div>
              <div class="flex items-center text-white/80">
                <fa-icon [icon]="faUsers" class="text-primary mr-2"></fa-icon>
                <span class="text-sm">Campus Community</span>
              </div>
              <div class="flex items-center text-white/80">
                <fa-icon [icon]="faStar" class="text-primary mr-2"></fa-icon>
                <span class="text-sm">Trusted Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Login Form Section -->
      <section class="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white">
        <div class="w-full max-w-md">
          
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-8">
            <h1 class="text-3xl font-bold text-dark mb-2">MARKT</h1>
            <div class="w-12 h-1 bg-primary mx-auto"></div>
          </div>

          <!-- Form Header -->
          <div class="text-center lg:text-left mb-8">
            <h2 class="text-2xl font-bold text-dark mb-2">Welcome Back</h2>
            <p class="text-muted">Sign in to your account to continue</p>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Email Field -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-dark">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <fa-icon [icon]="faEnvelope" class="text-muted text-sm"></fa-icon>
                </div>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter your email"
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-sm">
                Please enter a valid email address
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-dark">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <fa-icon [icon]="faLock" class="text-muted text-sm"></fa-icon>
                </div>
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter your password"
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <button 
                  type="button" 
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <fa-icon 
                    [icon]="showPassword() ? faEyeSlash : faEye" 
                    class="text-muted text-sm hover:text-dark transition-colors">
                  </fa-icon>
                </button>
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm">
                Password is required
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  formControlName="rememberMe"
                  class="w-4 h-4 text-primary border-border rounded focus:ring-primary">
                <span class="ml-2 text-sm text-muted">Remember me</span>
              </label>
              <a 
                [routerLink]="[ROUTES_ABSOLUTE.AUTH.FORGOT_PASSWORD]"
                class="text-sm text-primary hover:text-secondary transition-colors cursor-pointer">
                Forgot password?
              </a>
            </div>

            <!-- Error Message Display -->
            <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div class="flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            </div>

            <!-- Login Button -->
            <button 
              type="submit" 
              [disabled]="loginForm.invalid || isSubmitting()"
              class="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <fa-icon 
                *ngIf="isSubmitting()" 
                [icon]="faSpinner" 
                class="animate-spin mr-2">
              </fa-icon>
              {{ isSubmitting() ? 'Signing In...' : 'Sign In' }}
            </button>

            <!-- Social Login -->
            <div class="space-y-4">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-border"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-muted">Or continue with</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  (click)="loginWithGoogle()"
                  class="flex items-center justify-center px-4 py-3 border border-border rounded-lg hover:bg-light transition-colors">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#EF4444" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span class="text-sm font-medium text-dark">Google</span>
                </button>
                <button 
                  type="button" 
                  (click)="loginWithFacebook()"
                  class="flex items-center justify-center px-4 py-3 border border-border rounded-lg hover:bg-light transition-colors">
                  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#2563EB">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span class="text-sm font-medium text-dark">Facebook</span>
                </button>
              </div>
            </div>

            <!-- Registration Link -->
            <div class="text-center">
              <p class="text-sm text-muted">
                Don't have an account? 
                <a 
                  [routerLink]="[ROUTES_ABSOLUTE.AUTH.REGISTER]"
                  class="text-primary hover:text-secondary font-medium transition-colors cursor-pointer">
                  Sign up here
                </a>
              </p>
            </div>

          </form>

          <!-- Security Indicators -->
          <div class="mt-8 pt-6 border-t border-border">
            <div class="flex items-center justify-center space-x-6 text-xs text-muted">
              <div class="flex items-center">
                <fa-icon [icon]="faShieldCheck" class="text-green-500 mr-1"></fa-icon>
                <span>SSL Encrypted</span>
              </div>
              <div class="flex items-center">
                <fa-icon [icon]="faLock" class="text-green-500 mr-1"></fa-icon>
                <span>Secure Login</span>
              </div>
              <div class="flex items-center">
                <fa-icon [icon]="faUsers" class="text-primary mr-1"></fa-icon>
                <span>Campus Verified</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Custom color variables to match Figma design exactly */
    :host {
      --primary: #E94C2A;
      --secondary: #E94B26;
      --accent: #E07575;
      --dark: #181211;
      --light: #F4F1F0;
      --muted: #886A63;
      --border: #E5DDDC;
    }
    
    .text-primary { color: var(--primary) !important; }
    .bg-primary { background-color: var(--primary) !important; }
    .border-primary { border-color: var(--primary) !important; }
    .ring-primary { --tw-ring-color: var(--primary) !important; }
    
    .text-secondary { color: var(--secondary) !important; }
    .bg-secondary { background-color: var(--secondary) !important; }
    
    .text-dark { color: var(--dark) !important; }
    .text-muted { color: var(--muted) !important; }
    .bg-light { background-color: var(--light) !important; }
    .bg-border { background-color: var(--border) !important; }
    .border-border { border-color: var(--border) !important; }
    
    /* Hide scrollbar for webkit browsers */
    ::-webkit-scrollbar { 
      display: none; 
    }
    
    /* Custom animations */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Routes for template access
  readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;

  // Font Awesome Icons
  faEnvelope = faEnvelope;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faShield = faShield;
  faShieldCheck = faCheckCircle;
  faUsers = faUsers;
  faStar = faStar;
  faSpinner = faSpinner;

  // Signals for reactive state management
  showPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Form definition
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    const authState = this.authService.getAuthState();
    if (authState.isAuthenticated) {
      this.router.navigate([this.ROUTES_ABSOLUTE.APP.DASHBOARD]);
    }
  }

  /**
   * Toggle password visibility
   * This function switches between showing and hiding the password text
   */
  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Handle form submission
   * Validates the form and attempts to authenticate the user
   * Note: account_type is removed from login - backend determines user's role capabilities
   * and default role based on their registration data
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null); // Clear any previous errors
      
      const { email, password, rememberMe } = this.loginForm.value;
      
      this.authService.login({ email, password }).subscribe({
        next: (user) => {
          // Domain AuthService.login() returns User directly and handles state internally
          // If we reach here, login was successful
            this.router.navigate([this.ROUTES_ABSOLUTE.APP.DASHBOARD]);
        },
        error: (error: any) => {
          // Handle network or server errors
          // The error message from the API interceptor is in error.message
          const errorMsg = error?.message || 'Unable to connect. Please try again later.';
          this.errorMessage.set(errorMsg);
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle Google OAuth login
   * Initiates the Google authentication flow
   */
  loginWithGoogle(): void {
    // TODO: OAuth methods not yet implemented in backend API
    // When OAuth endpoints are available, create OAuthRepository and OAuthService
    // following the same DDD pattern as other domains
    this.isSubmitting.set(true);
    this.errorMessage.set('Google login not yet available');
    this.isSubmitting.set(false);
  }

  /**
   * Handle Facebook OAuth login
   * Initiates the Facebook authentication flow
   */
  loginWithFacebook(): void {
    // TODO: OAuth methods not yet implemented in backend API
    // When OAuth endpoints are available, create OAuthRepository and OAuthService
    // following the same DDD pattern as other domains
    this.isSubmitting.set(true);
    this.errorMessage.set('Facebook login not yet available');
    this.isSubmitting.set(false);
  }
}