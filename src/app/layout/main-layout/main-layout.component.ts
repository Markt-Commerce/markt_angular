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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              <span>Marketplace</span>
            </a>
            
            <!-- Smart Dashboard Link (adapts based on user role) -->
            <a routerLink="/app/dashboard" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard</span>
            </a>
            
            <a routerLink="/app/community/feed" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 21V14h2v7h4v-7h2v7h4v-7h2v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>
                <path d="M9 2l3 3 3-3h3l-5 5v4H8V7L3 2h6z"/>
              </svg>
              <span>Feed</span>
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
            
            <a routerLink="/app/requests" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                <line x1="7" y1="8" x2="17" y2="8"></line>
                <line x1="7" y1="12" x2="17" y2="12"></line>
                <line x1="7" y1="16" x2="13" y2="16"></line>
              </svg>
              <span>Requests</span>
            </a>
            
            <a routerLink="/app/chat" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1-4A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"></path>
              </svg>
              <span>Messages</span>
            </a>
            
                         <a routerLink="/app/offers" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>Offers</span>
            </a>
            <a routerLink="/app/seller/listings" routerLinkActive="active" class="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                <line x1="7" y1="8" x2="17" y2="8"></line>
                <line x1="7" y1="12" x2="17" y2="12"></line>
                <line x1="7" y1="16" x2="13" y2="16"></line>
              </svg>
              <span>Listings</span>
            </a>
          </nav>

          <!-- User Actions -->
          <div class="user-actions">
            <!-- Cart -->
            <a routerLink="/app/cart" class="action-link cart-link" [class.has-items]="(cartItemCount$ | async) ?? 0 > 0" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" role="img" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span class="cart-count" *ngIf="(cartItemCount$ | async) ?? 0 > 0">{{ cartItemCount$ | async }}</span>
            </a>

            <!-- Notifications -->
            <a routerLink="/app/notifications" class="action-link" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" role="img" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notification-badge" *ngIf="(unreadNotificationsCount$ | async) ?? 0 > 0">{{ unreadNotificationsCount$ | async }}</span>
            </a>

            <!-- User Menu -->
            <div class="user-menu" *ngIf="currentUser$ | async as user; else loginButton">
              <div class="user-avatar" (click)="toggleUserMenu()">
                <img *ngIf="user.profile_picture_url" [src]="user.profile_picture_url" [alt]="user.username" class="avatar-img">
                <div *ngIf="!user.profile_picture_url" class="avatar-placeholder">
                  {{ (user.username || 'U').charAt(0).toUpperCase() }}
                </div>
              </div>
              
              <div class="user-dropdown" [class.open]="userMenuOpen">
                <div class="dropdown-header">
                  <strong>{{ user.username }}</strong>
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
                <a routerLink="/app/seller/listings" class="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                    <line x1="7" y1="8" x2="17" y2="8"></line>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="7" y1="16" x2="13" y2="16"></line>
                  </svg>
                  Listings
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
          
          <!-- Smart Dashboard Link (adapts based on user role) -->
          <a routerLink="/app/dashboard" (click)="toggleMobileMenu()" class="mobile-nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
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
    }

    .header-content {
      max-width: 100%;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
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
      width: 48px;
      height: 48px;
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

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      border: 3px solid #e5dddc;
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
          message: 'Item added to cart successfully!',
          id: Date.now().toString(),
          title: 'Success',
          is_read: false,
          created_at: new Date().toISOString()
        });
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.appStateService.addNotification({
          type: 'error',
          message: 'Failed to add item to cart. Please try again.',
          id: Date.now().toString(),
          title: 'Error',
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    });
  }
} 