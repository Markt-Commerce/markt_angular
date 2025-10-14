# Domain State Ownership Sheet

**Created:** October 14, 2025  
**Purpose:** Single source of truth for which service owns each domain's state  
**Principle:** One domain, one owner - no duplication

---

## 🎯 Core Principle

**Each domain has exactly ONE canonical owner.**

- Domain services own their state using Angular signals
- `AppStateService` observes and composes, but **never** duplicates
- Components inject domain services directly for domain state
- Components inject `AppStateService` only for UI state and computed aggregates

---

## 📋 Domain Ownership Registry

### 1. Authentication & User Management

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **User Authentication** | `AuthService` | `user`, `isAuthenticated`, `currentRole`, `token` | `login()`, `logout()`, `register()` |
| **User Profile** | `AuthService` | `user.profile`, `userStats` | `updateProfile()`, `uploadAvatar()` |
| **Session Management** | `AuthService` | `sessionExpiry`, `refreshToken` | `refreshSession()`, `validateSession()` |
| **Role Switching** | `AuthService` | `currentRole`, `availableRoles` | `switchRole()` |

**Location:** `src/app/core/services/auth.service.ts`

**Dependencies:** 
- `ApiService` (HTTP)
- `StorageService` (token persistence)

**Notes:**
- User profile merged into AuthService (was separate ProfileService)
- Single user object eliminates sync issues
- Role management centralized here

---

### 2. Shopping Cart

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Cart** | `CartService` | `cart`, `cartItems`, `itemCount` | `addItem()`, `removeItem()`, `updateQuantity()` |
| **Cart Totals** | `CartService` | `subtotal`, `tax`, `totalPrice` | Auto-computed |
| **Cart Persistence** | `CartService` | `cartId`, `lastSaved` | `save()`, `load()`, `clear()` |

**Location:** `src/app/core/services/cart.service.ts`

**Dependencies:**
- `AuthService.user` (to associate cart with user)
- `ApiService` (backend sync)

**Notes:**
- Cart persists in localStorage for guests, backend for authenticated users
- Automatically syncs on login
- **Do NOT** duplicate in `AppStateService`

---

### 3. Notifications

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Notifications** | `NotificationService` | `notifications`, `unreadCount` | `markAsRead()`, `markAllRead()`, `deleteNotification()` |
| **Notification Preferences** | `NotificationService` | `preferences`, `mutedChannels` | `updatePreferences()` |
| **Real-time Updates** | `NotificationService` | `hasNewNotifications` | Auto-updated via RealtimeService |

**Location:** `src/app/core/services/notification.service.ts`

**Dependencies:**
- `RealtimeService` (WebSocket events)
- `AuthService.user` (user context)
- `ApiService` (fetching history)

**Notes:**
- Subscribes to `RealtimeService` for push notifications
- Manages local notification queue
- Exposes read-only signals to `AppStateService` for badge counts

---

### 4. Chat & Messaging

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Conversations** | `ChatService` | `conversations`, `activeConversation` | `selectConversation()`, `startConversation()` |
| **Messages** | `ChatService` | `messages`, `unreadConversationsCount` | `sendMessage()`, `markConversationRead()` |
| **Typing Indicators** | `ChatService` | `typingUsers`, `isTyping` | `setTyping()` |
| **Online Status** | `ChatService` | `onlineUsers` | Auto-updated via RealtimeService |

**Location:** `src/app/core/services/chat.service.ts`

**Dependencies:**
- `RealtimeService` (WebSocket)
- `AuthService.user`
- `ApiService` (message history)

**Notes:**
- Real-time via WebSocket
- Messages cached in memory (not persisted locally)
- Conversation list synced with backend

---

### 5. Marketplace & Products

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Products** | `MarketplaceService` | `products`, `featuredProducts`, `recentProducts` | `loadProducts()`, `refreshProducts()` |
| **Search** | `MarketplaceService` | `searchQuery`, `searchResults`, `filters` | `search()`, `applyFilters()`, `clearFilters()` |
| **Categories** | `CategoryService` | `categories`, `selectedCategory` | `loadCategories()`, `selectCategory()` |
| **Product Details** | `MarketplaceService` | `currentProduct`, `relatedProducts` | `loadProduct()` |

**Location:** 
- `src/app/core/services/marketplace.service.ts`
- `src/app/core/services/category.service.ts`

**Dependencies:**
- `ApiService`
- `CategoryService` (for category filtering)

**Notes:**
- Marketplace and Category are separate but related
- Search state lives in MarketplaceService
- Categories are global, rarely change (can cache persistently)

---

### 6. Orders & Order Management

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Orders** | `OrderService` | `orders`, `buyerOrders`, `sellerOrders` | `createOrder()`, `updateOrderStatus()` |
| **Order Details** | `OrderService` | `currentOrder`, `orderStatus` | `loadOrder()`, `cancelOrder()` |
| **Order Tracking** | `TrackingService` | `trackingInfo`, `deliveryStatus` | `updateTracking()` |

