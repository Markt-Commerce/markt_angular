import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUsers, 
  faComments, 
  faShoppingCart,
  faEnvelope,
  faStar,
  faDollarSign,
  faCheck,
  faMessage,
  faPlus,
  faSearch,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../domains/authentication/services/auth.service';
import { AppStateService } from '../../core/services/app-state.service';
import { CartService } from '../../domains/cart/services/cart.service';
import { NotificationService } from '../../domains/notifications/services/notification.service';
import { ChatService } from '../../domains/chat/services/chat.service';
import { AccessControlService } from '../../core/services/access-control.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <!-- Dashboard Content -->
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark mb-2">Welcome back, {{ getUserDisplayName() }}! 👋</h1>
        <p class="text-muted">Here's what's happening with your Markt activity today</p>
      </div>
      <!-- Stats Section -->
      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted text-sm font-medium">Active Orders</p>
                <p class="text-2xl font-bold text-dark mt-1">12</p>
                <p class="text-green-600 text-sm mt-1">
                  <fa-icon [icon]="faCheck" class="text-xs"></fa-icon> +2 from yesterday
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faShoppingCart" class="text-blue-600"></fa-icon>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted text-sm font-medium">Unread Messages</p>
                <p class="text-2xl font-bold text-dark mt-1">{{ unreadMessages }}</p>
                <p class="text-primary text-sm mt-1">
                  <fa-icon [icon]="faMessage" class="text-xs"></fa-icon> 3 urgent
                </p>
              </div>
              <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faEnvelope" class="text-green-600"></fa-icon>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted text-sm font-medium">Pending Reviews</p>
                <p class="text-2xl font-bold text-dark mt-1">4</p>
                <p class="text-orange-600 text-sm mt-1">
                  <fa-icon [icon]="faStar" class="text-xs"></fa-icon> 4.8 avg rating
                </p>
              </div>
              <div class="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faStar" class="text-yellow-600"></fa-icon>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-border">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted text-sm font-medium">This Month</p>
                <p class="text-2xl font-bold text-dark mt-1">$1,247</p>
                <p class="text-green-600 text-sm mt-1">
                  <fa-icon [icon]="faCheck" class="text-xs"></fa-icon> +15% vs last month
                </p>
              </div>
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faDollarSign" class="text-primary"></fa-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity -->
        <section class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border">
          <div class="p-6 border-b border-border">
            <h3 class="text-lg font-semibold text-dark">Recent Activity</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <fa-icon [icon]="faCheck" class="text-green-600 text-sm"></fa-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-dark">Order #1247 completed</p>
                <p class="text-xs text-muted">Vintage textbook sold to @michaelj</p>
                <p class="text-xs text-muted">2 hours ago</p>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <fa-icon [icon]="faMessage" class="text-blue-600 text-sm"></fa-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-dark">New message from Emma Wilson</p>
                <p class="text-xs text-muted">Interested in your dorm furniture listing</p>
                <p class="text-xs text-muted">4 hours ago</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <fa-icon [icon]="faStar" class="text-yellow-600 text-sm"></fa-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-dark">New 5-star review received</p>
                <p class="text-xs text-muted">"Great seller, fast shipping!" - @alexd</p>
                <p class="text-xs text-muted">6 hours ago</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <fa-icon [icon]="faPlus" class="text-primary text-sm"></fa-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-dark">New listing published</p>
                <p class="text-xs text-muted">MacBook Pro 2019 - Electronics</p>
                <p class="text-xs text-muted">1 day ago</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="bg-white rounded-xl shadow-sm border border-border">
          <div class="p-6 border-b border-border">
            <h3 class="text-lg font-semibold text-dark">Quick Actions</h3>
          </div>
          <div class="p-6 space-y-3">
            <button routerLink="/app/seller/listings/create" class="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <fa-icon [icon]="faPlus" class="mr-2"></fa-icon>
              Create New Listing
            </button>
            <button routerLink=ROUTES_ABSOLUTE.APP.MARKETPLACE class="w-full bg-blue-50 text-blue-600 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              <fa-icon [icon]="faSearch" class="mr-2"></fa-icon>
              Browse Marketplace
            </button>
            <button routerLink=ROUTES_ABSOLUTE.APP.COMMUNITY class="w-full bg-green-50 text-green-600 px-4 py-3 rounded-lg font-medium hover:bg-green-100 transition-colors">
              <fa-icon [icon]="faUsers" class="mr-2"></fa-icon>
              Join Community
            </button>
            <button routerLink="/app/offers/create" class="w-full bg-purple-50 text-purple-600 px-4 py-3 rounded-lg font-medium hover:bg-purple-100 transition-colors">
              <fa-icon [icon]="faHandshake" class="mr-2"></fa-icon>
              Create Offer
            </button>
          </div>
        </section>
      </div>

      <!-- Recommended Items -->
      <section class="bg-white rounded-xl shadow-sm border border-border">
        <div class="p-6 border-b border-border">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-dark">Recommended for You</h3>
            <span class="text-primary text-sm font-medium hover:underline cursor-pointer">View All</span>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <img class="w-full h-32 object-cover rounded-lg mb-3" src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center" alt="Economics textbook for college students">
              <h4 class="font-medium text-dark text-sm mb-1">Economics Textbook</h4>
              <p class="text-muted text-xs mb-2">Excellent condition</p>
              <p class="text-primary font-semibold">$45</p>
            </div>
            <div class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <img class="w-full h-32 object-cover rounded-lg mb-3" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center" alt="Modern LED desk lamp for studying">
              <h4 class="font-medium text-dark text-sm mb-1">Desk Lamp</h4>
              <p class="text-muted text-xs mb-2">Perfect for studying</p>
              <p class="text-primary font-semibold">$25</p>
            </div>
            <div class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <img class="w-full h-32 object-cover rounded-lg mb-3" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center" alt="Wireless noise cancelling headphones">
              <h4 class="font-medium text-dark text-sm mb-1">Wireless Headphones</h4>
              <p class="text-muted text-xs mb-2">Noise cancelling</p>
              <p class="text-primary font-semibold">$89</p>
            </div>
            <div class="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <img class="w-full h-32 object-cover rounded-lg mb-3" src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop&crop=center" alt="Vintage film camera for photography">
              <h4 class="font-medium text-dark text-sm mb-1">Vintage Camera</h4>
              <p class="text-muted text-xs mb-2">Film photography</p>
              <p class="text-primary font-semibold">$120</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Feed -->
      <section class="bg-white rounded-xl shadow-sm border border-border">
        <div class="p-6 border-b border-border">
          <h3 class="text-lg font-semibold text-dark">Campus Live Feed</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-start space-x-3">
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="User" class="w-8 h-8 rounded-full">
            <div class="flex-1">
              <p class="text-sm"><span class="font-medium">@mikejohnson</span> just listed a new item: "Gaming Chair - Like New"</p>
              <p class="text-xs text-muted">5 minutes ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" alt="User" class="w-8 h-8 rounded-full">
            <div class="flex-1">
              <p class="text-sm"><span class="font-medium">@emmastone</span> is looking for: "Calculus II textbook for spring semester"</p>
              <p class="text-xs text-muted">12 minutes ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" alt="User" class="w-8 h-8 rounded-full">
            <div class="flex-1">
              <p class="text-sm"><span class="font-medium">@alexdavis</span> completed a trade with @sarahchen</p>
              <p class="text-xs text-muted">18 minutes ago</p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    ::-webkit-scrollbar {
      display: none;
    }
    
    html, body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appStateService = inject(AppStateService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private chatService = inject(ChatService);
  public access = inject(AccessControlService);

  // FontAwesome Icons
  faUsers = faUsers;
  faComments = faComments;
  faShoppingCart = faShoppingCart;
  faEnvelope = faEnvelope;
  faStar = faStar;
  faDollarSign = faDollarSign;
  faCheck = faCheck;
  faMessage = faMessage;
  faPlus = faPlus;
  faSearch = faSearch;
  faHandshake = faHandshake;

  // State
  user: any = null;
  unreadMessages = 0;

  ngOnInit(): void {
    this.loadUserData();
    this.setupSubscriptions();
  }

  private loadUserData(): void {
    this.user = this.authService.getCurrentUser();
  }

  private setupSubscriptions(): void {
    this.chatService.getUnreadCount$().subscribe(count => {
      this.unreadMessages = count;
    });
  }

  getUserDisplayName(): string {
    if (!this.user) return 'User';
    if (this.access.role === 'buyer' && this.user.buyer_account) {
      return this.user.buyer_account.buyername;
    }
    if (this.access.role === 'seller' && this.user.seller_account) {
      return this.user.seller_account.shop_name;
    }
    return this.user.username || this.user.full_name || 'User';
  }
}