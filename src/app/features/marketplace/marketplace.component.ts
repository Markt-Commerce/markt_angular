import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  faSearch,
  faFilter,
  faSort,
  faThLarge,
  faList,
  faHeart,
  faShoppingCart,
  faStar,
  faEye,
  faTimes,
  faChevronDown,
  faChevronUp,
  faSlidersH,
  faTags,
  faMapMarkerAlt,
  faClock,
  faUser,
  faStore,
  faExclamationTriangle,
  faCheck,
  faBell,
  faLaptop,
  faBook,
  faFire,
  faComment,
  faMobile,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Product } from '../../domains/marketplace/models/product.model';
import { ProductSearchParamsDto } from '../../domains/marketplace/models/product.dto';
import { MarketplaceService } from '../../domains/marketplace/services/marketplace.service';
import { CartService, Cart } from '../../domains/cart';
import { CategoryService, CategorySummary } from '../../domains/categories';
import { SearchService } from '../../core/services/search.service';
import { AppStateService } from '../../core/services/app-state.service';
import { AuthService } from '../../domains/authentication/services/auth.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { MediaOptimizationService } from '../../core/services/media-optimization.service';
import { TypeSafetyService } from '../../core/services/type-safety.service';
import { ObservableUtilsService } from '../../core/services/observable-utils.service';
import { SocialService } from '../../domains/social/services/social.service';
import type { Post } from '../../domains/social';
import { ROUTES_ABSOLUTE, buildPath } from '../../core/config/routes.config';

type UnknownRecord = Record<string, unknown>;

interface MarketplaceProductImage {
  url: string;
}

interface MarketplaceSellerSummary {
  id: string;
  shop_name: string;
  profile_picture_url: string;
  is_verified: boolean;
  location: string;
}

interface MarketplaceProductListing {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  distance: string;
  images: MarketplaceProductImage[];
  seller: MarketplaceSellerSummary;
  description: string;
  stock: number;
  category: string;
  compare_at_price?: number;
  condition?: string;
}

interface MarketplaceCategorySummary {
  id: string;
  name: string;
  count: number;
}

interface LiveSellerPreview {
  id: string;
  name: string;
  avatar: string;
  description: string;
  rating: number;
  isOnline: boolean;
}

interface PaginatedProductPayload {
  items?: MarketplaceProductListing[];
  results?: MarketplaceProductListing[];
  pagination?: {
    total_items?: number;
    total_pages?: number;
  };
  meta?: {
    total?: number;
    total_pages?: number;
  };
}

interface ProductApiResponse {
  success?: boolean;
  data?: PaginatedProductPayload;
  [key: string]: unknown;
}

type SocialFeedItem = UnknownRecord;

interface SocialFeedResponse {
  data?: SocialFeedItem[];
  items?: SocialFeedItem[];
}

