import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <h1>Reset Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>
        
        <div *ngIf="!emailSent" class="forgot-password-form">
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <app-input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                formControlName="email"
                [required]="true"
                [errorMessage]="getErrorMessage('email')"
                [fullWidth]="true"
              ></app-input>
            </div>
            
            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [loading]="loading"
              [disabled]="forgotPasswordForm.invalid || loading"
              [fullWidth]="true"
            >
              Send Reset Link
            </app-button>
          </form>
        </div>
        
        <div *ngIf="emailSent" class="success-message">
          <div class="success-icon">✓</div>
          <h2>Check Your Email</h2>
          <p>We've sent a password reset link to <strong>{{ email }}</strong></p>
          <p>Click the link in the email to reset your password. The link will expire in 1 hour.</p>
          
          <div class="success-actions">
            <app-button
              variant="secondary"
              size="md"
              (clicked)="resendEmail()"
              [loading]="resending"
              [disabled]="resending"
            >
              Resend Email
            </app-button>
            
                         <app-button
               variant="secondary"
               size="md"
               [outline]="true"
               (clicked)="backToLogin()"
             >
               Back to Login
             </app-button>
          </div>
        </div>
        
        <div class="forgot-password-footer">
          <p>Remember your password? <a routerLink="/auth/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .forgot-password-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .forgot-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .forgot-password-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .forgot-password-header p {
      color: #7f8c8d;
      line-height: 1.5;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
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
    
    .success-message {
      text-align: center;
      padding: 2rem 0;
    }
    
    .success-icon {
      width: 60px;
      height: 60px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      margin: 0 auto 1.5rem;
    }
    
    .success-message h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .success-message p {
      color: #7f8c8d;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    
    .success-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    
    .forgot-password-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #ecf0f1;
    }
    
    .forgot-password-footer a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    
    .forgot-password-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotPasswordForm!: FormGroup;
  loading = false;
  resending = false;
  errorMessage = '';
  emailSent = false;
  email = '';

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(this.email).subscribe({
        next: (response) => {
          this.loading = false;
          this.emailSent = true;
          console.log('Password reset email sent:', response);
        },
        error: (error) => {
          this.loading = false;
          console.error('Password reset error:', error);
          
          if (error.status === 404) {
            this.errorMessage = 'No account found with this email address.';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = error.message || 'An error occurred. Please try again.';
          }
        }
      });
    }
  }

  resendEmail(): void {
    this.resending = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.resending = false;
        console.log('Password reset email resent:', response);
      },
      error: (error) => {
        this.resending = false;
        console.error('Password reset resend error:', error);
        this.errorMessage = 'Failed to resend email. Please try again.';
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  getErrorMessage(field: string): string {
    const control = this.forgotPasswordForm.get(field);
    
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    
    return '';
  }
} 