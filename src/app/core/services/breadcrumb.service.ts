import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
  icon?: string;
  isClickable: boolean;
  isCurrentPage: boolean;
  metadata?: {
    id?: string;
    type?: 'product' | 'user' | 'order' | 'listing' | 'offer' | 'request' | 'chat';
    role?: 'buyer' | 'seller';
  };
}

export interface BreadcrumbStructuredData {
  '@context': string;
  '@type': string;
  itemListElement: BreadcrumbItemStructuredData[];
}

export interface BreadcrumbItemStructuredData {
  '@type': string;
  position: number;
  name: string;
  item: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private meta = inject(Meta);
  private title = inject(Title);
  
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  public breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  // Route configuration mapping for better breadcrumb labels
  private routeConfig: { [key: string]: { label: string; icon?: string; hide?: boolean } } = {
    'app': { label: 'Dashboard', icon: 'home' },
    'dashboard': { label: 'Dashboard', icon: 'home' },
    'marketplace': { label: 'Marketplace', icon: 'store' },
    'product': { label: 'Product', icon: 'box' },
    'product-detail': { label: 'Product Details', icon: 'box' },
    'search': { label: 'Search Results', icon: 'search' },
    'community': { label: 'Community', icon: 'users' },
    'social-feed': { label: 'Social Feed', icon: 'stream' },
    'feed': { label: 'Feed', icon: 'stream' },
    'post': { label: 'Post', icon: 'file-text' },
    'profile': { label: 'Profile', icon: 'user' },
    'edit': { label: 'Edit Profile', icon: 'edit' },
    'user': { label: 'User Profile', icon: 'user' },
    'orders': { label: 'Orders', icon: 'receipt' },
    'history': { label: 'Order History', icon: 'history' },
    'track': { label: 'Track Order', icon: 'truck' },
    'offers': { label: 'Offers', icon: 'tag' },
    'create': { label: 'Create Offer', icon: 'plus' },
    'make': { label: 'Make Offer', icon: 'handshake' },
    'requests': { label: 'Requests', icon: 'clipboard' },
    'chat': { label: 'Messages', icon: 'comments' },
    'cart': { label: 'Shopping Cart', icon: 'shopping-cart' },
    'checkout': { label: 'Checkout', icon: 'credit-card' },
    'confirmation': { label: 'Order Confirmation', icon: 'check-circle' },
    'settings': { label: 'Settings', icon: 'cog' },
    'account': { label: 'Account Settings', icon: 'user-cog' },
    'notifications': { label: 'Notifications', icon: 'bell' },
    'privacy': { label: 'Privacy Settings', icon: 'shield' },
    'shipping': { label: 'Shipping Settings', icon: 'truck' },
    'preferences': { label: 'Preferences', icon: 'sliders' },
    'seller': { label: 'Seller Tools', icon: 'store' },
    'listings': { label: 'My Listings', icon: 'list' },
    'analytics': { label: 'Analytics', icon: 'chart-line' },
    'shops': { label: 'Shops', icon: 'store' },
    'social': { label: 'Social', icon: 'users' },
    'stories': { label: 'Stories', icon: 'camera' },
    'admin': { label: 'Admin Panel', icon: 'shield' }
  };

  constructor() {
    this.initializeBreadcrumbs();
  }

