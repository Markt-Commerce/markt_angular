# Application Cohesion Foundation

**Created:** October 14, 2025  
**Updated:** October 14, 2025 (Phase 5 complete)  
**Status:** Pilot Complete - Staging in `/core-next/` awaiting Phase 6 cutover  
**Goal:** Single source of truth for routes and state ownership

---

## 📁 Foundation Files Overview

This directory contains the **new cohesion layer** that will replace fragmented route and state management across the application.

### File Structure

```
/core-next/
├── config/
│   ├── routes.config.ts         # Centralized route constants
│   └── route-state-map.ts       # Route → State dependency map
├── state/
│   └── app-state.ui.ts          # UI-only global state
├── init/
│   └── app-initializer.service.ts # Bootstrap orchestrator
└── power-plan-foundation.md     # This file
```

---

## 🧭 1. Route Constants (`routes.config.ts`)

### Purpose

Single source of truth for all application routes. Eliminates hardcoded route strings and enables compile-time validation.

### Key Exports

#### `ROUTES` (Relative Paths)
```ts
export const ROUTES = {
  AUTH: {
    ROOT: 'auth',
    LOGIN: 'login',
    REGISTER: 'register',
  },
  APP: {
    ROOT: 'app',
    DASHBOARD: 'dashboard',
    MARKETPLACE: 'marketplace',
    // ...
  },
} as const;
```

Use with `buildPath()` helper:
```ts
this.router.navigate([buildPath(ROUTES.APP.ROOT, ROUTES.APP.MARKETPLACE)]);
// Result: '/app/marketplace'
```

#### `ROUTES_ABSOLUTE` (Pre-built Paths)
```ts
export const ROUTES_ABSOLUTE = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  APP: {
    DASHBOARD: '/app/dashboard',
    // ...
  },
} as const;
```

Direct usage:
```ts
this.router.navigate([ROUTES_ABSOLUTE.APP.DASHBOARD]);
```

#### Helpers

**`buildPath(...parts)`** - Build absolute paths from segments
```ts
buildPath(ROUTES.AUTH.ROOT, ROUTES.AUTH.LOGIN) // '/auth/login'
buildPath(ROUTES.APP.SELLER.ROOT, ROUTES.APP.SELLER.PRODUCTS, '123') // '/app/seller/products/123'
```

**`buildAppPath(...parts)`** - Automatically prefix with `/app`
```ts
buildAppPath(ROUTES.APP.MARKETPLACE) // '/app/marketplace'
```

**`RouteParams`** - Parameter helpers
```ts
RouteParams.orderDetail('123') // '/app/orders/details/123'
RouteParams.shopDetail('abc') // '/app/shops/abc'
RouteParams.productEdit('456') // '/app/seller/products/edit/456'
```

### Type Safety

```ts
export type RoutePaths = DeepValues<typeof ROUTES>;
export type AbsoluteRoutePaths = DeepValues<typeof ROUTES_ABSOLUTE>;

// Type guard
function isValidRoutePath(path: string): path is RoutePaths { /* ... */ }
```

### Migration Pattern

**Before:**
```ts
this.router.navigate(['/app/marketplace']);
<a routerLink="/app/cart">Cart</a>
```

**After:**
```ts
import { ROUTES_ABSOLUTE } from '@core-next/config/routes.config';

this.router.navigate([ROUTES_ABSOLUTE.APP.MARKETPLACE]);
<a [routerLink]="[routes.APP.CART]">Cart</a>
```

---

## 🗺️ 2. Route-State Map (`route-state-map.ts`)

### Purpose

Documents which services and signals each route depends on. Enables:
- Understanding state ownership at a glance
- Generating dev dashboards
- Identifying real-time routes
- Planning cache strategies

### Structure

