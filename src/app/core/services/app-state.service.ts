import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AuthService, User } from './auth.service';
import { CartService } from './cart.service';
import { OrderService } from './order.service';

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  cartItemCount: number;
  pendingOrdersCount: number;
  activeOrdersCount: number;
  notifications: Notification[];
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export interface ThemeConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);

  // Core state subjects
  private userSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  private languageSubject = new BehaviorSubject<string>('en');
  private currencySubject = new BehaviorSubject<string>('NGN');
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  private mobileMenuOpenSubject = new BehaviorSubject<boolean>(false);

  // Computed state
  private appStateSubject = new BehaviorSubject<AppState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    cartItemCount: 0,
    pendingOrdersCount: 0,
    activeOrdersCount: 0,
    notifications: [],
    theme: 'light',
    language: 'en',
    currency: 'NGN',
    sidebarCollapsed: false,
    mobileMenuOpen: false
  });

  // Public observables
  public appState$ = this.appStateSubject.asObservable();
  public user$ = this.userSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public theme$ = this.themeSubject.asObservable();
  public language$ = this.languageSubject.asObservable();
  public currency$ = this.currencySubject.asObservable();
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();
  public mobileMenuOpen$ = this.mobileMenuOpenSubject.asObservable();

  // Computed observables
  public isAuthenticated$ = this.user$.pipe(
    map(user => !!user)
  );

  public cartItemCount$ = this.cartService.cartSummary$.pipe(
    map(summary => summary.total_items)
  );

  public pendingOrdersCount$ = this.orderService.orders$.pipe(
    map(orders => orders.filter(order => order.status === 'pending').length)
  );

  public activeOrdersCount$ = this.orderService.orders$.pipe(
    map(orders => orders.filter(order => 
      ['confirmed', 'processing', 'shipped'].includes(order.status)
    ).length)
  );

  public unreadNotificationsCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  constructor() {
    this.initializeState();
    this.setupStateSync();
  }

  /**
   * Initialize application state
   */
  private initializeState(): void {
    // Load user from auth service
    this.authService.currentUser$.subscribe(user => {
      this.userSubject.next(user);
    });

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.setTheme(savedTheme);
    }

    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.setLanguage(savedLanguage);
    }

    // Load currency from localStorage
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      this.setCurrency(savedCurrency);
    }

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState) {
      this.setSidebarCollapsed(savedSidebarState === 'true');
    }
  }

  /**
   * Setup state synchronization
   */
  private setupStateSync(): void {
    // Combine all state sources
    combineLatest([
      this.user$,
      this.isLoading$,
      this.cartItemCount$,
      this.pendingOrdersCount$,
      this.activeOrdersCount$,
      this.notifications$,
      this.theme$,
      this.language$,
      this.currency$,
      this.sidebarCollapsed$,
      this.mobileMenuOpen$
    ]).subscribe(([
      user,
      isLoading,
      cartItemCount,
      pendingOrdersCount,
      activeOrdersCount,
      notifications,
      theme,
      language,
      currency,
      sidebarCollapsed,
      mobileMenuOpen
    ]) => {
      this.appStateSubject.next({
        user,
        isAuthenticated: !!user,
        isLoading,
        cartItemCount,
        pendingOrdersCount,
        activeOrdersCount,
        notifications,
        theme,
        language,
        currency,
        sidebarCollapsed,
        mobileMenuOpen
      });
    });
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.isLoadingSubject.next(loading);
  }

  /**
   * Add notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([newNotification, ...currentNotifications]);

    // Auto-remove success/error notifications after 5 seconds
    if (['success', 'error'].includes(notification.type)) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, 5000);
    }
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Toggle theme
   */
  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.languageSubject.next(language);
    localStorage.setItem('language', language);
  }

  /**
   * Set currency
   */
  setCurrency(currency: string): void {
    this.currencySubject.next(currency);
    localStorage.setItem('currency', currency);
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    const currentState = this.sidebarCollapsedSubject.value;
    this.setSidebarCollapsed(!currentState);
  }

  /**
   * Set sidebar collapsed state
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    const currentState = this.mobileMenuOpenSubject.value;
    this.mobileMenuOpenSubject.next(!currentState);
  }

  /**
   * Set mobile menu state
   */
  setMobileMenuOpen(open: boolean): void {
    this.mobileMenuOpenSubject.next(open);
  }

  /**
   * Get current app state
   */
  get currentAppState(): AppState {
    return this.appStateSubject.value;
  }

  /**
   * Get current user
   */
  get currentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  /**
   * Get current theme
   */
  get currentTheme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }

  /**
   * Get current language
   */
  get currentLanguage(): string {
    return this.languageSubject.value;
  }

  /**
   * Get current currency
   */
  get currentCurrency(): string {
    return this.currencySubject.value;
  }

  /**
   * Get current notifications
   */
  get currentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get unread notifications count
   */
  get unreadNotificationsCount(): number {
    return this.currentNotifications.filter(n => !n.read).length;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clear all state (on logout)
   */
  clearState(): void {
    this.userSubject.next(null);
    this.notificationsSubject.next([]);
    this.mobileMenuOpenSubject.next(false);
  }

  /**
   * Reset to default state
   */
  resetToDefaults(): void {
    this.setTheme('light');
    this.setLanguage('en');
    this.setCurrency('NGN');
    this.setSidebarCollapsed(false);
    this.clearNotifications();
  }
} 