  private initializeBreadcrumbs(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        distinctUntilChanged()
      )
      .subscribe(route => {
        const breadcrumbs = this.createBreadcrumbs(route);
        this.breadcrumbsSubject.next(breadcrumbs);
        this.updateSeoData(breadcrumbs);
      });
  }

  private createBreadcrumbs(route: ActivatedRoute): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    const urlSegments: string[] = [];
    let currentRoute = route;
    let currentUrl = '';

    // Build URL segments from route hierarchy
    while (currentRoute) {
      const routeConfig = currentRoute.snapshot;
      const path = routeConfig.url.map(segment => segment.path).join('/');
      
      if (path) {
        urlSegments.push(path);
        currentUrl += `/${path}`;
        
        // Get route data for custom labels
        const routeData = routeConfig.data;
        const params = routeConfig.params;
        
        // Check if breadcrumbs should be hidden for this route
        if (routeData['hideBreadcrumbs']) {
          return [];
        }

        const breadcrumbItem = this.createBreadcrumbItem(
          path, 
          currentUrl, 
          routeData, 
          params,
          urlSegments
        );
        
        if (breadcrumbItem) {
          breadcrumbs.push(breadcrumbItem);
        }
      }
      
      currentRoute = currentRoute.parent!;
    }

    // Reverse to get correct order (root to current)
    const reversedBreadcrumbs = breadcrumbs.reverse();
    
    // If no breadcrumbs were generated (e.g., for dashboard), add a default one
    if (reversedBreadcrumbs.length === 0) {
      reversedBreadcrumbs.push({
        label: 'Dashboard',
        url: '/app/dashboard',
        icon: 'home',
        isClickable: false,
        isCurrentPage: true,
        metadata: {}
      });
    } else {
      // Mark the last item as current page and non-clickable
      reversedBreadcrumbs[reversedBreadcrumbs.length - 1].isCurrentPage = true;
      reversedBreadcrumbs[reversedBreadcrumbs.length - 1].isClickable = false;
    }
    
    return reversedBreadcrumbs;
  }

  private createBreadcrumbItem(
    path: string, 
    url: string, 
    routeData: any, 
    params: any,
    urlSegments: string[]
  ): BreadcrumbItem | null {
    
    // Skip certain paths that shouldn't appear in breadcrumbs
    if (this.shouldSkipPath(path)) {
      return null;
    }

    const config = this.routeConfig[path];
    let label = config?.label || this.formatLabel(path);
    let icon = config?.icon;
    let metadata: any = {};

    // Handle dynamic segments with IDs
    if (params['id']) {
      metadata.id = params['id'];
      
      // Determine type based on context
      if (path === 'product' || path === 'product-detail') {
        metadata.type = 'product';
        label = `Product #${params['id']}`;
      } else if (path === 'user') {
        metadata.type = 'user';
        label = `User #${params['id']}`;
      } else if (path === 'post') {
        metadata.type = 'post';
        label = `Post #${params['id']}`;
      } else if (path === 'edit' && urlSegments.includes('listings')) {
        metadata.type = 'listing';
        label = `Edit Listing #${params['id']}`;
      } else if (path === 'make' && urlSegments.includes('offers')) {
        metadata.type = 'offer';
        label = `Make Offer #${params['id']}`;
      } else if (path === 'track' && urlSegments.includes('orders')) {
        metadata.type = 'order';
        label = `Track Order #${params['id']}`;
      } else {
        label = `${label} #${params['id']}`;
      }
    }

    // Handle special cases
    if (path === 'confirmation' && params['id']) {
      metadata.type = 'order';
      label = `Order Confirmation #${params['id']}`;
    }

    // Add role context for seller routes
    if (url.includes('/seller/')) {
      metadata.role = 'seller';
    } else if (url.includes('/cart') || url.includes('/checkout') || url.includes('/orders')) {
      metadata.role = 'buyer';
    }

    return {
      label,
      url,
      icon,
      isClickable: true, // All items are clickable except the last one
      isCurrentPage: false, // Will be updated in the calling method
      metadata
    };
  }

  private shouldSkipPath(path: string): boolean {
    const skipPaths = ['', 'app', 'auth', 'landing', 'onboarding'];
    return skipPaths.includes(path);
  }

  private formatLabel(path: string): string {
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Public method to manually set breadcrumbs (useful for dynamic content)
  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  // Method to get current breadcrumbs synchronously
  getCurrentBreadcrumbs(): BreadcrumbItem[] {
    return this.breadcrumbsSubject.value;
  }

  // Method to add a custom breadcrumb item
  addBreadcrumb(item: BreadcrumbItem): void {
    const current = this.getCurrentBreadcrumbs();
    const updated = [...current, item];
    this.breadcrumbsSubject.next(updated);
  }

  // Method to clear breadcrumbs
  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([]);
  }

  /**
   * Update SEO data including structured data, meta tags, and page title
   * @param breadcrumbs - Array of breadcrumb items
   */
  private updateSeoData(breadcrumbs: BreadcrumbItem[]): void {
    if (breadcrumbs.length === 0) return;

    try {
      this.updateStructuredData(breadcrumbs);
      this.updateMetaTags(breadcrumbs);
      this.updatePageTitle(breadcrumbs);
    } catch (error) {
      console.warn('Failed to update SEO data:', error);
    }
  }

  /**
   * Update structured data for search engines
   * @param breadcrumbs - Array of breadcrumb items
   */
  private updateStructuredData(breadcrumbs: BreadcrumbItem[]): void {
    const structuredData: BreadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.label,
        item: `${window.location.origin}${breadcrumb.url}`
      }))
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  /**
   * Update meta tags for SEO
   * @param breadcrumbs - Array of breadcrumb items
   */
  private updateMetaTags(breadcrumbs: BreadcrumbItem[]): void {
    const currentPage = breadcrumbs[breadcrumbs.length - 1];
    const breadcrumbPath = breadcrumbs.map(b => b.label).join(' > ');

    // Update breadcrumb meta tag
    this.meta.updateTag({
      name: 'breadcrumb',
      content: breadcrumbPath
    });

    // Update page hierarchy meta tag
    this.meta.updateTag({
      name: 'page-hierarchy',
      content: breadcrumbs.map(b => b.label).join(',')
    });

    // Update current page meta tag
    this.meta.updateTag({
      name: 'current-page',
      content: currentPage.label
    });

    // Update Open Graph tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: `${currentPage.label} - Markt`
    });

    this.meta.updateTag({
      property: 'og:description',
      content: `Navigate to ${currentPage.label} on Markt - ${breadcrumbPath}`
    });
  }

  /**
   * Update page title
   * @param breadcrumbs - Array of breadcrumb items
   */
  private updatePageTitle(breadcrumbs: BreadcrumbItem[]): void {
    const currentPage = breadcrumbs[breadcrumbs.length - 1];
    const title = `${currentPage.label} - Markt`;
    this.title.setTitle(title);
  }

  /**
   * Get current breadcrumb path for analytics
   * @returns Breadcrumb path as string
   */
  getCurrentBreadcrumbPath(): string {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    return currentBreadcrumbs.map(b => b.label).join(' > ');
  }

  /**
   * Get breadcrumb depth for analytics
   * @returns Number representing breadcrumb depth
   */
  getBreadcrumbDepth(): number {
    return this.getCurrentBreadcrumbs().length;
  }
}

