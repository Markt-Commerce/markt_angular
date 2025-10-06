import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard, RoleGuard } from './core/guards/auth.guard';

/**
 * Route Guard Strategy:
 * 
 * 1. GuestGuard: Protects auth routes (login, register, etc.) from authenticated users
 *    - Allows unauthenticated users to access auth pages (login, register, etc.)
 *    - Prevents authenticated users from accessing auth pages (they don't need to login again)
 *    - Redirects authenticated users to /app/dashboard if they try to access auth routes
 *    - Applied to: /auth/* routes (login, register, forgot-password, verify-email)
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
    path: 'seller-verification',
    loadComponent: () => import('./features/seller/verification/seller-verification.component').then(m => m.SellerVerificationComponent),
    data: { hideBreadcrumbs: true }
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    data: { hideBreadcrumbs: true }
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./features/checkout/order-confirmation.component').then(m => m.OrderConfirmationComponent)
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
    path: 'dev-navigation',
    loadComponent: () => import('./features/dev/dev-navigation/dev-navigation.component').then(m => m.DevNavigationComponent),
    data: { hideBreadcrumbs: true }
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/components/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'feed',
        redirectTo: 'community/social-feed',
        pathMatch: 'full'
      },
      {
        path: 'marketplace',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
          },
          {
            path: 'search',
            loadComponent: () => import('./features/marketplace/search/search.component').then(m => m.SearchComponent)
          },
          {
            path: 'product/:id',
            loadComponent: () => import('./features/marketplace/product-listing/product-listing.component').then(m => m.ProductListingComponent)
          },
          {
            path: 'product-detail/:id',
            loadComponent: () => import('./features/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
          }
        ]
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'buyer' }
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [RoleGuard],
        data: { requiredRole: 'buyer' }
      },
      {
        path: 'checkout/confirmation/:id',
        loadComponent: () => import('./features/checkout/order-confirmation.component').then(m => m.OrderConfirmationComponent)
      },
      {
        path: 'checkout/confirmation',
        loadComponent: () => import('./features/checkout/order-confirmation.component').then(m => m.OrderConfirmationComponent)
      },
      {
        path: 'community',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent)
          },
          {
            path: 'feed',
            loadComponent: () => import('./features/community/feed/feed.component').then(m => m.FeedComponent)
          },
          {
            path: 'social-feed',
            loadComponent: () => import('./features/community/social-feed/social-feed.component').then(m => m.SocialFeedComponent)
          },
          {
            path: 'post/:id',
            loadComponent: () => import('./features/community/post-detail/post-detail.component').then(m => m.PostDetailComponent)
          }
        ]
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
          },
          {
            path: 'edit',
            loadComponent: () => import('./features/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
          },
          {
            path: 'user/:id',
            loadComponent: () => import('./features/profile/user-profile/user-profile.component').then(m => m.UserProfileComponent)
          }
        ]
      },
      {
        path: 'orders',
        canActivate: [RoleGuard],
        data: { requiredRole: 'buyer' },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
          },
          {
            path: 'history',
            loadComponent: () => import('./features/orders/order-history.component').then(m => m.OrderHistoryComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
          },
          {
            path: ':id/track',
            loadComponent: () => import('./features/orders/order-tracking.component').then(m => m.OrderTrackingComponent)
          }
        ]
      },
      {
        path: 'offers',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/offers/create-offer/create-offer.component').then(m => m.CreateOfferComponent),
            canActivate: [RoleGuard],
            data: { requiredRole: 'buyer' }
          },
          {
            path: 'make/:id',
            loadComponent: () => import('./features/offers/make-offer/make-offer.component').then(m => m.MakeOfferComponent),
            canActivate: [RoleGuard],
            data: { requiredRole: 'buyer' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/offers/offer-detail/offer-detail.component').then(m => m.OfferDetailComponent)
          }
        ]
      },
      {
        path: 'requests',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/requests/requests.component').then(m => m.RequestsComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/requests/create-request/create-request.component').then(m => m.CreateRequestComponent),
            canActivate: [RoleGuard],
            data: { requiredRole: 'buyer' }
          },
          {
            path: ':id',
            loadComponent: () => import('./features/requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent)
          }
        ]
      },
      {
        path: 'chat',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/chat/chat-list/chat-list.component').then(m => m.ChatListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/chat/chat-detail/chat-detail.component').then(m => m.ChatDetailComponent)
          }
        ]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'shops',
        loadComponent: () => import('./features/shops/shops.component').then(m => m.ShopsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'social',
        canActivate: [AuthGuard],
        children: [
          {
            path: 'feed',
            loadComponent: () => import('./features/social/feed.component').then(m => m.FeedComponent)
          },
          {
            path: 'stories',
            loadComponent: () => import('./features/social/stories/stories.component').then(m => m.StoriesComponent)
          }
        ]
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
          },
          {
            path: 'account',
            loadComponent: () => import('./features/settings/account/account.component').then(m => m.AccountComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/settings/notifications/notifications.component').then(m => m.NotificationsComponent)
          },
          {
            path: 'privacy',
            loadComponent: () => import('./features/settings/privacy/privacy.component').then(m => m.PrivacyComponent)
          },
          {
            path: 'shipping',
            loadComponent: () => import('./features/settings/shipping/shipping.component').then(m => m.ShippingComponent)
          },
          {
            path: 'preferences',
            loadComponent: () => import('./features/settings/preferences/preferences.component').then(m => m.PreferencesComponent)
          }
        ]
      },
      {
        path: 'seller',
        canActivate: [RoleGuard],
        data: { requiredRole: 'seller' },
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/seller/dashboard/dashboard.component').then(m => m.DashboardComponent)
          },
          {
            path: 'listings',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/seller/listings/listings.component').then(m => m.ListingsComponent)
              },
              {
                path: 'create',
                loadComponent: () => import('./features/seller/listings/create-listing/create-listing.component').then(m => m.CreateListingComponent),
                canActivate: [RoleGuard],
                data: { requiredRole: 'seller' }
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./features/seller/listings/edit-listing/edit-listing.component').then(m => m.EditListingComponent),
                canActivate: [RoleGuard],
                data: { requiredRole: 'seller' }
              }
            ]
          },
          {
            path: 'analytics',
            loadComponent: () => import('./features/seller/analytics/analytics.component').then(m => m.AnalyticsComponent)
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