```ts
export interface RouteStateMeta {
  services: string[];        // Service classes owning state
  signals: string[];         // Specific signals accessed
  realtime: boolean;         // Requires WebSocket updates
  cache: 'session' | 'memory' | 'none' | 'persistent';
  description?: string;      // Human-readable description
  preloadPriority?: number;  // Higher = load earlier
  requiresAuth?: boolean;    // Auth requirement
  requiredRole?: 'buyer' | 'seller' | 'admin';
}
```

### Example Entries

```ts
export const ROUTE_STATE_MAP: Record<string, RouteStateMeta> = {
  [ROUTES_ABSOLUTE.APP.MARKETPLACE]: {
    services: ['MarketplaceService', 'CategoryService', 'AuthService'],
    signals: ['products', 'categories', 'searchQuery', 'filters', 'isAuthenticated'],
    realtime: false,
    cache: 'session',
    description: 'Product marketplace with search and filters',
    requiresAuth: false,
    preloadPriority: 9,
  },
  
  [ROUTES_ABSOLUTE.APP.CHAT]: {
    services: ['ChatService', 'RealtimeService', 'NotificationService', 'AuthService'],
    signals: ['conversations', 'activeConversation', 'messages', 'unreadCount'],
    realtime: true,
    cache: 'memory',
    description: 'Real-time chat',
    requiresAuth: true,
    preloadPriority: 8,
  },
};
```

### Helper Functions

```ts
getRouteStateMeta(route: string): RouteStateMeta | null
getRoutesByService(serviceName: string): string[]
getRealtimeRoutes(): string[]
getRoutesByRole(role: 'buyer' | 'seller' | 'admin'): string[]
getRouteStateStats(): { totalRoutes, realtimeRoutes, ... }
```

### Usage Examples

**In dev dashboard:**
```ts
const marketplaceMeta = getRouteStateMeta('/app/marketplace');
console.log('Services:', marketplaceMeta.services);
console.log('Signals:', marketplaceMeta.signals);
```

**Find impact of service changes:**
```ts
const affectedRoutes = getRoutesByService('CartService');
// Returns: ['/app/cart', '/app/checkout']
```

**Plan real-time optimization:**
```ts
const realtimeRoutes = getRealtimeRoutes();
// Returns: ['/app/chat', '/app/dashboard', '/app/notifications', ...]
```

---

## 🎨 3. AppState UI Service (`app-state.ui.ts`)

### Core Principle: **Observe, Don't Own**

This service is a **composition layer** for global UI state only.

### ✅ What It Does

- **Owns UI state:** Theme, sidebar, loading overlays, toasts, modals
- **Exposes computed aggregates:** Total unread count from multiple services
- **Provides read-only references:** To domain service signals (convenience)

### ❌ What It Does NOT Do

- **Own domain state:** No cart, notifications, orders, products, etc.
- **Duplicate state:** Domain services are the single source of truth
- **Mutate domain data:** All mutations happen in domain services

### State Categories

#### UI State (Owned)
```ts
isLoading = signal<boolean>(false);
sidebarOpen = signal<boolean>(true);
mobileMenuOpen = signal<boolean>(false);
theme = signal<Theme>('auto');
layoutMode = signal<LayoutMode>('default');
toasts = signal<Toast[]>([]);
activeModal = signal<string | null>(null);
pageTitle = signal<string>('Markt');
breadcrumbs = signal<Breadcrumb[]>([]);
isOnline = signal<boolean>(true);
searchBarVisible = signal<boolean>(false);
```

#### Computed Aggregates (Derived)
```ts
// Example: Combine unread counts from multiple services
totalUnreadCount = computed(() => {
  const notificationUnread = this.notificationService.unreadCount() ?? 0;
  const chatUnread = this.chatService.unreadConversationsCount() ?? 0;
  return notificationUnread + chatUnread;
});

isBlocking = computed(() => 
  this.isLoading() || this.activeModal() !== null
);
```

### Key Methods

