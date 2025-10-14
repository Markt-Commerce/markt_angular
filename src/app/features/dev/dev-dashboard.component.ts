import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ROUTES_ABSOLUTE, ROUTES } from '../../core/config/routes.config';
import { ROUTE_STATE_MAP, RouteStateMeta } from '../../core/config/route-state-map';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faRoute,
  faServer,
  faSignal,
  faDatabase,
  faClock,
  faShield,
  faSearch,
  faFilter,
  faCheckCircle,
  faExclamationTriangle,
  faCode,
  faBook
} from '@fortawesome/free-solid-svg-icons';

interface RouteInfo {
  path: string;
  meta: RouteStateMeta;
  category: 'public' | 'auth' | 'app';
  hasRealtime: boolean;
  requiresAuth: boolean;
  servicesCount: number;
}

@Component({
  selector: 'app-dev-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <fa-icon [icon]="faCode" class="text-primary"></fa-icon>
                Dev Dashboard
              </h1>
              <p class="mt-1 text-sm text-gray-600">Route architecture visualization & documentation</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">
                <span class="font-semibold text-gray-900">{{ routeCount }}</span> routes mapped
              </span>
              <button 
                (click)="openDocs()"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <fa-icon [icon]="faBook"></fa-icon>
                View Docs
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Stats Overview -->
      <section class=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Routes -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Routes</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ routeCount }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faRoute" class="text-2xl text-blue-600"></fa-icon>
              </div>
            </div>
          </div>

          <!-- Services Used -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Unique Services</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ uniqueServicesCount }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faServer" class="text-2xl text-green-600"></fa-icon>
              </div>
            </div>
          </div>

          <!-- Realtime Routes -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Realtime Routes</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ realtimeRoutesCount }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faClock" class="text-2xl text-purple-600"></fa-icon>
              </div>
            </div>
          </div>

          <!-- Protected Routes -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Protected Routes</p>
                <p class="text-3xl font-bold text-gray-900 mt-1">{{ protectedRoutesCount }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <fa-icon [icon]="faShield" class="text-2xl text-orange-600"></fa-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters and Search -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <fa-icon [icon]="faSearch" class="mr-2"></fa-icon>
                Search Routes
              </label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Search by path, service, or signal..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <fa-icon [icon]="faFilter" class="mr-2"></fa-icon>
                Category
              </label>
              <select
                [(ngModel)]="categoryFilter"
                (ngModelChange)="applyFilters()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="public">Public</option>
                <option value="auth">Authentication</option>
                <option value="app">Application</option>
              </select>
            </div>

            <!-- Feature Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <select
                [(ngModel)]="featureFilter"
                (ngModelChange)="applyFilters()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Features</option>
                <option value="realtime">Realtime</option>
                <option value="auth">Requires Auth</option>
                <option value="cached">Cached</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Routes List -->
      <section class=" mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 class="text-lg font-semibold text-gray-900">
              Route Dependencies
              <span class="ml-2 text-sm font-normal text-gray-600">({{ filteredRoutes().length }} routes)</span>
            </h2>
          </div>

          <div class="divide-y divide-gray-200">
            @for (route of filteredRoutes(); track route.path) {
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <!-- Route Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <code class="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-primary font-semibold">
                        {{ route.path }}
                      </code>
                      @if (route.meta.requiresAuth) {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <fa-icon [icon]="faShield" class="mr-1 text-xs"></fa-icon>
                          Protected
                        </span>
                      }
                      @if (route.hasRealtime) {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <fa-icon [icon]="faClock" class="mr-1 text-xs"></fa-icon>
                          Realtime
                        </span>
                      }
                      @if (route.meta.cache !== 'none') {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <fa-icon [icon]="faDatabase" class="mr-1 text-xs"></fa-icon>
                          {{ route.meta.cache }}
                        </span>
                      }
                    </div>
                    @if (route.meta.description) {
                      <p class="text-sm text-gray-600">{{ route.meta.description }}</p>
                    }
                  </div>
                </div>

                <!-- Services & Signals Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Services -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <fa-icon [icon]="faServer"></fa-icon>
                      Services ({{ route.meta.services.length }})
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      @for (service of route.meta.services; track service) {
                        <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {{ service }}
                        </span>
                      }
                      @if (route.meta.services.length === 0) {
                        <span class="text-xs text-gray-400 italic">No services required</span>
                      }
                    </div>
                  </div>

                  <!-- Signals -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <fa-icon [icon]="faSignal"></fa-icon>
                      Signals/State ({{ route.meta.signals.length }})
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      @for (signal of route.meta.signals; track signal) {
                        <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {{ signal }}
                        </span>
                      }
                      @if (route.meta.signals.length === 0) {
                        <span class="text-xs text-gray-400 italic">No signals required</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-12 text-center">
                <fa-icon [icon]="faExclamationTriangle" class="text-4xl text-gray-400 mb-4"></fa-icon>
                <p class="text-gray-600">No routes match your filters</p>
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DevDashboardComponent implements OnInit {
  // Icons
  faRoute = faRoute;
  faServer = faServer;
  faSignal = faSignal;
  faDatabase = faDatabase;
  faClock = faClock;
  faShield = faShield;
  faSearch = faSearch;
  faFilter = faFilter;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;
  faCode = faCode;
  faBook = faBook;

  private router = inject(Router);

  // Data
  routes = signal<RouteInfo[]>([]);
  filteredRoutes = signal<RouteInfo[]>([]);

  // Filters
  searchQuery = '';
  categoryFilter: '' | 'public' | 'auth' | 'app' = '';
  featureFilter: '' | 'realtime' | 'auth' | 'cached' = '';

  // Computed stats
  routeCount = computed(() => this.routes().length);
  uniqueServicesCount = computed(() => {
    const services = new Set<string>();
    this.routes().forEach(route => {
      route.meta.services.forEach(s => services.add(s));
    });
    return services.size;
  });
  realtimeRoutesCount = computed(() => 
    this.routes().filter(r => r.hasRealtime).length
  );
  protectedRoutesCount = computed(() => 
    this.routes().filter(r => r.requiresAuth).length
  );

  ngOnInit(): void {
    this.loadRoutes();
    this.applyFilters();
  }

  private loadRoutes(): void {
    const routeInfos: RouteInfo[] = [];

    Object.entries(ROUTE_STATE_MAP).forEach(([path, meta]) => {
      const category = this.categorizeRoute(path);
      routeInfos.push({
        path,
        meta,
        category,
        hasRealtime: meta.realtime,
        requiresAuth: meta.requiresAuth ?? false,
        servicesCount: meta.services.length
      });
    });

    // Sort by path
    routeInfos.sort((a, b) => a.path.localeCompare(b.path));

    this.routes.set(routeInfos);
  }

  private categorizeRoute(path: string): 'public' | 'auth' | 'app' {
    if (path.startsWith('/auth')) return 'auth';
    if (path.startsWith('/app')) return 'app';
    return 'public';
  }

  applyFilters(): void {
    let filtered = this.routes();

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(route => 
        route.path.toLowerCase().includes(query) ||
        route.meta.services.some(s => s.toLowerCase().includes(query)) ||
        route.meta.signals.some(s => s.toLowerCase().includes(query)) ||
        route.meta.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(route => route.category === this.categoryFilter);
    }

    // Feature filter
    if (this.featureFilter === 'realtime') {
      filtered = filtered.filter(route => route.hasRealtime);
    } else if (this.featureFilter === 'auth') {
      filtered = filtered.filter(route => route.requiresAuth);
    } else if (this.featureFilter === 'cached') {
      filtered = filtered.filter(route => route.meta.cache !== 'none');
    }

    this.filteredRoutes.set(filtered);
  }

  openDocs(): void {
    // Try to open docs in separate server, fallback to helpful message
    const docsUrl = 'http://localhost:8080/architecture.md';
    const newWindow = window.open(docsUrl, '_blank');
    
    // If window failed to open (server not running), show helpful message
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert(`Documentation not accessible.\n\nTo view docs:\n1. Run: python3 -m http.server 8080 --directory docs\n2. Then visit: ${docsUrl}\n\nOr view directly in your IDE: docs/architecture.md`);
    }
  }
}

