import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;
  error: string | null = null;
  currentStep = 1;

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group(
      {
        accountType: ['buyer', [Validators.required]],
        name: ['', [Validators.required, Validators.minLength(3)]],
        username: [
          '',
          [Validators.required, Validators.pattern(/^@[a-zA-Z0-9._]+$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        shopDirections: [''],
        shopCategory: [''],
        shopDescription: [''],
        cardNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{16}$/)],
        ],
        cardExpiry: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
          ],
        ],
        cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
        agreeToTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onCreateAccount() {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    // Simulate signup (replace with real API call)
    setTimeout(() => {
      this.loading = false;
      // Success: redirect to feed
      this.router.navigate(['/feed']);
    }, 1500);
  }

  markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach((key) => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  useCurrentLocation() {
    // Implement location detection
    console.log('Using current location');
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  // Getter methods for template access with null checks
  get accountType() {
    return this.signupForm.get('accountType');
  }

  get name() {
    return this.signupForm.get('name');
  }

  get username() {
    return this.signupForm.get('username');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get phone() {
    return this.signupForm.get('phone');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  get cardNumber() {
    return this.signupForm.get('cardNumber');
  }

  get cardExpiry() {
    return this.signupForm.get('cardExpiry');
  }

  get cvv() {
    return this.signupForm.get('cvv');
  }
}
