import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  // Landing Page (Public)
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },

  // Authentication Routes (Public - redirects if authenticated)
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./ui/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./ui/auth/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },

  // Protected Routes (Require Authentication)
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/feed/feed.component').then((m) => m.FeedComponent),
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/marketplace/marketplace.component').then(
        (m) => m.MarketplaceComponent
      ),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/search/search.component').then((m) => m.SearchComponent),
  },
  {
    path: 'product/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent
      ),
  },
  {
    path: 'user/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
  },

  // Buyer Routes (Protected)
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
  },
  {
    path: 'my-orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-orders/my-orders.component').then(
        (m) => m.MyOrdersComponent
      ),
  },
  {
    path: 'order/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/order/order.component').then((m) => m.OrderComponent),
  },
  {
    path: 'buyer-requests',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/buyer-requests/buyer-requests.component').then(
        (m) => m.BuyerRequestsComponent
      ),
  },
  {
    path: 'buyer-request/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './pages/buyer-request-detail/buyer-request-detail.component'
      ).then((m) => m.BuyerRequestDetailComponent),
  },

  // Seller Routes (Protected)
  {
    path: 'seller-dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/seller-dashboard/seller-dashboard.component').then(
        (m) => m.SellerDashboardComponent
      ),
  },
  {
    path: 'seller-listings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/seller-listings/seller-listings.component').then(
        (m) => m.SellerListingsComponent
      ),
  },
  {
    path: 'seller-orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/seller-orders/seller-orders.component').then(
        (m) => m.SellerOrdersComponent
      ),
  },
  {
    path: 'seller-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/seller-profile/seller-profile.component').then(
        (m) => m.SellerProfileComponent
      ),
  },
  {
    path: 'seller-offer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/seller-offer/seller-offer.component').then(
        (m) => m.SellerOfferComponent
      ),
  },

  // Social & Communication Routes (Protected)
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/chat/chat.component').then((m) => m.ChatComponent),
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/messages-list/messages-list.component').then(
        (m) => m.MessagesListComponent
      ),
  },
  {
    path: 'following',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/following/following.component').then(
        (m) => m.FollowingComponent
      ),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/notifications/notifications.component').then(
        (m) => m.NotificationsComponent
      ),
  },
  {
    path: 'create-post',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/create-post/create-post.component').then(
        (m) => m.CreatePostComponent
      ),
  },

  // Account & Settings Routes (Protected)
  {
    path: 'my-account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-account/my-account.component').then(
        (m) => m.MyAccountComponent
      ),
  },
  {
    path: 'account-details',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/account-details/account-details.component').then(
        (m) => m.AccountDetailsComponent
      ),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },

  // Discovery Routes (Protected)
  {
    path: 'niche-discovery',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/niche-discovery/niche-discovery.component').then(
        (m) => m.NicheDiscoveryComponent
      ),
  },

  // Error Routes
  {
    path: '**',
    loadComponent: () =>
      import('./ui/error/error.component').then((m) => m.ErrorComponent),
  },
];
