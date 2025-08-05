import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="account-container">
      <div class="account-header">
        <div class="header-content">
          <h1>Account Settings</h1>
          <p>Manage your account information and security</p>
        </div>
        <div class="header-actions">
          <app-button
            variant="secondary"
            size="md"
            [outline]="true"
            (click)="goBack()"
          >
            Back to Settings
          </app-button>
        </div>
      </div>

      <div class="account-content">
        <div class="settings-section">
          <h2>Personal Information</h2>
          <form [formGroup]="personalInfoForm" (ngSubmit)="updatePersonalInfo()" class="settings-form">
            <div class="form-row">
              <div class="form-group">
                <app-input
                  id="username"
                  name="username"
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  formControlName="username"
                  [required]="true"
                  [errorMessage]="getErrorMessage('username', personalInfoForm)"
                  [fullWidth]="true"
                ></app-input>
              </div>
              
              <div class="form-group">
                <app-input
                  id="full_name"
                  name="full_name"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  formControlName="full_name"
                  [required]="true"
                  [errorMessage]="getErrorMessage('full_name', personalInfoForm)"
                  [fullWidth]="true"
                ></app-input>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <app-input
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  formControlName="email"
                  [required]="true"
                  [errorMessage]="getErrorMessage('email', personalInfoForm)"
                  [fullWidth]="true"
                ></app-input>
              </div>
              
              <div class="form-group">
                <app-input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  formControlName="phone_number"
                  [errorMessage]="getErrorMessage('phone_number', personalInfoForm)"
                  [fullWidth]="true"
                ></app-input>
              </div>
            </div>

            <div *ngIf="personalInfoError" class="error-message">
              {{ personalInfoError }}
            </div>

            <div *ngIf="personalInfoSuccess" class="success-message">
              {{ personalInfoSuccess }}
            </div>

            <div class="form-actions">
              <app-button
                type="submit"
                variant="primary"
                size="md"
                [loading]="personalInfoLoading"
                [disabled]="personalInfoForm.invalid || personalInfoLoading"
              >
                Update Information
              </app-button>
            </div>
          </form>
        </div>

        <div class="settings-section">
          <h2>Change Password</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="settings-form">
            <div class="form-group">
              <app-input
                id="current_password"
                name="current_password"
                type="password"
                label="Current Password"
                placeholder="Enter your current password"
                formControlName="current_password"
                [required]="true"
                [errorMessage]="getErrorMessage('current_password', passwordForm)"
                [fullWidth]="true"
              ></app-input>
            </div>

            <div class="form-row">
              <div class="form-group">
                <app-input
                  id="new_password"
                  name="new_password"
                  type="password"
                  label="New Password"
                  placeholder="Enter your new password"
                  formControlName="new_password"
                  [required]="true"
                  [errorMessage]="getErrorMessage('new_password', passwordForm)"
                  [fullWidth]="true"
                ></app-input>
              </div>
              
              <div class="form-group">
                <app-input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  formControlName="confirm_password"
                  [required]="true"
                  [errorMessage]="getErrorMessage('confirm_password', passwordForm)"
                  [fullWidth]="true"
                ></app-input>
              </div>
            </div>

            <div class="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li [class.met]="passwordForm.get('new_password')?.value?.length >= 8">At least 8 characters</li>
                                 <li [class.met]="hasUppercase()">One uppercase letter</li>
                 <li [class.met]="hasLowercase()">One lowercase letter</li>
                 <li [class.met]="hasNumber()">One number</li>
                 <li [class.met]="hasSpecialChar()">One special character</li>
              </ul>
            </div>

            <div *ngIf="passwordError" class="error-message">
              {{ passwordError }}
            </div>

            <div *ngIf="passwordSuccess" class="success-message">
              {{ passwordSuccess }}
            </div>

            <div class="form-actions">
              <app-button
                type="submit"
                variant="primary"
                size="md"
                [loading]="passwordLoading"
                [disabled]="passwordForm.invalid || passwordLoading"
              >
                Change Password
              </app-button>
            </div>
          </form>
        </div>

        <div class="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <div class="danger-content">
            <div class="danger-info">
              <h3>Delete Account</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <app-button
              variant="danger"
              size="md"
              [outline]="true"
              (click)="showDeleteConfirmation()"
            >
              Delete Account
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .header-content p {
      color: #718096;
      margin: 0;
    }

    .account-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .settings-section {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 2rem;
    }

    .settings-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .password-requirements {
      background: #f7fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem 0;
    }

    .password-requirements h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
      margin: 0 0 0.5rem 0;
    }

    .password-requirements ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.25rem;
    }

    .password-requirements li {
      font-size: 0.75rem;
      color: #a0aec0;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .password-requirements li::before {
      content: '○';
      font-size: 0.875rem;
    }

    .password-requirements li.met {
      color: #38a169;
    }

    .password-requirements li.met::before {
      content: '●';
      color: #38a169;
    }

    .error-message {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .success-message {
      background: #c6f6d5;
      color: #2f855a;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .danger-zone {
      border-color: #fed7d7;
      background: #fff5f5;
    }

    .danger-zone h2 {
      color: #c53030;
      border-bottom-color: #fed7d7;
    }

    .danger-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .danger-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #c53030;
      margin: 0 0 0.5rem 0;
    }

    .danger-info p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .account-container {
        padding: 1rem;
      }

      .account-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .danger-content {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .password-requirements ul {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  personalInfoForm!: FormGroup;
  passwordForm!: FormGroup;
  
  personalInfoLoading = false;
  passwordLoading = false;
  
  personalInfoError = '';
  personalInfoSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  ngOnInit(): void {
    this.initForms();
    this.loadAccountInfo();
  }

  private initForms(): void {
    this.personalInfoForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): Record<string, any> | null {
    const newPassword = form.get('new_password');
    const confirmPassword = form.get('confirm_password');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadAccountInfo(): void {
    // Mock data - replace with actual API call
    const mockAccount = {
      username: 'johndoe',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone_number: '+1234567890'
    };

    this.personalInfoForm.patchValue(mockAccount);
  }

  updatePersonalInfo(): void {
    if (this.personalInfoForm.valid) {
      this.personalInfoLoading = true;
      this.personalInfoError = '';
      this.personalInfoSuccess = '';

      const formData = this.personalInfoForm.value;

      // Mock API call - replace with actual service call
      setTimeout(() => {
        this.personalInfoLoading = false;
        this.personalInfoSuccess = 'Personal information updated successfully!';
        
        setTimeout(() => {
          this.personalInfoSuccess = '';
        }, 3000);
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.passwordLoading = true;
      this.passwordError = '';
      this.passwordSuccess = '';

      const formData = this.passwordForm.value;

      // Mock API call - replace with actual service call
      setTimeout(() => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm.reset();
        
        setTimeout(() => {
          this.passwordSuccess = '';
        }, 3000);
      }, 1000);
    }
  }

  getErrorMessage(field: string, form: FormGroup): string {
    const control = form.get(field);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return `${field.replace('_', ' ')} is required`;
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors?.['minlength']) {
        return `${field.replace('_', ' ')} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors?.['maxlength']) {
        return `${field.replace('_', ' ')} must be no more than ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors?.['pattern']) {
        return `Please enter a valid ${field.replace('_', ' ')}`;
      }
    }
    
    if (form.errors?.['passwordMismatch'] && field === 'confirm_password') {
      return 'Passwords do not match';
    }
    
    return '';
  }

  showDeleteConfirmation(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.deleteAccount();
    }
  }

  deleteAccount(): void {
    // Mock account deletion - replace with actual implementation
    alert('Account deletion would be implemented here');
  }

  goBack(): void {
    this.router.navigate(['/app/settings']);
  }

  hasUppercase(): boolean {
    const password = this.passwordForm.get('new_password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.passwordForm.get('new_password')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.passwordForm.get('new_password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.passwordForm.get('new_password')?.value || '';
    return /[^A-Za-z0-9]/.test(password);
  }
} 