interface MixedContentItem {
  type: 'product' | 'post';
  data: MarketplaceProductListing | SocialFeedItem;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Filter Bar -->
      <section class="bg-white border-b border-border">
        <div class=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 overflow-x-auto">
              <button
                *ngFor="let category of categories"
                (click)="onCategorySelect(category.id)"
                [class.bg-primary]="selectedCategory === category.id"
                [class.text-white]="selectedCategory === category.id"
                [class.text-gray-600]="selectedCategory !== category.id"
                [class.hover:bg-gray-100]="selectedCategory !== category.id"
                class="px-4 py-2 rounded-lg font-medium whitespace-nowrap"
              >
                {{ category.name }}
              </button>
            </div>
            <div class="flex items-center space-x-3">
              <button class="p-2 text-gray-600 hover:text-primary">
                <fa-icon [icon]="faFilter"></fa-icon>
              </button>
              <button
                (click)="viewMode = 'grid'"
                [class.text-primary]="viewMode === 'grid'"
                [class.text-gray-400]="viewMode !== 'grid'"
                class="p-2 hover:text-primary"
              >
                <fa-icon [icon]="faGrid3"></fa-icon>
              </button>
              <button
                (click)="viewMode = 'list'"
                [class.text-primary]="viewMode === 'list'"
                [class.text-gray-400]="viewMode !== 'list'"
                class="p-2 hover:text-primary"
              >
                <fa-icon [icon]="faList"></fa-icon>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Section -->
      <section
        class="bg-gradient-to-r from-primary to-secondary text-white py-12"
      >
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 class="text-4xl font-bold mb-4">Featured Campus Deals</h2>
              <p class="text-xl mb-6 opacity-90">
                Discover amazing products from verified student sellers
              </p>
              <button
                class="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Explore Featured Items
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/10 backdrop-blur rounded-lg p-4">
                <fa-icon [icon]="faMobile" class="text-3xl mb-2"></fa-icon>
                <h3 class="font-semibold">Electronics</h3>
                <p class="text-sm opacity-80">Latest gadgets</p>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-lg p-4">
                <fa-icon [icon]="faBook" class="text-3xl mb-2"></fa-icon>
                <h3 class="font-semibold">Textbooks</h3>
                <p class="text-sm opacity-80">Academic books</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Sellers -->
      <section class="py-8 bg-white">
        <div class=" mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Live Sellers</h2>
            <span
              class="text-primary font-medium hover:underline cursor-pointer"
              >View All</span
            >
          </div>
          <div class="flex space-x-4 overflow-x-auto pb-4">
            <div
              *ngFor="let seller of liveSellers"
              class="flex-shrink-0 bg-white border border-border rounded-lg p-4 w-64"
            >
              <div class="flex items-center space-x-3 mb-3">
                <div class="relative">
                  <img
                    [src]="seller.avatar"
                    [alt]="seller.name"
                    class="h-10 w-10 rounded-full"
                  />
                  <div
                    class="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full h-4 w-4"
                  ></div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ seller.name }}</h3>
                  <p class="text-sm text-gray-500">Online now</p>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ seller.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1">
                  <fa-icon
                    [icon]="faStar"
                    class="text-yellow-400 text-xs"
                  ></fa-icon>
                  <span class="text-sm font-medium">{{ seller.rating }}</span>
                </div>
                <button
                  class="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90"
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Product Grid -->
      <section class="py-8">
        <div class=" mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Recent Listings</h2>
            <select
              [(ngModel)]="sortBy"
              (change)="onSortChange()"
              class="border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Most Popular</option>
            </select>
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <!-- Product Card 1 -->
            <div
              class="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              (click)="navigateToProduct('macbook-pro-13-2021')"
            >
              <div class="relative">
                <img
                  class="w-full h-48 object-cover"
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/9e580a234a-dfedd1ac85a893bb0f65.png"
                  alt="modern laptop computer on desk, clean product photography"
                />
                <div
                  class="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium"
                >
                  Featured
                </div>
                <div
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="bg-white/80 p-2 rounded-full hover:bg-white"
                    (click)="
                      toggleWishlistFromTemplate('macbook-pro-13-2021', $event)
                    "
                  >
                    <fa-icon [icon]="faHeart" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1">
                  MacBook Pro 13" 2021
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Excellent condition, barely used
                </p>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xl font-bold text-primary">$1,200</span>
                  <span class="text-sm text-gray-500">Like New</span>
                </div>
                <div class="flex items-center space-x-2 mb-3">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg"
                    alt="Seller"
                    class="h-6 w-6 rounded-full"
                  />
                  <span class="text-sm text-gray-600">Mike Davis</span>
                  <div class="flex items-center space-x-1">
                    <fa-icon
                      [icon]="faStar"
                      class="text-yellow-400 text-xs"
                    ></fa-icon>
                    <span class="text-xs">4.9</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                    (click)="makeOffer('macbook-pro-13-2021', $event)"
                  >
                    Make Offer
                  </button>
                  <button
                    class="px-3 py-2 border border-border rounded-lg hover:bg-gray-50"
                    (click)="$event.stopPropagation()"
                  >
                    <fa-icon [icon]="faComment" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Card 2 -->
            <div
              class="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              (click)="navigateToProduct('calculus-textbook-bundle')"
            >
              <div class="relative">
                <img
                  class="w-full h-48 object-cover"
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d2e5820307-936957b5d254a5a5cb38.png"
                  alt="textbook stack college books academic"
                />
                <div
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button class="bg-white/80 p-2 rounded-full hover:bg-white">
                    <fa-icon [icon]="faHeart" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1">
                  Calculus Textbook Bundle
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Math 101-102 required books
                </p>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xl font-bold text-primary">$85</span>
                  <span class="text-sm text-gray-500">Good</span>
                </div>
                <div class="flex items-center space-x-2 mb-3">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg"
                    alt="Seller"
                    class="h-6 w-6 rounded-full"
                  />
                  <span class="text-sm text-gray-600">Emma Wilson</span>
                  <div class="flex items-center space-x-1">
                    <fa-icon
                      [icon]="faStar"
                      class="text-yellow-400 text-xs"
                    ></fa-icon>
                    <span class="text-xs">4.7</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                    (click)="makeOffer('sony-wh-1000xm4-headphones', $event)"
                  >
                    Make Offer
                  </button>
                  <button
                    class="px-3 py-2 border border-border rounded-lg hover:bg-gray-50"
                    (click)="$event.stopPropagation()"
                  >
                    <fa-icon [icon]="faComment" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Card 3 -->
            <div
              class="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              (click)="navigateToProduct('vintage-denim-jacket')"
            >
              <div class="relative">
                <img
                  class="w-full h-48 object-cover"
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/1d0a014a05-98e516dc00329c7cf656.png"
                  alt="vintage denim jacket fashion clothing"
                />
                <div
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button class="bg-white/80 p-2 rounded-full hover:bg-white">
                    <fa-icon [icon]="faHeart" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1">
                  Vintage Denim Jacket
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Size M, perfect for campus style
                </p>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xl font-bold text-primary">$45</span>
                  <span class="text-sm text-gray-500">Very Good</span>
                </div>
                <div class="flex items-center space-x-2 mb-3">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg"
                    alt="Seller"
                    class="h-6 w-6 rounded-full"
                  />
                  <span class="text-sm text-gray-600">Lisa Park</span>
                  <div class="flex items-center space-x-1">
                    <fa-icon
                      [icon]="faStar"
                      class="text-yellow-400 text-xs"
                    ></fa-icon>
                    <span class="text-xs">5.0</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                    (click)="makeOffer('vintage-denim-jacket', $event)"
                  >
                    Make Offer
                  </button>
                  <button
                    class="px-3 py-2 border border-border rounded-lg hover:bg-gray-50"
                    (click)="$event.stopPropagation()"
                  >
                    <fa-icon [icon]="faComment" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Card 4 -->
            <div
              class="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              (click)="navigateToProduct('study-desk-with-drawers')"
            >
              <div class="relative">
                <img
                  class="w-full h-48 object-cover"
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/92f2ea4247-12d5dc88e2f1267dcf65.png"
                  alt="study desk furniture wooden clean minimalist"
                />
                <div
                  class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button class="bg-white/80 p-2 rounded-full hover:bg-white">
                    <fa-icon [icon]="faHeart" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1">
                  Study Desk with Drawers
                </h3>
                <p class="text-sm text-gray-600 mb-2">
                  Perfect for dorm room setup
                </p>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xl font-bold text-primary">$120</span>
                  <span class="text-sm text-gray-500">Excellent</span>
                </div>
                <div class="flex items-center space-x-2 mb-3">
                  <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg"
                    alt="Seller"
                    class="h-6 w-6 rounded-full"
                  />
                  <span class="text-sm text-gray-600">Tom Rodriguez</span>
                  <div class="flex items-center space-x-1">
                    <fa-icon
                      [icon]="faStar"
                      class="text-yellow-400 text-xs"
                    ></fa-icon>
                    <span class="text-xs">4.8</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                    (click)="makeOffer('study-desk-with-drawers', $event)"
                  >
                    Make Offer
                  </button>
                  <button
                    class="px-3 py-2 border border-border rounded-lg hover:bg-gray-50"
                    (click)="$event.stopPropagation()"
                  >
                    <fa-icon [icon]="faComment" class="text-gray-600"></fa-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <button
              class="bg-white border border-border text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Load More Products
            </button>
          </div>
        </div>
      </section>

      <!-- Trending Section -->
      <section class="py-8 bg-light">
        <div class=" mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Trending This Week
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg p-6 border border-border">
              <div class="flex items-center space-x-3 mb-4">
                <fa-icon [icon]="faFire" class="text-primary text-xl"></fa-icon>
                <h3 class="font-semibold text-gray-900">Most Viewed</h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <img
                    class="w-12 h-12 rounded object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/ddd07042da-d59618a1ef4e80ff46dc.png"
                    alt="gaming headset product"
                  />
                  <div>
                    <p class="font-medium text-sm">Gaming Headset</p>
                    <p class="text-primary font-semibold">$65</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <img
                    class="w-12 h-12 rounded object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/ab03d9c126-6bb14268bf91719ed74d.png"
                    alt="coffee maker appliance"
                  />
                  <div>
                    <p class="font-medium text-sm">Coffee Maker</p>
                    <p class="text-primary font-semibold">$35</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-6 border border-border">
              <div class="flex items-center space-x-3 mb-4">
                <i class="fa-solid fa-heart text-red-500 text-xl"></i>
                <h3 class="font-semibold text-gray-900">Most Liked</h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <img
                    class="w-12 h-12 rounded object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/228f4dad58-d835ef58698757d54300.png"
                    alt="plant succulent decoration"
                  />
                  <div>
                    <p class="font-medium text-sm">Plant Collection</p>
                    <p class="text-primary font-semibold">$25</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <img
                    class="w-12 h-12 rounded object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/970ecf1a9e-161727dfa5debd0b5b74.png"
                    alt="backpack student bag"
                  />
                  <div>
                    <p class="font-medium text-sm">Student Backpack</p>
                    <p class="text-primary font-semibold">$40</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg p-6 border border-border">
              <div class="flex items-center space-x-3 mb-4">
                <i class="fa-solid fa-clock text-yellow-500 text-xl"></i>
                <h3 class="font-semibold text-gray-900">Ending Soon</h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <img
                    class="w-12 h-12 rounded object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/bce6d37881-406bc75ae4a35b2a3530.png"
                    alt="guitar musical instrument"
                  />
                  <div>
                    <p class="font-medium text-sm">Acoustic Guitar</p>
                    <p class="text-primary font-semibold">$180</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <img
                    class="w-12 h-12 rounded object-cover"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/93bef5ffcb-0dfdc9ac4b88f5111977.png"
                    alt="sneakers shoes fashion"
                  />
                  <div>
                    <p class="font-medium text-sm">Designer Sneakers</p>
                    <p class="text-primary font-semibold">$95</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class MarketplaceComponent implements OnInit {
  private marketplaceService = inject(MarketplaceService);
  private cartService = inject(CartService);
  private categoryService = inject(CategoryService);
  private searchService = inject(SearchService);
  private appStateService = inject(AppStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);
  access = inject(AccessControlService);
  media = inject(MediaOptimizationService);
  private typeSafety = inject(TypeSafetyService);
  private observableUtils = inject(ObservableUtilsService);
  private socialService = inject(SocialService);

  // Icons
  faSearch = faSearch;
  faFilter = faFilter;
  faSort = faSort;
  faGrid3 = faThLarge;
  faList = faList;
  faHeart = faHeart;
  faShoppingCart = faShoppingCart;
  faStar = faStar;
  faEye = faEye;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faSlidersH = faSlidersH;
  faTags = faTags;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faUser = faUser;
  faStore = faStore;
  faExclamationTriangle = faExclamationTriangle;
  faCheck = faCheck;
  faBell = faBell;
  faLaptop = faLaptop;
  faBook = faBook;
  faFire = faFire;
  faComment = faComment;
  faMobile = faMobile;

  private readonly featuredProductLookup: Record<
    string,
    MarketplaceProductListing
  > = {
    'macbook-pro-13-2021': {
      id: 'macbook-pro-13-2021',
      name: 'MacBook Pro 13" 2021',
      price: 1200,
      currency: 'USD',
      rating: 4.9,
      review_count: 268,
      distance: '1.2',
      images: [
        {
          url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/9e580a234a-dfedd1ac85a893bb0f65.png',
        },
      ],
      seller: {
        id: 'seller-macbook',
        shop_name: 'Campus Tech Deals',
        profile_picture_url:
          'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        is_verified: true,
        location: 'Campus Marketplace',
      },
      description: 'Gently used MacBook Pro 13" (2021) with Apple M1 chip.',
      stock: 3,
      category: 'Electronics',
      compare_at_price: 1350,
      condition: 'Like New',
    },
  };

  // State
  products: MarketplaceProductListing[] = [];
  categories: MarketplaceCategorySummary[] = [];
  liveSellers: LiveSellerPreview[] = [];
  isLoading = false;
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = true; // Show filters by default to match Figma design
  errorMessage = '';
  wishlistItems: string[] = [];

  // Search and filters
  searchQuery = '';
  sortBy: ProductSearchParamsDto['sort_by'] = 'newest'; // Default to 'newest' to match Figma design
  selectedCategory = 'all';
  selectedCategories: string[] = [];
  priceRange: { min: number | null; max: number | null } = {
    min: null,
    max: null,
  };
  selectedRating: number | null = null;
  selectedLocations: string[] = [];

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalResults = 1247; // Default value to match Figma design

  // Mock data
  locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'];
  recommendedProducts: MarketplaceProductListing[] = [];
  trendingProducts: MarketplaceProductListing[] = [];

  // Content mixing
  mixedContent: MixedContentItem[] = [];
  socialPosts: SocialFeedItem[] = [];
  private currentCartSnapshot: Cart | UnknownRecord | null = null;
  enableContentMixing = true;

  ngOnInit(): void {
    this.loadFigmaMockData();
    this.setupSubscriptions();
  }

  loadFigmaMockData(): void {
    // Mock data that matches the Figma design exactly
    this.products = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 89.99,
        currency: 'USD',
        rating: 5.0,
        review_count: 24,
        distance: '2.1',
        images: [
          { url: '/assets/images/products/premium-wireless-headphones.jpg' },
        ],
        seller: {
          id: 'seller1',
          shop_name: 'TechStore',
          profile_picture_url: '/assets/images/sellers/techstore-avatar.jpg',
          is_verified: true,
          location: 'San Francisco, CA',
        },
        description:
          'High-quality wireless headphones with noise cancellation and premium sound quality.',
        stock: 15,
        category: 'Electronics',
      },
      {
        id: '2',
        name: 'Vintage Leather Jacket',
        price: 125.0,
        currency: 'USD',
        rating: 4.0,
        review_count: 18,
        distance: '1.5',
        images: [{ url: '/assets/images/products/vintage-leather-jacket.jpg' }],
        seller: {
          id: 'seller2',
          shop_name: 'StyleHub',
          profile_picture_url: '/assets/images/sellers/stylehub-avatar.jpg',
          is_verified: true,
          location: 'Los Angeles, CA',
        },
        description: 'Authentic vintage leather jacket in excellent condition.',
        stock: 8,
        category: 'Fashion',
      },
      {
        id: '3',
        name: 'Succulent Plant Collection',
        price: 35.99,
        currency: 'USD',
        rating: 5.0,
        review_count: 31,
        distance: '3.2',
        images: [
          { url: '/assets/images/products/succulent-plant-collection.jpg' },
        ],
        seller: {
          id: 'seller3',
          shop_name: 'GreenThumb',
          profile_picture_url: '/assets/images/sellers/greenthumb-avatar.jpg',
          is_verified: true,
          location: 'Portland, OR',
        },
        description:
          'Beautiful collection of 6 different succulent plants perfect for home decoration.',
        stock: 12,
        category: 'Home & Garden',
      },
      {
        id: '4',
        name: 'Premium Yoga Mat',
        price: 42.5,
        currency: 'USD',
        rating: 4.0,
        review_count: 12,
        distance: '4.1',
        images: [{ url: '/assets/images/products/premium-yoga-mat.jpg' }],
        seller: {
          id: 'seller4',
          shop_name: 'FitLife',
          profile_picture_url: '/assets/images/sellers/fitlife-avatar.jpg',
          is_verified: true,
          location: 'Austin, TX',
        },
        description:
          'Non-slip premium yoga mat with excellent grip and cushioning.',
        stock: 20,
        category: 'Sports',
      },
      {
        id: '5',
        name: 'Handmade Ceramic Mug',
        price: 28.0,
        currency: 'USD',
        rating: 5.0,
        review_count: 9,
        distance: '1.8',
        images: [{ url: '/assets/images/products/handmade-ceramic-mug.jpg' }],
        seller: {
          id: 'seller5',
          shop_name: 'ArtisanCrafts',
          profile_picture_url:
            '/assets/images/sellers/artisancrafts-avatar.jpg',
          is_verified: true,
          location: 'Seattle, WA',
        },
        description:
          'Beautiful handmade ceramic mug with unique glazing pattern.',
        stock: 25,
        category: 'Home & Garden',
      },
      {
        id: '6',
        name: 'Protective Phone Case',
        price: 24.99,
        currency: 'USD',
        rating: 4.5,
        review_count: 15,
        distance: '2.5',
        images: [{ url: '/assets/images/products/protective-phone-case.jpg' }],
        seller: {
          id: 'seller6',
          shop_name: 'TechStore',
          profile_picture_url: '/assets/images/sellers/techstore-avatar.jpg',
          is_verified: true,
          location: 'San Francisco, CA',
        },
        description:
          'Durable protective case for iPhone with military-grade protection.',
        stock: 30,
        category: 'Electronics',
      },
    ];

    this.categories = [
      { id: 'all', name: 'All Items', count: 1247 },
      { id: 'electronics', name: 'Electronics', count: 45 },
      { id: 'books', name: 'Books', count: 32 },
      { id: 'clothing', name: 'Clothing', count: 28 },
      { id: 'furniture', name: 'Furniture', count: 19 },
      { id: 'sports', name: 'Sports', count: 15 },
    ];

    this.liveSellers = [
      {
        id: '1',
        name: 'Alex Chen',
        avatar:
          'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
        description: 'Selling electronics and gadgets',
        rating: 4.9,
        isOnline: true,
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        avatar:
          'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        description: 'Fashion and accessories',
        rating: 4.8,
        isOnline: true,
      },
    ];

    this.isLoading = false;
    this.errorMessage = '';
  }

  loadMarketplaceData(): void {
    this.isLoading = true;

    // Optimized: Combined marketplace data loading with social posts
    combineLatest([
      this.marketplaceService.getProducts({
        page: this.currentPage,
        per_page: 20,
        status: 'active',
      }),
      this.categoryService.getCategorySummaries(),
    ]).subscribe({
      next: ([productsResponse, categorySummaries]) => {
        const productResult = this.resolveProductPayload(productsResponse);
        this.products = productResult.items;
        this.totalResults = productResult.totalItems;
        this.totalPages = productResult.totalPages;

        const mappedCategories = this.normalizeCategorySummaries(
          categorySummaries,
          productResult.totalItems
        );
        if (mappedCategories.length > 0) {
          this.categories = mappedCategories;
        }

        // Load social posts for content mixing
        this.loadSocialPosts();

        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please try again.';
        // Fallback: try with basic parameters
        this.marketplaceService
          .getProducts({
            page: this.currentPage,
            per_page: 20,
            status: 'active',
          })
          .subscribe({
            next: (fallbackRes) => {
              const fallbackResult = this.resolveProductPayload(fallbackRes);
              if (fallbackResult.items.length > 0) {
                this.products = fallbackResult.items;
                this.totalResults = fallbackResult.totalItems;
                this.totalPages = fallbackResult.totalPages;
                this.errorMessage = '';
              }
              this.isLoading = false;
            },
            error: (fallbackErr) => {
              console.error('Error loading products (fallback):', fallbackErr);
              this.products = [];
              this.isLoading = false;
              this.errorMessage =
                'Failed to load products. Please check your connection and try again.';
            },
          });
      },
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to search query changes
    this.searchService.getSearchQuery$().subscribe((query) => {
      this.searchQuery = query;
    });

    this.cartService.cart$.subscribe((cart) => {
      this.currentCartSnapshot = cart as Cart | UnknownRecord | null;
    });
  }

  onSearchInput(): void {
    this.searchService.setSearchQuery(this.searchQuery);
    this.currentPage = 1;
    this.filterProducts();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.filterProducts();
  }

  onCategorySelect(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.filterProducts();
  }

  onCategoryToggle(categoryId: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    if (input.checked) {
      this.selectedCategories = [...this.selectedCategories, categoryId];
    } else {
      this.selectedCategories = this.selectedCategories.filter(
        (id) => id !== categoryId
      );
    }
    this.currentPage = 1;
    this.filterProducts();
  }

  onPriceChange(): void {
    this.currentPage = 1;
    this.filterProducts();
  }

  onRatingChange(rating: number): void {
    this.selectedRating = rating;
    this.currentPage = 1;
    this.filterProducts();
  }

  onLocationToggle(location: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    if (input.checked) {
      this.selectedLocations = [...this.selectedLocations, location];
    } else {
      this.selectedLocations = this.selectedLocations.filter(
        (loc) => loc !== location
      );
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const categoryIds = (this.selectedCategories ?? [])
      .map((categoryId) => Number.parseInt(categoryId, 10))
      .filter((value) => Number.isFinite(value));

    const params: ProductSearchParamsDto & { locations?: string[] } = {
      page: this.currentPage,
      search: this.searchQuery || undefined,
      sort_by: this.sortBy,
      category_ids: categoryIds.length > 0 ? categoryIds : undefined,
      price_min: this.priceRange.min ?? undefined,
      price_max: this.priceRange.max ?? undefined,
      rating_min: this.selectedRating ?? undefined,
      locations:
        this.selectedLocations.length > 0
          ? [...this.selectedLocations]
          : undefined,
    };

    this.marketplaceService.getProducts(params).subscribe({
      next: (response) => {
        const result = this.resolveProductPayload(response);
        this.products = result.items;
        this.totalResults = result.totalItems;
        this.totalPages = result.totalPages;
        this.isLoading = false;
        this.errorMessage = '';
        this.mixContent();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load products. Please try again.';
        this.products = [];
      },
    });
  }

  private loadProductsForSeller(sellerId: string): void {
    this.isLoading = true;
    const params = {
      page: 1,
      per_page: 20,
      seller_id: sellerId,
      status: 'active' as const,
    };
    this.marketplaceService.getProducts(params).subscribe({
      next: (response) => {
        const result = this.resolveProductPayload(response);
        this.products = result.items;
        this.totalResults = result.totalItems;
        this.totalPages = result.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading seller products:', error);
        this.products = [];
        this.isLoading = false;
      },
    });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.priceRange = { min: null, max: null };
    this.selectedRating = null;
    this.selectedLocations = [];
    this.searchQuery = '';
    this.currentPage = 1;
    this.filterProducts();
  }

  filterProducts(): void {
    // Start with all products
    let filteredProducts = [...this.products];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.seller.shop_name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        this.selectedCategories.includes(
          product.category.toLowerCase().replace(' & ', '-').replace(' ', '-')
        )
      );
    }

    // Apply price filter
    if (this.priceRange.min !== null) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= (this.priceRange.min ?? 0)
      );
    }
    if (this.priceRange.max !== null) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= (this.priceRange.max ?? Infinity)
      );
    }

    // Apply rating filter
    if (this.selectedRating !== null) {
      filteredProducts = filteredProducts.filter(
        (product) => product.rating >= (this.selectedRating ?? 0)
      );
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // For mock data, we'll just keep the original order
        break;
      default:
        break;
    }

    // Update the products array with filtered results
    this.products = filteredProducts;
    this.totalResults = filteredProducts.length;
  }

  addToCart(product: MarketplaceProductListing): void {
    if (!product || !product.id) {
      console.error('Invalid product data');
      return;
    }

    // Check if product is already in cart
    if (this.isProductInCart(product.id)) {
      this.appStateService.showNotification({
        type: 'info',
        message: 'Product is already in your cart',
      });
      return;
    }

    this.observableUtils.createSafeObservable({
      source: this.cartService.addToCart(product.id, 1),
      successHandler: () => {
        this.appStateService.showNotification({
          type: 'success',
          message: `${product.name} added to cart successfully`,
        });
      },
      errorSetter: (error: string | null) => {
        console.error('Error adding to cart:', error);
        this.appStateService.showNotification({
          type: 'error',
          message: error || 'Failed to add product to cart',
        });
      },
    });
  }

  toggleWishlistFromTemplate(productId: string, event: Event): void {
    event.stopPropagation();

    const product =
      this.findProductById(productId) ?? this.featuredProductLookup[productId];

    if (!product) {
      this.appStateService.showNotification({
        type: 'error',
        message: 'Unable to find product details for wishlist update.',
      });
      return;
    }

    this.toggleWishlist(product);
  }

  toggleWishlist(product: MarketplaceProductListing): void {
    if (!product || !product.id) {
      console.error('Invalid product data');
      return;
    }

    const isCurrentlyInWishlist = this.isInWishlist(product);

    // Toggle wishlist state locally (API integration pending)
    const newWishlistState = !isCurrentlyInWishlist;
    this.updateWishlistState(product.id, newWishlistState);

    this.appStateService.showNotification({
      type: 'success',
      message: `${product.name} ${
        newWishlistState ? 'added to' : 'removed from'
      } wishlist`,
    });
  }

  isInWishlist(product: MarketplaceProductListing): boolean {
    if (!product || !product.id) return false;
    // Check against local wishlist state
    return this.wishlistItems.includes(product.id);
  }

  private updateWishlistState(productId: string, isInWishlist: boolean): void {
    if (isInWishlist) {
      if (!this.wishlistItems.includes(productId)) {
        this.wishlistItems.push(productId);
      }
    } else {
      this.wishlistItems = this.wishlistItems.filter((id) => id !== productId);
    }
  }

  private findProductById(
    productId: string
  ): MarketplaceProductListing | undefined {
    const collections: MarketplaceProductListing[][] = [
      this.products,
      this.recommendedProducts,
      this.trendingProducts,
      this.extractMixedProductListings(),
    ];

    for (const collection of collections) {
      const match = collection.find((item) => item.id === productId);
      if (match) {
        return match;
      }
    }

    return undefined;
  }

  private extractMixedProductListings(): MarketplaceProductListing[] {
    return this.mixedContent
      .filter(
        (
          item
        ): item is {
          type: 'product';
          data: MarketplaceProductListing;
        } => item.type === 'product'
      )
      .map((item) => item.data);
  }

  private hasGetItemsMethod(
    value: unknown
  ): value is { getItems: () => readonly unknown[] } {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const record = value as UnknownRecord;
    const getItemsCandidate = record['getItems'];
    return typeof getItemsCandidate === 'function';
  }

  private extractItemsFromCartRecord(value: unknown): unknown[] | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as UnknownRecord;
    const itemsCandidate = record['items'];
    return Array.isArray(itemsCandidate) ? itemsCandidate : null;
  }

  private cartItemMatchesProduct(item: unknown, productId: string): boolean {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const itemRecord = item as UnknownRecord;
    const productCandidate = itemRecord['product'];

    if (productCandidate && typeof productCandidate === 'object') {
      const productRecord = productCandidate as UnknownRecord;
      if (productRecord['id'] === productId) {
        return true;
      }
    }

    const productIdCandidate = itemRecord['product_id'];
    return productIdCandidate === productId;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getDiscountPercent(product: MarketplaceProductListing): number {
    const price = Number(product?.price ?? 0);
    const compare = Number(product?.compare_at_price ?? 0);
    if (!compare || compare <= price) return 0;
    return Math.round(((compare - price) / compare) * 100);
  }

  // Helper method for getting product image URLs
  getProductImageUrl(imageData?: MarketplaceProductImage): string {
    if (!imageData || typeof imageData.url !== 'string') {
      return '/assets/images/product-placeholder.png';
    }
    // For mock data, imageData.url is already the full path
    return imageData.url || '/assets/images/product-placeholder.png';
  }

  // Additional marketplace endpoint integrations
  getProducts(): void {
    this.marketplaceService.getProducts().subscribe({
      next: (response) => {
        const result = this.resolveProductPayload(response);
        this.products = result.items;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
      },
    });
  }

  getRecommendedProducts(): void {
    this.marketplaceService.getRecommendedProducts().subscribe({
      next: (response) => {
        const result = this.resolveProductPayload(response);
        this.recommendedProducts = result.items;
      },
      error: (error) => {
        console.error('Error loading recommended products:', error);
        this.recommendedProducts = [];
      },
    });
  }

  getTrendingProducts(): void {
    this.marketplaceService.getTrendingProducts().subscribe({
      next: (products) => {
        const result = this.resolveProductPayload(products);
        this.trendingProducts = result.items;
      },
      error: (error) => {
        console.error('Error loading trending products:', error);
        this.trendingProducts = [];
      },
    });
  }

  trackProductView(productId: string): void {
    this.marketplaceService.trackProductView(productId).subscribe({
      next: () => {
        // Product view tracked successfully
      },
      error: (error) => {
        console.error('Error tracking product view:', error);
      },
    });
  }

  upvoteReview(reviewId: string): void {
    this.marketplaceService.upvoteReview(reviewId).subscribe({
      next: () => {
        // Review upvoted successfully
      },
      error: (error) => {
        console.error('Error upvoting review:', error);
      },
    });
  }

  // Content Mixing Algorithm
  private loadSocialPosts(): void {
    this.observableUtils.createSafeObservable<SocialFeedResponse>({
      source: this.socialService
        .getFeed({ type: 'trending', per_page: 20 })
        .pipe(
          map((response) => ({
            items: response.items.map((post) =>
              this.mapPostToSocialFeedItem(post)
            ),
          }))
        ),
      successHandler: (response) => {
        this.socialPosts = this.resolveSocialPosts(response);
        this.mixContent();
      },
      errorSetter: (error: string | null) => {
        console.error('Error loading social posts:', error);
        this.socialPosts = [];
        this.mixContent();
      },
    });
  }

  private mixContent(): void {
    if (!this.enableContentMixing) {
      this.mixedContent = this.products.map((product) => ({
        type: 'product',
        data: product,
      }));
      return;
    }

    const mixed: MixedContentItem[] = [];
    const products = [...this.products];
    const posts = [...this.socialPosts];

    // Algorithm: Mix products and posts with weighted randomization
    while (products.length > 0 || posts.length > 0) {
      const productWeight = products.length * 0.6; // 60% weight for products
      const postWeight = posts.length * 0.4; // 40% weight for posts
      const totalWeight = productWeight + postWeight;

      if (totalWeight === 0) break;

      const random = Math.random() * totalWeight;

      if (random < productWeight && products.length > 0) {
        // Add product
        const productIndex = Math.floor(Math.random() * products.length);
        mixed.push({
          type: 'product',
          data: products.splice(productIndex, 1)[0],
        });
      } else if (posts.length > 0) {
        // Add post
        const postIndex = Math.floor(Math.random() * posts.length);
        mixed.push({ type: 'post', data: posts.splice(postIndex, 1)[0] });
      }
    }

    this.mixedContent = mixed;
  }

  toggleContentMixing(): void {
    this.enableContentMixing = !this.enableContentMixing;
    this.mixContent();
  }

  getContentTypeIcon(type: 'product' | 'post'): IconDefinition {
    return type === 'product' ? this.faShoppingCart : this.faComment;
  }

  getContentTypeLabel(type: 'product' | 'post'): string {
    return type === 'product' ? 'Product' : 'Community Post';
  }

  private isProductInCart(productId: string): boolean {
    if (!productId || !this.currentCartSnapshot) {
      return false;
    }

    const cartSnapshot = this.currentCartSnapshot;

    if (cartSnapshot instanceof Cart) {
      return cartSnapshot
        .getItems()
        .some((item) => this.cartItemMatchesProduct(item, productId));
    }

    if (this.hasGetItemsMethod(cartSnapshot)) {
      return cartSnapshot
        .getItems()
        .some((item) => this.cartItemMatchesProduct(item, productId));
    }

    const fallbackItems = this.extractItemsFromCartRecord(cartSnapshot);
    if (fallbackItems) {
      return fallbackItems.some((item) =>
        this.cartItemMatchesProduct(item, productId)
      );
    }

    return false;
  }

  private resolveProductPayload(source: unknown): {
    items: MarketplaceProductListing[];
    totalItems: number;
    totalPages: number;
  } {
    if (Array.isArray(source)) {
      const items = this.normalizeProductItems(source);
      return {
        items,
        totalItems: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / 20)),
      };
    }

    if (source && typeof source === 'object') {
      const apiResponse = source as ProductApiResponse;
      const payloadCandidate =
        apiResponse.data ?? (source as PaginatedProductPayload);
      const payload = this.isPaginatedPayload(payloadCandidate)
        ? (payloadCandidate as PaginatedProductPayload)
        : undefined;

      const rawItems = (payload?.items ?? payload?.results ?? []) as unknown[];
      const items = this.normalizeProductItems(rawItems);
      const paginationRecord = this.extractPaginationRecord(payload);
      const totalItems = this.extractNumericValue(
        paginationRecord,
        ['total_items', 'total'],
        items.length
      );
      const totalPages = this.extractNumericValue(
        paginationRecord,
        ['total_pages'],
        Math.max(1, Math.ceil(Math.max(totalItems, items.length) / 20))
      );

      return {
        items,
        totalItems,
        totalPages,
      };
    }

    return { items: [], totalItems: 0, totalPages: 1 };
  }

  private normalizeCategorySummaries(
    summaries: CategorySummary[] | null | undefined,
    totalItems: number
  ): MarketplaceCategorySummary[] {
    const mapped = Array.isArray(summaries)
      ? summaries.map((summary) => ({
          id: String(summary.id),
          name: summary.name,
          count: summary.childCount ?? 0,
        }))
      : [];

    const deduped = mapped.filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.id === item.id) === index
    );

    const baselineCount = Number.isFinite(totalItems) ? totalItems : 0;

    if (deduped.length === 0) {
      return [
        {
          id: 'all',
          name: 'All Items',
          count: baselineCount,
        },
      ];
    }

    return [
      {
        id: 'all',
        name: 'All Items',
        count: baselineCount,
      },
      ...deduped,
    ];
  }

  private resolveSocialPosts(source: unknown): SocialFeedItem[] {
    if (!source) {
      return [];
    }

    if (Array.isArray(source)) {
      return source as SocialFeedItem[];
    }

    if (typeof source === 'object') {
      const response = source as SocialFeedResponse;
      if (Array.isArray(response.data)) {
        return response.data as SocialFeedItem[];
      }
      if (Array.isArray(response.items)) {
        return response.items as SocialFeedItem[];
      }
    }

    return [];
  }

  private mapPostToSocialFeedItem(post: Post): SocialFeedItem {
    const author = post.user;
    const media = post.social_media;

    return {
      id: post.id,
      caption: post.caption,
      created_at: post.created_at,
      like_count: post.like_count,
      comment_count: post.comment_count,
      tags: post.tags,
      user: author
        ? {
            id: author.id,
            username: author.username,
            profile_picture_url: author.profilePictureUrl,
            display_name: author.displayName,
          }
        : null,
      media: media.map((item) => ({
        id: item.id,
        url:
          item.media?.social_post_url ||
          item.media?.social_square_url ||
          item.media?.thumbnail_url ||
          item.media?.original_url ||
          null,
      })),
    };
  }

  private normalizeProductItems(items: unknown[]): MarketplaceProductListing[] {
    return items.map((item) => {
      if (
        item instanceof Product ||
        typeof (item as Product).getPrice === 'function'
      ) {
        return this.mapDomainProductToListing(item as Product);
      }
      return item as MarketplaceProductListing;
    });
  }

  private mapDomainProductToListing(
    product: Product
  ): MarketplaceProductListing {
    const sellerId =
      product.sellerId !== null && product.sellerId !== undefined
        ? String(product.sellerId)
        : 'unknown';
    const firstCategory =
      product.categoryIds && product.categoryIds.length > 0
        ? String(product.categoryIds[0])
        : 'general';

    return {
      id: product.id,
      name: product.name,
      price: typeof product.getPrice === 'function' ? product.getPrice() : 0,
      currency: 'USD',
      rating: product.averageRating ?? 0,
      review_count: product.reviewCount ?? 0,
      distance: '',
      images: [],
      seller: {
        id: sellerId,
        shop_name: '',
        profile_picture_url: '',
        is_verified: false,
        location: '',
      },
      description: '',
      stock: typeof product.getStock === 'function' ? product.getStock() : 0,
      category: firstCategory,
    };
  }

  private extractPaginationRecord(
    payload: PaginatedProductPayload | undefined
  ): UnknownRecord | undefined {
    if (!payload) {
      return undefined;
    }

    if (payload.pagination && typeof payload.pagination === 'object') {
      return payload.pagination as unknown as UnknownRecord;
    }

    if (payload.meta && typeof payload.meta === 'object') {
      return payload.meta as unknown as UnknownRecord;
    }

    return undefined;
  }

  private extractNumericValue(
    source: UnknownRecord | undefined,
    keys: string[],
    fallback: number
  ): number {
    if (!source) {
      return fallback;
    }

    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number') {
        return value;
      }
    }

    return fallback;
  }

  private isPaginatedPayload(value: unknown): value is PaginatedProductPayload {
    return !!value && typeof value === 'object';
  }

  navigateToProduct(productId: string): void {
    this.router.navigate([
      buildPath(ROUTES_ABSOLUTE.APP.MARKETPLACE, 'product', productId),
    ]);
  }

  makeOffer(productId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate([
      buildPath(ROUTES_ABSOLUTE.APP.OFFERS.ROOT, 'make', productId),
    ]);
  }
}
