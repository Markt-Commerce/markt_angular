import { Routes } from '@angular/router';

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

  // Authentication
  {
    path: 'auth',
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
    loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    children: [
      // Feed & Community
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full'
      },
      {
        path: 'feed',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Feed - Markt'
      },
      {
        path: 'community',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Community - Markt'
      },
      {
        path: 'posts/:id',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Post - Markt'
      },

      // Marketplace
      {
        path: 'marketplace',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Marketplace - Markt'
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Product - Markt'
      },
      {
        path: 'search',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Search - Markt'
      },

      // Requests & Offers
      {
        path: 'requests',
        children: [
          {
            path: '',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Buyer Requests - Markt'
          },
          {
            path: 'new',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Create Request - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Request Details - Markt'
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Seller Offers - Markt'
          },
          {
            path: 'new',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Create Offer - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
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
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Messages - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
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
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'My Orders - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Order Details - Markt'
          }
        ]
      },
      {
        path: 'checkout',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Checkout - Markt'
      },

      // Seller Dashboard
      {
        path: 'seller',
        children: [
          {
            path: '',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Seller Dashboard - Markt'
          },
          {
            path: 'listings',
            children: [
              {
                path: '',
                loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
                title: 'My Listings - Markt'
              },
              {
                path: 'new',
                loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
                title: 'Create Listing - Markt'
              },
              {
                path: ':id/edit',
                loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
                title: 'Edit Listing - Markt'
              }
            ]
          },
          {
            path: 'analytics',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
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
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Profile - Markt'
          },
          {
            path: 'edit',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Edit Profile - Markt'
          },
          {
            path: ':id',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'User Profile - Markt'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Settings - Markt'
          },
          {
            path: 'account',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Account Settings - Markt'
          },
          {
            path: 'notifications',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Notification Settings - Markt'
          },
          {
            path: 'privacy',
            loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
            title: 'Privacy Settings - Markt'
          }
        ]
      },

      // Cart
      {
        path: 'cart',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Shopping Cart - Markt'
      },

      // Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
        title: 'Notifications - Markt'
      }
    ]
  },

  // Error Pages
  {
    path: '404',
    loadComponent: () => import('./shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    title: 'Page Not Found - Markt'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
