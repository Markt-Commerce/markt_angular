import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { NavigationService } from './services/navigation.service';
import { CartStore } from './stores/cart.store';
import { AuthService } from './services/http/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SearchBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  // Make navigationService public for template access
  public navigationService = inject(NavigationService);
  private cartStore = inject(CartStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  // User state
  userName = signal<string>('John Doe');
  userAvatar = signal<string | null>(null);
  userInitials = signal<string>('JD');

  // Notification counts
  unreadMessages = signal<number>(3);
  unreadNotifications = signal<number>(5);
  cartItemCount = computed(() => this.cartStore.cartItems().length);

  // Show header only on authenticated pages
  showHeader = signal<boolean>(false);

  constructor() {
    // Move the effect here to fix the injection context error
    effect(() => {
      // This effect will run whenever cartItems changes
      const items = this.cartStore.cartItems();
      // The cartItemCount computed signal will automatically update
    });
  }

  ngOnInit() {
    this.initializeApp();
    this.loadUserData();
    this.setupRouteListener();
  }

  private initializeApp() {
    // Initialize app state
    // Cart item count is now computed automatically
  }

  private loadUserData() {
    // Load user data from auth service
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      // Load user profile data
      this.loadUserProfile(userId);
    }
  }

  private loadUserProfile(userId: string) {
    // In production, this would load from user service
    // For now, using mock data
    this.userName.set('John Doe');
    this.userInitials.set('JD');
  }

  private setupRouteListener() {
    // Listen to route changes to show/hide header
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        // Show header only on authenticated pages (not landing, login, signup)
        const isPublicPage =
          url === '/' || url === '/login' || url === '/signup';
        this.showHeader.set(!isPublicPage);
      });
  }

  onSearch(query: string) {
    // Handle search
    this.navigationService.navigateTo(`/search?q=${encodeURIComponent(query)}`);
  }

  logout() {
    // Handle logout
    this.authService.logoutUser().subscribe({
      next: () => {
        this.navigationService.navigateTo('/login');
      },
      error: () => {
        // Handle logout error
        this.navigationService.navigateTo('/login');
      },
    });
  }
}
