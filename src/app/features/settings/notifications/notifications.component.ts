import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  category: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <div class="header-content">
          <h1>Notification Settings</h1>
          <p>Control how and when you receive notifications</p>
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

      <div class="notifications-content">
        <form [formGroup]="notificationsForm" (ngSubmit)="saveSettings()" class="notifications-form">
          <div class="settings-section">
            <h2>Order Notifications</h2>
            <p class="section-description">Get notified about your order status and updates</p>
            
            <div class="notification-item" *ngFor="let setting of orderNotifications">
              <div class="notification-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <div class="notification-toggles">
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_email'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Email</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_push'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Push</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_sms'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">SMS</span>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h2>Message Notifications</h2>
            <p class="section-description">Stay updated with messages from buyers and sellers</p>
            
            <div class="notification-item" *ngFor="let setting of messageNotifications">
              <div class="notification-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <div class="notification-toggles">
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_email'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Email</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_push'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Push</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_sms'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">SMS</span>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h2>Marketplace Notifications</h2>
            <p class="section-description">Get updates about products, offers, and marketplace activity</p>
            
            <div class="notification-item" *ngFor="let setting of marketplaceNotifications">
              <div class="notification-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <div class="notification-toggles">
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_email'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Email</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_push'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Push</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_sms'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">SMS</span>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h2>General Notifications</h2>
            <p class="section-description">System updates and general announcements</p>
            
            <div class="notification-item" *ngFor="let setting of generalNotifications">
              <div class="notification-info">
                <h3>{{ setting.title }}</h3>
                <p>{{ setting.description }}</p>
              </div>
              <div class="notification-toggles">
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_email'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Email</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_push'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">Push</span>
                </label>
                
                <label class="toggle-label">
                  <input 
                    type="checkbox" 
                    [formControlName]="setting.id + '_sms'"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">SMS</span>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h2>Notification Schedule</h2>
            <p class="section-description">Set when you want to receive notifications</p>
            
            <div class="schedule-settings">
              <div class="schedule-item">
                <label class="schedule-label">
                  <input 
                    type="checkbox" 
                    formControlName="quiet_hours_enabled"
                    class="toggle-input"
                  >
                  <span class="toggle-slider"></span>
                  <span class="schedule-text">Enable Quiet Hours</span>
                </label>
                <p class="schedule-description">Pause notifications during specific hours</p>
              </div>
              
              <div class="schedule-times" *ngIf="notificationsForm.get('quiet_hours_enabled')?.value">
                <div class="time-input">
                  <label>From:</label>
                  <input type="time" formControlName="quiet_hours_start" class="time-field">
                </div>
                <div class="time-input">
                  <label>To:</label>
                  <input type="time" formControlName="quiet_hours_end" class="time-field">
                </div>
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
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .notifications-header {
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

    .notifications-content {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .notifications-form {
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

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      background: #f7fafc;
    }

    .notification-info {
      flex: 1;
    }

    .notification-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .notification-info p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
    }

    .notification-toggles {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: #4a5568;
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

    .toggle-text {
      font-weight: 500;
    }

    .schedule-settings {
      background: #f7fafc;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .schedule-item {
      margin-bottom: 1rem;
    }

    .schedule-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .schedule-description {
      color: #718096;
      font-size: 0.875rem;
      margin: 0.5rem 0 0 0;
    }

    .schedule-times {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .time-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .time-input label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #4a5568;
    }

    .time-field {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
      font-size: 0.875rem;
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
      .notifications-container {
        padding: 1rem;
      }

      .notifications-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .notifications-form {
        padding: 1rem;
      }

      .notification-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .notification-toggles {
        justify-content: center;
      }

      .schedule-times {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  notificationsForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  orderNotifications: NotificationSetting[] = [
    {
      id: 'order_confirmation',
      title: 'Order Confirmation',
      description: 'When your order is confirmed and payment is received',
      category: 'order',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'order_shipped',
      title: 'Order Shipped',
      description: 'When your order is shipped and tracking is available',
      category: 'order',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'order_delivered',
      title: 'Order Delivered',
      description: 'When your order has been delivered',
      category: 'order',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'order_cancelled',
      title: 'Order Cancelled',
      description: 'When your order is cancelled or refunded',
      category: 'order',
      email: true,
      push: true,
      sms: true
    }
  ];

  messageNotifications: NotificationSetting[] = [
    {
      id: 'new_message',
      title: 'New Message',
      description: 'When you receive a new message from a buyer or seller',
      category: 'message',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'message_reply',
      title: 'Message Reply',
      description: 'When someone replies to your message',
      category: 'message',
      email: true,
      push: true,
      sms: false
    }
  ];

  marketplaceNotifications: NotificationSetting[] = [
    {
      id: 'new_offer',
      title: 'New Offer',
      description: 'When you receive a new offer on your request',
      category: 'marketplace',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'offer_accepted',
      title: 'Offer Accepted',
      description: 'When someone accepts your offer',
      category: 'marketplace',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'price_drop',
      title: 'Price Drop Alert',
      description: 'When items on your wishlist drop in price',
      category: 'marketplace',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'new_product',
      title: 'New Product Alert',
      description: 'When new products matching your interests are listed',
      category: 'marketplace',
      email: false,
      push: true,
      sms: false
    }
  ];

  generalNotifications: NotificationSetting[] = [
    {
      id: 'system_update',
      title: 'System Updates',
      description: 'Important updates about the platform and new features',
      category: 'general',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'security_alert',
      title: 'Security Alerts',
      description: 'Important security notifications about your account',
      category: 'general',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'promotional',
      title: 'Promotional Offers',
      description: 'Special deals, discounts, and promotional content',
      category: 'general',
      email: false,
      push: true,
      sms: false
    }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    const formControls: Record<string, any> = {
      quiet_hours_enabled: [false],
      quiet_hours_start: ['22:00'],
      quiet_hours_end: ['08:00']
    };

    // Add controls for all notification settings
    [...this.orderNotifications, ...this.messageNotifications, ...this.marketplaceNotifications, ...this.generalNotifications].forEach(setting => {
      formControls[setting.id + '_email'] = [setting.email];
      formControls[setting.id + '_push'] = [setting.push];
      formControls[setting.id + '_sms'] = [setting.sms];
    });

    this.notificationsForm = this.fb.group(formControls);
  }

  private loadSettings(): void {
    // Mock data - replace with actual API call
    const mockSettings = {
      quiet_hours_enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00'
    };

    this.notificationsForm.patchValue(mockSettings);
  }

  saveSettings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

          // const formData = this.notificationsForm.value;

    // Mock API call - replace with actual service call
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Notification settings saved successfully!';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1000);
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
      this.loadSettings();
      this.successMessage = 'Settings reset to defaults!';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  goBack(): void {
    this.router.navigate(['/app/settings']);
  }
} 