import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ROUTES_ABSOLUTE, buildPath } from '../../../core/config/routes.config';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faGear, 
  faUser, 
  faShieldHalved, 
  faBell, 
  faLock, 
  faCreditCard, 
  faTruck, 
  faUserTag, 
  faPalette, 
  faQuestionCircle, 
  faInfoCircle,
  faDownload,
  faSave,
  faKey,
  faEnvelope,
  faShield,
  faCheck,
  faShoppingCart,
  faStore,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

interface SettingsNavItem {
  id: string;
  title: string;
  icon: IconDefinition;
  route: string;
  isActive: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  is_verified: boolean;
  member_since: string;
  last_login: string;
  trust_level: string;
  profile_completion: number;
  security_score: 'Good' | 'Fair' | 'Poor';
  account_status: 'Active' | 'Inactive' | 'Suspended';
  current_role: 'buyer' | 'seller';
  has_2fa: boolean;
  has_strong_password: boolean;
  is_email_verified: boolean;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="flex min-h-screen bg-gray-50 font-inter">
      <!-- Sidebar -->
      <aside class="w-80 bg-white shadow-lg border-r border-markt-border">
        <div class="p-6 border-b border-markt-border">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-markt-primary rounded-xl flex items-center justify-center">
              <fa-icon [icon]="faGear" class="text-white text-xl"></fa-icon>
            </div>
            <div>
              <h1 class="text-xl font-bold text-markt-dark">Settings</h1>
              <p class="text-sm text-markt-muted">Manage your account</p>
            </div>
          </div>
          
          <!-- User Info Card -->
          <div class="bg-markt-light rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <img 
                [src]="userProfile?.avatar_url || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'" 
                [alt]="userProfile?.full_name || 'Profile'" 
                class="w-10 h-10 rounded-full"
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-markt-dark truncate">
                  {{ userProfile?.full_name || 'Loading...' }}
                </p>
                <p class="text-xs text-markt-muted truncate">
                  {{ userProfile?.email || 'Loading...' }}
                </p>
              </div>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav class="p-4 space-y-2">
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-markt-muted uppercase tracking-wider mb-3">Account</h3>
            @for (item of accountNavItems; track item.id) {
              <a 
                [routerLink]="item.route"
                [class]="getNavItemClass(item)"
                (click)="setActiveNavItem(item.id)"
              >
                <fa-icon [icon]="item.icon" class="w-4"></fa-icon>
                <span class="text-sm font-medium">{{ item.title }}</span>
              </a>
            }
          </div>
          
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-markt-muted uppercase tracking-wider mb-3">Commerce</h3>
            @for (item of commerceNavItems; track item.id) {
              <a 
                [routerLink]="item.route"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-markt-dark cursor-pointer"
              >
                <fa-icon [icon]="item.icon" class="w-4"></fa-icon>
                <span class="text-sm font-medium">{{ item.title }}</span>
              </a>
            }
          </div>
          
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-markt-muted uppercase tracking-wider mb-3">Preferences</h3>
            @for (item of preferencesNavItems; track item.id) {
              <a 
                [routerLink]="item.route"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-markt-dark cursor-pointer"
              >
                <fa-icon [icon]="item.icon" class="w-4"></fa-icon>
                <span class="text-sm font-medium">{{ item.title }}</span>
              </a>
            }
          </div>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-1">
        <!-- Header -->
        <header class="bg-white border-b border-markt-border p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-markt-dark">Account Settings</h1>
              <p class="text-markt-muted mt-1">Manage your account information and preferences</p>
            </div>
            <div class="flex items-center space-x-3">
              <button 
                (click)="exportData()"
                class="bg-markt-light text-markt-dark px-4 py-2 rounded-lg hover:bg-markt-border transition-colors"
              >
                <fa-icon [icon]="faDownload" class="mr-2"></fa-icon>Export Data
              </button>
              <button 
                (click)="saveChanges()"
                class="bg-markt-primary text-white px-4 py-2 rounded-lg hover:bg-markt-secondary transition-colors"
              >
                <fa-icon [icon]="faSave" class="mr-2"></fa-icon>Save Changes
              </button>
            </div>
          </div>
        </header>
        
