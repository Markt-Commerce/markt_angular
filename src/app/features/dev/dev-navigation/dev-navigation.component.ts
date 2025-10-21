import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCode, 
  faHome, 
  faStore, 
  faUsers, 
  faComments, 
  faShoppingCart, 
  faReceipt, 
  faTag, 
  faClipboard, 
  faBell, 
  faUser, 
  faCog, 
  faChartBar, 
  faList, 
  faPlusCircle, 
  faChartLine,
  faSearch,
  faStream,
  faSignInAlt,
  faUserPlus,
  faKey,
  faEnvelope,
  faCheckCircle,
  faArrowLeft,
  faToggleOn,
  faToggleOff,
  faFileContract,
  faQuestionCircle,
  faHandshake,
  faGavel
} from '@fortawesome/free-solid-svg-icons';
import { AccessControlService } from '../../../core/services/access-control.service';
import { AuthService } from '../../../core/services/auth.service';

interface DevRoute {
  path: string;
  title: string;
  description: string;
  icon: any;
  category: 'public' | 'auth' | 'main' | 'buyer' | 'seller' | 'settings' | 'admin';
  requiresAuth: boolean;
  requiredRole?: 'buyer' | 'seller' | 'admin';
  isActive?: boolean;
}

@Component({
  selector: 'app-dev-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <button 
                (click)="goBack()"
                class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <fa-icon [icon]="faArrowLeft" class="w-4 h-4"></fa-icon>
                <span>Back to App</span>
              </button>
              <div class="h-6 w-px bg-gray-300"></div>
              <div class="flex items-center space-x-3">
                <fa-icon [icon]="faCode" class="w-6 h-6 text-blue-600"></fa-icon>
                <h1 class="text-xl font-bold text-gray-900">Dev Navigation</h1>
              </div>
            </div>
            
            <!-- Role Toggle -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">Current Role:</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                  {{ access.role || 'none' }}
                </span>
              </div>
              <button 
                (click)="toggleRole()"
                class="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <fa-icon [icon]="isRoleToggleVisible() ? faToggleOn : faToggleOff" class="w-4 h-4"></fa-icon>
                <span class="text-sm">Toggle Role</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Toggle Panel -->
      <div *ngIf="isRoleToggleVisible()" class="bg-blue-50 border-b border-blue-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-blue-900">Switch Role:</span>
            <button 
              (click)="switchRole('buyer')"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Buyer
            </button>
            <button 
              (click)="switchRole('seller')"
              class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Seller
            </button>
            <button 
              (click)="switchRole(null)"
              class="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              No Role
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          <!-- Public Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faHome" class="w-5 h-5 text-green-600 mr-2"></fa-icon>
                Public Routes
              </h2>
              <p class="text-sm text-gray-600 mt-1">Accessible without authentication</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('public')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

          <!-- Auth Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faSignInAlt" class="w-5 h-5 text-blue-600 mr-2"></fa-icon>
                Authentication
              </h2>
              <p class="text-sm text-gray-600 mt-1">Login, register, and account management</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('auth')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md hover:bg-blue-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

          <!-- Main App Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faHome" class="w-5 h-5 text-purple-600 mr-2"></fa-icon>
                Main App
              </h2>
              <p class="text-sm text-gray-600 mt-1">Core application features</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('main')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-md hover:bg-purple-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

          <!-- Buyer Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faShoppingCart" class="w-5 h-5 text-orange-600 mr-2"></fa-icon>
                Buyer Features
              </h2>
              <p class="text-sm text-gray-600 mt-1">Shopping and purchasing features</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('buyer')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-md hover:bg-orange-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

          <!-- Seller Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faStore" class="w-5 h-5 text-green-600 mr-2"></fa-icon>
                Seller Features
              </h2>
              <p class="text-sm text-gray-600 mt-1">Selling and inventory management</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('seller')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

          <!-- Settings Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faCog" class="w-5 h-5 text-gray-600 mr-2"></fa-icon>
                Settings
              </h2>
              <p class="text-sm text-gray-600 mt-1">Account and app preferences</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('settings')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

          <!-- Admin Routes -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <fa-icon [icon]="faCog" class="w-5 h-5 text-red-600 mr-2"></fa-icon>
                Admin
              </h2>
              <p class="text-sm text-gray-600 mt-1">Administrative functions</p>
            </div>
            <div class="p-6 space-y-3">
              <div 
                *ngFor="let route of getRoutesByCategory('admin')"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <fa-icon [icon]="route.icon" class="w-4 h-4 text-gray-600"></fa-icon>
                  <div>
                    <div class="font-medium text-gray-900">{{ route.title }}</div>
                    <div class="text-sm text-gray-600">{{ route.description }}</div>
                  </div>
                </div>
                <a 
                  [routerLink]="route.path"
                  class="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200 transition-colors"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>

        </div>

        <!-- Quick Stats -->
        <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Navigation Summary</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ getRoutesByCategory('public').length }}</div>
              <div class="text-sm text-gray-600">Public Routes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ getRoutesByCategory('auth').length }}</div>
              <div class="text-sm text-gray-600">Auth Routes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ getRoutesByCategory('main').length }}</div>
              <div class="text-sm text-gray-600">Main Routes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ getRoutesByCategory('buyer').length }}</div>
              <div class="text-sm text-gray-600">Buyer Routes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ getRoutesByCategory('seller').length }}</div>
              <div class="text-sm text-gray-600">Seller Routes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">{{ getRoutesByCategory('admin').length }}</div>
              <div class="text-sm text-gray-600">Admin Routes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DevNavigationComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  public access = inject(AccessControlService);

  // FontAwesome Icons
  faCode = faCode;
  faHome = faHome;
  faStore = faStore;
  faUsers = faUsers;
  faComments = faComments;
  faShoppingCart = faShoppingCart;
  faReceipt = faReceipt;
  faTag = faTag;
  faClipboard = faClipboard;
  faBell = faBell;
  faUser = faUser;
  faCog = faCog;
  faChartBar = faChartBar;
  faList = faList;
  faPlusCircle = faPlusCircle;
  faChartLine = faChartLine;
  faSearch = faSearch;
  faStream = faStream;
  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;
  faKey = faKey;
  faEnvelope = faEnvelope;
  faCheckCircle = faCheckCircle;
  faArrowLeft = faArrowLeft;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faFileContract = faFileContract;
  faQuestionCircle = faQuestionCircle;
  faHandshake = faHandshake;
  faGavel = faGavel;

  // State
  isRoleToggleVisible = signal(false);

  // All available routes for development navigation
  devRoutes: DevRoute[] = [
    // Public Routes
    {
      path: ROUTES_ABSOLUTE.LANDING,
      title: 'Landing Page',
      description: 'Main landing page with hero section',
      icon: faHome,
      category: 'public',
      requiresAuth: false
    },
    {
      path: '/legal/terms',
      title: 'Terms & Conditions',
      description: 'Legal terms and user agreement (no app layout)',
      icon: faFileContract,
      category: 'public',
      requiresAuth: false
    },
    {
      path: '/seller-verification',
      title: 'Seller Verification',
      description: 'Standalone verification flow (no app layout)',
      icon: faCheckCircle,
      category: 'public',
      requiresAuth: false
    },
    {
      path: '/order-confirmation',
      title: 'Order Confirmation',
      description: 'Order confirmation page (public)',
      icon: faCheckCircle,
      category: 'public',
      requiresAuth: false
    },
    {
      path: '/dev-navigation',
      title: 'Dev Navigation',
      description: 'Development navigation helper',
      icon: faCode,
      category: 'public',
      requiresAuth: false
    },

    // Auth Routes
    {
      path: ROUTES_ABSOLUTE.AUTH.LOGIN,
      title: 'Login',
      description: 'User login page',
      icon: faSignInAlt,
      category: 'auth',
      requiresAuth: false
    },
    {
      path: ROUTES_ABSOLUTE.AUTH.REGISTER,
      title: 'Register',
      description: 'User registration page',
      icon: faUserPlus,
      category: 'auth',
      requiresAuth: false
    },
    {
      path: ROUTES_ABSOLUTE.AUTH.FORGOT_PASSWORD,
      title: 'Forgot Password',
      description: 'Password reset request',
      icon: faKey,
      category: 'auth',
      requiresAuth: false
    },
    {
      path: '/auth/verify-email',
      title: 'Verify Email',
      description: 'Email verification page',
      icon: faEnvelope,
      category: 'auth',
      requiresAuth: false
    },
    {
      path: '/onboarding',
      title: 'Onboarding',
      description: 'User onboarding flow',
      icon: faUser,
      category: 'auth',
      requiresAuth: true
    },

    // Main App Routes
    {
      path: ROUTES_ABSOLUTE.APP.DASHBOARD,
      title: 'Dashboard',
      description: 'Main user dashboard',
      icon: faHome,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/community/social-feed',
      title: 'Social Feed',
      description: 'Community social feed',
      icon: faStream,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.COMMUNITY,
      title: 'Community',
      description: 'Community hub',
      icon: faUsers,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/community/feed',
      title: 'Community Feed',
      description: 'Community feed page',
      icon: faStream,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.MARKETPLACE,
      title: 'Marketplace',
      description: 'Browse all products',
      icon: faStore,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/marketplace/search',
      title: 'Search Products',
      description: 'Product search page',
      icon: faSearch,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/marketplace/product/1',
      title: 'Product Listing',
      description: 'Individual product page (demo ID: 1)',
      icon: faStore,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.CHAT,
      title: 'Messages',
      description: 'Chat and messaging',
      icon: faComments,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.NOTIFICATIONS,
      title: 'Notifications',
      description: 'User notifications',
      icon: faBell,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.OFFERS.ROOT,
      title: 'Offers',
      description: 'Browse and manage offers',
      icon: faTag,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.REQUESTS.ROOT,
      title: 'Requests',
      description: 'Browse and manage requests',
      icon: faClipboard,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/requests/my',
      title: 'My Requests',
      description: 'View and manage your own requests',
      icon: faClipboard,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.PROFILE,
      title: 'Profile',
      description: 'User profile page',
      icon: faUser,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/profile/edit',
      title: 'Edit Profile',
      description: 'Edit user profile',
      icon: faUser,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/profile/user/1',
      title: 'User Profile',
      description: 'View other user profile (demo ID: 1)',
      icon: faUser,
      category: 'main',
      requiresAuth: true
    },
    {
      path: ROUTES_ABSOLUTE.APP.SHOPS.ROOT,
      title: 'Shops',
      description: 'Browse and discover shops',
      icon: faStore,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/social/feed',
      title: 'Social Feed',
      description: 'Social media style feed',
      icon: faStream,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/social/stories',
      title: 'Stories',
      description: 'View and create stories',
      icon: faStream,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/marketplace/product-detail/1',
      title: 'Product Detail',
      description: 'Detailed product view (demo ID: 1)',
      icon: faStore,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/support',
      title: 'Support',
      description: 'Help and support center',
      icon: faQuestionCircle,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/contact',
      title: 'Contact Us',
      description: 'Contact form and support tickets',
      icon: faEnvelope,
      category: 'main',
      requiresAuth: true
    },
    {
      path: '/app/community/post/1',
      title: 'Post Detail',
      description: 'Individual community post view (demo ID: 1)',
      icon: faUsers,
      category: 'main',
      requiresAuth: true
    },

    // Buyer Routes
    {
      path: ROUTES_ABSOLUTE.APP.CART,
      title: 'Shopping Cart',
      description: 'View cart items',
      icon: faShoppingCart,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: ROUTES_ABSOLUTE.APP.CHECKOUT,
      title: 'Checkout',
      description: 'Complete purchase',
      icon: faShoppingCart,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/checkout/confirmation',
      title: 'Order Confirmation',
      description: 'Order confirmation (authenticated)',
      icon: faCheckCircle,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: ROUTES_ABSOLUTE.APP.ORDERS.ROOT,
      title: 'My Orders',
      description: 'View order history',
      icon: faReceipt,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/orders/history',
      title: 'Order History',
      description: 'Detailed order history with filters and search',
      icon: faReceipt,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/orders/1',
      title: 'Order Detail',
      description: 'View order details (demo ID: 1)',
      icon: faReceipt,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/orders/1/track',
      title: 'Track Order',
      description: 'Track order status (demo ID: 1)',
      icon: faReceipt,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/offers/create',
      title: 'Create Offer',
      description: 'Respond to buyer requests with offers',
      icon: faPlusCircle,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/offers/make/macbook-pro-13-2021',
      title: 'Make Offer',
      description: 'Make offer on existing product listings',
      icon: faTag,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/offers/1',
      title: 'Offer Detail',
      description: 'View offer details (demo ID: 1)',
      icon: faTag,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/requests/create',
      title: 'Create Request',
      description: 'Create new request',
      icon: faPlusCircle,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/requests/1',
      title: 'Request Detail',
      description: 'Request Management - View responses and manage offers (demo ID: 1)',
      icon: faClipboard,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/app/checkout/confirmation/1',
      title: 'Order Confirmation (Auth)',
      description: 'Order confirmation page (authenticated, demo ID: 1)',
      icon: faCheckCircle,
      category: 'buyer',
      requiresAuth: true,
      requiredRole: 'buyer'
    },
    {
      path: '/offers/negotiation/1',
      title: 'Negotiation (Public)',
      description: 'Offer negotiation page (public access, demo ID: 1)',
      icon: faHandshake,
      category: 'buyer',
      requiresAuth: true
    },
    {
      path: '/app/offers/negotiation/1',
      title: 'Negotiation (App)',
      description: 'Offer negotiation page (app layout, demo ID: 1)',
      icon: faHandshake,
      category: 'buyer',
      requiresAuth: true
    },

    // Seller Routes
    {
      path: '/app/seller/dashboard',
      title: 'Seller Dashboard',
      description: 'Seller analytics and overview',
      icon: faChartBar,
      category: 'seller',
      requiresAuth: true,
      requiredRole: 'seller'
    },
    {
      path: '/app/seller/listings',
      title: 'My Listings',
      description: 'Manage product listings',
      icon: faList,
      category: 'seller',
      requiresAuth: true,
      requiredRole: 'seller'
    },
    {
      path: '/app/seller/listings/create',
      title: 'Create Listing',
      description: 'Add new product listing',
      icon: faPlusCircle,
      category: 'seller',
      requiresAuth: true,
      requiredRole: 'seller'
    },
    {
      path: '/app/seller/listings/edit/1',
      title: 'Edit Listing',
      description: 'Edit product listing (demo ID: 1)',
      icon: faList,
      category: 'seller',
      requiresAuth: true,
      requiredRole: 'seller'
    },
    {
      path: '/app/seller/analytics',
      title: 'Analytics',
      description: 'Sales and performance analytics',
      icon: faChartLine,
      category: 'seller',
      requiresAuth: true,
      requiredRole: 'seller'
    },
    {
      path: '/seller-verification',
      title: 'Seller Verification (Public)',
      description: 'Seller verification flow (standalone, no app layout)',
      icon: faGavel,
      category: 'seller',
      requiresAuth: false
    },

    // Settings Routes
    {
      path: ROUTES_ABSOLUTE.APP.SETTINGS,
      title: 'Settings',
      description: 'Main settings page',
      icon: faCog,
      category: 'settings',
      requiresAuth: true
    },
    {
      path: '/app/settings/account',
      title: 'Account Settings',
      description: 'Account management',
      icon: faUser,
      category: 'settings',
      requiresAuth: true
    },
    {
      path: '/app/settings/notifications',
      title: 'Notification Settings',
      description: 'Notification preferences',
      icon: faBell,
      category: 'settings',
      requiresAuth: true
    },
    {
      path: '/app/settings/privacy',
      title: 'Privacy Settings',
      description: 'Privacy and security',
      icon: faCog,
      category: 'settings',
      requiresAuth: true
    },
    {
      path: '/app/settings/shipping',
      title: 'Shipping Settings',
      description: 'Shipping preferences',
      icon: faCog,
      category: 'settings',
      requiresAuth: true
    },
    {
      path: '/app/settings/preferences',
      title: 'Preferences',
      description: 'App preferences',
      icon: faCog,
      category: 'settings',
      requiresAuth: true
    },

    // Admin Routes
    {
      path: ROUTES_ABSOLUTE.APP.ADMIN.ROOT,
      title: 'Admin Panel',
      description: 'Administrative dashboard and controls',
      icon: faCog,
      category: 'admin',
      requiresAuth: true,
      requiredRole: 'admin'
    }
  ];

  /**
   * Get routes filtered by category
   * This method filters the dev routes based on the specified category
   * and returns them for display in the navigation interface
   */
  getRoutesByCategory(category: DevRoute['category']): DevRoute[] {
    return this.devRoutes.filter(route => route.category === category);
  }

  /**
   * Navigate back to the main application
   * This provides a quick way to return to the main app from the dev navigation
   */
  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.DASHBOARD]);
  }

  /**
   * Toggle the role selection panel visibility
   * This allows developers to easily switch between different user roles for testing
   */
  toggleRole(): void {
    this.isRoleToggleVisible.update(visible => !visible);
  }

  /**
   * Switch the current user role for testing purposes
   * This method uses the AuthService to switch roles for testing
   * @param role - The role to switch to ('buyer', 'seller', or null)
   */
  switchRole(role: 'buyer' | 'seller' | null): void {
    if (role) {
      this.authService.switchRole(role).subscribe({
        next: (response) => {
          this.isRoleToggleVisible.set(false);
        },
        error: (error) => {
          console.error('Failed to switch role:', error);
          this.isRoleToggleVisible.set(false);
        }
      });
    } else {
      // For demo purposes, we'll just log that no role is set
      this.isRoleToggleVisible.set(false);
    }
  }
}
