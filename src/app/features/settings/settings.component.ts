import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ROUTES_ABSOLUTE, buildPath } from '../../core/config/routes.config';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ApiService } from '../../core/services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faBell, faLock, faCreditCard, faBox, faGear, faArrowRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: IconDefinition;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, FontAwesomeModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <div class="header-content">
          <h1>Settings</h1>
          <p>Manage your account preferences and privacy</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="settings-grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="settings-card">
              <div class="card-icon">
                <div class="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <div class="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div class="h-4 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
                <div class="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
              <div class="card-arrow">
                <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Error State -->
      @if (errorMessage) {
        <div class="text-center py-12">
          <div class="text-4xl mb-4">⚠️</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading settings</h3>
          <p class="text-gray-500 mb-6">{{ errorMessage }}</p>
          <app-button
            variant="primary"
            size="md"
            (click)="loadSettingsData()"
          >
            Try Again
          </app-button>
        </div>
      }

      <!-- Settings Content -->
      @if (!loading && !errorMessage) {
        <div class="settings-grid">
          @for (section of settingsSections; track section.id) {
            <div class="settings-card" [routerLink]="section.route">
          <div class="card-icon">
            <fa-icon [icon]="section.icon"></fa-icon>
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3>{{ section.title }}</h3>
              @if (section.badge) {
                <span class="badge">{{ section.badge }}</span>
              }
            </div>
            <p>{{ section.description }}</p>
          </div>
          <div class="card-arrow">
            <fa-icon [icon]="faArrowRight"></fa-icon>
          </div>
        </div>
          }
        </div>
      }

      <div class="settings-footer">
        <div class="footer-info">
          <h3>Need Help?</h3>
          <p>If you need assistance with your settings or have questions about your account, our support team is here to help.</p>
          <app-button
            variant="secondary"
            size="md"
            [outline]="true"
            (click)="contactSupport()"
          >
            Contact Support
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .settings-header {
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .settings-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: inherit;
    }

    .settings-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      border-color: #4299e1;
    }

    .card-icon {
      font-size: 1.25rem;
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f7fafc;
      border-radius: 0.5rem;
      flex-shrink: 0;
    }

    .card-content {
      flex: 1;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .card-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .badge {
      background: #4299e1;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .card-content p {
      color: #718096;
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.5;
    }

    .card-arrow {
      color: #a0aec0;
      font-size: 1.25rem;
      font-weight: 300;
      flex-shrink: 0;
    }

    .settings-footer {
      background: #f7fafc;
      border-radius: 0.75rem;
      padding: 2rem;
      text-align: center;
    }

    .footer-info h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .footer-info p {
      color: #718096;
      margin: 0 0 1rem 0;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem;
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .settings-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .card-arrow {
        display: none;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);
  faArrowRight = faArrowRight;

  loading = false;
  errorMessage = '';
  userProfile: any = null;

  settingsSections: SettingsSection[] = [
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Manage your personal information, password, and account preferences.',
      icon: faUser,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'account')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control how and when you receive notifications about orders, messages, and updates.',
      icon: faBell,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'notifications'),
      badge: 'New'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Manage your privacy settings, data sharing preferences, and security options.',
      icon: faLock,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'privacy')
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Add, edit, or remove your payment methods and billing information.',
      icon: faCreditCard,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'payment')
    },
    {
      id: 'shipping',
      title: 'Shipping Addresses',
      description: 'Manage your shipping addresses for faster checkout and delivery.',
      icon: faBox,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'shipping')
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your marketplace experience, language, and display options.',
      icon: faGear,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'preferences')
    }
  ];

  contactSupport(): void {
    window.open('mailto:support@marktcommerce.com', '_blank');
  }

  ngOnInit(): void {
    this.loadSettingsData();
  }

  loadSettingsData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Try to load user profile data, but don't block settings display if it fails
    this.apiService.getProfile().subscribe({
      next: (response) => {
        this.userProfile = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        // Don't show error for settings page - just load without profile data
        this.loading = false;
        // Set fallback user profile data for development
        this.userProfile = {
          id: '1',
          username: 'test_user',
          email: 'test@example.com',
          full_name: 'Test User'
        };
      }
    });
  }
} 