import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard, SellerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Landing & Onboarding
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'Markt - Social-First E-commerce'
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    title: 'Welcome to Markt'
  },

  // Authentication (Guest-only routes)
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login - Markt'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Join Markt'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Reset Password'
      }
    ]
  },

  // Main Application (Protected Routes)
  {
    path: 'app',
    canActivate: [AuthGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      // Feed & Community
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full'
      },
      {
        path: 'feed',
        loadComponent: () => import('./features/community/feed/feed.component').then(m => m.FeedComponent),
        title: 'Feed - Markt'
      },
      {
        path: 'community',
        loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent),
        title: 'Community - Markt'
      },
      {
        path: 'posts/:id',
        loadComponent: () => import('./features/community/post-detail/post-detail.component').then(m => m.PostDetailComponent),
        title: 'Post - Markt'
      },

      // Marketplace
      {
        path: 'marketplace',
        loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent),
        title: 'Marketplace - Markt'
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Product - Markt'
      },
      {
        path: 'search',
        loadComponent: () => import('./features/marketplace/search/search.component').then(m => m.SearchComponent),
        title: 'Search - Markt'
      },

      // Requests & Offers
      {
        path: 'requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/requests/requests.component').then(m => m.RequestsComponent),
            title: 'Buyer Requests - Markt'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/requests/create-request/create-request.component').then(m => m.CreateRequestComponent),
            title: 'Create Request - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
            title: 'Request Details - Markt'
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent),
            title: 'Seller Offers - Markt'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/offers/create-offer/create-offer.component').then(m => m.CreateOfferComponent),
            title: 'Create Offer - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/offers/offer-detail/offer-detail.component').then(m => m.OfferDetailComponent),
            title: 'Offer Details - Markt'
          }
        ]
      },

      // Messaging
      {
        path: 'messages',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/chat/chat-list/chat-list.component').then(m => m.ChatListComponent),
            title: 'Messages - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/chat/chat-detail/chat-detail.component').then(m => m.ChatDetailComponent),
            title: 'Chat - Markt'
          }
        ]
      },

      // Orders & Transactions
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
            title: 'My Orders - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
            title: 'Order Details - Markt'
          }
        ]
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Checkout - Markt'
      },

      // Seller Dashboard (Protected by SellerGuard)
      {
        path: 'seller',
        canActivate: [SellerGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/seller/dashboard/dashboard.component').then(m => m.DashboardComponent),
            title: 'Seller Dashboard - Markt'
          },
          {
            path: 'listings',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/seller/listings/listings.component').then(m => m.ListingsComponent),
                title: 'My Listings - Markt'
              },
              {
                path: 'new',
                loadComponent: () => import('./features/seller/listings/create-listing/create-listing.component').then(m => m.CreateListingComponent),
                title: 'Create Listing - Markt'
              },
              {
                path: ':id/edit',
                loadComponent: () => import('./features/seller/listings/edit-listing/edit-listing.component').then(m => m.EditListingComponent),
                title: 'Edit Listing - Markt'
              }
            ]
          },
          {
            path: 'analytics',
            loadComponent: () => import('./features/seller/analytics/analytics.component').then(m => m.AnalyticsComponent),
            title: 'Analytics - Markt'
          }
        ]
      },

      // User Profile & Settings
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
            title: 'Profile - Markt'
          },
          {
            path: 'edit',
            loadComponent: () => import('./features/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
            title: 'Edit Profile - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/profile/user-profile/user-profile.component').then(m => m.UserProfileComponent),
            title: 'User Profile - Markt'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
            title: 'Settings - Markt'
          },
          {
            path: 'account',
            loadComponent: () => import('./features/settings/account/account.component').then(m => m.AccountComponent),
            title: 'Account Settings - Markt'
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/settings/notifications/notifications.component').then(m => m.NotificationsComponent),
            title: 'Notification Settings - Markt'
          },
          {
            path: 'privacy',
            loadComponent: () => import('./features/settings/privacy/privacy.component').then(m => m.PrivacyComponent),
            title: 'Privacy Settings - Markt'
          }
        ]
      },

      // Cart
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
        title: 'Shopping Cart - Markt'
      },

      // Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications - Markt'
      }
    ]
  },

  // Error Pages
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Markt'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
