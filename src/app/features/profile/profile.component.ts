import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { TypeSafetyService } from '../../core/services/type-safety.service';

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  location: string;
  join_date: string;
  rating: number;
  total_reviews: number;
  total_orders: number;
  total_listings: number;
  is_verified: boolean;
  is_seller: boolean;
  is_buyer: boolean;
  // Store details
  shop_name?: string;
  verification_status?: string;
  shop_description?: string;
  shop_categories?: string[];
  policies?: { returns?: string; shipping?: string; warranty?: string };
}

interface Review {
  id: number;
  reviewer_name: string;
  reviewer_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Listing {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  images: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="relative flex min-h-screen flex-col bg-white overflow-x-hidden font-sans">
      <div class="absolute inset-0 bg-gradient-to-br from-markt-light/30 via-white to-markt-accent/10"></div>
      <div class="relative w-full mx-auto px-6 lg:px-10 py-8 lg:py-12">
        
        <!-- Error Message -->
        @if (errorMessage) {
          <div class="mb-8">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-red-800">{{ errorMessage }}</span>
                </div>
                <button (click)="errorMessage = ''" class="text-red-400 hover:text-red-600">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Loading State -->
        @if (loading) {
          <div class="mb-8">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span class="text-sm text-blue-800">Loading profile...</span>
              </div>
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (!loading && !errorMessage && !profile) {
          <div class="text-center py-12">
            <div class="max-w-md mx-auto">
              <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">Profile not found</h3>
              <p class="mt-2 text-gray-500">Unable to load your profile information.</p>
              <div class="mt-6">
                <button 
                  (click)="loadProfile()"
                  class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Main Content (only show when profile is loaded) -->
        @if (!loading && !errorMessage && profile) {
          <!-- Header Card -->
          <div class="rounded-3xl overflow-hidden shadow-xl border border-markt-border/30 mb-8">
            <div class="bg-gradient-to-r from-markt-primary to-markt-secondary p-8 lg:p-10 text-white flex flex-col lg:flex-row items-center gap-6">
              <div class="relative">
                @if (profile?.avatar_url) {
                  <img [src]="profile?.avatar_url" [alt]="profile?.full_name" class="w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white object-cover" />
                } @else {
                  <div class="w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white bg-white/20 flex items-center justify-center text-4xl font-bold">
                    {{ profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U' }}
                  </div>
                }
                @if (profile?.is_verified) {
                  <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                }
              </div>
              <div class="flex-1 text-center lg:text-left">
                <h1 class="text-2xl lg:text-3xl font-bold tracking-tight">{{ profile?.full_name || profile?.username }}</h1>
                <p class="opacity-90">@{{ profile?.username }}</p>
                <p class="opacity-80 mt-1">Member since {{ profile?.join_date | date:'MMMM yyyy' }}</p>
                @if (profile?.shop_name) {
                  <p class="opacity-90 mt-2 text-sm">Shop: <span class="font-semibold">{{ profile?.shop_name }}</span></p>
                }
              </div>
              <div class="flex gap-3">
                <a class="group flex items-center justify-center rounded-xl h-11 px-6 bg-white text-markt-primary font-semibold shadow-lg hover:shadow-xl transition-all" routerLink="/app/profile/edit" aria-label="Edit profile">
                  Edit Profile
                </a>
                <a class="group flex items-center justify-center rounded-xl h-11 px-6 bg-white/20 text-white font-semibold border-2 border-white/40 hover:bg-white/30 transition-all" routerLink="/app/chat" aria-label="Send message">
                  Send Message
                </a>
              </div>
            </div>
            <!-- Stats Row -->
            <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6 lg:p-8 bg-white">
              <div class="rounded-2xl border border-markt-border/40 p-5 text-center">
                <div class="text-2xl font-black text-markt-dark">{{ profile?.rating || 0 }}</div>
                <div class="text-markt-muted">Rating</div>
              </div>
              <div class="rounded-2xl border border-markt-border/40 p-5 text-center">
                <div class="text-2xl font-black text-markt-dark">{{ profile?.total_reviews || 0 }}</div>
                <div class="text-markt-muted">Reviews</div>
              </div>
              <div class="rounded-2xl border border-markt-border/40 p-5 text-center">
                <div class="text-2xl font-black text-markt-dark">{{ profile?.total_orders || 0 }}</div>
                <div class="text-markt-muted">Orders</div>
              </div>
              @if (profile?.is_seller) {
                <div class="rounded-2xl border border-markt-border/40 p-5 text-center">
                  <div class="text-2xl font-black text-markt-dark">{{ listings.length }}</div>
                  <div class="text-markt-muted">Listings</div>
                </div>
              }
            </div>
          </div>

          <!-- Tabs + Content Cards -->
          <div class="bg-white rounded-3xl shadow-xl border border-markt-border/30">
            <div class="flex border-b border-markt-border/30 overflow-x-auto">
              <button class="px-6 lg:px-8 py-4 text-sm font-semibold transition-all border-b-2" [class.text-markt-primary]="activeTab==='about'" [class.border-markt-primary]="activeTab==='about'" (click)="setActiveTab('about')">About</button>
              <button class="px-6 lg:px-8 py-4 text-sm font-semibold transition-all border-b-2" [class.text-markt-primary]="activeTab==='reviews'" [class.border-markt-primary]="activeTab==='reviews'" (click)="setActiveTab('reviews')">Reviews ({{ profile?.total_reviews || 0 }})</button>
              @if (profile?.is_seller) {
                <button class="px-6 lg:px-8 py-4 text-sm font-semibold transition-all border-b-2" [class.text-markt-primary]="activeTab==='listings'" [class.border-markt-primary]="activeTab==='listings'" (click)="setActiveTab('listings')">Listings ({{ listings.length }})</button>
              }
            </div>

            <!-- About -->
            @if (activeTab==='about') {
              <div class="p-6 lg:p-8 grid gap-8">
                <div>
                  <h3 class="text-lg font-bold text-markt-dark mb-4">Contact Information</h3>
                  <div class="grid gap-3">
                    <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                      <span class="font-medium text-markt-dark">Email:</span>
                      <span class="text-markt-muted">{{ profile?.email }}</span>
                    </div>
                    @if (profile?.phone) {
                      <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                        <span class="font-medium text-markt-dark">Phone:</span>
                        <span class="text-markt-muted">{{ profile?.phone }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-bold text-markt-dark mb-4">Account Information</h3>
                  <div class="grid gap-3">
                    <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                      <span class="font-medium text-markt-dark">Username:</span>
                      <span class="text-markt-muted">@{{ profile?.username }}</span>
                    </div>
                    <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                      <span class="font-medium text-markt-dark">Member Since:</span>
                      <span class="text-markt-muted">{{ profile?.join_date | date:'longDate' }}</span>
                    </div>
                    <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                      <span class="font-medium text-markt-dark">Roles:</span>
                      <span class="text-markt-muted">
                        @if (profile?.is_buyer) {
                          <span class="inline-flex items-center px-2 py-1 rounded-full bg-white border border-markt-border/50 mr-2 text-sm">Buyer</span>
                        }
                        @if (profile?.is_seller) {
                          <span class="inline-flex items-center px-2 py-1 rounded-full bg-white border border-markt-border/50 text-sm">Seller</span>
                        }
                      </span>
                    </div>
                    <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                      <span class="font-medium text-markt-dark">Current Role:</span>
                      <span class="text-markt-muted capitalize">{{ currentRole || (profile?.is_seller ? 'seller' : 'buyer') }}</span>
                    </div>
                    @if (profile?.is_buyer && profile?.is_seller) {
                      <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                        <span class="font-medium text-markt-dark">Switch Role:</span>
                        <button (click)="switchRole()" class="rounded-lg bg-markt-primary text-white px-4 py-2 hover:opacity-90">Toggle to {{ (currentRole === 'buyer') ? 'Seller' : 'Buyer' }}</button>
                      </div>
                    }
                    <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                      <span class="font-medium text-markt-dark">Verification:</span>
                      @if (profile?.is_verified) {
                        <span class="text-emerald-600 font-semibold">Verified</span>
                      } @else {
                        <span class="text-gray-500">Not Verified</span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Role creation CTAs when missing -->
                @if (profile && !profile.is_buyer) {
                  <div class="rounded-xl bg-markt-light/40 px-4 py-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-medium text-markt-dark">Buyer Account</div>
                        <div class="text-markt-muted text-sm">Add a buyer account to start purchasing.</div>
                      </div>
                      <button class="rounded-lg bg-markt-primary text-white px-4 py-2 hover:opacity-90" (click)="showBuyerForm = !showBuyerForm">{{ showBuyerForm ? 'Close' : 'Create' }}</button>
                    </div>
                    @if (showBuyerForm) {
                      <div class="mt-4 grid gap-3">
                        <div class="grid gap-2 sm:grid-cols-2">
                          <input [(ngModel)]="buyerForm.buyername" placeholder="Full name" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="buyerForm.street" placeholder="Street" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="buyerForm.house_number" placeholder="House/Apartment" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="buyerForm.city" placeholder="City" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="buyerForm.state" placeholder="State" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="buyerForm.country" placeholder="Country" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="buyerForm.postal_code" placeholder="Postal Code" class="border rounded-md px-3 py-2" />
                        </div>
                        @if (buyerError) {
                          <div class="text-sm text-red-600">{{ buyerError }}</div>
                        }
                        <button class="rounded-lg bg-markt-primary text-white px-4 py-2 hover:opacity-90 w-full sm:w-auto" (click)="submitCreateBuyer()" [disabled]="buyerLoading">{{ buyerLoading ? 'Creating...' : 'Create Buyer Account' }}</button>
                      </div>
                    }
                  </div>
                }

                @if (profile && !profile.is_seller) {
                  <div class="rounded-xl bg-markt-light/40 px-4 py-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-medium text-markt-dark">Seller Account</div>
                        <div class="text-markt-muted text-sm">Add a seller account to start listing products.</div>
                      </div>
                      <button class="rounded-lg bg-markt-primary text-white px-4 py-2 hover:opacity-90" (click)="toggleSellerForm()">{{ showSellerForm ? 'Close' : 'Create' }}</button>
                    </div>
                    @if (showSellerForm) {
                      <div class="mt-4 grid gap-3">
                        <div class="grid gap-2 sm:grid-cols-2">
                          <input [(ngModel)]="sellerForm.shop_name" placeholder="Shop name" class="border rounded-md px-3 py-2" />
                          <input [(ngModel)]="sellerForm.description" placeholder="Description" class="border rounded-md px-3 py-2" />
                        </div>
                        <div class="grid gap-2">
                          <div class="text-sm font-medium">Categories</div>
                          <div class="flex flex-wrap gap-2">
                            @for (c of shopCategories; track c.id) {
                              <label class="inline-flex items-center gap-2 text-sm border rounded-full px-3 py-1">
                                <input type="checkbox" [value]="c.id" (change)="onSellerCategoryToggle($event)" /> {{ c.name }}
                              </label>
                            }
                          </div>
                        </div>
                        @if (sellerError) {
                          <div class="text-sm text-red-600">{{ sellerError }}</div>
                        }
                        <button class="rounded-lg bg-markt-primary text-white px-4 py-2 hover:opacity-90 w-full sm:w-auto" (click)="submitCreateSeller()" [disabled]="sellerLoading">{{ sellerLoading ? 'Creating...' : 'Create Seller Account' }}</button>
                      </div>
                    }
                  </div>
                }

                <!-- Store Details (Seller) -->
                @if (profile?.is_seller) {
                  <div class="grid gap-3">
                    <h3 class="text-lg font-bold text-markt-dark mb-2">Store Details</h3>
                    @if (profile?.verification_status) {
                      <div class="flex items-center justify-between rounded-xl bg-markt-light/40 px-4 py-3">
                        <span class="font-medium text-markt-dark">Verification Status:</span>
                        <span class="text-markt-muted capitalize">{{ profile?.verification_status }}</span>
                      </div>
                    }
                    @if (profile?.shop_description) {
                      <div class="rounded-xl bg-markt-light/40 px-4 py-3">
                        <div class="font-medium text-markt-dark mb-1">About Store:</div>
                        <p class="text-markt-muted">{{ profile?.shop_description }}</p>
                      </div>
                    }
                    @if (profile?.shop_categories?.length) {
                      <div class="rounded-xl bg-markt-light/40 px-4 py-3">
                        <div class="font-medium text-markt-dark mb-2">Categories:</div>
                        <div class="flex flex-wrap gap-2">
                          @for (c of profile?.shop_categories; track c) {
                            <span class="inline-flex items-center px-3 py-1 rounded-full border border-markt-border/50 text-sm text-markt-dark bg-white">{{ c }}</span>
                          }
                        </div>
                      </div>
                    }
                    @if (profile?.policies) {
                      <div class="rounded-xl bg-markt-light/40 px-4 py-3">
                        <div class="font-medium text-markt-dark mb-2">Policies</div>
                        <div class="grid gap-2 text-sm text-markt-muted">
                          @if (profile?.policies?.returns) {
                            <div><span class="font-semibold text-markt-dark">Returns:</span> {{ profile?.policies?.returns }}</div>
                          }
                          @if (profile?.policies?.shipping) {
                            <div><span class="font-semibold text-markt-dark">Shipping:</span> {{ profile?.policies?.shipping }}</div>
                          }
                          @if (profile?.policies?.warranty) {
                            <div><span class="font-semibold text-markt-dark">Warranty:</span> {{ profile?.policies?.warranty }}</div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Reviews -->
            @if (activeTab === 'reviews') {
              <div class="p-6 lg:p-8">
                <h3 class="text-lg font-bold text-markt-dark mb-4">User Reviews</h3>
                @if (reviews.length > 0) {
                  <div class="grid gap-4">
                    @for (review of reviews; track review.id) {
                      <div class="rounded-2xl border border-markt-border/30 p-5">
                        <div class="flex items-center justify-between mb-2">
                          <div class="font-semibold text-markt-dark">{{ review.reviewer_name }}</div>
                          <div class="text-markt-muted text-sm">{{ review.created_at | date:'mediumDate' }}</div>
                        </div>
                        <p class="text-markt-dark">{{ review.comment }}</p>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center text-markt-muted py-10">No reviews yet</div>
                }
              </div>
            }

            <!-- Listings -->
            @if (activeTab === 'listings' && profile?.is_seller) {
              <div class="p-6 lg:p-8">
                <h3 class="text-lg font-bold text-markt-dark mb-4">User Listings</h3>
                @if (listings.length > 0) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (listing of listings; track listing.id) {
                      <a [routerLink]="['/app/marketplace/product', listing.id]" class="rounded-2xl border border-markt-border/30 overflow-hidden hover:shadow-xl transition-all">
                        <img [src]="listing.images[0] || '/markt-text-logo.png'" [alt]="listing.title" class="h-48 w-full object-cover" />
                        <div class="p-4">
                          <h4 class="font-semibold text-markt-dark">{{ listing.title }}</h4>
                          <p class="text-markt-muted">{{ listing.price | currency:listing.currency:'symbol':'1.0-0' }}</p>
                        </div>
                      </a>
                    }
                  </div>
                } @else {
                  <div class="text-center text-markt-muted py-10">No listings yet</div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
  `]
})
export class ProfileComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private typeSafety = inject(TypeSafetyService);

  profile: UserProfile | null = null;
  activeTab: 'about' | 'reviews' | 'listings' = 'about' as 'about' | 'reviews' | 'listings';
  reviews: Review[] = [];
  listings: Listing[] = [];
  loading = false;
  errorMessage = '';
  currentRole: 'buyer' | 'seller' | null = null;
  // Role creation state
  showBuyerForm = false;
  buyerLoading = false;
  buyerError = '';
  buyerForm = {
    buyername: '', street: '', house_number: '', city: '', state: '', country: '', postal_code: ''
  };
  showSellerForm = false;
  sellerLoading = false;
  sellerError = '';
  sellerForm = { shop_name: '', description: '', category_ids: [] as number[] };
  shopCategories: any[] = [];

  ngOnInit(): void {
    this.currentRole = this.authService.getCurrentRole();
    this.loadProfile();
    this.loadReviews();
    this.loadListings();
    // Auto-open forms from onboarding shortcuts
    this.route.queryParamMap.subscribe(params => {
      if (params.get('createBuyer') === '1') {
        this.showBuyerForm = true;
      }
      if (params.get('createSeller') === '1') {
        this.toggleSellerForm();
      }
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getProfile().subscribe({
      next: (response) => {
        const u = (this.typeSafety.getProperty(response, 'data', response) || response) as any;
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        const location = u.address ? [u.address.city, u.address.state, u.address.country].filter(Boolean).join(', ') : '';
        const seller = u.seller_account || {};
        this.profile = {
          id: u.id,
          username: u.username,
          full_name: fullName || u.username || '',
          email: u.email || '',
          phone: u.phone_number || '',
          avatar_url: u.profile_picture_url || '',
          bio: u.bio || '',
          location,
          join_date: u.created_at || '',
          rating: seller?.average_rating || 0,
          total_reviews: seller?.total_raters || 0,
          total_orders: u.buyer_account?.total_orders || 0,
          total_listings: seller?.total_products || 0,
          is_verified: !!u.email_verified,
          is_seller: !!u.is_seller,
          is_buyer: !!u.is_buyer,
          shop_name: seller?.shop_name || '',
          verification_status: seller?.verification_status || '',
          shop_description: seller?.description || '',
          shop_categories: Array.isArray(seller?.categories) ? seller.categories.map((c: any) => this.typeSafety.getProperty(c, 'name')).filter(Boolean) : [],
          policies: seller?.policies || {}
        } as UserProfile;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.profile = null;
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  loadReviews(): void {
    this.apiService.getMyReviews().subscribe({
      next: (response) => {
        this.reviews = response.data || [];
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviews = [];
      }
    });
  }

  loadListings(): void {
    this.apiService.getMyProducts().subscribe({
      next: (response) => {
        const items: any[] = response?.data?.items || [];
        this.listings = items.map((p: any) => {
          const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
          const imageUrl = firstImage?.media?.thumbnail_url || firstImage?.media?.url || firstImage?.media?.original_url || firstImage?.url || '';
          return {
            id: p.id,
            title: p.name || p.title || 'Listing',
            price: p.price ?? 0,
            currency: p.currency || 'NGN',
            location: p.product_metadata?.location || '',
            images: imageUrl ? [imageUrl] : []
          } as Listing;
        });
        // If profile exists, ensure the listings count reflects loaded data
        if (this.profile?.is_seller) {
          this.profile = { ...(this.profile as UserProfile), total_listings: this.listings.length };
        }
      },
      error: (error) => {
        console.error('Error loading listings:', error);
        this.listings = [];
      }
    });
  }

  setActiveTab(tab: 'about' | 'reviews' | 'listings'): void {
    this.activeTab = tab;
  }

  getStars(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    
    if (hasHalfStar) {
      stars.push(0.5);
    }
    
    return stars;
  }

  // User management endpoint integrations - using component data instead of hardcoded values
  createBuyerAccount(buyerData: any): void {
    this.apiService.createBuyerAccount(buyerData).subscribe({
      next: (response) => {
        console.log('Buyer account created:', response.data);
      },
      error: (error) => {
        console.error('Error creating buyer account:', error);
      }
    });
  }

  createSellerAccount(sellerData: any): void {
    this.apiService.createSellerAccount(sellerData).subscribe({
      next: (response) => {
        console.log('Seller account created:', response.data);
      },
      error: (error) => {
        console.error('Error creating seller account:', error);
      }
    });
  }

  updateBuyerProfile(buyerData: any): void {
    this.apiService.updateBuyerProfile(buyerData).subscribe({
      next: (response) => {
        console.log('Buyer profile updated:', response.data);
      },
      error: (error) => {
        console.error('Error updating buyer profile:', error);
      }
    });
  }

  updateSellerProfile(sellerData: any): void {
    this.apiService.updateSellerProfile(sellerData).subscribe({
      next: (response) => {
        console.log('Seller profile updated:', response.data);
      },
      error: (error) => {
        console.error('Error updating seller profile:', error);
      }
    });
  }

  switchRole(): void {
    this.authService.switchRole().subscribe({
      next: () => {
        this.currentRole = this.authService.getCurrentRole();
        this.loadProfile();
      },
      error: (error) => {
        console.error('Error switching role:', error);
      }
    });
  }

  getUsers(): void {
    this.apiService.getUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  getPublicProfile(userId: string): void {
    this.apiService.getPublicProfile(userId).subscribe({
      next: (response) => {
        console.log('Public profile loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading public profile:', error);
      }
    });
  }

  loadUserSettings(): void {
    this.apiService.getUserSettings().subscribe({
      next: (response) => {
        console.log('User settings loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading user settings:', error);
      }
    });
  }

  updateUserSettings(settings: any): void {
    this.apiService.updateUserSettings(settings).subscribe({
      next: (response) => {
        console.log('User settings updated:', response.data);
      },
      error: (error) => {
        console.error('Error updating user settings:', error);
      }
    });
  }

  passwordReset(email: string): void {
    this.apiService.passwordReset(email).subscribe({
      next: (response) => {
        console.log('Password reset email sent:', response.data);
      },
      error: (error) => {
        console.error('Error sending password reset:', error);
      }
    });
  }

  passwordResetConfirm(resetData: any): void {
    this.apiService.passwordResetConfirm(resetData).subscribe({
      next: (response) => {
        console.log('Password reset confirmed:', response.data);
      },
      error: (error) => {
        console.error('Error confirming password reset:', error);
      }
    });
  }

  sendEmailVerification(email: string): void {
    this.apiService.sendEmailVerification(email).subscribe({
      next: (response) => {
        console.log('Email verification sent:', response.data);
      },
      error: (error) => {
        console.error('Error sending email verification:', error);
      }
    });
  }

  verifyEmail(verificationData: any): void {
    this.apiService.verifyEmail(verificationData).subscribe({
      next: (response) => {
        console.log('Email verified:', response.data);
      },
      error: (error) => {
        console.error('Error verifying email:', error);
      }
    });
  }

  logout(): void {
    this.apiService.logout().subscribe({
      next: (response) => {
        console.log('Logged out successfully:', response.data);
      },
      error: (error) => {
        console.error('Error logging out:', error);
      }
    });
  }

  toggleSellerForm(): void {
    this.showSellerForm = !this.showSellerForm;
    if (this.showSellerForm && this.shopCategories.length === 0) {
      this.authService.getShopCategories().subscribe({
        next: (res: any) => { this.shopCategories = (res?.data || res || []); },
        error: () => { this.shopCategories = []; }
      });
    }
  }

  onSellerCategoryToggle(event: any): void {
    const id = Number(event.target.value);
    if (event.target.checked) {
      if (!this.sellerForm.category_ids.includes(id)) this.sellerForm.category_ids.push(id);
    } else {
      this.sellerForm.category_ids = this.sellerForm.category_ids.filter(x => x !== id);
    }
  }

  submitCreateBuyer(): void {
    this.buyerError = '';
    if (!this.buyerForm.buyername || !this.buyerForm.street || !this.buyerForm.city || !this.buyerForm.country) {
      this.buyerError = 'Please complete required fields (name, street, city, country).';
      return;
    }
    this.buyerLoading = true;
    const payload = {
      buyername: this.buyerForm.buyername,
      shipping_address: {
        street: this.buyerForm.street,
        house_number: this.buyerForm.house_number,
        city: this.buyerForm.city,
        state: this.buyerForm.state,
        country: this.buyerForm.country,
        postal_code: this.buyerForm.postal_code,
        latitude: 0,
        longitude: 0
      }
    };
    this.authService.createBuyerAccount(payload).subscribe({
      next: () => {
        this.buyerLoading = false;
        this.showBuyerForm = false;
        this.loadProfile();
      },
      error: (e) => {
        this.buyerLoading = false;
        this.buyerError = e?.message || 'Failed to create buyer account.';
      }
    });
  }

  submitCreateSeller(): void {
    this.sellerError = '';
    if (!this.sellerForm.shop_name || this.sellerForm.category_ids.length === 0) {
      this.sellerError = 'Please provide a shop name and select at least one category.';
      return;
    }
    this.sellerLoading = true;
    const payload = {
      shop_name: this.sellerForm.shop_name,
      description: this.sellerForm.description,
      category_ids: this.sellerForm.category_ids,
      policies: { return_policy: 'Standard', shipping_policy: 'Standard', payment_policy: 'Standard' }
    };
    this.authService.createSellerAccount(payload).subscribe({
      next: () => {
        this.sellerLoading = false;
        this.showSellerForm = false;
        this.loadProfile();
      },
      error: (e) => {
        this.sellerLoading = false;
        this.sellerError = e?.message || 'Failed to create seller account.';
      }
    });
  }
}