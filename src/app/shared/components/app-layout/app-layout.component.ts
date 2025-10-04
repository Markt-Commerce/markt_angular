import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faBars, 
  faSearch, 
  faBell, 
  faChevronDown, 
  faUser, 
  faHome, 
  faStore, 
  faUsers, 
  faComments, 
  faShoppingBag, 
  faShoppingCart, 
  faReceipt, 
  faTag, 
  faClipboard, 
  faChartBar, 
  faChartLine, 
  faList, 
  faPlusCircle, 
  faCog, 
  faTimes, 
  faChevronRight,
  faStream
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { AppStateService } from '../../../core/services/app-state.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatService } from '../../../core/services/chat.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { ObservableUtilsService } from '../../../core/services/observable-utils.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule, FontAwesomeModule],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <!-- Header -->
        <header class="bg-white border-b border-border shadow-sm sticky top-0 z-50">
          <div class="px-6 py-2">
          <div class="flex items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center space-x-4">
              <button 
                (click)="toggleSidebar()"
                class="lg:hidden text-dark hover:text-primary"
                aria-label="Toggle menu"
              >
                <fa-icon [icon]="faBars" class="text-xl"></fa-icon>
              </button>
                <div class="flex items-center">
                    <img 
                        src="/markt-text-logo.png" 
                        alt="Markt Logo" 
                        class="h-16 object-contain"
                    />
                </div>
            </div>
              
              <!-- Search Bar -->
            <div class="hidden md:flex flex-1 max-w-lg mx-8">
              <div class="relative w-full">
                  <input 
                    type="text" 
                  placeholder="Search products, sellers, or communities..." 
                  class="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                  >
                <fa-icon [icon]="faSearch" class="absolute left-3 top-3 text-muted w-4 h-4"></fa-icon>
              </div>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <div class="relative">
                <button 
                  (click)="goToNotifications()"
                  class="text-dark hover:text-primary relative"
                  aria-label="Notifications"
                >
                  <fa-icon [icon]="faBell" class="text-xl"></fa-icon>
                  <span 
                    *ngIf="unreadNotifications > 0"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {{ unreadNotifications }}
                  </span>
                </button>
              </div>

              <!-- User Profile -->
              <div class="relative">
                <button 
                  (click)="toggleUserMenu()"
                  class="flex items-center space-x-3 hover:bg-light rounded-lg p-2"
                  [attr.aria-expanded]="userMenuOpen"
                >
                  <img 
                    [src]="user?.profile_picture_url || '/Logo.png'" 
                    alt="Profile" 
                    class="w-8 h-8 rounded-full object-cover"
                  >
                  <div class="hidden md:block text-left">
                    <div class="text-sm font-medium text-dark">{{ getUserDisplayName() }}</div>
                    <div class="text-xs text-muted capitalize">{{ access.role || 'user' }}</div>
                  </div>
                  <fa-icon [icon]="faChevronDown" class="text-muted text-sm hidden md:block w-3 h-3"></fa-icon>
                </button>

                <!-- User Dropdown Menu -->
                <div 
                  *ngIf="userMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-border"
                >
                  <a 
                    routerLink="/app/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-light"
                    (click)="closeUserMenu()"
                  >
                    Profile
                  </a>
                  <a 
                    routerLink="/app/settings"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-light"
                    (click)="closeUserMenu()"
                  >
                    Settings
                  </a>
                  <hr class="my-1 border-border">
                  <button 
                    (click)="logout()"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-light"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile Search -->
          <div class="md:hidden mt-4">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                class="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
              >
              <fa-icon [icon]="faSearch" class="absolute left-3 top-3 text-muted w-4 h-4"></fa-icon>
              </div>
            </div>
          </div>
        </header>

      <div class="flex">
        <!-- Desktop Sidebar -->
        <aside class="w-64 bg-white border-r border-border h-screen fixed top-16 left-0 hidden lg:block z-40">
          <div class="p-6">
            <!-- Role Badge -->
            <div class="mb-6">
              <div class="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center">
                <fa-icon [icon]="faUser" class="w-4 h-4 mr-2"></fa-icon>
                <span class="capitalize">{{ access.role || 'user' }}</span>
              </div>
            </div>

            <!-- Navigation Menu -->
            <nav class="space-y-2">
              <!-- Dashboard -->
              <a 
                routerLink="/app/dashboard" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faHome" class="w-4 h-4"></fa-icon>
                <span>Dashboard</span>
              </a>

              <!-- Feed -->
              <a 
                routerLink="/app/community/social-feed" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faStream" class="w-4 h-4"></fa-icon>
                <span>Feed</span>
              </a>

              <!-- Marketplace -->
              <a 
                routerLink="/app/marketplace" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faStore" class="w-4 h-4"></fa-icon>
                <span>Marketplace</span>
              </a>

              <!-- Community -->
              <a 
                routerLink="/app/community" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faUsers" class="w-4 h-4"></fa-icon>
                <span>Community</span>
              </a>

              <!-- Messages -->
              <a 
                routerLink="/app/chat" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faComments" class="w-4 h-4"></fa-icon>
                <span>Messages</span>
                <span 
                  *ngIf="unreadMessages > 0"
                  class="bg-primary text-white text-xs px-2 py-1 rounded-full ml-auto"
                >
                  {{ unreadMessages }}
                </span>
              </a>

              <!-- Orders -->
              <a 
                routerLink="/app/orders" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faReceipt" class="w-4 h-4"></fa-icon>
                <span>Orders</span>
              </a>

              <!-- Offers -->
              <a 
                routerLink="/app/offers" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faTag" class="w-4 h-4"></fa-icon>
                <span>Offers</span>
              </a>

              <!-- Requests -->
              <a 
                routerLink="/app/requests" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faClipboard" class="w-4 h-4"></fa-icon>
                <span>Requests</span>
              </a>

              <!-- Cart -->
              <a 
                routerLink="/app/cart" 
                routerLinkActive="bg-primary text-white"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
              >
                <fa-icon [icon]="faShoppingCart" class="w-4 h-4"></fa-icon>
                <span>Cart</span>
                <span 
                  *ngIf="cartItemCount > 0"
                  class="bg-primary text-white text-xs px-2 py-1 rounded-full ml-auto"
                >
                  {{ cartItemCount }}
                </span>
              </a>

              <!-- Notifications removed from sidebar - available in header -->

              <!-- Seller Section -->
              <div class="pt-4 mt-4 border-t border-border">
                <h3 class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Seller Tools</h3>
                
                <a 
                  routerLink="/app/seller/dashboard" 
                  routerLinkActive="bg-primary text-white"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
                >
                  <fa-icon [icon]="faChartBar" class="w-4 h-4"></fa-icon>
                  <span>Seller Dashboard</span>
                </a>

                <a 
                  routerLink="/app/seller/listings" 
                  routerLinkActive="bg-primary text-white"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
                >
                  <fa-icon [icon]="faList" class="w-4 h-4"></fa-icon>
                  <span>My Listings</span>
                </a>

                <a 
                  routerLink="/app/seller/listings/create" 
                  routerLinkActive="bg-primary text-white"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
                >
                  <fa-icon [icon]="faPlusCircle" class="w-4 h-4"></fa-icon>
                  <span>Add Product</span>
                </a>

                <a 
                  routerLink="/app/seller/analytics" 
                  routerLinkActive="bg-primary text-white"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-dark hover:bg-light cursor-pointer transition-colors"
                >
                  <fa-icon [icon]="faChartLine" class="w-4 h-4"></fa-icon>
                  <span>Analytics</span>
                </a>
              </div>

              <!-- Account Section -->
              <!-- User Settings removed from sidebar - available in user dropdown menu -->
            </nav>
          </div>
        </aside>

        <!-- Mobile Sidebar - Removed redundant navigation (use bottom nav instead) -->

        <!-- Main Content Area -->
        <main class="flex-1 lg:ml-64">
          <!-- Page Content -->
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Bottom Navigation (Mobile) - Essential routes only -->
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-border lg:hidden">
        <div class="flex justify-around py-2">
          <a 
            routerLink="/app/community/social-feed" 
            routerLinkActive="text-primary"
            class="flex flex-col items-center py-2 px-3 text-muted hover:text-primary cursor-pointer transition-colors"
          >
            <fa-icon [icon]="faStream" class="w-4 h-4"></fa-icon>
            <span class="text-xs mt-1">Feed</span>
          </a>
          
          <a 
            routerLink="/app/marketplace" 
            routerLinkActive="text-primary"
            class="flex flex-col items-center py-2 px-3 text-muted hover:text-primary cursor-pointer transition-colors"
          >
            <fa-icon [icon]="faStore" class="w-4 h-4"></fa-icon>
            <span class="text-xs mt-1">Market</span>
          </a>
          
          <a 
            routerLink="/app/cart" 
            routerLinkActive="text-primary"
            class="flex flex-col items-center py-2 px-3 text-muted hover:text-primary cursor-pointer transition-colors relative"
          >
            <fa-icon [icon]="faShoppingCart" class="w-4 h-4"></fa-icon>
            <span class="text-xs mt-1">Cart</span>
            <span 
              *ngIf="cartItemCount > 0"
              class="absolute -top-1 right-2 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ cartItemCount }}
            </span>
          </a>
          
          <a 
            routerLink="/app/chat" 
            routerLinkActive="text-primary"
            class="flex flex-col items-center py-2 px-3 text-muted hover:text-primary cursor-pointer transition-colors relative"
          >
            <fa-icon [icon]="faComments" class="w-4 h-4"></fa-icon>
            <span class="text-xs mt-1">Chat</span>
            <span 
              *ngIf="unreadMessages > 0"
              class="absolute -top-1 right-2 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ unreadMessages }}
            </span>
          </a>
          
          <a 
            routerLink="/app/orders" 
            routerLinkActive="text-primary"
            class="flex flex-col items-center py-2 px-3 text-muted hover:text-primary cursor-pointer transition-colors"
          >
            <fa-icon [icon]="faReceipt" class="w-4 h-4"></fa-icon>
            <span class="text-xs mt-1">Orders</span>
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    
    html, body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private appStateService = inject(AppStateService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private chatService = inject(ChatService);
  private observableUtils = inject(ObservableUtilsService);
  public access = inject(AccessControlService);

  // FontAwesome Icons
  faBars = faBars;
  faSearch = faSearch;
  faBell = faBell;
  faChevronDown = faChevronDown;
  faUser = faUser;
  faHome = faHome;
  faStore = faStore;
  faUsers = faUsers;
  faComments = faComments;
  faShoppingBag = faShoppingBag;
  faShoppingCart = faShoppingCart;
  faReceipt = faReceipt;
  faTag = faTag;
  faClipboard = faClipboard;
  faChartBar = faChartBar;
  faChartLine = faChartLine;
  faList = faList;
  faPlusCircle = faPlusCircle;
  faCog = faCog;
  faTimes = faTimes;
  faChevronRight = faChevronRight;
  faStream = faStream;

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
    this.initializeServices();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeComponent(): void {
    // Subscribe to auth state
    this.authService.authState$.subscribe(authState => {
      this.user = authState.user;
    });

    // Subscribe to UI state
    this.appStateService.getUIState$().subscribe(uiState => {
      this.sidebarOpen = uiState.sidebarOpen;
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to cart, notification and message counts
    this.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.unreadNotifications$.subscribe(count => {
      this.unreadNotifications = count;
    });

    this.unreadMessages$.subscribe(count => {
      this.unreadMessages = count;
    });

    // Close user menu on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.userMenuOpen = false;
    });
  }

  private initializeServices(): void {
    // Initialize services that need lifecycle hooks
    this.cartService.initialize();
  }

  toggleSidebar(): void {
    this.appStateService.toggleSidebar();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/app/marketplace/search'], {
        queryParams: { q: this.searchQuery.trim() }
      });
      this.searchQuery = '';
    }
  }

  goToNotifications(): void {
    this.router.navigate(['/app/notifications']);
  }

  getUserDisplayName(): string {
    if (!this.user) return 'User';
    if (this.access.role === 'buyer' && this.user.buyer_account) {
      return this.user.buyer_account.buyername;
    }
    if (this.access.role === 'seller' && this.user.seller_account) {
      return this.user.seller_account.shop_name;
    }
    return this.user.username;
  }

  logout(): void {
    this.observableUtils.createSafeObservable({
      source: this.authService.logout(),
      successHandler: () => this.router.navigate(['/landing']),
      errorSetter: (error: string | null) => {
        console.error('Logout error:', error);
        this.router.navigate(['/landing']);
      }
    });
  }
}
