import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { timer, Subscription } from 'rxjs';
import { ToggleSwitchComponent } from '../../../shared/components/toggle-switch/toggle-switch.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NotificationService } from '../../../domains/notifications';
import {
  faMobileScreen,
  faEnvelope,
  faCommentSms,
  faList,
  faMoon,
  faEye,
  faShoppingBag,
  faMessage,
  faHandshake,
  faUsers,
  faShieldHalved,
  faGear,
  faBullhorn,
  faCalendar,
  faUserPlus,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToggleSwitchComponent,
    ButtonComponent,
    FontAwesomeModule,
  ],
  template: `
    <div class="notification-settings-container">
      <!-- Header -->
      <header class="notification-header">
        <div class="header-content">
          <div>
            <h1 class="page-title">Notification Settings</h1>
            <p class="page-description">
              Manage your communication preferences and notification settings
            </p>
          </div>
          <div class="header-actions">
            <app-button
              variant="secondary"
              size="md"
              [outline]="true"
              (clicked)="resetSettings()"
            >
              Reset to Default
            </app-button>
            <app-button
              variant="primary"
              size="md"
              [loading]="loading"
              (clicked)="saveSettings()"
            >
              Save Changes
            </app-button>
          </div>
        </div>
      </header>

      <!-- Success/Error Messages -->
      @if (successMessage) {
      <div class="success-message">
        {{ successMessage }}
      </div>
      } @if (errorMessage) {
      <div class="error-message">
        {{ errorMessage }}
      </div>
      }

      <!-- Content -->
      <div class="notification-content">
        <div class=" mx-auto space-y-8">
          <form [formGroup]="notificationsForm">
            <!-- Push Notifications -->
            <section class="notification-section">
              <div class="section-header">
                <div>
                  <h2 class="section-title">
                    <fa-icon
                      [icon]="faMobileScreen"
                      class="section-icon"
                    ></fa-icon>
                    Push Notifications
                  </h2>
                  <p class="section-description">
                    Control how you receive push notifications on your device
                  </p>
                </div>
                <app-toggle-switch
                  formControlName="push_notifications_enabled"
                  ariaLabel="Enable push notifications"
                ></app-toggle-switch>
              </div>

              <div class="settings-grid">
                <div class="settings-column">
                  <div class="setting-item">
                    <span class="setting-label">Notification Sound</span>
                    <app-toggle-switch
                      formControlName="notification_sound"
                      ariaLabel="Enable notification sound"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">Vibration</span>
                    <app-toggle-switch
                      formControlName="vibration"
                      ariaLabel="Enable vibration"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">Badge Count</span>
                    <app-toggle-switch
                      formControlName="badge_count"
                      ariaLabel="Enable badge count"
                    ></app-toggle-switch>
                  </div>
                </div>
                <div class="settings-column">
                  <div class="setting-item">
                    <span class="setting-label">Lock Screen Preview</span>
                    <app-toggle-switch
                      formControlName="lock_screen_preview"
                      ariaLabel="Enable lock screen preview"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">Group Notifications</span>
                    <app-toggle-switch
                      formControlName="group_notifications"
                      ariaLabel="Enable group notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">Do Not Disturb Override</span>
                    <app-toggle-switch
                      formControlName="dnd_override"
                      ariaLabel="Enable do not disturb override"
                    ></app-toggle-switch>
                  </div>
                </div>
              </div>
            </section>

            <!-- Email Notifications -->
            <section class="notification-section">
              <div class="section-header">
                <div>
                  <h2 class="section-title">
                    <fa-icon [icon]="faEnvelope" class="section-icon"></fa-icon>
                    Email Notifications
                  </h2>
                  <p class="section-description">
                    Configure your email notification preferences
                  </p>
                </div>
                <app-toggle-switch
                  formControlName="email_notifications_enabled"
                  ariaLabel="Enable email notifications"
                ></app-toggle-switch>
              </div>

              <div class="settings-list">
                <div class="setting-item">
                  <div>
                    <span class="setting-label">Email Frequency</span>
                    <p class="setting-hint">
                      How often you receive email notifications
                    </p>
                  </div>
                  <select
                    formControlName="email_frequency"
                    class="frequency-select"
                  >
                    <option value="instant">Instant</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <div class="setting-item">
                  <span class="setting-label">HTML Email Format</span>
                  <app-toggle-switch
                    formControlName="html_email_format"
                    ariaLabel="Enable HTML email format"
                  ></app-toggle-switch>
                </div>
                <div class="setting-item">
                  <span class="setting-label">Security Notifications</span>
                  <app-toggle-switch
                    formControlName="security_notifications"
                    ariaLabel="Enable security notifications"
                  ></app-toggle-switch>
                </div>
              </div>
            </section>

            <!-- SMS Notifications -->
            <section class="notification-section">
              <div class="section-header">
                <div>
                  <h2 class="section-title">
                    <fa-icon
                      [icon]="faCommentSms"
                      class="section-icon"
                    ></fa-icon>
                    SMS Notifications
                  </h2>
                  <p class="section-description">
                    Manage SMS notification settings and preferences
                  </p>
                </div>
                <app-toggle-switch
                  formControlName="sms_notifications_enabled"
                  ariaLabel="Enable SMS notifications"
                ></app-toggle-switch>
              </div>

              <div class="settings-list">
                <div class="setting-item">
                  <span class="setting-label">Emergency Alerts Only</span>
                  <app-toggle-switch
                    formControlName="emergency_alerts_only"
                    ariaLabel="Enable emergency alerts only"
                  ></app-toggle-switch>
                </div>
                <div class="setting-item">
                  <span class="setting-label">Two-Factor Authentication</span>
                  <app-toggle-switch
                    formControlName="two_factor_auth"
                    ariaLabel="Enable two-factor authentication SMS"
                  ></app-toggle-switch>
                </div>
              </div>
            </section>

            <!-- Notification Categories -->
            <section class="notification-section">
              <div class="section-header">
                <div>
                  <h2 class="section-title">
                    <fa-icon [icon]="faList" class="section-icon"></fa-icon>
                    Notification Categories
                  </h2>
                  <p class="section-description">
                    Choose which types of notifications you want to receive
                  </p>
                </div>
              </div>

              <div class="settings-grid">
                <div class="settings-column">
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faShoppingBag"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Order Updates</span>
                    </div>
                    <app-toggle-switch
                      formControlName="order_updates"
                      ariaLabel="Enable order updates"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faMessage"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Messages</span>
                    </div>
                    <app-toggle-switch
                      formControlName="messages"
                      ariaLabel="Enable message notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faHandshake"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Offers & Requests</span>
                    </div>
                    <app-toggle-switch
                      formControlName="offers_requests"
                      ariaLabel="Enable offers and requests notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon [icon]="faUsers" class="category-icon"></fa-icon>
                      <span class="setting-label">Community Activity</span>
                    </div>
                    <app-toggle-switch
                      formControlName="community_activity"
                      ariaLabel="Enable community activity notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faShieldHalved"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Security Alerts</span>
                    </div>
                    <app-toggle-switch
                      formControlName="security_alerts"
                      ariaLabel="Enable security alerts"
                    ></app-toggle-switch>
                  </div>
                </div>
                <div class="settings-column">
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon [icon]="faGear" class="category-icon"></fa-icon>
                      <span class="setting-label">System Updates</span>
                    </div>
                    <app-toggle-switch
                      formControlName="system_updates"
                      ariaLabel="Enable system updates"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faBullhorn"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Marketing</span>
                    </div>
                    <app-toggle-switch
                      formControlName="marketing"
                      ariaLabel="Enable marketing notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faCalendar"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Events</span>
                    </div>
                    <app-toggle-switch
                      formControlName="events"
                      ariaLabel="Enable event notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faUserPlus"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Friend Activity</span>
                    </div>
                    <app-toggle-switch
                      formControlName="friend_activity"
                      ariaLabel="Enable friend activity notifications"
                    ></app-toggle-switch>
                  </div>
                  <div class="setting-item">
                    <div class="setting-with-icon">
                      <fa-icon
                        [icon]="faExclamationTriangle"
                        class="category-icon"
                      ></fa-icon>
                      <span class="setting-label">Emergency Alerts</span>
                    </div>
                    <app-toggle-switch
                      formControlName="emergency_alerts"
                      ariaLabel="Enable emergency alerts"
                    ></app-toggle-switch>
                  </div>
                </div>
              </div>
            </section>

            <!-- Quiet Hours -->
            <section class="notification-section">
              <div class="section-header">
                <div>
                  <h2 class="section-title">
                    <fa-icon [icon]="faMoon" class="section-icon"></fa-icon>
                    Quiet Hours
                  </h2>
                  <p class="section-description">
                    Set times when you don't want to receive notifications
                  </p>
                </div>
              </div>

              <div class="time-inputs">
                <div class="time-input-group">
                  <label class="time-label">Start Time</label>
                  <input
                    type="time"
                    formControlName="quiet_hours_start"
                    value="22:00"
                    class="time-input"
                  />
                </div>
                <div class="time-input-group">
                  <label class="time-label">End Time</label>
                  <input
                    type="time"
                    formControlName="quiet_hours_end"
                    value="08:00"
                    class="time-input"
                  />
                </div>
              </div>

              <div class="settings-list">
                <div class="setting-item">
                  <span class="setting-label">Apply to Weekends</span>
                  <app-toggle-switch
                    formControlName="apply_to_weekends"
                    ariaLabel="Apply quiet hours to weekends"
                  ></app-toggle-switch>
                </div>
                <div class="setting-item">
                  <span class="setting-label">Emergency Override</span>
                  <app-toggle-switch
                    formControlName="emergency_override"
                    ariaLabel="Enable emergency override"
                  ></app-toggle-switch>
                </div>
              </div>
            </section>

            <!-- Test Notifications -->
            <section class="notification-section">
              <div class="section-header">
                <div>
                  <h2 class="section-title">
                    <fa-icon [icon]="faEye" class="section-icon"></fa-icon>
                    Test Notifications
                  </h2>
                  <p class="section-description">
                    Preview how your notifications will appear
                  </p>
                </div>
              </div>

              <div class="test-buttons">
                <button
                  type="button"
                  class="test-button"
                  (click)="testNotification('push')"
                >
                  <fa-icon [icon]="faMobileScreen" class="test-icon"></fa-icon>
                  Test Push
                </button>
                <button
                  type="button"
                  class="test-button"
                  (click)="testNotification('email')"
                >
                  <fa-icon [icon]="faEnvelope" class="test-icon"></fa-icon>
                  Test Email
                </button>
                <button
                  type="button"
                  class="test-button"
                  (click)="testNotification('sms')"
                >
                  <fa-icon [icon]="faCommentSms" class="test-icon"></fa-icon>
                  Test SMS
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-settings-container {
        min-height: 100vh;
        background-color: #f4f1f0;
      }

      .notification-header {
        background: white;
        border-bottom: 1px solid #e5dddc;
        padding: 2rem;
      }

      .header-content {
        max-width: 1000px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: #181211;
        margin: 0 0 0.5rem 0;
      }

      .page-description {
        color: #886a63;
        margin: 0;
        font-size: 0.875rem;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .success-message {
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        color: #0c4a6e;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 2rem;
        max-width: 1000px;
        margin-left: auto;
        margin-right: auto;
      }

      .error-message {
        background: #fef2f2;
        border: 1px solid #ef4444;
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 2rem;
        max-width: 1000px;
        margin-left: auto;
        margin-right: auto;
      }

      .notification-content {
        padding: 2rem;
      }

      .notification-section {
        background: white;
        border-radius: 0.75rem;
        border: 1px solid #e5dddc;
        padding: 1.5rem;
        margin-bottom: 2rem;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }

      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #181211;
        display: flex;
        align-items: center;
        margin: 0 0 0.25rem 0;
      }

      .section-icon {
        color: #e94c2a;
        margin-right: 0.75rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .section-description {
        color: #886a63;
        font-size: 0.875rem;
        margin: 0;
      }

      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .settings-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .settings-column {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .setting-label {
        color: #181211;
        font-weight: 500;
        font-size: 0.875rem;
      }

      .setting-hint {
        color: #886a63;
        font-size: 0.75rem;
        margin: 0.25rem 0 0 0;
      }

      .setting-with-icon {
        display: flex;
        align-items: center;
      }

      .category-icon {
        color: #e94c2a;
        margin-right: 0.75rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .frequency-select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #e5dddc;
        border-radius: 0.5rem;
        background: white;
        color: #181211;
        font-size: 0.875rem;
        min-width: 120px;
      }

      .frequency-select:focus {
        outline: none;
        border-color: #e94c2a;
        box-shadow: 0 0 0 3px rgba(233, 76, 42, 0.1);
      }

      .time-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1rem;
      }

      .time-input-group {
        display: flex;
        flex-direction: column;
      }

      .time-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #181211;
        margin-bottom: 0.5rem;
      }

      .time-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #e5dddc;
        border-radius: 0.5rem;
        background: white;
        color: #181211;
        font-size: 0.875rem;
      }

      .time-input:focus {
        outline: none;
        border-color: #e94c2a;
        box-shadow: 0 0 0 3px rgba(233, 76, 42, 0.1);
      }

      .test-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .test-button {
        padding: 0.75rem 1rem;
        border: 1px solid #e5dddc;
        border-radius: 0.5rem;
        background: white;
        color: #181211;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .test-button:hover {
        background: #f4f1f0;
        border-color: #e94c2a;
      }

      .test-icon {
        width: 1rem;
        height: 1rem;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .notification-header {
          padding: 1rem;
        }

        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }

        .notification-content {
          padding: 1rem;
        }

        .settings-grid {
          grid-template-columns: 1fr;
        }

        .time-inputs {
          grid-template-columns: 1fr;
        }

        .test-buttons {
          grid-template-columns: 1fr;
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }

      @media (max-width: 480px) {
        .page-title {
          font-size: 1.5rem;
        }

        .header-actions {
          flex-direction: column;
          width: 100%;
        }

        .header-actions app-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private messageTimer?: Subscription;

  // FontAwesome icons
  faMobileScreen = faMobileScreen;
  faEnvelope = faEnvelope;
  faCommentSms = faCommentSms;
  faList = faList;
  faMoon = faMoon;
  faEye = faEye;
  faShoppingBag = faShoppingBag;
  faMessage = faMessage;
  faHandshake = faHandshake;
  faUsers = faUsers;
  faShieldHalved = faShieldHalved;
  faGear = faGear;
  faBullhorn = faBullhorn;
  faCalendar = faCalendar;
  faUserPlus = faUserPlus;
  faExclamationTriangle = faExclamationTriangle;

  notificationsForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    if (this.messageTimer) {
      this.messageTimer.unsubscribe();
    }
  }

  private initForm(): void {
    const formControls: Record<string, any> = {
      // Push Notifications
      push_notifications_enabled: [true],
      notification_sound: [true],
      vibration: [true],
      badge_count: [true],
      lock_screen_preview: [false],
      group_notifications: [true],
      dnd_override: [false],

      // Email Notifications
      email_notifications_enabled: [true],
      email_frequency: ['instant'],
      html_email_format: [true],
      security_notifications: [true],

      // SMS Notifications
      sms_notifications_enabled: [false],
      emergency_alerts_only: [true],
      two_factor_auth: [true],

      // Notification Categories
      order_updates: [true],
      messages: [true],
      offers_requests: [true],
      community_activity: [false],
      security_alerts: [true],
      system_updates: [true],
      marketing: [false],
      events: [false],
      friend_activity: [false],
      emergency_alerts: [true],

      // Quiet Hours
      quiet_hours_start: ['22:00'],
      quiet_hours_end: ['08:00'],
      apply_to_weekends: [true],
      emergency_override: [true],
    };

    this.notificationsForm = this.fb.group(formControls);
  }

  private loadSettings(): void {
    this.loading = true;

    this.notificationService.getSettings().subscribe({
      next: (response: any) => {
        this.notificationsForm.patchValue(response?.data || {});
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notification settings:', error);
        this.loading = false;
      },
    });
  }

  saveSettings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.notificationsForm.value;

    this.notificationService.updateSettings(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Notification settings updated successfully!';
        this.clearMessageAfterDelay();
      },
      error: (error) => {
        console.error('Error updating notification settings:', error);
        this.loading = false;
        this.errorMessage = 'Failed to update notification settings.';
        this.clearMessageAfterDelay();
      },
    });
  }

  private clearMessageAfterDelay(): void {
    if (this.messageTimer) {
      this.messageTimer.unsubscribe();
    }
    this.messageTimer = timer(3000).subscribe(() => {
      this.successMessage = '';
      this.errorMessage = '';
    });
  }

  resetSettings(): void {
    if (
      confirm(
        'Are you sure you want to reset all notification settings to defaults?'
      )
    ) {
      this.loadSettings();
      // TODO: Replace with actual backend call
    }
  }

  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SETTINGS]);
  }

  testNotification(type: 'push' | 'email' | 'sms'): void {
    // This would typically call an API endpoint to send a test notification
    // For now, we'll just show a success message
    this.successMessage = `Test ${type} notification sent successfully!`;
    this.clearMessageAfterDelay();
  }
}
