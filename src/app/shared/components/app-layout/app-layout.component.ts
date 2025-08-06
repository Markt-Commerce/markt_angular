import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faShoppingBag,
  faTimesCircle,
  faHeart,
  faStore,
  faUser,
  faCog,
  faSignOutAlt,
  faSearch,
  faBell,
  faBars,
  faTimes,
  faFileText,
  faUsers,
  faChartBar,
  faBox,
  faTruck,
  faCreditCard,
  faComments,
  faBookmark,
  faShare,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, 
  faTwitter, 
  faInstagram, 
  faLinkedin 
} from '@fortawesome/free-brands-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { AppStateService } from '../../../core/services/app-state.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FontAwesomeModule, FormsModule],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <div 
        class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
        [class.translate-x-0]="sidebarOpen"
        [class.-translate-x-full]="!sidebarOpen"
      >
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <img src="/Logo.png" alt="Markt" class="h-8 w-8">
            <span class="text-xl font-bold text-gray-900">Markt</span>
          </div>
          <button 
            (click)="toggleSidebar()"
            class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <fa-icon [icon]="faTimes" class="w-5 h-5"></fa-icon>
          </button>
        </div>

        <!-- User Profile Section -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <img 
                [src]="user?.profile_picture_url || '/assets/images/default-avatar.png'" 
                alt="Profile" 
                class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              >
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ getUserDisplayName() }}
              </p>
              <p class="text-xs text-gray-500 capitalize">
                {{ user?.current_role || 'User' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <!-- Main Navigation -->
          <div class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </h3>
            
            <a 
              routerLink="/app/dashboard" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faHome" class="w-5 h-5 mr-3"></fa-icon>
              Dashboard
            </a>

            <a 
              routerLink="/app/marketplace" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faStore" class="w-5 h-5 mr-3"></fa-icon>
              Marketplace
            </a>

            <a 
              routerLink="/app/requests" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faFileText" class="w-5 h-5 mr-3"></fa-icon>
              Buyer Requests
            </a>

            <a 
              routerLink="/app/social" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faUsers" class="w-5 h-5 mr-3"></fa-icon>
              Social Feed
            </a>
          </div>

          <!-- Shopping Section -->
          <div class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Shopping
            </h3>
            
            <a 
              routerLink="/app/cart" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faShoppingBag" class="w-5 h-5 mr-3"></fa-icon>
              Cart
              <span 
                *ngIf="cartItemCount > 0"
                class="ml-auto bg-markt-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
              >
                {{ cartItemCount }}
              </span>
            </a>

            <a 
              routerLink="/app/orders" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faBox" class="w-5 h-5 mr-3"></fa-icon>
              Orders
            </a>

            <a 
              routerLink="/app/wishlist" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faHeart" class="w-5 h-5 mr-3"></fa-icon>
              Wishlist
            </a>
          </div>

          <!-- Seller Section (if seller) -->
          <div *ngIf="isSeller" class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Seller Tools
            </h3>
            
            <a 
              routerLink="/app/seller/products" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faBox" class="w-5 h-5 mr-3"></fa-icon>
              My Products
            </a>

            <a 
              routerLink="/app/seller/orders" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faTruck" class="w-5 h-5 mr-3"></fa-icon>
              Seller Orders
            </a>

            <a 
              routerLink="/app/seller/analytics" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faChartBar" class="w-5 h-5 mr-3"></fa-icon>
              Analytics
            </a>
          </div>

          <!-- Communication -->
          <div class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Communication
            </h3>
            
            <a 
              routerLink="/app/chat" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faComments" class="w-5 h-5 mr-3"></fa-icon>
              Messages
              <span 
                *ngIf="unreadMessages > 0"
                class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
              >
                {{ unreadMessages }}
              </span>
            </a>

            <a 
              routerLink="/app/notifications" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faBell" class="w-5 h-5 mr-3"></fa-icon>
              Notifications
              <span 
                *ngIf="unreadNotifications > 0"
                class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
              >
                {{ unreadNotifications }}
              </span>
            </a>
          </div>

          <!-- Account -->
          <div class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            
            <a 
              routerLink="/app/profile" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faUser" class="w-5 h-5 mr-3"></fa-icon>
              Profile
            </a>

            <a 
              routerLink="/app/settings" 
              routerLinkActive="bg-markt-primary text-white"
              class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faCog" class="w-5 h-5 mr-3"></fa-icon>
              Settings
            </a>

            <button 
              (click)="logout()"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <fa-icon [icon]="faSignOutAlt" class="w-5 h-5 mr-3"></fa-icon>
              Logout
            </button>
          </div>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col lg:ml-64">
        <!-- Top Navigation -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <!-- Left side -->
            <div class="flex items-center">
              <button 
                (click)="toggleSidebar()"
                class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <fa-icon [icon]="faBars" class="w-5 h-5"></fa-icon>
              </button>
              
              <!-- Search Bar -->
              <div class="ml-4 flex-1 max-w-lg">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <fa-icon [icon]="faSearch" class="w-5 h-5 text-gray-400"></fa-icon>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search products, users, requests..."
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
                    [(ngModel)]="searchQuery"
                    (input)="onSearchInput()"
                  >
                </div>
              </div>
            </div>

            <!-- Right side -->
            <div class="flex items-center space-x-4">
              <!-- Quick Actions -->
              <div class="flex items-center space-x-2">
                <button 
                  routerLink="/app/marketplace/create"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Add Product"
                >
                  <fa-icon [icon]="faTimes" class="w-5 h-5"></fa-icon>
                </button>
                
                <button 
                  routerLink="/app/requests/create"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Create Request"
                >
                  <fa-icon [icon]="faFileText" class="w-5 h-5"></fa-icon>
                </button>
                
                <button 
                  routerLink="/app/social/create"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Create Post"
                >
                  <fa-icon [icon]="faCamera" class="w-5 h-5"></fa-icon>
                </button>
              </div>

              <!-- Notifications -->
              <button 
                routerLink="/app/notifications"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors relative"
                title="Notifications"
              >
                <fa-icon [icon]="faBell" class="w-5 h-5"></fa-icon>
                <span 
                  *ngIf="unreadNotifications > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ unreadNotifications > 99 ? '99+' : unreadNotifications }}
                </span>
              </button>

              <!-- Messages -->
              <button 
                routerLink="/app/chat"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors relative"
                title="Messages"
              >
                <fa-icon [icon]="faComments" class="w-5 h-5"></fa-icon>
                <span 
                  *ngIf="unreadMessages > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ unreadMessages > 99 ? '99+' : unreadMessages }}
                </span>
              </button>

              <!-- Cart -->
              <button 
                routerLink="/app/cart"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors relative"
                title="Cart"
              >
                <fa-icon [icon]="faShoppingBag" class="w-5 h-5"></fa-icon>
                <span 
                  *ngIf="cartItemCount > 0"
                  class="absolute -top-1 -right-1 bg-markt-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ cartItemCount > 99 ? '99+' : cartItemCount }}
                </span>
              </button>

              <!-- User Menu -->
              <div class="relative">
                <button 
                  (click)="toggleUserMenu()"
                  class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <img 
                    [src]="user?.profile_picture_url || '/assets/images/default-avatar.png'" 
                    alt="Profile" 
                    class="w-8 h-8 rounded-full object-cover"
                  >
                  <span class="hidden md:block text-sm font-medium text-gray-700">
                    {{ getUserDisplayName() }}
                  </span>
                </button>

                <!-- User Dropdown Menu -->
                <div 
                  *ngIf="userMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                >
                  <a 
                    routerLink="/app/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a 
                    routerLink="/app/settings"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <hr class="my-1">
                  <button 
                    (click)="logout()"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>

      <!-- Mobile Overlay -->
      <div 
        *ngIf="sidebarOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
      ></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private appStateService = inject(AppStateService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  // Icons
  faHome = faHome;
  faSearch = faSearch;
  faShoppingBag = faShoppingBag;
  faUser = faUser;
  faBell = faBell;
  faMessageCircle = faTimesCircle;
  faHeart = faHeart;
  faCog = faCog;
  faSignOutAlt = faSignOutAlt;
  faBars = faBars;
  faTimes = faTimes;
  faPlus = faTimes;
  faStore = faStore;
  faFileText = faFileText;
  faUsers = faUsers;
  faChartBar = faChartBar;
  faBox = faBox;
  faTruck = faTruck;
  faCreditCard = faCreditCard;
  faComments = faComments;
  faBookmark = faBookmark;
  faShare = faShare;
  faCamera = faCamera;

  // State
  user: any = null;
  sidebarOpen = false;
  userMenuOpen = false;
  searchQuery = '';
  
  // Observables
  cartItemCount$ = this.cartService.getCartItemCount$();
  unreadNotifications$ = this.notificationService.getUnreadCount$();
  unreadMessages$ = this.chatService.getUnreadCount$();
  
  // Local state
  cartItemCount = 0;
  unreadNotifications = 0;
  unreadMessages = 0;

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSubscriptions();
  }

  private initializeComponent(): void {
    // Get current user
    this.authService.authState$.subscribe(authState => {
      this.user = authState.user;
    });

    // Get UI state
    this.appStateService.getUIState$().subscribe(uiState => {
      this.sidebarOpen = uiState.sidebarOpen;
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to cart item count
    this.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    // Subscribe to unread notifications
    this.unreadNotifications$.subscribe(count => {
      this.unreadNotifications = count;
    });

    // Subscribe to unread messages
    this.unreadMessages$.subscribe(count => {
      this.unreadMessages = count;
    });
  }

  toggleSidebar(): void {
    this.appStateService.toggleSidebar();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  onSearchInput(): void {
    this.appStateService.setSearchQuery(this.searchQuery);
  }

  getUserDisplayName(): string {
    if (!this.user) return 'User';
    
    if (this.user.current_role === 'buyer' && this.user.buyer_account) {
      return this.user.buyer_account.buyername;
    } else if (this.user.current_role === 'seller' && this.user.seller_account) {
      return this.user.seller_account.shop_name;
    }
    return this.user.username;
  }

  get isSeller(): boolean {
    return this.user?.current_role === 'seller';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/landing']);
      }
    });
  }
} 