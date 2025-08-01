# Markt Application Route Structure

## Overview
This document outlines the complete routing structure for the Markt social-first e-commerce platform, organized by user journey and functionality.

## Route Categories

### 1. Landing & Onboarding
- **`/`** → Redirects to `/home`
- **`/home`** → Landing page (public)
- **`/onboarding`** → Welcome flow for new users

### 2. Authentication
- **`/auth/login`** → User login
- **`/auth/register`** → User registration
- **`/auth/forgot-password`** → Password reset

### 3. Main Application (`/app/*`)
All routes under `/app` are protected and require authentication.

#### 3.1 Feed & Community
- **`/app/feed`** → Main social feed (default landing)
- **`/app/community`** → Community discussions
- **`/app/posts/:id`** → Individual post details

#### 3.2 Marketplace
- **`/app/marketplace`** → Product browsing
- **`/app/products/:id`** → Product details
- **`/app/search`** → Search results

#### 3.3 Requests & Offers
- **`/app/requests`** → Buyer requests list
- **`/app/requests/new`** → Create new request
- **`/app/requests/:id`** → Request details
- **`/app/offers`** → Seller offers list
- **`/app/offers/new`** → Create new offer
- **`/app/offers/:id`** → Offer details

#### 3.4 Messaging
- **`/app/messages`** → Messages list
- **`/app/messages/:id`** → Individual chat

#### 3.5 Orders & Transactions
- **`/app/orders`** → User's order history
- **`/app/orders/:id`** → Order details
- **`/app/checkout`** → Checkout process

#### 3.6 Seller Dashboard
- **`/app/seller`** → Seller dashboard overview
- **`/app/seller/listings`** → Manage listings
- **`/app/seller/listings/new`** → Create listing
- **`/app/seller/listings/:id/edit`** → Edit listing
- **`/app/seller/analytics`** → Sales analytics

#### 3.7 User Profile & Settings
- **`/app/profile`** → User's own profile
- **`/app/profile/edit`** → Edit profile
- **`/app/profile/:id`** → Public profile view
- **`/app/settings`** → Settings overview
- **`/app/settings/account`** → Account settings
- **`/app/settings/notifications`** → Notification preferences
- **`/app/settings/privacy`** → Privacy settings

#### 3.8 Shopping
- **`/app/cart`** → Shopping cart
- **`/app/notifications`** → User notifications

### 4. Error Pages
- **`/404`** → Page not found
- **`/**`** → Catch-all redirects to 404

## User Journey Flows

### New User Journey
1. `/home` → Landing page
2. `/onboarding` → Welcome flow
3. `/auth/register` → Create account
4. `/app/feed` → Main application

### Returning User Journey
1. `/auth/login` → Login
2. `/app/feed` → Main application

### Buyer Journey
1. `/app/marketplace` → Browse products
2. `/app/products/:id` → View product
3. `/app/messages/:id` → Chat with seller
4. `/app/cart` → Add to cart
5. `/app/checkout` → Complete purchase
6. `/app/orders/:id` → Track order

### Seller Journey
1. `/app/seller` → Dashboard overview
2. `/app/seller/listings/new` → Create listing
3. `/app/seller/listings` → Manage listings
4. `/app/messages` → Respond to inquiries
5. `/app/orders` → Process orders
6. `/app/seller/analytics` → View performance

### Community Journey
1. `/app/feed` → View social feed
2. `/app/posts/:id` → Engage with posts
3. `/app/community` → Join discussions
4. `/app/profile/:id` → View other profiles

## Route Guards (Future Implementation)
- **AuthGuard**: Protect `/app/*` routes
- **SellerGuard**: Protect seller-specific routes
- **ProfileGuard**: Ensure profile completion

## Lazy Loading Strategy
All feature modules are lazy-loaded for optimal performance:
- Landing & Auth: Loaded immediately
- Main App: Loaded after authentication
- Individual features: Loaded on demand

## SEO Considerations
- All routes have descriptive titles
- Product and user profile pages support dynamic titles
- Error pages have appropriate meta tags 