```ts
initUIState()           // Load preferences from localStorage
resetUIState()          // Clear UI state (on logout)
setLoading(bool, msg?)  // Show/hide loading overlay
toggleSidebar()         // Toggle sidebar + persist to localStorage
toggleMobileMenu()      // Toggle mobile menu
setTheme(theme)         // Set and persist theme
showToast(msg, type)    // Display toast notification
dismissToast(id)        // Remove toast
showModal(id)           // Show modal
closeModal()            // Close modal
setPageTitle(title)     // Update page title + document.title
setBreadcrumbs([...])   // Update breadcrumb navigation
```

### Component Usage

**UI State:**
```ts
export class HeaderComponent {
  private appState = inject(AppStateService);
  
  sidebarOpen = this.appState.sidebarOpen;
  theme = this.appState.theme;
  
  toggleSidebar() {
    this.appState.toggleSidebar();
  }
}
```

**Domain State (inject domain service directly):**
```ts
export class CartComponent {
  private cartService = inject(CartService);
  
  cart = this.cartService.cart;
  totalPrice = this.cartService.totalPrice;
  
  addItem(item: Product) {
    this.cartService.addItem(item);
  }
}
```

---

## 🚀 4. App Initializer (`app-initializer.service.ts`)

### Purpose

Orchestrates the bootstrap sequence for all services in the correct order.

### Initialization Phases

1. **Phase 1:** UI State Layer (theme, sidebar, network listeners)
2. **Phase 2:** Core Services (AuthService, ConfigService)
3. **Phase 3:** Domain Services (Cart, Notifications, Chat) - parallel
4. **Phase 4:** Real-time Connections (if authenticated)

### Usage in `app.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { AppInitializerService } from '@core-next/init/app-initializer.service';

@Component({
  selector: 'app-root',
  template: `
    @if (initResult && !initResult.success) {
      <div class="init-error">
        Application failed to initialize. Please refresh.
      </div>
    }
    <router-outlet />
  `
})
export class AppComponent implements OnInit {
  private initializer = inject(AppInitializerService);
  
  initResult: InitResult | null = null;
  
  async ngOnInit() {
    this.initResult = await this.initializer.init();
    
    if (!this.initResult.success) {
      console.error('Initialization errors:', this.initResult.errors);
    }
  }
}
```

### Reset on Logout

```ts
export class AuthService {
  private initializer = inject(AppInitializerService);
  
  async logout() {
    await this.api.logout();
    await this.initializer.reset(); // Resets all services + UI state
    this.router.navigate(['/landing']);
  }
}
```

### Init Result

```ts
interface InitResult {
  success: boolean;
  timestamp: Date;
  errors: string[];
  warnings: string[];
  duration: number;  // milliseconds
}
```

---

## 🏗️ Architecture Principles

### 1. Single Source of Truth

Each domain has **one owner**:

| Domain | Owner Service | State Location |
|--------|--------------|----------------|
| Authentication | `AuthService` | `user`, `isAuthenticated`, `currentRole` |
| Cart | `CartService` | `cart`, `cartItems`, `totalPrice` |
| Notifications | `NotificationService` | `notifications`, `unreadCount` |
| Chat | `ChatService` | `conversations`, `messages` |
| Marketplace | `MarketplaceService` | `products`, `categories`, `searchQuery` |

`AppStateService` **never** duplicates these. It may expose computed aggregates or read-only references.

### 2. Dependency Flow

```
Components
    ↓ inject
Domain Services  →  Own domain state (signals)
    ↓ inject (for aggregates)
AppStateService  →  UI state + computed aggregates
    ↓ inject
