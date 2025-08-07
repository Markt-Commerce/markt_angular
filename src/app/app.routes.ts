import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
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
            loadComponent: () => import('./features/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
          }
        ]
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'community',
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
            path: 'post/:id',
            loadComponent: () => import('./features/community/post-detail/post-detail.component').then(m => m.PostDetailComponent)
          }
        ]
      },
      {
        path: 'profile',
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
        children: [
          {
            path: '',
            loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/offers/create-offer/create-offer.component').then(m => m.CreateOfferComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/offers/offer-detail/offer-detail.component').then(m => m.OfferDetailComponent)
          }
        ]
      },
      {
        path: 'requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/requests/requests.component').then(m => m.RequestsComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/requests/create-request/create-request.component').then(m => m.CreateRequestComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent)
          }
        ]
      },
      {
        path: 'chat',
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
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'settings',
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
          }
        ]
      },
      {
        path: 'seller',
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
                loadComponent: () => import('./features/seller/listings/create-listing/create-listing.component').then(m => m.CreateListingComponent)
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('./features/seller/listings/edit-listing/edit-listing.component').then(m => m.EditListingComponent)
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

