import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AppStateService } from '../../core/services/app-state.service';
import { CartService } from '../../core/services/cart.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="app-container" [class.sidebar-collapsed]="sidebarCollapsed$ | async">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <a routerLink="/" class="logo-link">
              <span class="logo-text">Markt</span>
            </a>
          </div>

          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-bar">
              <input 
                type="text" 
                placeholder="Search products, sellers, or categories..."
                class="search-input"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
              >
              <button class="search-button" (click)="onSearch()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="nav">
            <a routerLink="/app/marketplace" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              <span>Marketplace</span>
            </a>
            
            <a routerLink="/app/community" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Community</span>
            </a>
            
            <a routerLink="/app/offers" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>Offers</span>
            </a>
          </nav>

          <!-- User Actions -->
          <div class="user-actions">
            <!-- Cart -->
            <a routerLink="/app/cart" class="action-link cart-link" [class.has-items]="(cartItemCount$ | async) && (cartItemCount$ | async)! > 0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span class="cart-count" *ngIf="(cartItemCount$ | async) && (cartItemCount$ | async)! > 0">{{ cartItemCount$ | async }}</span>
            </a>

            <!-- Notifications -->
            <a routerLink="/app/notifications" class="action-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notification-badge" *ngIf="(unreadNotificationsCount$ | async) && (unreadNotificationsCount$ | async)! > 0">{{ unreadNotificationsCount$ | async }}</span>
            </a>

            <!-- User Menu -->
            <div class="user-menu" *ngIf="currentUser$ | async as user; else loginButton">
              <div class="user-avatar" (click)="toggleUserMenu()">
                <img *ngIf="user.avatar_url" [src]="user.avatar_url" [alt]="user.full_name" class="avatar-img">
                <div *ngIf="!user.avatar_url" class="avatar-placeholder">
                  {{ user.full_name?.charAt(0) || user.username?.charAt(0) || 'U' }}
                </div>
              </div>
              
              <div class="user-dropdown" [class.open]="userMenuOpen">
                <div class="dropdown-header">
                  <strong>{{ user.full_name || user.username }}</strong>
                  <small>{{ user.email }}</small>
                </div>
                <a routerLink="/app/profile" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </a>
                <a routerLink="/app/orders" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  Orders
                </a>
                <a routerLink="/app/settings" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </a>
                <div class="dropdown-divider"></div>
                <button (click)="logout()" class="dropdown-item logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            <ng-template #loginButton>
              <app-button variant="primary" size="sm" (clicked)="goToLogin()">
                Sign In
              </app-button>
            </ng-template>

            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" (click)="toggleMobileMenu()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.open]="mobileMenuOpen">
        <div class="mobile-menu-header">
          <h3>Menu</h3>
          <button class="close-button" (click)="toggleMobileMenu()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav class="mobile-nav">
          <a routerLink="/app/marketplace" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            Marketplace
          </a>
          <a routerLink="/app/community" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Community
          </a>
          <a routerLink="/app/offers" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
            Offers
          </a>
          <a routerLink="/app/cart" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Cart
          </a>
          <a routerLink="/app/notifications" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Notifications
          </a>
        </nav>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Markt</h4>
            <p>Your trusted marketplace for buying and selling.</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <a routerLink="/app/marketplace">Marketplace</a>
            <a routerLink="/app/community">Community</a>
            <a routerLink="/app/offers">Offers</a>
          </div>
          <div class="footer-section">
            <h4>Support</h4>
            <a routerLink="/help">Help Center</a>
            <a routerLink="/contact">Contact Us</a>
            <a routerLink="/about">About</a>
          </div>
          <div class="footer-section">
            <h4>Legal</h4>
            <a routerLink="/terms">Terms of Service</a>
            <a routerLink="/privacy">Privacy Policy</a>
            <a routerLink="/cookies">Cookie Policy</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 Markt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      height: 64px;
    }

    .logo {
      flex-shrink: 0;
    }

    .logo-link {
      text-decoration: none;
      color: #1f2937;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
    }

    /* Search */
    .search-container {
      flex: 1;
      max-width: 500px;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 1rem;
      padding-right: 3rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-button {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: color 0.2s;
    }

    .search-button:hover {
      color: #3b82f6;
    }

    /* Navigation */
    .nav {
      display: flex;
      gap: 1rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #6b7280;
      border-radius: 8px;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .nav-link:hover {
      color: #3b82f6;
      background: #f3f4f6;
    }

    .nav-link.active {
      color: #3b82f6;
      background: #eff6ff;
    }

    /* User Actions */
    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .action-link {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #6b7280;
      border-radius: 8px;
      transition: all 0.2s;
      text-decoration: none;
    }

    .action-link:hover {
      color: #3b82f6;
      background: #f3f4f6;
    }

    .cart-link.has-items {
      color: #3b82f6;
    }

    .cart-count, .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      border: 2px solid #e5e7eb;
      transition: border-color 0.2s;
    }

    .user-avatar:hover {
      border-color: #3b82f6;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
    }

    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s;
      z-index: 1000;
    }

    .user-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .dropdown-header strong {
      display: block;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .dropdown-header small {
      color: #6b7280;
      font-size: 0.75rem;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #374151;
      text-decoration: none;
      font-size: 0.875rem;
      transition: background-color 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background: #f9fafb;
    }

    .dropdown-item.logout {
      color: #ef4444;
    }

    .dropdown-item.logout:hover {
      background: #fef2f2;
    }

    .dropdown-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
    }

    .mobile-menu-toggle:hover {
      background: #f3f4f6;
    }

    /* Mobile Menu */
    .mobile-menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .mobile-menu.open {
      transform: translateX(0);
    }

    .mobile-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .mobile-menu-header h3 {
      margin: 0;
      color: #1f2937;
    }

    .close-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
    }

    .mobile-nav {
      padding: 1rem;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      color: #374151;
      text-decoration: none;
      border-radius: 8px;
      transition: background-color 0.2s;
      font-size: 1rem;
    }

    .mobile-nav-link:hover {
      background: #f9fafb;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      min-height: calc(100vh - 64px - 200px);
    }

    /* Footer */
    .footer {
      background: #1f2937;
      color: white;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1rem 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .footer-section h4 {
      margin: 0 0 1rem 0;
      color: #f9fafb;
      font-size: 1rem;
    }

    .footer-section a {
      display: block;
      color: #d1d5db;
      text-decoration: none;
      margin-bottom: 0.5rem;
      transition: color 0.2s;
    }

    .footer-section a:hover {
      color: white;
    }

    .footer-bottom {
      border-top: 1px solid #374151;
      padding: 1rem;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .nav {
        display: none;
      }

      .mobile-menu-toggle {
        display: block;
      }

      .search-container {
        display: none;
      }

      .header-content {
        gap: 1rem;
      }
    }

    @media (max-width: 480px) {
      .user-actions {
        gap: 0.5rem;
      }

      .action-link {
        width: 36px;
        height: 36px;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private appStateService = inject(AppStateService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // Observables
  currentUser$ = this.authService.currentUser$;
  loading$ = this.authService.loading$;
  sidebarCollapsed$ = this.appStateService.sidebarCollapsed$;
  cartItemCount$ = this.cartService.cartItems$.pipe(
    map(items => items.reduce((total, item) => total + item.quantity, 0))
  );
  unreadNotificationsCount$ = this.appStateService.unreadNotificationsCount$;

  // Local state
  searchQuery = '';
  userMenuOpen = false;
  mobileMenuOpen = false;

  ngOnInit(): void {
    // Close mobile menu on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileMenuOpen = false;
    });

    // Close user menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.userMenuOpen = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/app/search'], {
        queryParams: { q: this.searchQuery.trim() }
      });
      this.searchQuery = '';
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.userMenuOpen = false;
        this.router.navigate(['/']);
        this.appStateService.addNotification({
          type: 'success',
          title: 'Logged Out',
          message: 'You have been successfully logged out.'
        });
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.appStateService.addNotification({
          type: 'error',
          title: 'Logout Failed',
          message: 'There was an error logging out. Please try again.'
        });
      }
    });
  }
} 