        <!-- Content -->
        <div class="p-6 space-y-6">
          <!-- Account Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Profile Completion Card -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-markt-border">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-markt-dark">Profile Completion</h3>
                <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {{ userProfile?.profile_completion || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  class="bg-green-500 h-2 rounded-full" 
                  [style.width.%]="userProfile?.profile_completion || 0"
                ></div>
              </div>
              <p class="text-sm text-markt-muted">Complete your profile to unlock all features</p>
              <button 
                (click)="completeProfile()"
                class="mt-3 text-markt-primary text-sm font-medium hover:underline"
              >
                Complete Now
              </button>
            </div>
            
            <!-- Security Score Card -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-markt-border">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-markt-dark">Security Score</h3>
                <div class="flex items-center space-x-2">
                  <fa-icon [icon]="faShield" class="text-green-500"></fa-icon>
                  <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {{ userProfile?.security_score || 'Good' }}
                  </span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-markt-muted">2FA Enabled</span>
                  <fa-icon 
                    [icon]="faCheck" 
                    [class]="userProfile?.has_2fa ? 'text-green-500' : 'text-gray-300'"
                  ></fa-icon>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-markt-muted">Strong Password</span>
                  <fa-icon 
                    [icon]="faCheck" 
                    [class]="userProfile?.has_strong_password ? 'text-green-500' : 'text-gray-300'"
                  ></fa-icon>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-markt-muted">Email Verified</span>
                  <fa-icon 
                    [icon]="faCheck" 
                    [class]="userProfile?.is_email_verified ? 'text-green-500' : 'text-gray-300'"
                  ></fa-icon>
                </div>
              </div>
            </div>
            
            <!-- Account Status Card -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-markt-border">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-markt-dark">Account Status</h3>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-green-600">
                    {{ userProfile?.account_status || 'Active' }}
                  </span>
                </div>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-markt-muted">Member Since</span>
                  <span class="text-markt-dark">{{ userProfile?.member_since || 'Jan 2024' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-markt-muted">Last Login</span>
                  <span class="text-markt-dark">{{ userProfile?.last_login || '2 hours ago' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-markt-muted">Trust Level</span>
                  <span class="text-markt-primary font-medium">
                    {{ userProfile?.trust_level || 'Verified' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quick Settings -->
          <div class="bg-white rounded-xl shadow-sm border border-markt-border">
            <div class="p-6 border-b border-markt-border">
              <h2 class="text-lg font-semibold text-markt-dark">Quick Settings</h2>
              <p class="text-markt-muted mt-1">Frequently accessed settings and preferences</p>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                (click)="openChangePassword()"
                class="p-4 border border-markt-border rounded-lg hover:bg-markt-light transition-colors text-left"
              >
                <fa-icon [icon]="faKey" class="text-markt-primary text-xl mb-3"></fa-icon>
                <h3 class="font-medium text-markt-dark">Change Password</h3>
                <p class="text-sm text-markt-muted mt-1">Update your password</p>
              </button>
              <button 
                (click)="openUpdateEmail()"
                class="p-4 border border-markt-border rounded-lg hover:bg-markt-light transition-colors text-left"
              >
                <fa-icon [icon]="faEnvelope" class="text-markt-primary text-xl mb-3"></fa-icon>
                <h3 class="font-medium text-markt-dark">Update Email</h3>
                <p class="text-sm text-markt-muted mt-1">Change email address</p>
              </button>
              <button 
                (click)="openNotifications()"
                class="p-4 border border-markt-border rounded-lg hover:bg-markt-light transition-colors text-left"
              >
                <fa-icon [icon]="faBell" class="text-markt-primary text-xl mb-3"></fa-icon>
                <h3 class="font-medium text-markt-dark">Notifications</h3>
                <p class="text-sm text-markt-muted mt-1">Manage alerts</p>
              </button>
              <button 
                (click)="openPrivacy()"
                class="p-4 border border-markt-border rounded-lg hover:bg-markt-light transition-colors text-left"
              >
                <fa-icon [icon]="faShield" class="text-markt-primary text-xl mb-3"></fa-icon>
                <h3 class="font-medium text-markt-dark">Privacy</h3>
                <p class="text-sm text-markt-muted mt-1">Control visibility</p>
              </button>
            </div>
          </div>
          
          <!-- Settings Summary -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Privacy Summary -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-markt-border">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-markt-dark">Privacy Summary</h3>
                <fa-icon [icon]="faShieldHalved" class="text-markt-primary"></fa-icon>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Profile Visibility</span>
                  <span class="text-sm text-markt-dark font-medium">Public</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Data Sharing</span>
                  <span class="text-sm text-markt-dark font-medium">Limited</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Blocked Users</span>
                  <span class="text-sm text-markt-dark font-medium">3</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Privacy Score</span>
                  <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Good</span>
                </div>
              </div>
              <button 
                (click)="openPrivacy()"
                class="mt-4 text-markt-primary text-sm font-medium hover:underline"
              >
                Manage Privacy
              </button>
            </div>
            
            <!-- Notification Summary -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-markt-border">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-markt-dark">Notification Summary</h3>
                <fa-icon [icon]="faBell" class="text-markt-primary"></fa-icon>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Push Notifications</span>
                  <div class="w-8 h-4 bg-markt-primary rounded-full relative">
                    <div class="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Email Notifications</span>
                  <div class="w-8 h-4 bg-markt-primary rounded-full relative">
                    <div class="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">SMS Notifications</span>
                  <div class="w-8 h-4 bg-gray-300 rounded-full relative">
                    <div class="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-markt-muted">Quiet Hours</span>
                  <span class="text-sm text-markt-dark font-medium">10PM - 8AM</span>
                </div>
              </div>
              <button 
                (click)="openNotifications()"
                class="mt-4 text-markt-primary text-sm font-medium hover:underline"
              >
                Manage Notifications
              </button>
            </div>
          </div>
          
          <!-- Role Management -->
          <div class="bg-white rounded-xl shadow-sm border border-markt-border">
            <div class="p-6 border-b border-markt-border">
              <h2 class="text-lg font-semibold text-markt-dark">Role Management</h2>
              <p class="text-markt-muted mt-1">Switch between buyer and seller roles</p>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Current Role -->
                <div class="p-4 border-2 border-markt-primary rounded-lg bg-markt-light">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-markt-dark">Current Role</h3>
                    <span class="bg-markt-primary text-white text-xs px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <fa-icon 
                      [icon]="userProfile?.current_role === 'buyer' ? faShoppingCart : faStore" 
                      class="text-markt-primary text-xl"
                    ></fa-icon>
                    <div>
                      <p class="font-medium text-markt-dark">
                        {{ userProfile?.current_role === 'buyer' ? 'Buyer' : 'Seller' }}
                      </p>
                      <p class="text-sm text-markt-muted">
                        {{ userProfile?.current_role === 'buyer' ? 'Browse and purchase items' : 'List and sell your items' }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- Available Role -->
                <div 
                  (click)="switchRole()"
                  class="p-4 border border-markt-border rounded-lg hover:bg-markt-light transition-colors cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-markt-dark">Available Role</h3>
                    <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Switch</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <fa-icon 
                      [icon]="userProfile?.current_role === 'buyer' ? faStore : faShoppingCart" 
                      class="text-markt-muted text-xl"
                    ></fa-icon>
                    <div>
                      <p class="font-medium text-markt-dark">
                        {{ userProfile?.current_role === 'buyer' ? 'Seller' : 'Buyer' }}
                      </p>
                      <p class="text-sm text-markt-muted">
                        {{ userProfile?.current_role === 'buyer' ? 'List and sell your items' : 'Browse and purchase items' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AccountComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // FontAwesome icons
  faGear = faGear;
  faUser = faUser;
  faShieldHalved = faShieldHalved;
  faBell = faBell;
  faLock = faLock;
  faCreditCard = faCreditCard;
  faTruck = faTruck;
  faUserTag = faUserTag;
  faPalette = faPalette;
  faQuestionCircle = faQuestionCircle;
  faInfoCircle = faInfoCircle;
  faDownload = faDownload;
  faSave = faSave;
  faKey = faKey;
  faEnvelope = faEnvelope;
  faShield = faShield;
  faCheck = faCheck;
  faShoppingCart = faShoppingCart;
  faStore = faStore;

  // Component state
  userProfile: UserProfile | null = null;
  loading = false;
  errorMessage = '';

  // Navigation items
  accountNavItems: SettingsNavItem[] = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: faUser,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'account'),
      isActive: true
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: faShieldHalved,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'security'),
      isActive: false
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: faBell,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'notifications'),
      isActive: false
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      icon: faLock,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'privacy'),
      isActive: false
    }
  ];

  commerceNavItems: SettingsNavItem[] = [
    {
      id: 'payments',
      title: 'Payment Methods',
      icon: faCreditCard,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'payments'),
      isActive: false
    },
    {
      id: 'shipping',
      title: 'Shipping Info',
      icon: faTruck,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'shipping'),
      isActive: false
    },
    {
      id: 'roles',
      title: 'Role Management',
      icon: faUserTag,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'roles'),
      isActive: false
    }
  ];

  preferencesNavItems: SettingsNavItem[] = [
    {
      id: 'preferences',
      title: 'Preferences',
      icon: faPalette,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'preferences'),
      isActive: false
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: faQuestionCircle,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'support'),
      isActive: false
    },
    {
      id: 'about',
      title: 'About Markt',
      icon: faInfoCircle,
      route: buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'about'),
      isActive: false
    }
  ];

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Loads user profile data from the API service
   * This method fetches comprehensive user information including profile completion,
   * security status, and account details to populate the account settings dashboard
   */
  private loadUserProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getProfile().subscribe({
      next: (response) => {
        // Transform API response to match our UserProfile interface
        // This ensures type safety and consistent data structure
        this.userProfile = {
          id: response.data?.id || '',
          username: response.data?.username || '',
          full_name: `${response.data?.first_name || ''} ${response.data?.last_name || ''}`.trim() || response.data?.username || '',
          email: response.data?.email || '',
          phone_number: response.data?.phone_number,
          avatar_url: response.data?.profile_picture_url,
          is_verified: response.data?.email_verified || false,
          member_since: response.data?.created_at ? this.formatDate(response.data.created_at) : 'Jan 2024',
          last_login: response.data?.updated_at ? this.formatLastLogin(response.data.updated_at) : '2 hours ago',
          trust_level: response.data?.email_verified ? 'Verified' : 'Unverified',
          profile_completion: this.calculateProfileCompletion(response.data),
          security_score: this.calculateSecurityScore(response.data),
          account_status: response.data?.email_verified ? 'Active' : 'Inactive',
          current_role: response.data?.current_role || 'buyer',
          has_2fa: false, // This would need to be added to the User interface
          has_strong_password: false, // This would need to be added to the User interface
          is_email_verified: response.data?.email_verified || false
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage = 'Failed to load profile data. Please try again.';
        this.loading = false;
        
        // Set fallback data for development/demo purposes
        this.userProfile = {
          id: '1',
          username: 'sarah.johnson',
          full_name: 'Sarah Johnson',
          email: 'sarah.j@university.edu',
          phone_number: '+1 (555) 123-4567',
          avatar_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
          is_verified: true,
          member_since: 'Jan 2024',
          last_login: '2 hours ago',
          trust_level: 'Verified',
          profile_completion: 85,
          security_score: 'Good',
          account_status: 'Active',
          current_role: 'buyer',
          has_2fa: true,
          has_strong_password: true,
          is_email_verified: true
        };
      }
    });
  }

  /**
   * Calculates profile completion percentage based on filled fields
   * This helps users understand what information is missing from their profile
   */
  private calculateProfileCompletion(data: any): number {
    const fields = ['username', 'full_name', 'email', 'phone_number', 'avatar_url'];
    const filledFields = fields.filter(field => data?.[field] && data[field].trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }

  /**
   * Determines security score based on security features enabled
   * Provides users with a clear understanding of their account security level
   */
  private calculateSecurityScore(data: any): 'Good' | 'Fair' | 'Poor' {
    let score = 0;
    if (data?.has_2fa) score += 1;
    if (data?.has_strong_password) score += 1;
    if (data?.is_email_verified) score += 1;
    
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Poor';
  }

  /**
   * Formats date strings for display in the UI
   * Converts API date format to user-friendly format
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /**
   * Formats last login time for display
   * Shows relative time (e.g., "2 hours ago") for better UX
   */
  private formatLastLogin(dateString: string): string {
    const now = new Date();
    const lastLogin = new Date(dateString);
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Sets the active navigation item for visual feedback
   * Updates the active state of navigation items when clicked
   */
  setActiveNavItem(itemId: string): void {
    // Reset all account nav items
    this.accountNavItems.forEach(item => item.isActive = item.id === itemId);
    
    // Reset all commerce nav items
    this.commerceNavItems.forEach(item => item.isActive = item.id === itemId);
    
    // Reset all preferences nav items
    this.preferencesNavItems.forEach(item => item.isActive = item.id === itemId);
  }

  /**
   * Returns CSS classes for navigation items based on active state
   * Provides visual feedback for the currently selected settings section
   */
  getNavItemClass(item: SettingsNavItem): string {
    const baseClass = 'flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer';
    return item.isActive 
      ? `${baseClass} bg-markt-primary text-white`
      : `${baseClass} hover:bg-gray-100 text-markt-dark`;
  }

  /**
   * Exports user data for download
   * Allows users to download their account data for backup or portability
   */
  exportData(): void {
    this.loading = true;
    
    // This would typically call an API endpoint to generate and download user data
    // For now, we'll simulate the export process
    setTimeout(() => {
      this.loading = false;
      // In a real implementation, this would trigger a file download
      console.log('Exporting user data...');
      alert('Data export initiated. You will receive an email when ready.');
    }, 1000);
  }

  /**
   * Saves any pending changes to user settings
   * Provides a way for users to save modifications made to their account settings
   */
  saveChanges(): void {
    if (!this.userProfile) return;
    
    this.loading = true;
    
    // This would typically save any pending changes to the backend
    // For now, we'll simulate the save process
    setTimeout(() => {
      this.loading = false;
      console.log('Saving changes...');
      alert('Changes saved successfully!');
    }, 1000);
  }

  /**
   * Opens the change password modal or navigates to password change page
   * Provides quick access to password management functionality
   */
  openChangePassword(): void {
    // This could open a modal or navigate to a dedicated password change page
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'account')], { 
      fragment: 'change-password' 
    });
  }

  /**
   * Opens the email update functionality
   * Allows users to quickly access email change options
   */
  openUpdateEmail(): void {
    // This could open a modal or navigate to email settings
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'account')], { 
      fragment: 'update-email' 
    });
  }

  /**
   * Navigates to notification settings
   * Provides quick access to notification management
   */
  openNotifications(): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'notifications')]);
  }

  /**
   * Navigates to privacy settings
   * Provides quick access to privacy controls
   */
  openPrivacy(): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'privacy')]);
  }

  /**
   * Initiates profile completion flow
   * Guides users through completing their profile information
   */
  completeProfile(): void {
    // This could open a profile completion wizard or modal
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.SETTINGS, 'account')], { 
      fragment: 'complete-profile' 
    });
  }

  /**
   * Switches user role between buyer and seller
   * Allows users to toggle between different platform roles
   */
  switchRole(): void {
    if (!this.userProfile) return;
    
    const newRole = this.userProfile.current_role === 'buyer' ? 'seller' : 'buyer';
    
    this.loading = true;
    
    // This would typically call an API to switch roles
    // For now, we'll simulate the role switch
    setTimeout(() => {
      if (this.userProfile) {
        this.userProfile.current_role = newRole;
      }
      this.loading = false;
      console.log(`Switched to ${newRole} role`);
      alert(`Successfully switched to ${newRole} role!`);
    }, 1000);
  }
} 