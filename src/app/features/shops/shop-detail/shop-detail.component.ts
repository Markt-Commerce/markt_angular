/**
 * Shop Detail Component
 *
 * Displays detailed information about a shop including products, posts, and stats.
 */

import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ShopService, ShopDetail } from '../../../domains/authentication';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faStar,
  faHeart,
  faComment,
  faShare,
  faShoppingBag,
  faUser,
  faCheckCircle,
  faStore,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="shop-detail-container">
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"
        ></div>
      </div>

      <!-- Shop Header -->
      <div
        *ngIf="!isLoading() && shop()"
        class="bg-white rounded-lg shadow mb-6 overflow-hidden"
      >
        <div
          class="bg-gradient-to-r from-markt-primary to-markt-secondary p-8 text-white"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-6">
              <img
                [src]="shop()!.user.profile_picture || '/markt-text-logo.png'"
                [alt]="shop()!.shopName"
                class="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
              <div>
                <div class="flex items-center space-x-3 mb-2">
                  <h1 class="text-3xl font-bold">{{ shop()!.shopName }}</h1>
                  <span
                    *ngIf="shop()!.isVerified()"
                    class="text-blue-300"
                    title="Verified Shop"
                  >
                    <fa-icon [icon]="faCheckCircle" class="w-6 h-6"></fa-icon>
                  </span>
                </div>
                <p class="text-white-90 mb-4 max-w-2xl">
                  {{ shop()!.description }}
                </p>
                <div class="flex items-center space-x-6 text-sm">
                  <div class="flex items-center space-x-2">
                    <fa-icon [icon]="faStar" class="w-4 h-4"></fa-icon>
                    <span>{{ shop()!.getDisplayRating().toFixed(1) }}</span>
                    <span class="text-white-80"
                      >({{ shop()!.totalRaters }} reviews)</span
                    >
                  </div>
                  <div class="flex items-center space-x-2">
                    <fa-icon [icon]="faStore" class="w-4 h-4"></fa-icon>
                    <span
                      >{{ shop()!.stats?.product_count || 0 }} products</span
                    >
                  </div>
                  <div class="flex items-center space-x-2">
                    <fa-icon [icon]="faUser" class="w-4 h-4"></fa-icon>
                    <span
                      >{{ shop()!.stats?.follower_count || 0 }} followers</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col space-y-2">
              <button
                *ngIf="shop()!.canFollow"
                class="bg-white text-markt-primary px-6 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                {{ shop()!.isFollowed ? 'Following' : 'Follow' }}
              </button>
              <button
                class="bg-white/20 text-white px-6 py-2 rounded-md hover:bg-white/30 transition-colors font-medium"
              >
                Message
              </button>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div
          *ngIf="shop()!.categories.length > 0"
          class="px-8 py-4 border-b border-gray-200"
        >
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let category of shop()!.categories"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {{ category.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Shop Content -->
      <div
        *ngIf="!isLoading() && shop()"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Recent Products -->
          <div
            *ngIf="shop()!.recentProducts.length > 0"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-bold text-gray-900 mb-4">
              Recent Products
            </h2>
            <div class="grid grid-cols-2 gap-4">
              <div
                *ngFor="let product of shop()!.recentProducts"
                class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                [routerLink]="['/app/marketplace/products', product.id]"
              >
                <img
                  [src]="product.image || '/markt-text-logo.png'"
                  [alt]="product.name"
                  class="w-full h-32 object-cover"
                />
                <div class="p-3">
                  <h3 class="font-medium text-gray-900 text-sm mb-1">
                    {{ product.name }}
                  </h3>
                  <p class="text-lg font-bold text-markt-primary">
                    {{ product.price | currency : 'NGN' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Posts -->
          <div
            *ngIf="shop()!.recentPosts.length > 0"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Posts</h2>
            <div class="space-y-4">
              <div
                *ngFor="let post of shop()!.recentPosts"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p class="text-gray-900 mb-3">{{ post.caption }}</p>
                <div
                  *ngIf="post.media.length > 0"
                  class="grid grid-cols-2 gap-2 mb-3"
                >
                  <img
                    *ngFor="let media of post.media.slice(0, 4)"
                    [src]="media.url"
                    [alt]="media.alt_text || 'Post image'"
                    class="w-full h-32 object-cover rounded"
                  />
                </div>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center space-x-1">
                    <fa-icon [icon]="faHeart" class="w-4 h-4"></fa-icon>
                    <span>{{ post.likes_count }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <fa-icon [icon]="faComment" class="w-4 h-4"></fa-icon>
                    <span>{{ post.comments_count }}</span>
                  </span>
                  <span class="text-xs text-gray-400">{{
                    formatDate(post.created_at)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Shop Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Shop Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Products</span>
                <span class="font-medium">{{
                  shop()!.stats?.product_count || 0
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Posts</span>
                <span class="font-medium">{{
                  shop()!.stats?.post_count || 0
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Followers</span>
                <span class="font-medium">{{
                  shop()!.stats?.follower_count || 0
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Rating</span>
                <span class="font-medium"
                  >{{ shop()!.getDisplayRating().toFixed(1) }} / 5.0</span
                >
              </div>
            </div>
          </div>

          <!-- Policies -->
          <div *ngIf="hasPolicies()" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Shop Policies</h3>
            <div class="space-y-3 text-sm">
              <div *ngFor="let policy of getPolicyEntries()">
                <div class="font-medium text-gray-900 mb-1">
                  {{ policy.key }}
                </div>
                <div class="text-gray-600">{{ policy.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading() && !shop()" class="text-center py-12">
        <h2 class="text-xl font-medium text-gray-900 mb-2">Shop not found</h2>
        <p class="text-gray-500 mb-6">
          The shop you're looking for doesn't exist or has been removed.
        </p>
        <button
          (click)="goBack()"
          class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .shop-detail-container {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }
    `,
  ],
})
export class ShopDetailComponent implements OnInit {
  private shopService = inject(ShopService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Icons
  faStar = faStar;
  faHeart = faHeart;
  faComment = faComment;
  faShare = faShare;
  faShoppingBag = faShoppingBag;
  faUser = faUser;
  faCheckCircle = faCheckCircle;
  faStore = faStore;

  // Signals
  shop = signal<ShopDetail | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (shopId) {
      this.loadShopDetail(parseInt(shopId, 10));
    }
  }

  /**
   * Load shop details
   */
  private loadShopDetail(shopId: number): void {
    this.isLoading.set(true);
    this.shopService
      .getShopDetails(shopId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (shop) => {
          this.shop.set(shop);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading shop details:', error);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Check if shop has policies
   */
  hasPolicies(): boolean {
    const shopData = this.shop();
    if (!shopData || !shopData.policies) {
      return false;
    }
    return Object.keys(shopData.policies).length > 0;
  }

  /**
   * Get policy entries for display
   */
  getPolicyEntries(): Array<{ key: string; value: string }> {
    const shopData = this.shop();
    if (!shopData || !shopData.policies) {
      return [];
    }
    const entries: Array<{ key: string; value: string }> = [];
    for (const [key, value] of Object.entries(shopData.policies)) {
      entries.push({
        key: this.formatPolicyKey(key),
        value: String(value),
      });
    }
    return entries;
  }

  /**
   * Format policy key for display
   */
  private formatPolicyKey(key: string): string {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SHOPS.ROOT]);
  }
}
