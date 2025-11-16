/**
 * Public Profile Component
 * 
 * Displays a user's public profile information.
 */

import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserRepository, PublicProfileDto } from '../../../domains/authentication';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faStore,
  faShoppingBag,
  faHeart,
  faUserPlus,
  faCheckCircle,
  faEnvelope,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="public-profile-container">
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"
        ></div>
      </div>

      <!-- Profile Header -->
      <div *ngIf="!isLoading() && profile()" class="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div class="bg-gradient-to-r from-markt-primary to-markt-secondary p-8 text-white">
          <div class="flex items-start space-x-6">
            <img
              [src]="profile()!.profile_picture_url || '/markt-text-logo.png'"
              [alt]="profile()!.username"
              class="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h1 class="text-3xl font-bold">{{ profile()!.username }}</h1>
                <span
                  *ngIf="profile()!.seller_account?.verification_status === 'verified'"
                  class="text-blue-300"
                  title="Verified Seller"
                >
                  <fa-icon [icon]="faCheckCircle" class="w-6 h-6"></fa-icon>
                </span>
              </div>
              <div class="flex items-center space-x-6 text-sm mb-4">
                <span *ngIf="profile()!.is_buyer" class="flex items-center space-x-2">
                  <fa-icon [icon]="faShoppingBag" class="w-4 h-4"></fa-icon>
                  <span>Buyer</span>
                </span>
                <span *ngIf="profile()!.is_seller" class="flex items-center space-x-2">
                  <fa-icon [icon]="faStore" class="w-4 h-4"></fa-icon>
                  <span>Seller</span>
                </span>
              </div>
              <div class="flex items-center space-x-6">
                <button
                  class="bg-white text-markt-primary px-6 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium"
                >
                  <fa-icon [icon]="faUserPlus" class="w-4 h-4 mr-2"></fa-icon>
                  Follow
                </button>
                <button
                  class="bg-white/20 text-white px-6 py-2 rounded-md hover:bg-white/30 transition-colors font-medium"
                >
                  <fa-icon [icon]="faEnvelope" class="w-4 h-4 mr-2"></fa-icon>
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="px-8 py-4 border-b border-gray-200">
          <div class="flex items-center space-x-8">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ profile()!.followers_count || 0 }}
              </div>
              <div class="text-sm text-gray-500">Followers</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ profile()!.following_count || 0 }}
              </div>
              <div class="text-sm text-gray-500">Following</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ profile()!.posts_count || 0 }}
              </div>
              <div class="text-sm text-gray-500">Posts</div>
            </div>
            <div
              *ngIf="profile()!.seller_account"
              class="text-center"
            >
              <div class="text-2xl font-bold text-gray-900">
                {{ profile()?.seller_account?.total_products || 0 }}
              </div>
              <div class="text-sm text-gray-500">Products</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div *ngIf="!isLoading() && profile()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Buyer Account Info -->
          <div
            *ngIf="profile()!.buyer_account"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-bold text-gray-900 mb-4">Buyer Profile</h2>
            <div class="space-y-3">
              <div>
                <span class="text-sm text-gray-500">Name</span>
                <p class="font-medium text-gray-900">
                  {{ profile()?.buyer_account?.buyername }}
                </p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Total Orders</span>
                <p class="font-medium text-gray-900">
                  {{ profile()?.buyer_account?.total_orders }}
                </p>
              </div>
            </div>
          </div>

          <!-- Seller Account Info -->
          <div
            *ngIf="profile()!.seller_account"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-bold text-gray-900 mb-4">Shop Information</h2>
            <div class="space-y-3">
              <div>
                <span class="text-sm text-gray-500">Shop Name</span>
                <p class="font-medium text-gray-900">
                  {{ profile()?.seller_account?.shop_name }}
                </p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Verification Status</span>
                <p class="font-medium text-gray-900">
                  {{ formatVerificationStatus(profile()?.seller_account?.verification_status || '') }}
                </p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Rating</span>
                <p class="font-medium text-gray-900">
                  {{ profile()?.seller_account?.average_rating?.toFixed(1) || 'N/A' }} / 5.0
                </p>
              </div>
              <div>
                <span class="text-sm text-gray-500">Total Products</span>
                <p class="font-medium text-gray-900">
                  {{ profile()?.seller_account?.total_products }}
                </p>
              </div>
              <div *ngIf="profile()?.seller_account?.shop_slug">
                <a 
                  [routerLink]="['/app/shops', profile()?.seller_account?.shop_slug]"
                  class="text-markt-primary hover:text-markt-secondary font-medium"
                >
                  View Shop →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Followers</span>
                <span class="font-medium">{{ profile()!.followers_count || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Following</span>
                <span class="font-medium">{{ profile()!.following_count || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Posts</span>
                <span class="font-medium">{{ profile()!.posts_count || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading() && !profile()" class="text-center py-12">
        <h2 class="text-xl font-medium text-gray-900 mb-2">Profile not found</h2>
        <p class="text-gray-500 mb-6">
          The user profile you're looking for doesn't exist or has been removed.
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
      .public-profile-container {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }
    `,
  ],
})
export class PublicProfileComponent implements OnInit {
  private userRepository = inject(UserRepository);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Icons
  faUser = faUser;
  faStore = faStore;
  faShoppingBag = faShoppingBag;
  faHeart = faHeart;
  faUserPlus = faUserPlus;
  faCheckCircle = faCheckCircle;
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;

  // Signals
  profile = signal<PublicProfileDto | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadPublicProfile(userId);
    }
  }

  /**
   * Load public profile
   */
  private loadPublicProfile(userId: string): void {
    this.isLoading.set(true);
    this.userRepository
      .getPublicProfile(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading public profile:', error);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Format verification status for display
   */
  formatVerificationStatus(status: string): string {
    const statusMap: Record<string, string> = {
      verified: 'Verified',
      pending: 'Pending Verification',
      unverified: 'Unverified',
      rejected: 'Rejected',
      suspended: 'Suspended',
    };
    return statusMap[status] || status;
  }

  /**
   * Navigate back
   */
  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.DASHBOARD]);
  }
}

