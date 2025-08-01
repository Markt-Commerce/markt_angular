import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  // Form data
  forgotPasswordData = {
    email: ''
  };

  // UI state
  isLoading = false;
  isEmailSent = false;

  // Form validation
  errors: { [key: string]: string } = {};

  constructor(private router: Router) {}

  // Navigation
  onSendResetLink() {
    if (this.validateForm()) {
      this.isLoading = true;
      // TODO: Implement password reset logic
      console.log('Password reset attempt:', this.forgotPasswordData);
      setTimeout(() => {
        this.isLoading = false;
        this.isEmailSent = true;
      }, 2000);
    }
  }

  onSignIn() {
    this.router.navigate(['/auth/login']);
  }

  onContactSupport() {
    // Navigate to support page or open contact form
    console.log('Contact support');
  }

  // Form validation
  validateForm(): boolean {
    this.errors = {};

    if (!this.forgotPasswordData.email.trim()) {
      this.errors['email'] = 'Email is required';
    } else if (!this.isValidEmail(this.forgotPasswordData.email)) {
      this.errors['email'] = 'Please enter a valid email';
    }

    return Object.keys(this.errors).length === 0;
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Reset form for new attempt
  onResetForm() {
    this.isEmailSent = false;
    this.forgotPasswordData.email = '';
    this.errors = {};
  }
} 