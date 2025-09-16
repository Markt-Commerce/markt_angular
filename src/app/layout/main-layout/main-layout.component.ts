import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AppStateService } from '../../core/services/app-state.service';
import { CartService } from '../../core/services/cart.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { map } from 'rxjs/operators';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { FeatureFlagService } from '../../core/services/feature-flags.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, ButtonComponent, BreadcrumbsComponent, IconComponent],
  template: `
    <div class="app-container" [class.sidebar-collapsed]="sidebarCollapsed$ | async">
      <!-- Header -->
      <header class="header" [class.header-compact]="compactHeader">
        <a class="skip-link" href="#main-content">Skip to content</a>
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <a routerLink="/" class="logo-link">
              <img src="/markt-text-logo.png" alt="Markt" class="h-16 lg:h-20 xl:h-24 w-auto object-contain drop-shadow-lg">
            </a>
          </div>

          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-bar">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search products, sellers, or categories..."
                class="search-input"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
              >
              <button class="search-button" (click)="onSearch()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="nav">
            <a routerLink="/app/marketplace" routerLinkActive="active" class="nav-link">
              <app-icon name="shopping-bag" size="5" className="mr-1"></app-icon>
              <span>Marketplace</span>
            </a>
            
            <!-- Smart Dashboard Link (adapts based on user role) -->
            <!-- Dashboard link moved to user dropdown to reduce header clutter -->
            
            <a routerLink="/app/community/feed" routerLinkActive="active" class="nav-link">
              <app-icon name="chat" size="5" className="mr-1"></app-icon>
              <span>Feed</span>
            </a>
            
            <a routerLink="/app/community" routerLinkActive="active" class="nav-link">
              <app-icon name="users" size="5" className="mr-1"></app-icon>
              <span>Community</span>
            </a>
            
            <a routerLink="/app/requests" routerLinkActive="active" class="nav-link">
              <app-icon name="search" size="5" className="mr-1"></app-icon>
              <span>Requests</span>
            </a>
            
            <a routerLink="/app/chat" routerLinkActive="active" class="nav-link">
              <app-icon name="chat" size="5" className="mr-1"></app-icon>
              <span>Messages</span>
            </a>
            
                         <a routerLink="/app/offers" routerLinkActive="active" class="nav-link">
              <app-icon name="shopping-bag" size="5" className="mr-1"></app-icon>
              <span>Offers</span>
            </a>
            @if (access.isSeller) {
              <a routerLink="/app/seller/listings" routerLinkActive="active" class="nav-link">
              <app-icon name="shopping-bag" size="5" className="mr-1"></app-icon>
                <span>Listings</span>
              </a>
            }
          </nav>

          <!-- User Actions -->
          <div class="user-actions">
            <button class="action-link search-trigger" (click)="openSearchOverlay()" aria-label="Search" title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <!-- Role pill + switch -->
            @if (currentUser$ | async; as user) {
              <span class="role-pill">{{ (user.current_role || 'user') | titlecase }}</span>
              @if (user.is_buyer && user.is_seller) {
                <button class="role-switch" [disabled]="switchingRole" (click)="switchRole()" [title]="switchingRole ? 'Switching...' : 'Switch role'">{{ switchingRole ? 'Switching...' : 'Switch' }}</button>
              }
            }

            <!-- Cart -->
            <a routerLink="/app/cart" class="action-link cart-link" [class.has-items]="(cartItemCount$ | async) ?? 0 > 0" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" role="img" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              @if ((cartItemCount$ | async) ?? 0 > 0) {
                <span class="cart-count">{{ cartItemCount$ | async }}</span>
              }
            </a>

            <!-- Notifications -->
            <a routerLink="/app/notifications" class="action-link" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" role="img" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              @if ((unreadNotificationsCount$ | async) ?? 0 > 0) {
                <span class="notification-badge">{{ unreadNotificationsCount$ | async }}</span>
              }
            </a>

            <!-- User Menu -->
            @if (currentUser$ | async; as user) {
              <div class="user-menu">
                <button class="user-avatar" type="button" (click)="toggleUserMenu()" [attr.aria-expanded]="userMenuOpen" aria-haspopup="menu" aria-controls="user-dropdown">
                  @if (user.profile_picture_url) {
                    <img [src]="user.profile_picture_url" [alt]="user.username" class="avatar-img">
                  }
                  @if (!user.profile_picture_url) {
                    <div class="avatar-placeholder" aria-hidden="true">
                      {{ (user.username || 'U').charAt(0).toUpperCase() }}
                    </div>
                  }
                </button>
              
              <div id="user-dropdown" class="user-dropdown" [class.open]="userMenuOpen">
                <div class="dropdown-header">
                  <strong>{{ user.username }}</strong>
                  <small>{{ user.email }}</small>
                  @if (user.is_buyer && user.is_seller) {
                    <div class="role-segment" role="tablist" aria-label="Switch role">
                      <button type="button" class="segment-btn" [class.active]="access.role === 'buyer'" role="tab" [attr.aria-selected]="access.role === 'buyer'" (click)="switchRoleTo('buyer')">Buyer</button>
                      <button type="button" class="segment-btn" [class.active]="access.role === 'seller'" role="tab" [attr.aria-selected]="access.role === 'seller'" (click)="switchRoleTo('seller')">Seller</button>
                    </div>
                  }
                </div>
                <a routerLink="/app/dashboard" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Dashboard
                </a>
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
                <a routerLink="/app/seller/listings" class="dropdown-item">
                  @if (access.isSeller) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                      <line x1="7" y1="8" x2="17" y2="8"></line>
                      <line x1="7" y1="12" x2="17" y2="12"></line>
                      <line x1="7" y1="16" x2="13" y2="16"></line>
                    </svg>
                    Listings
                  } @else {
                    <span class="text-gray-400">Listings (seller only)</span>
                  }
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
            } @else {
              <app-button variant="primary" size="sm" (clicked)="goToLogin()">
                Sign In
              </app-button>
            }

            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" [attr.aria-expanded]="mobileMenuOpen" aria-controls="app-mobile-menu" aria-label="Toggle menu">
              @if (!mobileMenuOpen) {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              }
              @if (mobileMenuOpen) {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              }
            </button>
          </div>
        </div>
      </header>

      <!-- Breadcrumbs -->
      <app-breadcrumbs></app-breadcrumbs>

      <!-- Beta banner (feature-flagged) -->
      @if (flags.isEnabled('beta_banner')) {
        <div class="mx-auto max-w-6xl px-4 lg:px-8 py-2 text-center text-sm bg-gradient-to-r from-markt-primary/10 to-markt-accent/10 text-markt-dark border border-markt-border/40 rounded-xl mt-2">
          You're using the new navigation. Share feedback anytime!
        </div>
      }

      <!-- Mobile Menu -->
      <div class="mobile-menu-backdrop" [class.open]="mobileMenuOpen || searchOverlayOpen" (click)="mobileMenuOpen ? toggleMobileMenu() : closeSearchOverlay()"></div>
      <div id="app-mobile-menu" class="mobile-menu" [class.open]="mobileMenuOpen" (keydown)="onMobileMenuKeydown($event)">
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
            <app-icon name="shopping-bag" size="5" className="mr-2"></app-icon>
            Marketplace
          </a>
          
          <!-- Smart Dashboard Link (adapts based on user role) -->
          <a routerLink="/app/dashboard" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <app-icon name="search" size="5" className="mr-2"></app-icon>
            Dashboard
          </a>
          
          <a routerLink="/app/community" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <app-icon name="users" size="5" className="mr-2"></app-icon>
            Community
          </a>
          <a routerLink="/app/offers" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <app-icon name="shopping-bag" size="5" className="mr-2"></app-icon>
            Offers
          </a>
          <a routerLink="/app/cart" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <app-icon name="shopping-bag" size="5" className="mr-2"></app-icon>
            Cart
          </a>
          <a routerLink="/app/notifications" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <app-icon name="chat" size="5" className="mr-2"></app-icon>
            Notifications
          </a>
        </nav>
      </div>

      <!-- Global Search Overlay -->
      <div class="search-overlay" [class.open]="searchOverlayOpen" role="dialog" aria-modal="true" aria-label="Global search" (keydown)="onOverlayKeydown($event)">
        <div class="search-overlay-content" tabindex="-1">
          <div class="search-input-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input #searchInputEl type="text" class="search-overlay-input" placeholder="Search products, sellers, or requests" [(ngModel)]="searchQuery" (keyup.enter)="onSearch(); closeSearchOverlay()"/>
            <button class="search-overlay-close" (click)="closeSearchOverlay()" aria-label="Close search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <p class="search-hint">Tip: Press / to search</p>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content" id="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom-left Quick Actions (Speed Dial) -->
      <div class="quick-actions">
        <input id="qa-toggle" type="checkbox" class="qa-toggle"/>
        <label for="qa-toggle" class="qa-fab" title="Quick actions">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </label>
        <div class="qa-menu">
          <a routerLink="/app/community/feed" class="qa-item" title="Feed">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 21V14h2v7h4v-7h2v7h4v-7h2v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"></path>
            </svg>
          </a>
          <a routerLink="/app/marketplace" class="qa-item" title="Marketplace">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </a>
          <a routerLink="/app/chat" class="qa-item" title="Messages">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1-4A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"></path>
            </svg>
          </a>
          <a routerLink="/app/requests/create" class="qa-item" title="New Request">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </a>
          @if (access.isSeller) {
            <a routerLink="/app/seller/listings/create" class="qa-item" title="New Listing">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </a>
          }
        </div>
      </div>
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
      border-bottom: 1px solid #e5dddc;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(232, 85, 48, 0.1);
      transition: all 0.2s ease;
    }

    .header-compact .header-content {
      height: 60px;
      padding: 0 0.75rem;
    }

    .header-compact .logo img { height: 44px !important; }
    .header-compact .action-link { width: 38px; height: 38px; }
    .header-compact .user-avatar { width: 38px; height: 38px; }

    .header-content {
      max-width: 100%;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      height: 72px;
    }

    .logo {
      flex: 0 0 auto;
    }

    .logo-link {
      text-decoration: none;
      color: #181211;
      display: flex;
      align-items: center;
      transition: transform 0.2s;
    }

    .logo-link:hover {
      transform: scale(1.05);
    }

    .logo-icon {
      margin-right: 0.75rem;
      color: #e85530;
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 800;
      background: linear-gradient(135deg, #e85530 0%, #d14520 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Search */
    .search-container {
      flex: 1 1 auto;
      max-width: 720px;
      min-width: 240px;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: #886a63;
      z-index: 10;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-left: 2.75rem;
      padding-right: 3rem;
      border: 2px solid #e5dddc;
      border-radius: 12px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
      background: #f4f1f0;
      color: #181211;
    }

    .search-input:focus {
      border-color: #e85530;
      box-shadow: 0 0 0 3px rgba(232, 85, 48, 0.1);
      background: white;
    }

    .search-input::placeholder {
      color: #886a63;
    }

    .search-button {
      position: absolute;
      right: 0.5rem;
      background: none;
      border: none;
      color: #886a63;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .search-button:hover {
      color: #e85530;
      background: rgba(232, 85, 48, 0.1);
    }

    /* Navigation */
    .nav {
      display: flex;
      gap: 0.5rem;
      flex: 0 0 auto;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      text-decoration: none;
      color: #886a63;
      border-radius: 10px;
      transition: all 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
      position: relative;
    }

    .nav-link:hover {
      color: #e85530;
      background: rgba(232, 85, 48, 0.1);
      transform: translateY(-1px);
    }

    .nav-link.active {
      color: #e85530;
      background: rgba(232, 85, 48, 0.15);
      font-weight: 600;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #e85530;
      border-radius: 1px;
    }

    /* User Actions */
    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: auto;
      flex: 0 0 auto;
    }

    .action-link {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      color: #886a63;
      border-radius: 12px;
      transition: all 0.2s;
      text-decoration: none;
      background: transparent;
    }

    .action-link:hover {
      color: #e85530;
      background: rgba(232, 85, 48, 0.1);
      transform: translateY(-1px);
    }

    .cart-link.has-items {
      color: #e85530;
    }

    .cart-count, .notification-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #e85530;
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(232, 85, 48, 0.3);
    }

    .role-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      background: #f4f1f0;
      color: #181211;
      font-size: 0.75rem;
      border: 1px solid #e5dddc;
      text-transform: capitalize;
    }

    .role-switch {
      margin-left: 0.25rem;
      font-size: 0.8rem;
      color: #e85530;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .role-switch:hover { text-decoration: underline; }

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      border: 2px solid #e5dddc;
      transition: all 0.2s;
      background: linear-gradient(135deg, #e85530 0%, #d14520 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .user-avatar:hover {
      border-color: #e85530;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(232, 85, 48, 0.3);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e85530 0%, #d14520 100%);
      color: white;
      font-weight: 700;
      font-size: 1.25rem;
      text-transform: uppercase;
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

    .mobile-menu-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.35);
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .mobile-menu-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Search overlay */
    .search-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1001;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
    }
    .search-overlay.open { opacity: 1; pointer-events: auto; }
    .search-overlay-content {
      width: min(800px, 92%);
      background: #fff;
      border: 1px solid #e5dddc;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      padding: 1rem;
    }
    .search-input-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .search-input-wrap svg { color: #886a63; }
    .search-overlay-input {
      flex: 1;
      height: 44px;
      border: 2px solid #e5dddc;
      border-radius: 10px;
      padding: 0 0.75rem;
      outline: none;
    }
    .search-overlay-input:focus { border-color: #e85530; box-shadow: 0 0 0 3px rgba(232,85,48,0.1); }
    .search-overlay-close { background: none; border: none; color: #6b7280; padding: 0.25rem; cursor: pointer; }
    .search-hint { margin: 0.5rem 0 0; color: #886a63; font-size: 0.85rem; }

    /* Restore mobile menu styles */
    .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
    .mobile-menu-header h3 { margin: 0; color: #1f2937; }
    .close-button { background: none; border: none; color: #6b7280; cursor: pointer; padding: 0.5rem; }
    .mobile-nav { padding: 0.5rem; }
    .mobile-nav-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: #374151; text-decoration: none; border-radius: 8px; transition: background-color 0.2s; font-size: 1rem; }
    .mobile-nav-link:hover { background: #f9fafb; }

    .skip-link { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
    .skip-link:focus { left: 8px; top: 8px; width: auto; height: auto; padding: 8px 12px; background: #fff; border: 2px solid #e85530; border-radius: 8px; z-index: 1100; }

    /* Main Content */
    .main-content {
      flex: 1;
      min-height: calc(100vh - 64px - 200px);
    }

    /* Quick Actions */
    .quick-actions {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 1100;
    }
    .qa-toggle { display: none; }
    .qa-fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e85530 0%, #d14520 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(232, 85, 48, 0.35);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .qa-fab:hover { transform: translateY(-2px); }
    .qa-menu {
      position: absolute;
      bottom: 70px;
      left: 0;
      display: flex;
      gap: 10px;
      flex-direction: column;
      opacity: 0;
      transform: translateY(10px);
      pointer-events: none;
      transition: all 0.2s ease;
    }
    .qa-item {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #181211;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(0,0,0,0.2);
      text-decoration: none;
    }
    .qa-item:hover { background: #e85530; }
    .qa-toggle:checked ~ .qa-menu {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

          /* Responsive */
      @media (max-width: 1024px) {
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
          gap: 0.75rem;
          height: 64px;
          padding: 0 1rem;
        }

        .user-actions {
          gap: 0.5rem;
        }

        .action-link {
          width: 40px;
          height: 40px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-width: 2px;
        }

        .logo img {
          height: 48px !important;
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
export class MainLayoutComponent implements OnInit, OnDestroy {

  flags = inject(FeatureFlagService);
  access = inject(AccessControlService);
  private authService = inject(AuthService);
  private appStateService = inject(AppStateService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // Observables
  currentUser$ = this.authService.currentUser$;
  loading$ = this.authService.loading$;
  sidebarCollapsed$ = this.appStateService.sidebarCollapsed$;
  cartItemCount$ = this.cartService.getCartItemCount$();

  unreadNotificationsCount$ = this.appStateService.getUnreadNotifications$();

  showNotification(type: string, message: string): void {
    this.appStateService.showNotification({
      type,
      message,
      duration: 5000
    });
  }

  // Local state
  searchQuery = '';
  userMenuOpen = false;
  mobileMenuOpen = false;
  switchingRole = false; // Added for role switching
  compactHeader = false;
  searchOverlayOpen = false;
  @ViewChild('searchInputEl') searchInputEl?: ElementRef<HTMLInputElement>;
  private lastSearchTrigger?: HTMLElement | null = null;
  private lastMobileTrigger?: HTMLElement | null = null;

  private keyHandler?: (e: KeyboardEvent) => void;
  private onScrollHandler?: () => void;
  private docClickHandler?: (e: Event) => void;

  ngOnInit(): void {
    // Close mobile menu on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileMenuOpen = false;
    });

    // Compact header on scroll
    let lastY = window.scrollY;
    this.onScrollHandler = () => {
      const currentY = window.scrollY;
      this.compactHeader = currentY > 20 && currentY >= lastY;
      lastY = currentY;
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });

    // Global key handler for '/'
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === '/' && !this.searchOverlayOpen) {
        e.preventDefault();
        this.openSearchOverlay();
      } else if (e.key === 'Escape') {
        if (this.userMenuOpen) this.userMenuOpen = false;
        if (this.mobileMenuOpen) this.mobileMenuOpen = false;
        if (this.searchOverlayOpen) this.closeSearchOverlay();
      } else if ((e.key === 'ArrowDown' || e.key === 'Enter') && this.userMenuOpen) {
        const dropdown = document.getElementById('user-dropdown');
        const first = dropdown?.querySelector<HTMLElement>('.dropdown-item, a, button');
        first?.focus();
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    // Close user menu when clicking outside
    this.docClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.userMenuOpen = false;
      }
    };
    document.addEventListener('click', this.docClickHandler);

    // Role switch immediate refresh hooks
    this.authService.roleSwitched$.subscribe(role => {
      // Refresh role-sensitive counters quietly
      this.cartItemCount$ = this.cartService.getCartItemCount$();
      // Could extend to offers/orders summaries here as needed
    });
  }

  ngOnDestroy(): void {
    if (this.onScrollHandler) window.removeEventListener('scroll', this.onScrollHandler as any);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
    if (this.docClickHandler) document.removeEventListener('click', this.docClickHandler);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/app/marketplace/search'], {
        queryParams: { q: this.searchQuery.trim() }
      });
      this.searchQuery = '';
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMobileMenu(): void {
    const willOpen = !this.mobileMenuOpen;
    if (willOpen) {
      this.lastMobileTrigger = document.activeElement as HTMLElement;
      this.mobileMenuOpen = true;
      setTimeout(() => {
        const first = document.querySelector<HTMLElement>('#app-mobile-menu .mobile-nav-link, #app-mobile-menu button');
        first?.focus();
      }, 0);
    } else {
      this.mobileMenuOpen = false;
      if (this.lastMobileTrigger) {
        setTimeout(() => this.lastMobileTrigger?.focus(), 0);
      }
    }
  }

  openSearchOverlay(): void {
    this.lastSearchTrigger = document.activeElement as HTMLElement;
    this.searchOverlayOpen = true;
    setTimeout(() => this.searchInputEl?.nativeElement?.focus(), 0);
  }

  closeSearchOverlay(): void {
    this.searchOverlayOpen = false;
    if (this.lastSearchTrigger) {
      setTimeout(() => this.lastSearchTrigger?.focus(), 0);
    }
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (!this.searchOverlayOpen) return;
    const container = (event.currentTarget as HTMLElement).querySelector('.search-overlay-content') as HTMLElement | null;
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
    if (event.key === 'Tab' && focusable.length) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        (last as HTMLElement).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        (first as HTMLElement).focus();
      }
    } else if (event.key === 'Escape') {
      this.closeSearchOverlay();
    }
  }

  onMobileMenuKeydown(event: KeyboardEvent): void {
    if (!this.mobileMenuOpen) return;
    const container = document.getElementById('app-mobile-menu');
    if (!container) return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
    if (event.key === 'Tab' && focusable.length) {
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === 'Escape') {
      this.toggleMobileMenu();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.userMenuOpen = false;
        this.router.navigate(['/landing']);
        this.appStateService.addNotification({
          type: 'success',
          message: 'You have been logged out.',
          id: Date.now().toString(),
          title: 'Logged out',
          is_read: false,
          created_at: new Date().toISOString()
        });
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.appStateService.addNotification({
          type: 'error',
          message: 'Failed to log out. Please try again.',
          id: Date.now().toString(),
          title: 'Error',
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    });
  }

  switchRoleTo(target: 'buyer' | 'seller'): void {
    if (this.access.role === target) return;
    this.switchingRole = true;
    this.authService.switchRole(target).subscribe({
      next: () => {
        this.userMenuOpen = false;
        this.cartItemCount$ = this.cartService.getCartItemCount$();
        this.appStateService.addNotification({
          type: 'success',
          message: `Switched to ${target.charAt(0).toUpperCase() + target.slice(1)} mode`,
          id: Date.now().toString(),
          title: 'Success',
          is_read: false,
          created_at: new Date().toISOString()
        });
      },
      error: (error: any) => {
        console.error('Switch role error:', error);
        this.appStateService.addNotification({
          type: 'error',
          message: 'Failed to switch role. Please try again.',
          id: Date.now().toString(),
          title: 'Error',
          is_read: false,
          created_at: new Date().toISOString()
        });
        this.switchingRole = false;
      },
      complete: () => {
        this.switchingRole = false;
      }
    });
  }

  switchRole(): void {
    this.switchingRole = true; // Set loading state
    const current = (this.access.role === 'buyer' ? 'buyer' : this.access.role === 'seller' ? 'seller' : null);
    const target = current === 'buyer' ? 'seller' : 'buyer';
    this.authService.switchRole(target).subscribe({
      next: () => {
        this.userMenuOpen = false;
        // Clear/refresh role-dependent UI
        this.cartItemCount$ = this.cartService.getCartItemCount$();
        this.appStateService.addNotification({
          type: 'success',
          message: `Switched to ${target.charAt(0).toUpperCase() + target.slice(1)} mode`,
          id: Date.now().toString(),
          title: 'Success',
          is_read: false,
          created_at: new Date().toISOString()
        });
      },
      error: (error: any) => {
        console.error('Switch role error:', error);
        this.appStateService.addNotification({
          type: 'error',
          message: 'Failed to switch role. Please try again.',
          id: Date.now().toString(),
          title: 'Error',
          is_read: false,
          created_at: new Date().toISOString()
        });
      },
      complete: () => {
        this.switchingRole = false; // Reset loading state
      }
    });
  }
} 