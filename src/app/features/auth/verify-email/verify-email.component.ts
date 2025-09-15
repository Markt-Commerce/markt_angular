import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCheckCircle, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden font-sans">
      <div class="layout-container flex h-full grow flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f1f0] px-10">
          <div class="flex items-center gap-6 text-[#181211]">
            <div class="h-12 lg:h-16 xl:h-20">
              <img src="/markt-text-logo.png" alt="Markt" class="h-full w-auto object-contain drop-shadow-lg">
            </div>
          </div>
          <button
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f4f1f0] text-[#181211] text-sm font-bold leading-normal tracking-[0.015em]"
            [routerLink]="['/auth/login']"
          >
            <span class="truncate">Back to Login</span>
          </button>
        </header>

        <!-- Main Content -->
        <div class="px-4 lg:px-40 flex flex-1 justify-center py-5">
          <div class="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div class="w-full" style="height: 80px;"></div>
            
            <!-- Email Icon -->
            <div class="flex w-full grow bg-white @container p-4">
              <div class="w-full gap-1 overflow-hidden bg-white @[480px]:gap-2 aspect-[3/2] rounded-lg flex">
                <div class="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1 flex items-center justify-center"
                     [ngClass]="getIconContainerClass()">
                  <fa-icon [icon]="getHeaderIcon()" class="text-6xl" [ngClass]="getIconClass()"></fa-icon>
                </div>
              </div>
            </div>

            <!-- Title and Description -->
            <h2 class="text-[#181211] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              {{ getTitle() }}
            </h2>
            <p class="text-[#181211] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              {{ getMainDescription() }}
            </p>
            <p *ngIf="getSecondaryDescription()" class="text-[#181211] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
              {{ getSecondaryDescription() }}
            </p>

            <!-- Error Message -->
            <div *ngIf="verificationStatus === 'error'" class="mx-4 my-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
              {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div *ngIf="verificationStatus === 'success'" class="mx-4 my-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
              Your email has been verified successfully! You can now access all features of your Markt account.
            </div>

            <!-- Loading State -->
            <div *ngIf="isVerifying" class="text-center py-4">
              <fa-icon [icon]="faSpinner" class="text-2xl text-[#e85530] animate-spin mb-2"></fa-icon>
              <p class="text-[#886a63] text-sm">Verifying your email address...</p>
            </div>

            <!-- Primary Action Button -->
            <div class="flex px-4 py-3">
              <button
                class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#e85530] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                [disabled]="isResending || (verificationStatus === 'pending' && resendCooldown > 0)"
                (click)="handlePrimaryAction()"
              >
                <fa-icon *ngIf="isResending" [icon]="faSpinner" class="animate-spin mr-2"></fa-icon>
                <span class="truncate">{{ getPrimaryButtonText() }}</span>
              </button>
            </div>

            <!-- Secondary Action Button -->
            <div class="flex px-4 py-3">
              <button
                class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 flex-1 bg-[#f4f1f0] text-[#181211] text-sm font-bold leading-normal tracking-[0.015em]"
                (click)="handleSecondaryAction()"
              >
                <span class="truncate">{{ getSecondaryButtonText() }}</span>
              </button>
            </div>

            <!-- Help Text -->
            <p class="text-[#886a63] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              <a href="mailto:support@marktcommerce.com" class="underline hover:text-[#e85530]">
                Need help? Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Font Awesome icons
  faEnvelope = faEnvelope;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;

  // Component state
  verificationStatus: 'pending' | 'success' | 'error' | null = null;
  isVerifying = false;
  isResending = false;
  errorMessage = '';
  email = '';
  verificationCode = '';
  resendCooldown = 0;
  private cooldownInterval?: number;

  ngOnInit(): void {
    // Get query parameters - updated to use code instead of token
    const code = this.route.snapshot.queryParams['code'];
    const email = this.route.snapshot.queryParams['email'];
    
    this.email = email || '/Logo.png';
    this.verificationCode = code || '/Logo.png';

    if (code && email) {
      // If both code and email are present, verify immediately
      this.verifyEmailWithCode(email, code);
    } else {
      // If no code/email, show pending state (user needs to check email)
      this.verificationStatus = 'pending';
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  verifyEmailWithCode(email: string, code: string): void {
    this.isVerifying = true;
    this.verificationStatus = null;

    this.authService.verifyEmail({
      email: email,
      verification_code: code
    }).subscribe({
      next: (response: any) => {
        this.isVerifying = false;
        this.verificationStatus = 'success';
        
      },
      error: (error: any) => {
        this.isVerifying = false;
        this.verificationStatus = 'error';
        this.errorMessage = this.getErrorMessage(error);
        console.error('Email verification failed:', error);
      }
    });
  }

  resendVerificationEmail(): void {
    if (this.isResending || this.resendCooldown > 0 || !this.email) return;

    this.isResending = true;

    this.authService.sendEmailVerification(this.email).subscribe({
      next: (response: any) => {
        this.isResending = false;
        this.startResendCooldown();
        
        // Reset status to pending as new code was sent
        this.verificationStatus = 'pending';
        this.errorMessage = '';
      },
      error: (error: any) => {
        this.isResending = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Failed to resend verification email:', error);
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60; // 60 seconds cooldown
    this.cooldownInterval = window.setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.status === 400) {
      return 'Invalid or expired verification token. Please request a new verification email.';
    }
    
    if (error?.status === 404) {
      return 'Verification token not found. Please request a new verification email.';
    }
    
    if (error?.status === 409) {
      return 'This email address has already been verified.';
    }
    
    return 'An error occurred during email verification. Please try again.';
  }

  getTitle(): string {
    switch (this.verificationStatus) {
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'pending':
        return 'Verify Your Email';
      default:
        return 'Email Verification';
    }
  }

  getMainDescription(): string {
    switch (this.verificationStatus) {
      case 'success':
        return 'Welcome to Markt! Your account is now active.';
      case 'error':
        return 'We couldn\'t verify your email address.';
      case 'pending':
        return 'We\'ve sent a verification link to your email address';
      default:
        return 'Verifying your email address...';
    }
  }

  getSecondaryDescription(): string | null {
    switch (this.verificationStatus) {
      case 'pending':
        return 'Please check your inbox and click the link to verify your account';
      default:
        return null;
    }
  }

  getIconContainerClass(): string {
    switch (this.verificationStatus) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'pending':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  }

  getIconClass(): string {
    switch (this.verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }

  getHeaderIcon() {
    switch (this.verificationStatus) {
      case 'success':
        return this.faCheckCircle;
      case 'error':
        return this.faExclamationTriangle;
      case 'pending':
        return this.faEnvelope;
      default:
        return this.faSpinner;
    }
  }

  getPrimaryButtonText(): string {
    switch (this.verificationStatus) {
      case 'success':
        return 'Continue to Login';
      case 'error':
        return this.isResending ? 'Sending...' : 'Resend Verification Email';
      case 'pending':
        return this.getResendButtonText();
      default:
        return 'Verifying...';
    }
  }

  getSecondaryButtonText(): string {
    switch (this.verificationStatus) {
      case 'success':
        return 'Go to Homepage';
      case 'error':
        return 'Back to Registration';
      case 'pending':
        return 'Back to Login';
      default:
        return 'Back to Login';
    }
  }

  handlePrimaryAction(): void {
    if (this.verificationStatus === 'success') {
      // Navigate to login or main app
      this.router.navigate(['/auth/login']);
    } else if (this.verificationStatus === 'error') {
      // Retry verification if we have the code
      if (this.verificationCode && this.email) {
        this.verifyEmailWithCode(this.email, this.verificationCode);
      } else {
        // Navigate to login to start over
        this.router.navigate(['/auth/login']);
      }
    } else {
      // Pending state - resend email
      this.resendVerificationEmail();
    }
  }

  handleSecondaryAction(): void {
    // Always navigate to login
    this.router.navigate(['/auth/login']);
  }

  getResendButtonText(): string {
    if (this.isResending) {
      return 'Sending...';
    }
    if (this.resendCooldown > 0) {
      return `Resend in ${this.resendCooldown}s`;
    }
    return 'Resend Verification Email';
  }
} 