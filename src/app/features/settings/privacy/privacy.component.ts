import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
import { AuthService } from '../../../domains/authentication';

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="privacy-container">
      <div class="privacy-header">
        <div class="header-content">
          <h1>Privacy & Security</h1>
          <p>Control your privacy settings and data sharing preferences</p>
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

      <div class="privacy-content">
        <form [formGroup]="privacyForm" (ngSubmit)="saveSettings()" class="privacy-form">
          <div class="settings-section">
            <h2>Profile Privacy</h2>
            <p class="section-description">Control who can see your profile information</p>
            
            <div class="privacy-item" *ngFor="let setting of profilePrivacy">
              <div class="privacy-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <label class="toggle-label">
                <input 
                  type="checkbox" 
                  [formControlName]="setting.id"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h2>Contact Information</h2>
            <p class="section-description">Manage who can see your contact details</p>
            
            <div class="privacy-item" *ngFor="let setting of contactPrivacy">
              <div class="privacy-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <label class="toggle-label">
                <input 
                  type="checkbox" 
                  [formControlName]="setting.id"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h2>Activity Privacy</h2>
            <p class="section-description">Control what others can see about your activity</p>
            
            <div class="privacy-item" *ngFor="let setting of activityPrivacy">
              <div class="privacy-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <label class="toggle-label">
                <input 
                  type="checkbox" 
                  [formControlName]="setting.id"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h2>Data & Analytics</h2>
            <p class="section-description">Control how your data is used for analytics and improvements</p>
            
            <div class="privacy-item" *ngFor="let setting of dataPrivacy">
              <div class="privacy-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <label class="toggle-label">
                <input 
                  type="checkbox" 
                  [formControlName]="setting.id"
                  class="toggle-input"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h2>Security Settings</h2>
            <p class="section-description">Additional security measures for your account</p>
            
            <div class="security-item">
              <div class="security-info">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account with 2FA</p>
                <span class="security-status" [class.enabled]="twoFactorEnabled">
                  {{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}
                </span>
              </div>
              <app-button
                variant="primary"
                size="sm"
                [outline]="twoFactorEnabled"
                (click)="toggleTwoFactor()"
              >
                {{ twoFactorEnabled ? 'Disable' : 'Enable' }} 2FA
              </app-button>
            </div>

            <div class="security-item">
              <div class="security-info">
                <h3>Login History</h3>
                <p>View recent login activity and manage active sessions</p>
              </div>
              <app-button
                variant="secondary"
                size="sm"
                [outline]="true"
                (click)="viewLoginHistory()"
              >
                View History
              </app-button>
            </div>
          </div>

          <div class="settings-section danger-zone">
            <h2>Data Management</h2>
            <p class="section-description">Manage your data and account</p>
            
            <div class="data-actions">
              <div class="data-action">
                <div class="action-info">
                  <h3>Download My Data</h3>
                  <p>Get a copy of all your data in a downloadable format</p>
                </div>
                <app-button
                  variant="secondary"
                  size="sm"
                  [outline]="true"
                  (click)="downloadData()"
                >
                  Download
                </app-button>
              </div>

              <div class="data-action">
                <div class="action-info">
                  <h3>Delete My Data</h3>
                  <p>Permanently delete all your data from our servers</p>
                </div>
                <app-button
                  variant="danger"
                  size="sm"
                  [outline]="true"
                  (click)="showDeleteDataConfirmation()"
                >
                  Delete Data
                </app-button>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [loading]="loading"
              [disabled]="loading"
            >
              Save Settings
            </app-button>
            
            <app-button
              type="button"
              variant="secondary"
              size="lg"
              [outline]="true"
              (click)="resetSettings()"
              [disabled]="loading"
            >
              Reset to Defaults
            </app-button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .privacy-header {
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

    .privacy-content {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .privacy-form {
      padding: 2rem;
    }

    .settings-section {
      margin-bottom: 2rem;
    }

    .settings-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .section-description {
      color: #718096;
      font-size: 0.875rem;
      margin: 0 0 1rem 0;
    }

    .privacy-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      background: #f7fafc;
    }

    .privacy-info {
      flex: 1;
    }

    .privacy-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .privacy-info p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .toggle-input {
      display: none;
    }

    .toggle-slider {
      position: relative;
      width: 2.5rem;
      height: 1.25rem;
      background: #cbd5e0;
      border-radius: 1.25rem;
      transition: background 0.2s ease;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1rem;
      height: 1rem;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
    }

    .toggle-input:checked + .toggle-slider {
      background: #4299e1;
    }

    .toggle-input:checked + .toggle-slider::before {
      transform: translateX(1.25rem);
    }

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      background: #f7fafc;
    }

    .security-info {
      flex: 1;
    }

    .security-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .security-info p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0 0 0.5rem 0;
    }

    .security-status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      background: #fed7d7;
      color: #c53030;
    }

    .security-status.enabled {
      background: #c6f6d5;
      color: #2f855a;
    }

    .danger-zone {
      border-color: #fed7d7;
      background: #fff5f5;
    }

    .danger-zone h2 {
      color: #c53030;
    }

    .data-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .data-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #fed7d7;
      border-radius: 0.5rem;
      background: #fff5f5;
    }

    .action-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #c53030;
      margin: 0 0 0.25rem 0;
    }

    .action-info p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .error-message {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .success-message {
      background: #c6f6d5;
      color: #2f855a;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .privacy-container {
        padding: 1rem;
      }

      .privacy-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .privacy-form {
        padding: 1rem;
      }

      .privacy-item,
      .security-item,
      .data-action {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
        text-align: center;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PrivacyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  privacyForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  twoFactorEnabled = false;

  profilePrivacy: PrivacySetting[] = [
    {
      id: 'profile_public',
      title: 'Public Profile',
      description: 'Allow others to view your profile and listings',
      category: 'profile',
      enabled: true
    },
    {
      id: 'show_email',
      title: 'Show Email Address',
      description: 'Display your email address on your public profile',
      category: 'profile',
      enabled: false
    },
    {
      id: 'show_phone',
      title: 'Show Phone Number',
      description: 'Display your phone number on your public profile',
      category: 'profile',
      enabled: false
    },
    {
      id: 'show_location',
      title: 'Show Location',
      description: 'Display your location on your public profile',
      category: 'profile',
      enabled: true
    }
  ];

  contactPrivacy: PrivacySetting[] = [
    {
      id: 'allow_messages',
      title: 'Allow Direct Messages',
      description: 'Let other users send you direct messages',
      category: 'contact',
      enabled: true
    },
    {
      id: 'show_online_status',
      title: 'Show Online Status',
      description: 'Display when you are online to other users',
      category: 'contact',
      enabled: false
    },
    {
      id: 'allow_friend_requests',
      title: 'Allow Friend Requests',
      description: 'Let other users send you friend requests',
      category: 'contact',
      enabled: true
    }
  ];

  activityPrivacy: PrivacySetting[] = [
    {
      id: 'show_purchase_history',
      title: 'Show Purchase History',
      description: 'Display your recent purchases on your profile',
      category: 'activity',
      enabled: false
    },
    {
      id: 'show_reviews',
      title: 'Show Reviews',
      description: 'Display reviews you have written on your profile',
      category: 'activity',
      enabled: true
    },
    {
      id: 'show_favorites',
      title: 'Show Favorites',
      description: 'Display your favorite items on your profile',
      category: 'activity',
      enabled: true
    },
    {
      id: 'show_activity_feed',
      title: 'Show Activity Feed',
      description: 'Display your recent activity on your profile',
      category: 'activity',
      enabled: false
    }
  ];

  dataPrivacy: PrivacySetting[] = [
    {
      id: 'analytics_tracking',
      title: 'Analytics Tracking',
      description: 'Allow us to collect analytics data to improve our service',
      category: 'data',
      enabled: true
    },
    {
      id: 'personalized_ads',
      title: 'Personalized Advertising',
      description: 'Show personalized ads based on your interests',
      category: 'data',
      enabled: false
    },
    {
      id: 'third_party_sharing',
      title: 'Third-Party Data Sharing',
      description: 'Allow sharing of your data with trusted third-party partners',
      category: 'data',
      enabled: false
    }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    const formControls: Record<string, any> = {};

    // Add controls for all privacy settings
    [...this.profilePrivacy, ...this.contactPrivacy, ...this.activityPrivacy, ...this.dataPrivacy].forEach(setting => {
      formControls[setting.id] = [setting.enabled];
    });

    this.privacyForm = this.fb.group(formControls);
  }

  private loadSettings(): void {
    this.loading = true;
    
    this.authService.getPrivacySettings().subscribe({
      next: (response: any) => {
        this.privacyForm.patchValue(response?.data || {});
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading privacy settings:', error);
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const formData = this.privacyForm.value;
    
    this.authService.updatePrivacySettings(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Privacy settings updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating privacy settings:', error);
        this.loading = false;
        this.errorMessage = 'Failed to update privacy settings.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all privacy settings to defaults?')) {
      this.loadSettings();
      // TODO: Replace with actual backend call
    }
  }

  toggleTwoFactor(): void {
    if (this.twoFactorEnabled) {
      if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        this.twoFactorEnabled = false;
        this.successMessage = 'Two-factor authentication disabled!';
      }
    } else {
      // Mock 2FA setup - replace with actual implementation
      this.twoFactorEnabled = true;
      this.successMessage = 'Two-factor authentication enabled!';
    }
    
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  viewLoginHistory(): void {
    // Mock login history view - replace with actual implementation
    
  }

  downloadData(): void {
    // Mock data download - replace with actual implementation
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Data download started! Check your email for the download link.';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }, 2000);
  }

  showDeleteDataConfirmation(): void {
    if (confirm('Are you sure you want to permanently delete all your data? This action cannot be undone.')) {
      this.deleteData();
    }
  }

  deleteData(): void {
    // Mock data deletion - replace with actual implementation
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Data deletion request submitted. You will receive a confirmation email.';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SETTINGS]);
  }
} 