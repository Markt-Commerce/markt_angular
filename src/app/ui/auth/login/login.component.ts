import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    // Simulate login (replace with real API call)
    setTimeout(() => {
      this.loading = false;
      if (
        this.loginForm.value.email === 'user@markt.com' &&
        this.loginForm.value.password === 'password123'
      ) {
        // Success: redirect or emit event
        window.location.href = '/feed';
      } else {
        this.error = 'Invalid email or password.';
      }
    }, 1200);
  }

  onForgotPassword() {
    // TODO: Implement forgot password flow
    alert('Forgot password flow coming soon!');
  }
}
