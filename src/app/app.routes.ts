import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard, RoleGuard } from './core/guards/auth.guard';

/**
 * Route Guard Strategy:
 * 
 * 1. GuestGuard: Protects auth routes (login, register, etc.)
 *    - Prevents authenticated users from accessing auth pages
 *    - Redirects to /app/dashboard if already logged in
 * 
 * 2. AuthGuard: Protects all authenticated routes
 *    - Ensures user is logged in before accessing protected pages
 *    - Redirects to /auth/login with returnUrl for post-login redirect
 *    - Applied to: dashboard, notifications, settings, profile, community, chat, offers, requests
 * 
 * 3. RoleGuard: Protects role-specific routes
 *    - Requires specific user role (buyer/seller)
 *    - Automatically switches roles if user has the required role
 *    - Shows helpful notifications and error messages
 *    - Applied to: cart, checkout, orders (buyer), seller routes (seller)
 * 
 * Route Protection Levels:
 * - Public: landing, auth routes (with GuestGuard)
 * - Authenticated: All /app routes (with AuthGuard)
 * - Role-specific: buyer/seller specific features (with RoleGuard)
 */

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    data: { hideBreadcrumbs: true }
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        data: { hideBreadcrumbs: true }
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        data: { hideBreadcrumbs: true }
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        data: { hideBreadcrumbs: true }
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        data: { hideBreadcrumbs: true }
      }
    ]
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'app',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'marketplace',
        pathMatch: 'full'
      },
      {
        path: 'feed',
        redirectTo: 'community/feed',
        pathMatch: 'full'
      },
      {
        path: 'marketplace',
        data: { breadcrumb: 'Marketplace' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent),
            data: { breadcrumb: 'Marketplace' }
          },
          {
            path: 'search',
            loadComponent: () => import('./features/marketplace/search/search.component').then(m => m.SearchComponent),
            data: { breadcrumb: 'Search' }
          },
          {
            path: 'product/:id',
            loadComponent: () => import('./features/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
            data: { breadcrumb: { type: 'product' } }
          }
        ]
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
        canActivate: [RoleGuard],
        data: { breadcrumb: 'Cart', requiredRole: 'buyer' }
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [RoleGuard],
        data: { breadcrumb: 'Checkout', requiredRole: 'buyer' }
      },
      {
        path: 'community',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Community' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent),
            data: { breadcrumb: 'Community' }
          },
          {
            path: 'feed',
            loadComponent: () => import('./features/community/feed/feed.component').then(m => m.FeedComponent),
            data: { breadcrumb: 'Feed' }
          },
          {
            path: 'post/:id',
            loadComponent: () => import('./features/community/post-detail/post-detail.component').then(m => m.PostDetailComponent),
            data: { breadcrumb: { type: 'post' } }
          }
        ]
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Profile' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
            data: { breadcrumb: 'Profile' }
          },
          {
            path: 'edit',
            loadComponent: () => import('./features/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
            data: { breadcrumb: 'Edit Profile' }
          },
          {
            path: 'user/:id',
            loadComponent: () => import('./features/profile/user-profile/user-profile.component').then(m => m.UserProfileComponent),
            data: { breadcrumb: { type: 'user' } }
          }
        ]
      },
      {
        path: 'orders',
        canActivate: [RoleGuard],
        data: { breadcrumb: 'Orders', requiredRole: 'buyer' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
            data: { breadcrumb: 'Orders' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
            data: { breadcrumb: { type: 'order' } }
          }
        ]
      },
      {
        path: 'offers',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Offers' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent),
            data: { breadcrumb: 'Offers' }
          },
          {
            path: 'create',
            loadComponent: () => import('./features/offers/create-offer/create-offer.component').then(m => m.CreateOfferComponent),
            canActivate: [RoleGuard],
            data: { breadcrumb: 'Create Offer', requiredRole: 'buyer' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/offers/offer-detail/offer-detail.component').then(m => m.OfferDetailComponent),
            data: { breadcrumb: 'Offer' }
          }
        ]
      },
      {
        path: 'requests',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Requests' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/requests/requests.component').then(m => m.RequestsComponent),
            data: { breadcrumb: 'Requests' }
          },
          {
            path: 'create',
            loadComponent: () => import('./features/requests/create-request/create-request.component').then(m => m.CreateRequestComponent),
            canActivate: [RoleGuard],
            data: { breadcrumb: 'Create Request', requiredRole: 'buyer' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
            data: { breadcrumb: { type: 'request' } }
          }
        ]
      },
      {
        path: 'chat',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Messages' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/chat/chat-list/chat-list.component').then(m => m.ChatListComponent),
            data: { breadcrumb: 'Messages' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/chat/chat-detail/chat-detail.component').then(m => m.ChatDetailComponent),
            data: { breadcrumb: 'Conversation' }
          }
        ]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Notifications' }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Dashboard' }
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Settings' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
            data: { breadcrumb: 'Settings' }
          },
          {
            path: 'account',
            loadComponent: () => import('./features/settings/account/account.component').then(m => m.AccountComponent),
            data: { breadcrumb: 'Account' }
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/settings/notifications/notifications.component').then(m => m.NotificationsComponent),
            data: { breadcrumb: 'Notifications' }
          },
          {
            path: 'privacy',
            loadComponent: () => import('./features/settings/privacy/privacy.component').then(m => m.PrivacyComponent),
            data: { breadcrumb: 'Privacy' }
          },
          {
            path: 'shipping',
            loadComponent: () => import('./features/settings/shipping/shipping.component').then(m => m.ShippingComponent),
            data: { breadcrumb: 'Shipping' }
          },
          {
            path: 'preferences',
            loadComponent: () => import('./features/settings/preferences/preferences.component').then(m => m.PreferencesComponent),
            data: { breadcrumb: 'Preferences' }
          }
        ]
      },
      {
        path: 'seller',
        canActivate: [RoleGuard],
        data: { breadcrumb: 'Seller', requiredRole: 'seller' },
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/seller/dashboard/dashboard.component').then(m => m.DashboardComponent),
            data: { breadcrumb: 'Dashboard' }
          },
          {
            path: 'listings',
            data: { breadcrumb: 'Listings' },
            children: [
              {
                path: '',
                loadComponent: () => import('./features/seller/listings/listings.component').then(m => m.ListingsComponent),
                data: { breadcrumb: 'Listings' }
              },
                        {
            path: 'create',
            loadComponent: () => import('./features/seller/listings/create-listing/create-listing.component').then(m => m.CreateListingComponent),
            canActivate: [RoleGuard],
            data: { breadcrumb: 'Create Listing', requiredRole: 'seller' }
          },
              {
                path: 'edit/:id',
                loadComponent: () => import('./features/seller/listings/edit-listing/edit-listing.component').then(m => m.EditListingComponent),
                canActivate: [RoleGuard],
                data: { breadcrumb: 'Edit Listing', requiredRole: 'seller' }
              }
            ]
          },
          {
            path: 'analytics',
            loadComponent: () => import('./features/seller/analytics/analytics.component').then(m => m.AnalyticsComponent),
            data: { breadcrumb: 'Analytics' }
          }
        ]
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