AppInitializer   →  Bootstrap orchestration
```

### 3. State Layering

- **UI Layer:** `AppStateService` (theme, sidebar, loading)
- **Domain Layer:** Feature services (cart, chat, orders)
- **API Layer:** HTTP services, WebSocket services

No layer owns another layer's state.

### 4. Guard Strategy: Hybrid Model

**Composite Guard** (baseline):
```ts
// Handles: auth, role, session
canActivate: [compositeGuard]
data: { auth: true, role: 'seller' }
```

**Specialized Guards** (domain logic):
```ts
// Handles: verification status, subscriptions, feature flags
canActivate: [compositeGuard, sellerVerifiedGuard]
```

Stack guards for complex rules. Composite handles common checks, specialized guards handle business logic.

---

## 📋 Migration Checklist

### Phase 0: Quick Fixes ✅
- [x] Fix `/home` → `/landing` bug in not-found component
- [x] Run local smoke test

### Phase 1: Foundation Files ✅
- [x] Create `/core-next/` directory
- [x] Create `routes.config.ts`
- [x] Create `route-state-map.ts`
- [x] Create `app-state.ui.ts`
- [x] Create `app-initializer.service.ts`
- [x] Create `power-plan-foundation.md`

### Phase 2: Validation Tooling ✅
- [x] Create `scripts/validate-routes.ts` (+ simple.js versions)
- [x] Create `scripts/validate-route-state-map.ts`
- [ ] Wire into CI (deferred to Phase 6)

### Phase 3: Ownership Cleanup ✅
- [x] Document ownership sheet (DOMAIN_OWNERSHIP.md)
- [x] Audit existing `AppStateService` for duplication (verified clean)
- [x] Plan migration of domain state to domain services

### Phase 4: Guards ✅
- [x] Create `composite.guard.ts` (placeholder until Phase 6)
- [x] Keep specialized guards (seller-verified.guard.ts)
- [x] Add unit tests (100+ test cases)

### Phase 5: Pilot Migration (Marketplace) ✅
- [x] Update Marketplace to use `ROUTES` constants (4 components)
- [x] Ensure Marketplace uses `MarketplaceService` for state (verified)
- [x] Add `route-state-map` entry (complete)
- [x] Test thoroughly (marketplace-pilot.spec.ts created)
- [x] Fixed buildPath() double-slash bug

### Phase 6: Atomic Cutover
- [ ] Freeze route-related PRs (48h window)
- [ ] Replace all hardcoded route strings
- [ ] Migrate `AppStateService` from `/core/` to `/core-next/`
- [ ] Run full validation suite
- [ ] Merge atomic commit

### Phase 7+: Progressive Migration
- [ ] Cart feature
- [ ] Orders feature
- [ ] Chat feature
- [ ] Notifications feature
- [ ] Profile feature
- [ ] Seller dashboard
- [ ] Admin panel

---

## 🛡️ Type Safety Strategy

### Route Type Extraction

```ts
type DeepValues<T> = T extends string
  ? T
  : T extends object
  ? { [K in keyof T]: DeepValues<T[K]> }[keyof T]
  : never;

export type RoutePaths = DeepValues<typeof ROUTES>;
export type AbsoluteRoutePaths = DeepValues<typeof ROUTES_ABSOLUTE>;
```

This enables:
```ts
// ✅ Valid
const route: RoutePaths = 'marketplace';

