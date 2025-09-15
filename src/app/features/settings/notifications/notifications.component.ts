import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { timer, Subscription } from 'rxjs';

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
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-4">
              <button
                (click)="goBack()"
                class="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">Notification Settings</h1>
            </div>
            <div class="flex space-x-3">
              <button
                (click)="resetSettings()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
              <button
                (click)="saveSettings()"
                [disabled]="loading || notificationsForm.invalid"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div *ngIf="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form [formGroup]="notificationsForm" class="space-y-8">
          <!-- Quiet Hours -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-center">
                <input
                  id="quiet_hours_enabled"
                  type="checkbox"
                  formControlName="quiet_hours_enabled"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="quiet_hours_enabled" class="ml-2 text-sm text-gray-700">
                  Enable quiet hours
                </label>
              </div>
              <div>
                <label for="quiet_hours_start" class="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  id="quiet_hours_start"
                  type="time"
                  formControlName="quiet_hours_start"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label for="quiet_hours_end" class="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  id="quiet_hours_end"
                  type="time"
                  formControlName="quiet_hours_end"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Order Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Order Notifications</h2>
            <div class="space-y-4">
              <div *ngFor="let setting of orderNotifications" class="border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">{{ setting.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ setting.description }}</p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_email'"
                        type="checkbox"
                        [formControlName]="setting.id + '_email'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_email'" class="ml-2 text-xs text-gray-500">Email</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_push'"
                        type="checkbox"
                        [formControlName]="setting.id + '_push'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_push'" class="ml-2 text-xs text-gray-500">Push</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_sms'"
                        type="checkbox"
                        [formControlName]="setting.id + '_sms'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_sms'" class="ml-2 text-xs text-gray-500">SMS</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Message Notifications</h2>
            <div class="space-y-4">
              <div *ngFor="let setting of messageNotifications" class="border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">{{ setting.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ setting.description }}</p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_email'"
                        type="checkbox"
                        [formControlName]="setting.id + '_email'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_email'" class="ml-2 text-xs text-gray-500">Email</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_push'"
                        type="checkbox"
                        [formControlName]="setting.id + '_push'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_push'" class="ml-2 text-xs text-gray-500">Push</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_sms'"
                        type="checkbox"
                        [formControlName]="setting.id + '_sms'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_sms'" class="ml-2 text-xs text-gray-500">SMS</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Marketplace Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Marketplace Notifications</h2>
            <div class="space-y-4">
              <div *ngFor="let setting of marketplaceNotifications" class="border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">{{ setting.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ setting.description }}</p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_email'"
                        type="checkbox"
                        [formControlName]="setting.id + '_email'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_email'" class="ml-2 text-xs text-gray-500">Email</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_push'"
                        type="checkbox"
                        [formControlName]="setting.id + '_push'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_push'" class="ml-2 text-xs text-gray-500">Push</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_sms'"
                        type="checkbox"
                        [formControlName]="setting.id + '_sms'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_sms'" class="ml-2 text-xs text-gray-500">SMS</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- General Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">General Notifications</h2>
            <div class="space-y-4">
              <div *ngFor="let setting of generalNotifications" class="border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">{{ setting.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ setting.description }}</p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_email'"
                        type="checkbox"
                        [formControlName]="setting.id + '_email'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_email'" class="ml-2 text-xs text-gray-500">Email</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_push'"
                        type="checkbox"
                        [formControlName]="setting.id + '_push'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_push'" class="ml-2 text-xs text-gray-500">Push</label>
                    </div>
                    <div class="flex items-center">
                      <input
                        [id]="setting.id + '_sms'"
                        type="checkbox"
                        [formControlName]="setting.id + '_sms'"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label [for]="setting.id + '_sms'" class="ml-2 text-xs text-gray-500">SMS</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private messageTimer?: Subscription;

  notificationsForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  orderNotifications: NotificationSetting[] = [
    {
      id: 'order_confirmation',
      title: 'Order Confirmation',
      description: 'When your order is confirmed by the seller',
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
      description: 'When your order is delivered',
      category: 'order',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'order_cancelled',
      title: 'Order Cancelled',
      description: 'When your order is cancelled',
      category: 'order',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'order_refund',
      title: 'Order Refund',
      description: 'When a refund is processed for your order',
      category: 'order',
      email: true,
      push: true,
      sms: false
    }
  ];

  messageNotifications: NotificationSetting[] = [
    {
      id: 'new_message',
      title: 'New Message',
      description: 'When you receive a new message from a buyer or seller',
      category: 'message',
      email: false,
      push: true,
      sms: false
    },
    {
      id: 'message_reply',
      title: 'Message Reply',
      description: 'When someone replies to your message',
      category: 'message',
      email: false,
      push: true,
      sms: false
    }
  ];

  marketplaceNotifications: NotificationSetting[] = [
    {
      id: 'price_drop',
      title: 'Price Drop Alert',
      description: 'When items in your wishlist drop in price',
      category: 'marketplace',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'new_product',
      title: 'New Product Alert',
      description: 'When new products are added to categories you follow',
      category: 'marketplace',
      email: false,
      push: true,
      sms: false
    },
    {
      id: 'stock_alert',
      title: 'Stock Alert',
      description: 'When items in your wishlist come back in stock',
      category: 'marketplace',
      email: true,
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

  ngOnDestroy(): void {
    if (this.messageTimer) {
      this.messageTimer.unsubscribe();
    }
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
    this.loading = true;
    
    this.apiService.getNotificationSettings().subscribe({
      next: (response) => {
        this.notificationsForm.patchValue(response.data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notification settings:', error);
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const formData = this.notificationsForm.value;
    
    this.apiService.updateNotificationSettings(formData).subscribe({
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
      }
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
    if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
      this.loadSettings();
      // TODO: Replace with actual backend call
    }
  }

  goBack(): void {
    this.router.navigate(['/app/settings']);
  }
} 