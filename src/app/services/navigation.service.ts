import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

export interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  isActive: boolean;
  badge?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);

  // Mobile menu state
  private mobileMenuOpen = signal<boolean>(false);

  // Navigation items
  navigationItems = signal<NavigationItem[]>([
    {
      label: 'Feed',
      route: '/feed',
      icon: 'ph-house',
      isActive: false,
    },
    {
      label: 'Marketplace',
      route: '/marketplace',
      icon: 'ph-shopping-bag',
      isActive: false,
    },
    {
      label: 'Chat',
      route: '/chat',
      icon: 'ph-chats-circle',
      isActive: false,
      badge: 3,
    },
    {
      label: 'Orders',
      route: '/my-orders',
      icon: 'ph-package',
      isActive: false,
    },
    {
      label: 'Profile',
      route: '/my-account',
      icon: 'ph-user-circle',
      isActive: false,
    },
  ]);

  // Mobile menu state getter
  isMobileMenuOpen() {
    return this.mobileMenuOpen();
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    this.mobileMenuOpen.update((current) => !current);
  }

  // Close mobile menu
  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  // Navigate to route
  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  // Navigation methods
  goToFeed() {
    this.navigateTo('/feed');
  }

  goToMarketplace() {
    this.navigateTo('/marketplace');
  }

  goToChat() {
    this.navigateTo('/chat');
  }

  goToCart() {
    this.navigateTo('/cart');
  }

  goToNotifications() {
    this.navigateTo('/notifications');
  }

  goToMyAccount() {
    this.navigateTo('/my-account');
  }

  goToSettings() {
    this.navigateTo('/settings');
  }
}