// ❌ Compile error
const route: RoutePaths = 'invalid-route';
```

### Route-State Map Validation

Ensure map keys match `ROUTES_ABSOLUTE` values:
```ts
export const ROUTE_STATE_MAP: Record<AbsoluteRoutePaths, RouteStateMeta> = {
  // Type error if key doesn't match route constant
  [ROUTES_ABSOLUTE.APP.MARKETPLACE]: { /* ... */ },
};
```

---

## 🧪 Testing Strategy

### Route Constants
```ts
describe('ROUTES', () => {
  it('should have all expected routes', () => {
    expect(ROUTES.AUTH.LOGIN).toBe('login');
    expect(ROUTES_ABSOLUTE.AUTH.LOGIN).toBe('/auth/login');
  });
  
  it('buildPath should construct valid paths', () => {
    expect(buildPath(ROUTES.APP.ROOT, ROUTES.APP.CART)).toBe('/app/cart');
  });
});
```

### Route-State Map
```ts
describe('ROUTE_STATE_MAP', () => {
  it('should map all major routes', () => {
    expect(ROUTE_STATE_MAP[ROUTES_ABSOLUTE.APP.MARKETPLACE]).toBeDefined();
  });
  
  it('should identify real-time routes', () => {
    const realtimeRoutes = getRealtimeRoutes();
    expect(realtimeRoutes).toContain('/app/chat');
  });
});
```

### AppState UI
```ts
describe('AppStateService', () => {
  it('should initialize UI state', () => {
    const service = TestBed.inject(AppStateService);
    service.initUIState();
    expect(service.isOnline()).toBe(true);
  });
  
  it('should toggle sidebar', () => {
    const service = TestBed.inject(AppStateService);
    const initial = service.sidebarOpen();
    service.toggleSidebar();
    expect(service.sidebarOpen()).toBe(!initial);
  });
});
```

### AppInitializer
```ts
describe('AppInitializerService', () => {
  it('should initialize successfully', async () => {
    const service = TestBed.inject(AppInitializerService);
    const result = await service.init();
    expect(result.success).toBe(true);
  });
  
  it('should be idempotent', async () => {
    const service = TestBed.inject(AppInitializerService);
    const result1 = await service.init();
    const result2 = await service.init();
    expect(result1).toBe(result2);
  });
});
```

---

## 📊 Dev Dashboard Plan

Once `route-state-map.ts` is stable, create `DevDashboardComponent`:

### Features
- Table view of all routes
- Services and signals per route
- Real-time indicator
- Cache strategy
- Auth requirements
- Preload priority

### Mockup
```
┌─────────────────────────────────────────────────────────────────────┐
│ Route State Dashboard                                    Total: 45  │
├─────────────────────────────────────────────────────────────────────┤
│ Route              │ Services         │ Signals    │ RT │ Auth │ Role │
├────────────────────┼──────────────────┼────────────┼────┼──────┼──────┤
│ /app/marketplace   │ Marketplace      │ products   │ ✗  │ ✗    │ -    │
│                    │ Category         │ categories │    │      │      │
├────────────────────┼──────────────────┼────────────┼────┼──────┼──────┤
│ /app/chat          │ Chat             │ messages   │ ✓  │ ✓    │ -    │
│                    │ Realtime         │ unread     │    │      │      │
│                    │ Notification     │ online     │    │      │      │
└────────────────────┴──────────────────┴────────────┴────┴──────┴──────┘
```

Implementation:
```ts
export class DevDashboardComponent {
  routeStateMap = ROUTE_STATE_MAP;
  routes = Object.keys(ROUTE_STATE_MAP);
  stats = getRouteStateStats();
}
```

---

## 🎯 Success Metrics

1. **Zero hardcoded route strings** outside of `routes.config.ts`
2. **Single state owner** per domain (no duplication)
3. **Full route coverage** in `route-state-map.ts`
4. **Type-safe navigation** (compile errors on invalid routes)
5. **Documented dependencies** (route → services mapping)

---

## 📝 Quick Reference

### Import Paths (after migration from /core-next/ to /core/)

```ts
import { ROUTES, ROUTES_ABSOLUTE, buildPath } from '@core/config/routes.config';
import { ROUTE_STATE_MAP, getRouteStateMeta } from '@core/config/route-state-map';
import { AppStateService } from '@core/state/app-state.ui';
import { AppInitializerService } from '@core/init/app-initializer.service';
```

### Common Patterns

**Navigate to route:**
```ts
this.router.navigate([ROUTES_ABSOLUTE.APP.MARKETPLACE]);
```

**Navigate with params:**
```ts
this.router.navigate([RouteParams.orderDetail(orderId)]);
```

**Check route metadata:**
```ts
const meta = getRouteStateMeta(this.router.url);
console.log('Services:', meta.services);
```

**Show toast:**
```ts
this.appState.showToast('Item added to cart', 'success');
```

**Set page title:**
```ts
this.appState.setPageTitle('Marketplace');
```

---

**Last Updated:** October 14, 2025  
**Next Review:** After Phase 5 (Marketplace Pilot)

