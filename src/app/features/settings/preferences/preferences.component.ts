import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Preferences</h1>
          <p class="text-sm text-gray-500">Manage general preferences for your account</p>
        </div>
        <button (click)="goBack()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
        <div class="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 class="text-lg font-medium text-gray-900">Display</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select formControlName="theme" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-markt-primary focus:border-markt-primary sm:text-sm">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <input type="text" formControlName="timezone" placeholder="e.g. Africa/Lagos" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-markt-primary focus:border-markt-primary sm:text-sm" />
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 class="text-lg font-medium text-gray-900">Privacy</h2>
          <div class="space-y-3">
            <label class="flex items-center gap-2">
              <input type="checkbox" formControlName="show_email" class="h-4 w-4 text-markt-primary border-gray-300 rounded" />
              <span class="text-sm text-gray-700">Show my email on profile</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" formControlName="show_phone" class="h-4 w-4 text-markt-primary border-gray-300 rounded" />
              <span class="text-sm text-gray-700">Show my phone number on profile</span>
            </label>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 class="text-lg font-medium text-gray-900">Communication</h2>
          <div class="space-y-3">
            <label class="flex items-center gap-2">
              <input type="checkbox" formControlName="newsletter" class="h-4 w-4 text-markt-primary border-gray-300 rounded" />
              <span class="text-sm text-gray-700">Subscribe to newsletter</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <button type="button" (click)="reload()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Reset</button>
          <button type="submit" [disabled]="loading" class="px-4 py-2 text-sm font-medium text-white bg-markt-primary rounded-md hover:bg-markt-secondary disabled:opacity-50">{{ loading ? 'Saving...' : 'Save Changes' }}</button>
        </div>

        <div *ngIf="error" class="p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>
        <div *ngIf="success" class="p-3 bg-green-50 text-green-700 rounded">{{ success }}</div>
      </form>
    </div>
  `,
  styles: []
})
export class PreferencesComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  loading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.form = this.fb.group({
      theme: ['system'],
      timezone: ['Africa/Lagos'],
      show_email: [false],
      show_phone: [false],
      newsletter: [true]
    });
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.api.getUserSettings().subscribe({
      next: (res) => {
        const data: any = res.data || {};
        this.form.patchValue({
          theme: data.theme ?? 'system',
          timezone: data.timezone ?? 'Africa/Lagos',
          show_email: !!data.show_email,
          show_phone: !!data.show_phone,
          newsletter: !!data.newsletter
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to load settings';
        setTimeout(() => (this.error = ''), 3000);
      }
    });
  }

  save(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    const payload = this.form.value;
    this.api.updateUserSettings(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Preferences saved';
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to save settings';
        setTimeout(() => (this.error = ''), 3000);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/settings']);
  }
} 