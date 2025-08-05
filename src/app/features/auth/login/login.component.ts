import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Markt account</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
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
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              formControlName="password"
              [required]="true"
              [errorMessage]="getErrorMessage('password')"
              [fullWidth]="true"
            ></app-input>
          </div>
          
          <div class="form-group">
            <label for="account_type" class="form-label">Account Type</label>
            <select 
              id="account_type" 
              formControlName="account_type"
              class="form-select"
              [class.error]="getErrorMessage('account_type')"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            <div *ngIf="getErrorMessage('account_type')" class="error-text">
              {{ getErrorMessage('account_type') }}
            </div>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe">
              <span>Remember me</span>
            </label>
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [loading]="loading"
            [disabled]="loginForm.invalid || loading"
            [fullWidth]="true"
          >
            Sign In
          </app-button>
        </form>
        
        <div class="login-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
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

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      account_type: ['buyer', [Validators.required]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        account_type: this.loginForm.value.account_type
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login successful:', response);
          
          // Redirect to return URL or default to app
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
          
          if (error.status === 401) {
            this.errorMessage = 'Invalid email or password';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = error.message || 'An error occurred during login. Please try again.';
          }
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