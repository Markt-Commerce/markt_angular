import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style='font-family: Inter, "Noto Sans", sans-serif;'>
      <div class="layout-container flex h-full grow flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f1f0] px-10">
          <div class="flex items-center gap-6 text-[#181211]">
            <div class="h-12 lg:h-16 xl:h-20">
              <img src="/markt-text-logo.png" alt="Markt" class="h-full w-auto object-contain drop-shadow-lg">
            </div>
          </div>
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e85530] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            [routerLink]="['/auth/login']"
          >
            <span class="truncate">Back to sign in</span>
          </button>
        </header>

        <!-- Main Content -->
        <div class="px-40 flex flex-1 justify-center py-5">
          <div class="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            
            <!-- Reset Password Form -->
            <div *ngIf="!emailSent">
              <h2 class="text-[#181211] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Reset your password</h2>
              <p class="text-[#181211] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              
              <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
                <div class="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label class="flex flex-col min-w-40 flex-1">
                    <p class="text-[#181211] text-base font-medium leading-normal pb-2">Email</p>
                    <input
                      placeholder="your.email@example.com"
                      formControlName="email"
                      type="email"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-14 placeholder:text-[#886a63] p-[15px] text-base font-normal leading-normal"
                      [class.border-red-500]="forgotPasswordForm.get('email')?.errors && forgotPasswordForm.get('email')?.touched"
                    />
                    <div *ngIf="forgotPasswordForm.get('email')?.errors && forgotPasswordForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                      {{ getErrorMessage('email') }}
                    </div>
                  </label>
                </div>
                
                <!-- Error Message -->
                <div *ngIf="errorMessage" class="mx-4 mb-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {{ errorMessage }}
            </div>
            
                <div class="flex px-4 py-3">
                  <button
              type="submit"
              [disabled]="forgotPasswordForm.invalid || loading"
                    class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#e85530] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                    <span class="truncate">{{ loading ? 'Sending...' : 'Send reset link' }}</span>
                  </button>
                </div>
          </form>
              
              <p class="text-[#886a63] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
                <a [routerLink]="['/auth/login']" class="underline hover:no-underline">Remember your password? Sign in</a>
              </p>
        </div>
        
            <!-- Success Message -->
            <div *ngIf="emailSent" class="text-center py-8">
              <div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">✓</div>
              <h2 class="text-[#181211] text-[28px] font-bold leading-tight mb-4">Check Your Email</h2>
              <p class="text-[#181211] text-base font-normal leading-normal mb-4">
                We've sent a password reset link to <strong>{{ email }}</strong>
              </p>
              <p class="text-[#886a63] text-sm font-normal leading-normal mb-6">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
          
              <div class="flex gap-4 justify-center">
                <button
                  (click)="resendEmail()"
              [disabled]="resending"
                  class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f4f1f0] text-[#181211] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                >
                  <span class="truncate">{{ resending ? 'Sending...' : 'Resend Email' }}</span>
                </button>
            
                <button
                  (click)="backToLogin()"
                  class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e85530] text-white text-sm font-bold leading-normal tracking-[0.015em]"
             >
                  <span class="truncate">Back to Login</span>
                </button>
          </div>
        </div>
        
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
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
        next: (response: any) => {
          this.loading = false;
          this.emailSent = true;
          
        },
        error: (error: any) => {
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
      next: (response: any) => {
        this.resending = false;
        
      },
      error: (error: any) => {
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