**Location:** 
- `src/app/core/services/order.service.ts`
- `src/app/core/services/tracking.service.ts`

**Dependencies:**
- `AuthService.currentRole` (buyer vs seller views)
- `ApiService`
- `RealtimeService` (for status updates)

**Notes:**
- Role-aware: filters orders based on current role
- Tracking is separate service (specialized domain)

---

### 7. Seller Management

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Shop** | `SellerService` | `shop`, `shopStats`, `verificationStatus` | `updateShop()`, `submitForVerification()` |
| **Seller Products** | `SellerService` | `sellerProducts`, `activeListings` | `createProduct()`, `updateProduct()`, `deleteProduct()` |
| **Analytics** | `AnalyticsService` | `salesStats`, `revenue`, `topProducts` | `loadAnalytics()`, `setDateRange()` |

**Location:** 
- `src/app/core/services/seller.service.ts`
- `src/app/core/services/analytics.service.ts`

**Dependencies:**
- `AuthService.user` (must be seller role)
- `ApiService`
- `ProductService` (for product CRUD)

**Notes:**
- Seller-specific product management separate from marketplace browsing
- Analytics is domain-specific, not global

---

### 8. Requests & Offers

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Product Requests** | `RequestService` | `requests`, `currentRequest`, `myRequests` | `createRequest()`, `updateRequest()`, `deleteRequest()` |
| **Offers** | `OfferService` | `offers`, `sentOffers`, `receivedOffers` | `makeOffer()`, `acceptOffer()`, `rejectOffer()` |
| **Negotiation** | `OfferService` | `currentNegotiation`, `offerHistory` | `counterOffer()`, `finalizeOffer()` |

**Location:** 
- `src/app/core/services/request.service.ts`
- `src/app/core/services/offer.service.ts`

**Dependencies:**
- `AuthService.user`, `AuthService.currentRole`
- `RealtimeService` (offer updates)
- `ApiService`

**Notes:**
- Requests = buyers requesting products they can't find
- Offers = negotiation system for price/terms
- Both support real-time updates

---

### 9. Community & Social

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Community Posts** | `CommunityService` | `posts`, `discussions`, `currentPost` | `createPost()`, `updatePost()`, `deletePost()` |
| **Social Feed** | `SocialService` | `feedItems`, `userActivity` | `loadFeed()`, `likePost()`, `commentOnPost()` |
| **Comments** | `CommunityService` | `comments`, `commentCount` | `addComment()`, `deleteComment()` |

**Location:** 
- `src/app/core/services/community.service.ts`
- `src/app/core/services/social.service.ts`

**Dependencies:**
- `AuthService.user`
- `ApiService`
- `RealtimeService` (live updates)

**Notes:**
- Community = discussions/forums
- Social = feed/activity stream
- Some overlap, but different use cases

---

### 10. Admin & Moderation

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **User Management** | `AdminService` | `users`, `userStats`, `reportedUsers` | `banUser()`, `approveUser()` |
| **Product Moderation** | `AdminService` | `flaggedProducts`, `pendingApprovals` | `approveProduct()`, `rejectProduct()` |
| **Platform Analytics** | `AdminService` | `platformAnalytics`, `revenue`, `growth` | `loadDashboard()` |

**Location:** `src/app/core/services/admin.service.ts`

**Dependencies:**
- `AuthService.user` (must be admin role)
- `ApiService`

**Notes:**
- Admin-only domain
- High privilege level
- Separate from seller analytics

---

### 11. Settings & Preferences

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **User Preferences** | `SettingsService` | `preferences`, `notificationSettings` | `updatePreferences()` |
| **Shipping Addresses** | `SettingsService` | `addresses`, `defaultAddress` | `addAddress()`, `updateAddress()`, `deleteAddress()` |
| **Payment Methods** | `PaymentService` | `paymentMethods`, `defaultPayment` | `addPaymentMethod()`, `removePaymentMethod()` |

**Location:** 
- `src/app/core/services/settings.service.ts`
- `src/app/core/services/payment.service.ts`

**Dependencies:**
- `AuthService.user`
- `ApiService`

**Notes:**
- Settings span multiple concerns (notifications, shipping, privacy)
- Payment is sensitive, kept separate

---

### 12. Real-time Infrastructure

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **WebSocket Connection** | `RealtimeService` | `isConnected`, `connectionStatus` | `connect()`, `disconnect()`, `reconnect()` |
| **Event Bus** | `RealtimeService` | N/A (event emitter) | `emit()`, `on()`, `off()` |

**Location:** `src/app/core/services/realtime.service.ts`

