/**
 * Application State Service (UI Layer)
 * 
 * CRITICAL PRINCIPLE: Observe, don't own.
 * 
 * This service is the composition layer for GLOBAL UI STATE only.
 * It does NOT own domain state (cart, notifications, orders, products, etc.).
 * 
 * Domain state lives in domain services:
 * - Auth state → AuthService
 * - Cart state → CartService
 * - Notifications → NotificationService
 * - Chat → ChatService
 * - etc.
 * 
 * This service may:
 * ✅ Expose computed aggregates from multiple domain services
 * ✅ Own UI-only state (theme, sidebar, mobile menu, loading overlays)
 * ✅ Provide read-only references to domain service signals
 * 
 * This service must NOT:
 * ❌ Duplicate domain state
 * ❌ Mutate domain state directly
 * ❌ Subscribe to and cache domain data
 */

import { Injectable, computed, signal, inject } from '@angular/core';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Layout mode
 */
export type LayoutMode = 'default' | 'compact' | 'comfortable';

/**
 * AppStateService - Global UI State Manager
 */
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // ============================================
  // UI State (Owned by this service)
  // ============================================
  
  /**
   * Global loading state
   * Used for full-page loading overlays
   */
  readonly isLoading = signal<boolean>(false);
  
  /**
   * Loading message (optional descriptive text)
   */
  readonly loadingMessage = signal<string>('');
  
  /**
   * Desktop sidebar open/closed state
   */
  readonly sidebarOpen = signal<boolean>(true);
  
  /**
   * Mobile menu open/closed state
   */
  readonly mobileMenuOpen = signal<boolean>(false);
  
  /**
   * Current theme
   */
  readonly theme = signal<Theme>('auto');
  
  /**
   * Layout density mode
   */
  readonly layoutMode = signal<LayoutMode>('default');
  
  /**
   * Notification toast queue (UI layer only)
   */
  readonly toasts = signal<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>>([]);
  
  /**
   * Active modal/dialog identifier
   */
  readonly activeModal = signal<string | null>(null);
  
  /**
   * Page title (for dynamic updates)
   */
  readonly pageTitle = signal<string>('Markt');
  
  /**
   * Breadcrumb items
   */
  readonly breadcrumbs = signal<Array<{ label: string; path?: string }>>([]);
  
  /**
   * Network connectivity status
   */
  readonly isOnline = signal<boolean>(true);
  
  /**
   * Search bar visibility (global search)
   */
  readonly searchBarVisible = signal<boolean>(false);
  
  /**
   * Quick action panel visibility
   */
  readonly quickActionsOpen = signal<boolean>(false);
  
  // ============================================
  // Computed UI State
  // ============================================
  
  /**
   * Derived: Is any blocking operation in progress?
   */
  readonly isBlocking = computed(() => 
    this.isLoading() || this.activeModal() !== null
  );
  
  /**
   * Derived: Should show offline banner?
   */
  readonly showOfflineBanner = computed(() => !this.isOnline());
  
  /**
   * Derived: Active toast count
   */
  readonly activeToastCount = computed(() => this.toasts().length);
  
  // ============================================
  // Domain Service References (Read-Only)
  // ============================================
  // These will be injected lazily when needed
  // Components should prefer injecting domain services directly
  // These are convenience accessors for cross-cutting concerns
  
  // NOTE: Actual domain service injection commented out to avoid circular deps
  // Uncomment and inject as needed once services are migrated
  
  // private authService = inject(AuthService);
  // private notificationService = inject(NotificationService);
  // private chatService = inject(ChatService);
  
  /**
   * EXAMPLE: Computed aggregate from multiple domain services
   * Uncomment once domain services are available
   */
  /*
  readonly totalUnreadCount = computed(() => {
    const notificationUnread = this.notificationService.unreadCount() ?? 0;
    const chatUnread = this.chatService.unreadConversationsCount() ?? 0;
    return notificationUnread + chatUnread;
  });
  
  readonly isAuthenticated = computed(() => 
    this.authService.isAuthenticated()
  );
  
  readonly currentUser = computed(() => 
    this.authService.user()
  );
  
  readonly currentRole = computed(() => 
    this.authService.currentRole()
  );
  */
  
  // ============================================
  // UI State Actions
  // ============================================
  
  /**
   * Initialize UI state from localStorage/preferences
   */
  initUIState(): void {
    // Load theme preference
    const savedTheme = localStorage.getItem('app_theme') as Theme;
    if (savedTheme) {
      this.theme.set(savedTheme);
    }
    
    // Load layout mode
    const savedLayout = localStorage.getItem('app_layout_mode') as LayoutMode;
    if (savedLayout) {
      this.layoutMode.set(savedLayout);
    }
    
    // Load sidebar state (desktop)
    const savedSidebarState = localStorage.getItem('app_sidebar_open');
    if (savedSidebarState !== null) {
      this.sidebarOpen.set(savedSidebarState === 'true');
    }
    
    // Setup network status listener
    this.setupNetworkListeners();
    
  }
  
  /**
   * Reset UI state to defaults (used on logout)
   */
  resetUIState(): void {
    this.isLoading.set(false);
    this.loadingMessage.set('');
    this.mobileMenuOpen.set(false);
    this.toasts.set([]);
    this.activeModal.set(null);
    this.pageTitle.set('Markt');
    this.breadcrumbs.set([]);
    this.searchBarVisible.set(false);
    this.quickActionsOpen.set(false);
    
    // Don't reset theme, sidebar, layoutMode (user preferences persist)
    
  }
  
  /**
   * Set loading state with optional message
   */
  setLoading(loading: boolean, message: string = ''): void {
    this.isLoading.set(loading);
    this.loadingMessage.set(message);
  }
  
  /**
   * Toggle sidebar (desktop)
   */
  toggleSidebar(): void {
    const newState = !this.sidebarOpen();
    this.sidebarOpen.set(newState);
    localStorage.setItem('app_sidebar_open', String(newState));
  }
  
  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }
  
  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  
  /**
   * Set theme and persist
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem('app_theme', theme);
    
    // Apply theme to document
    this.applyTheme(theme);
  }
  
  /**
   * Set layout mode and persist
   */
  setLayoutMode(mode: LayoutMode): void {
    this.layoutMode.set(mode);
    localStorage.setItem('app_layout_mode', mode);
  }
  
  /**
   * Show toast notification
   * Alias: showNotification for backwards compatibility
   */
  showToast(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast = { id, message, type, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => this.dismissToast(id), duration);
    }
  }
  
  /**
   * Dismiss toast by ID
   */
  dismissToast(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
  
  /**
   * Clear all toasts
   */
  clearToasts(): void {
    this.toasts.set([]);
  }
  
  /**
   * Show modal
   */
  showModal(modalId: string): void {
    this.activeModal.set(modalId);
  }
  
  /**
   * Close active modal
   */
  closeModal(): void {
    this.activeModal.set(null);
  }
  
  /**
   * Update page title
   */
  setPageTitle(title: string): void {
    this.pageTitle.set(title);
    document.title = `${title} | Markt`;
  }
  
  /**
   * Update breadcrumbs
   */
  setBreadcrumbs(breadcrumbs: Array<{ label: string; path?: string }>): void {
    this.breadcrumbs.set(breadcrumbs);
  }
  
  /**
   * Toggle search bar
   */
  toggleSearchBar(): void {
    this.searchBarVisible.set(!this.searchBarVisible());
  }
  
  /**
   * Toggle quick actions panel
   */
  toggleQuickActions(): void {
    this.quickActionsOpen.set(!this.quickActionsOpen());
  }
  
  /**
   * Backwards compatibility alias for showToast
   * Accepts old notification format: { type, message }
   */
  showNotification(notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }): void {
    this.showToast(notification.message, notification.type);
  }
  
  // ============================================
  // Private Helpers
  // ============================================
  
  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }
  
  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;
    
    // Initial state
    this.isOnline.set(navigator.onLine);
    
    // Listen for changes
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.showToast('Connection restored', 'success', 3000);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline.set(false);
      this.showToast('No internet connection', 'warning', 0); // Persistent
    });
  }
}

/**
 * Example usage in components:
 * 
 * ```ts
 * export class MyComponent {
 *   private appState = inject(AppStateService);
 *   
 *   // Read UI state
 *   isLoading = this.appState.isLoading;
 *   theme = this.appState.theme;
 *   
 *   // Mutate UI state
 *   toggleSidebar() {
 *     this.appState.toggleSidebar();
 *   }
 *   
 *   showSuccess() {
 *     this.appState.showToast('Success!', 'success');
 *   }
 * }
 * ```
 * 
 * For domain state, inject domain services directly:
 * 
 * ```ts
 * export class CartComponent {
 *   private cartService = inject(CartService);
 *   
 *   cart = this.cartService.cart; // Domain state
 *   totalPrice = this.cartService.totalPrice; // Domain computed
 * }
 * ```
 */

