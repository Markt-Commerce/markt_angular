import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>Create Account</h1>
          <p>Join Markt and start buying and selling</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <app-input
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="Choose a username"
              formControlName="username"
              [required]="true"
              [errorMessage]="getErrorMessage('username')"
              [fullWidth]="true"
            ></app-input>
          </div>
          
          <div class="form-group">
            <app-input
              id="fullName"
              name="fullName"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              formControlName="fullName"
              [required]="true"
              [errorMessage]="getErrorMessage('fullName')"
              [fullWidth]="true"
            ></app-input>
          </div>
          
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
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number (Optional)"
              placeholder="Enter your phone number"
              formControlName="phone"
              [errorMessage]="getErrorMessage('phone')"
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
              <option value="buyer">Buyer - I want to buy products</option>
              <option value="seller">Seller - I want to sell products</option>
            </select>
            <div *ngIf="getErrorMessage('account_type')" class="error-text">
              {{ getErrorMessage('account_type') }}
            </div>
          </div>
          
          <div class="form-group">
            <app-input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Create a password"
              formControlName="password"
              [required]="true"
              [errorMessage]="getErrorMessage('password')"
              [fullWidth]="true"
            ></app-input>
          </div>
          
          <div class="form-group">
            <app-input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              formControlName="confirmPassword"
              [required]="true"
              [errorMessage]="getErrorMessage('confirmPassword')"
              [fullWidth]="true"
            ></app-input>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="agreeToTerms">
              <span>I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a></span>
            </label>
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [loading]="loading"
            [disabled]="registerForm.invalid || loading"
            [fullWidth]="true"
          >
            Create Account
          </app-button>
        </form>
        
        <div class="register-footer">
          <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
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

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
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
      agreeToTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: this.passwordMatchValidator
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