**Dependencies:**
- `AuthService.token` (for authenticated connections)
- Socket.IO client

**Notes:**
- Infrastructure layer, not domain state
- Other services subscribe to events, don't own them
- Automatically reconnects on disconnect

---

### 13. Shops & Shop Discovery

| Domain | Owner Service | State Signals | Mutators |
|--------|--------------|---------------|----------|
| **Shop Directory** | `ShopService` | `shops`, `featuredShops` | `loadShops()`, `searchShops()` |
| **Shop Details** | `ShopService` | `currentShop`, `shopProducts`, `shopReviews` | `loadShop()` |

**Location:** `src/app/core/services/shop.service.ts`

**Dependencies:**
- `ApiService`
- `ProductService` (for shop products)

**Notes:**
- Public shop browsing (not seller management)
- Seller management in SellerService

---

## 🚫 What AppStateService Does NOT Own

`AppStateService` is **UI-only**. It does NOT own:

- ❌ User data → `AuthService.user`
- ❌ Cart → `CartService.cart`
- ❌ Notifications → `NotificationService.notifications`
- ❌ Chat messages → `ChatService.messages`
- ❌ Orders → `OrderService.orders`
- ❌ Products → `MarketplaceService.products`
- ❌ Any domain state

---

## ✅ What AppStateService CAN Do

`AppStateService` may:

1. **Own UI state:**
   - Theme, sidebar, modals, toasts, loading overlays
   - Breadcrumbs, page titles, layout mode

2. **Expose computed aggregates:**
   ```ts
   totalUnreadCount = computed(() => 
     this.notificationService.unreadCount() + 
     this.chatService.unreadConversationsCount()
   );
   ```

3. **Provide read-only references** (convenience):
   ```ts
   isAuthenticated = computed(() => this.authService.isAuthenticated());
   currentUser = computed(() => this.authService.user());
   ```

---

## 🔄 Migration Strategy

### Current State (Before)

Some services duplicate state:
- `AppStateService` has `user` signal → duplicates `AuthService.user`
- `AppStateService` has `cart` signal → duplicates `CartService.cart`
- Multiple services tracking `isAuthenticated`

### Target State (After)

- Each domain service owns its state
- `AppStateService` references or computes from domain services
- No duplication, single source of truth

### Migration Steps

1. **Audit current `AppStateService`** - identify all domain state
2. **For each duplicated state:**
   - Find domain service that should own it
   - Move state to that service (if not already there)
   - Update `AppStateService` to reference, not duplicate
3. **Update components:**
   - Inject domain services directly
   - Use `AppStateService` only for UI state
4. **Test thoroughly** - ensure no broken references

---

## 📊 Service Dependency Graph

```
┌─────────────────────┐
│   Components        │
└──────────┬──────────┘
           │ inject
           ↓
┌─────────────────────┐     ┌──────────────────┐
│  Domain Services    │ ←───┤ AppStateService  │
│  (own state)        │     │ (UI + aggregates)│
└──────────┬──────────┘     └──────────────────┘
           │ inject
           ↓
┌─────────────────────┐
│  Infrastructure     │
│  (API, Realtime)    │
└─────────────────────┘
```

**Flow:**
1. Components inject domain services for domain state
2. Components inject `AppStateService` for UI state
3. `AppStateService` injects domain services for computed aggregates
4. Domain services use infrastructure services (API, Realtime)

---

## 🎯 Validation Rules

For each domain:

1. **One owner** - only one service owns the state
2. **Clear boundaries** - no overlap in responsibilities
3. **Signals for state** - use Angular signals for reactive state
4. **Computed for derived** - use `computed()` for derived values
5. **Methods for mutations** - clear API for state changes
6. **Services collaborate** - but don't duplicate state

---

## 📝 Checklist: Is State in the Right Place?

Ask these questions:

1. **Is this domain state?** → Belongs in domain service
2. **Is this UI state?** → Belongs in `AppStateService`
3. **Is this a combination of multiple domains?** → Computed signal in `AppStateService`
4. **Does it persist across routes?** → Domain service (not component)
5. **Is it user-specific?** → Likely AuthService or user-related domain
6. **Does it sync with backend?** → Definitely domain service

---

**Last Updated:** October 14, 2025  
**Next Review:** After Phase 6 (Atomic Cutover)

---

## Quick Reference

| Ask | Answer |
|-----|--------|
| Where is user data? | `AuthService.user` |
| Where is cart? | `CartService.cart` |
| Where are notifications? | `NotificationService.notifications` |
| Where are messages? | `ChatService.messages` |
| Where is sidebar state? | `AppStateService.sidebarOpen` |
| Where is loading overlay? | `AppStateService.isLoading` |
| Where is total unread count? | `AppStateService.totalUnreadCount` (computed) |
| Where is theme? | `AppStateService.theme` |

