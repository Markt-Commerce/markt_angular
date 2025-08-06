import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { 
  Product, 
  Cart, 
  CartItem, 
  Notification, 
  User,
  Category,
  Niche,
  Post,
  BuyerRequest,
  Order,
  Payment,
  ChatRoom,
  ChatMessage
} from '../models';

export interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  currentRole: 'buyer' | 'seller' | null;
  
  // Cart & Shopping
  cart: Cart | null;
  cartItemCount: number;
  cartTotal: number;
  
  // Notifications
  notifications: Notification[];
  unreadNotifications: number;
  
  // UI State
  isLoading: boolean;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Search & Filters
  searchQuery: string;
  activeFilters: Record<string, any>;
  
  // Navigation
  currentRoute: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  
  // Modals & Overlays
  activeModal: string | null;
  activeOverlay: string | null;
  
  // Theme & Preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  
  // Cached Data
  categories: Category[];
  niches: Niche[];
  recentProducts: Product[];
  recentSearches: string[];
  
  // Real-time Updates
  lastUpdate: Date;
  isOnline: boolean;
}

const initialState: AppState = {
  // User & Auth
  user: null,
  isAuthenticated: false,
  currentRole: null,
  
  // Cart & Shopping
  cart: null,
  cartItemCount: 0,
  cartTotal: 0,
  
  // Notifications
  notifications: [],
  unreadNotifications: 0,
  
  // UI State
  isLoading: false,
  sidebarOpen: false,
  mobileMenuOpen: false,
  
  // Search & Filters
  searchQuery: '',
  activeFilters: {},
  
  // Navigation
  currentRoute: '',
  breadcrumbs: [],
  
  // Modals & Overlays
  activeModal: null,
  activeOverlay: null,
  
  // Theme & Preferences
  theme: 'light',
  language: 'en',
  
  // Cached Data
  categories: [],
  niches: [],
  recentProducts: [],
  recentSearches: [],
  
  // Real-time Updates
  lastUpdate: new Date(),
  isOnline: navigator.onLine
};

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  
  private stateSubject = new BehaviorSubject<AppState>(initialState);
  public state$ = this.stateSubject.asObservable();

  constructor() {
    this.initializeState();
    this.setupSubscriptions();
    this.setupNetworkListener();
  }

  // ============================================================================
  // STATE SELECTORS
  // ============================================================================

  /**
   * Get current state
   */
  getState(): AppState {
    return this.stateSubject.value;
  }

  /**
   * Get user state
   */
  getUser$(): Observable<User | null> {
    return this.state$.pipe(
      map(state => state.user),
      distinctUntilChanged()
    );
  }

  /**
   * Get authentication state
   */
  getAuthState$(): Observable<{ user: User | null; isAuthenticated: boolean }> {
    return this.state$.pipe(
      map(state => ({ user: state.user, isAuthenticated: state.isAuthenticated })),
      distinctUntilChanged()
    );
  }

  /**
   * Get current role
   */
  getCurrentRole$(): Observable<'buyer' | 'seller' | null> {
    return this.state$.pipe(
      map(state => state.currentRole),
      distinctUntilChanged()
    );
  }

  /**
   * Get cart state
   */
  getCart$(): Observable<Cart | null> {
    return this.state$.pipe(
      map(state => state.cart),
      distinctUntilChanged()
    );
  }

  /**
   * Get cart summary
   */
  getCartSummary$(): Observable<{ itemCount: number; total: number }> {
    return this.state$.pipe(
      map(state => ({ itemCount: state.cartItemCount, total: state.cartTotal })),
      distinctUntilChanged()
    );
  }

  /**
   * Get notifications
   */
  getNotifications$(): Observable<Notification[]> {
    return this.state$.pipe(
      map(state => state.notifications),
      distinctUntilChanged()
    );
  }

  /**
   * Get unread notification count
   */
  getUnreadNotifications$(): Observable<number> {
    return this.state$.pipe(
      map(state => state.unreadNotifications),
      distinctUntilChanged()
    );
  }

  /**
   * Get loading state
   */
  getLoading$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.isLoading),
      distinctUntilChanged()
    );
  }

  /**
   * Get UI state
   */
  getUIState$(): Observable<{ sidebarOpen: boolean; mobileMenuOpen: boolean }> {
    return this.state$.pipe(
      map(state => ({ sidebarOpen: state.sidebarOpen, mobileMenuOpen: state.mobileMenuOpen })),
      distinctUntilChanged()
    );
  }

  /**
   * Get search state
   */
  getSearchState$(): Observable<{ query: string; filters: Record<string, any> }> {
    return this.state$.pipe(
      map(state => ({ query: state.searchQuery, filters: state.activeFilters })),
      distinctUntilChanged()
    );
  }

  /**
   * Get cached data
   */
  getCachedData$(): Observable<{ categories: Category[]; niches: Niche[]; recentProducts: Product[] }> {
    return this.state$.pipe(
      map(state => ({ 
        categories: state.categories, 
        niches: state.niches, 
        recentProducts: state.recentProducts 
      })),
      distinctUntilChanged()
    );
  }

  // ============================================================================
  // STATE ACTIONS
  // ============================================================================

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  /**
   * Set user
   */
  setUser(user: User | null): void {
    this.updateState({ 
      user, 
      isAuthenticated: !!user,
      currentRole: user?.current_role || null
    });
  }

  /**
   * Set cart
   */
  setCart(cart: Cart | null): void {
    const cartItemCount = cart?.total_items || 0;
    const cartTotal = cart?.subtotal || 0;
    
    this.updateState({ 
      cart, 
      cartItemCount, 
      cartTotal 
    });
  }

  /**
   * Add item to cart
   */
  addToCart(item: CartItem): void {
    const currentState = this.getState();
    const currentCart = currentState.cart;
    
    if (currentCart) {
      const existingItem = currentCart.items.find(cartItem => 
        cartItem.product_id === item.product_id && cartItem.variant_id === item.variant_id
      );
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        currentCart.items.push(item);
      }
      
      currentCart.total_items = currentCart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      currentCart.subtotal = currentCart.items.reduce((sum, cartItem) => sum + (cartItem.product_price * cartItem.quantity), 0);
      
      this.setCart(currentCart);
    }
  }

  /**
   * Remove item from cart
   */
  removeFromCart(itemId: string): void {
    const currentState = this.getState();
    const currentCart = currentState.cart;
    
    if (currentCart) {
      currentCart.items = currentCart.items.filter(item => item.id !== itemId);
      currentCart.total_items = currentCart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      currentCart.subtotal = currentCart.items.reduce((sum, cartItem) => sum + (cartItem.product_price * cartItem.quantity), 0);
      
      this.setCart(currentCart);
    }
  }

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity(itemId: string, quantity: number): void {
    const currentState = this.getState();
    const currentCart = currentState.cart;
    
    if (currentCart) {
      const item = currentCart.items.find(cartItem => cartItem.id === itemId);
      if (item) {
        item.quantity = quantity;
        currentCart.total_items = currentCart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
        currentCart.subtotal = currentCart.items.reduce((sum, cartItem) => sum + (cartItem.product_price * cartItem.quantity), 0);
        
        this.setCart(currentCart);
      }
    }
  }

  /**
   * Set notifications
   */
  setNotifications(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    this.updateState({ notifications, unreadNotifications: unreadCount });
  }

  /**
   * Add notification
   */
  addNotification(notification: Notification): void {
    const currentState = this.getState();
    const notifications = [notification, ...currentState.notifications];
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    this.updateState({ notifications, unreadNotifications: unreadCount });
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    const currentState = this.getState();
    const updatedNotifications = currentState.notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    this.updateState({ notifications: updatedNotifications });
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar(): void {
    const currentState = this.getState();
    this.updateState({ sidebarOpen: !currentState.sidebarOpen });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    const currentState = this.getState();
    this.updateState({ mobileMenuOpen: !currentState.mobileMenuOpen });
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.updateState({ searchQuery: query });
    this.addRecentSearch(query);
  }

  /**
   * Set active filters
   */
  setActiveFilters(filters: Record<string, any>): void {
    this.updateState({ activeFilters: filters });
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.updateState({ activeFilters: {} });
  }

  /**
   * Set current route
   */
  setCurrentRoute(route: string): void {
    this.updateState({ currentRoute: route });
  }

  /**
   * Set breadcrumbs
   */
  setBreadcrumbs(breadcrumbs: Array<{ label: string; path: string }>): void {
    this.updateState({ breadcrumbs });
  }

  /**
   * Open modal
   */
  openModal(modalId: string): void {
    this.updateState({ activeModal: modalId });
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.updateState({ activeModal: null });
  }

  /**
   * Open overlay
   */
  openOverlay(overlayId: string): void {
    this.updateState({ activeOverlay: overlayId });
  }

  /**
   * Close overlay
   */
  closeOverlay(): void {
    this.updateState({ activeOverlay: null });
  }

  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.updateState({ theme });
    localStorage.setItem('markt_theme', theme);
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.updateState({ language });
    localStorage.setItem('markt_language', language);
  }

  /**
   * Set categories
   */
  setCategories(categories: Category[]): void {
    this.updateState({ categories });
  }

  /**
   * Set niches
   */
  setNiches(niches: Niche[]): void {
    this.updateState({ niches });
  }

  /**
   * Add recent product
   */
  addRecentProduct(product: Product): void {
    const currentState = this.getState();
    const recentProducts = [product, ...currentState.recentProducts.filter(p => p.id !== product.id)].slice(0, 10);
    this.updateState({ recentProducts });
  }

  /**
   * Add recent search
   */
  addRecentSearch(search: string): void {
    if (!search.trim()) return;
    
    const currentState = this.getState();
    const recentSearches = [search, ...currentState.recentSearches.filter(s => s !== search)].slice(0, 10);
    this.updateState({ recentSearches });
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.updateState({ recentSearches: [] });
  }

  /**
   * Update last update time
   */
  updateLastUpdate(): void {
    this.updateState({ lastUpdate: new Date() });
  }

  /**
   * Show notification
   */
  showNotification(notification: { type: string; message: string; duration?: number }): void {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Info',
      message: notification.message,
      type: notification.type,
      is_read: false,
      created_at: new Date().toISOString(),
      duration: notification.duration || 5000
    };

    const currentState = this.getState();
    const currentNotifications = currentState.notifications;
    
    this.updateState({
      notifications: [...currentNotifications, newNotification]
    });

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, newNotification.duration);
  }

  /**
   * Remove notification
   */
  removeNotification(id: string): void {
    const currentState = this.getState();
    const currentNotifications = currentState.notifications;
    
    this.updateState({
      notifications: currentNotifications.filter(n => n.id !== id)
    });
  }

  /**
   * Sidebar collapsed state
   */
  get sidebarCollapsed$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.sidebarOpen),
      distinctUntilChanged()
    );
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize state from localStorage
   */
  private initializeState(): void {
    const theme = localStorage.getItem('markt_theme') as 'light' | 'dark' | 'auto' || 'light';
    const language = localStorage.getItem('markt_language') || 'en';
    const recentSearches = JSON.parse(localStorage.getItem('markt_recent_searches') || '[]');
    
    this.updateState({ theme, language, recentSearches });
  }

  /**
   * Setup subscriptions to external services
   */
  private setupSubscriptions(): void {
    // Subscribe to auth state changes
    this.authService.authState$.subscribe(authState => {
      this.setUser(authState.user);
    });

    // Subscribe to cart changes
    this.cartService.cart$.subscribe(cart => {
      this.setCart(cart);
    });
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      this.updateState({ isOnline: true });
    });

    window.addEventListener('offline', () => {
      this.updateState({ isOnline: false });
    });
  }

  /**
   * Update state with partial update
   */
  private updateState(partial: Partial<AppState>): void {
    const currentState = this.getState();
    const newState = { ...currentState, ...partial };
    this.stateSubject.next(newState);
  }

  /**
   * Save state to localStorage
   */
  private saveToLocalStorage(): void {
    const state = this.getState();
    localStorage.setItem('markt_recent_searches', JSON.stringify(state.recentSearches));
  }
} 