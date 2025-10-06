import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApiService } from '../../core/services/api.service';

interface OfferCard {
  id: string;
  title: string;
  context: string;
  meta: string;
  status: 'Pending' | 'Accepted' | 'Counter Offer' | 'Urgent';
  statusTone: 'yellow' | 'green' | 'blue' | 'red';
  offeredText: string;
  avatarAlt: string;
  imageUrl: string;
}

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgOptimizedImage, RouterLink],
  template: `
    <div class="bg-gray-50">
      <!-- Hero Banner -->
      <section class="relative h-64 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <img ngSrc="/assets/images/sony-headphones.png" width="1200" height="400" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="background" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div class="relative mx-auto px-6 h-full flex items-center">
          <div class="text-white">
            <h1 class="text-4xl font-bold mb-4">Manage Your Offers</h1>
            <p class="text-lg text-gray-200 mb-6">Track negotiations, respond to offers, and close deals</p>
            <button class="bg-[#E94C2A] hover:bg-[#FF6B47] text-white px-6 py-3 rounded-lg font-semibold" (click)="createNewOffer()">
              <span class="mr-2">＋</span> Create Offer
            </button>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p class="text-sm font-medium text-gray-600">Active Offers</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ sentOffers.length + receivedOffers.length }}</p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p class="text-sm font-medium text-gray-600">Pending Responses</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ pendingCount }}</p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p class="text-sm font-medium text-gray-600">Accepted Deals</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ acceptedCount }}</p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p class="text-sm font-medium text-gray-600">Total Value</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalValue | currency }}</p>
          </div>
        </div>
      </section>

      <!-- Controls -->
      <section class=" mx-auto px-6 pb-6">
        <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex-1 max-w-lg">
              <input class="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94C2A]" type="text" placeholder="Search offers by product or user..." [(ngModel)]="searchQuery" />
            </div>
            <div class="flex flex-wrap gap-3">
              <select class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94C2A]" [(ngModel)]="statusFilter">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Counter Offer">Counter Offer</option>
                <option value="Urgent">Urgent</option>
              </select>
              <select class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E94C2A]" [(ngModel)]="sortBy">
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
              <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Filters</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="mx-auto px-6 pb-12">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <!-- Sent -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Offers Sent ({{ filteredSent.length }})</h2>
            </div>
            <div class="p-6 space-y-4">
              <ng-container *ngFor="let card of filteredSent">
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex items-start gap-4">
                    <img [ngSrc]="card.imageUrl" width="64" height="64" class="w-16 h-16 rounded-lg object-cover" [alt]="card.avatarAlt" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-2">
                        <h3 class="font-medium text-gray-900 truncate">{{ card.title }}</h3>
                        <span class="text-xs px-2 py-1 rounded-full" [ngClass]="statusBadge(card.statusTone)">{{ card.status }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ card.offeredText }}</p>
                      <p class="text-xs text-gray-500 mb-3">{{ card.meta }}</p>
                      <div class="flex flex-wrap gap-2">
                        <a class="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 inline-flex items-center" [routerLink]="['/app/offers/negotiation', card.id]">Open negotiation</a>
                        <button class="text-xs bg-[#E94C2A] text-white px-3 py-1 rounded hover:bg-[#FF6B47]">Message</button>
                        <button class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">Modify</button>
                        <button class="text-xs text-red-600 hover:text-red-800">Withdraw</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>

          <!-- Received -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Offers Received ({{ filteredReceived.length }})</h2>
            </div>
            <div class="p-6 space-y-4">
              <ng-container *ngFor="let card of filteredReceived; let i = index">
                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow" [ngClass]="i === 0 ? 'bg-blue-50 border-blue-200' : 'border-gray-200'">
                  <div class="flex items-start gap-4">
                    <img [ngSrc]="card.imageUrl" width="64" height="64" class="w-16 h-16 rounded-lg object-cover" [alt]="card.avatarAlt" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-2">
                        <h3 class="font-medium text-gray-900 truncate">{{ card.title }}</h3>
                        <span class="text-xs px-2 py-1 rounded-full" [ngClass]="statusBadge(card.statusTone)">{{ card.status }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ card.offeredText }}</p>
                      <p class="text-xs text-gray-500 mb-3">{{ card.meta }}</p>
                      <div class="flex flex-wrap gap-2">
                        <a class="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 inline-flex items-center" [routerLink]="['/app/offers/negotiation', card.id]">Open negotiation</a>
                        <button class="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Accept</button>
                        <button class="text-xs bg-[#E94C2A] text-white px-3 py-1 rounded hover:bg-[#FF6B47]">Counter</button>
                        <button class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">Message</button>
                        <button class="text-xs text-red-600 hover:text-red-800">Decline</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [``]
})
export class OffersComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);

  searchQuery = '';
  statusFilter: OfferCard['status'] | '' = '';
  sortBy: 'date' | 'amount' | 'status' = 'date';

  sentOffers: OfferCard[] = [];
  receivedOffers: OfferCard[] = [];

  filteredSent: OfferCard[] = [];
  filteredReceived: OfferCard[] = [];

  get pendingCount(): number {
    return [...this.sentOffers, ...this.receivedOffers].filter(o => o.status === 'Pending').length;
  }

  get acceptedCount(): number {
    return [...this.sentOffers, ...this.receivedOffers].filter(o => o.status === 'Accepted').length;
  }

  get totalValue(): number {
    return this.receivedOffers
      .filter(o => o.status === 'Accepted')
      .reduce((acc, _o) => acc + 100, 0);
  }

  ngOnInit(): void {
    // Static demo content to match the design; integrate API later
    this.sentOffers = [
      {
        id: '1',
        title: 'MacBook Pro 2021',
        context: 'Offered: $1,200',
        meta: 'To: Sarah Chen • 2 days ago',
        status: 'Pending',
        statusTone: 'yellow',
        offeredText: 'Offered: $1,200 • Original: $1,400',
        avatarAlt: 'modern laptop',
        imageUrl: '/assets/images/products/sony-headphones.png'
      },
      {
        id: '2',
        title: 'Chemistry Textbook Bundle',
        context: 'Counter: $95',
        meta: 'To: Mike Johnson • 1 day ago',
        status: 'Counter Offer',
        statusTone: 'blue',
        offeredText: 'Offered: $80 • Counter: $95',
        avatarAlt: 'textbook stack',
        imageUrl: '/assets/images/products/calculus-textbook.png'
      },
      {
        id: '3',
        title: 'Ergonomic Desk Chair',
        context: 'Agreed: $150',
        meta: 'To: Emma Davis • 3 hours ago',
        status: 'Accepted',
        statusTone: 'green',
        offeredText: 'Agreed: $150',
        avatarAlt: 'desk chair',
        imageUrl: '/assets/images/products/premium-yoga-mat.jpg'
      }
    ];

    this.receivedOffers = [
      {
        id: '4',
        title: 'Gaming Headset',
        context: 'Offered: $85',
        meta: 'From: Alex Rodriguez • 30 min ago',
        status: 'Urgent',
        statusTone: 'red',
        offeredText: 'Offered: $85 • Your price: $100',
        avatarAlt: 'gaming headset',
        imageUrl: '/assets/images/sony-headphones.png'
      },
      {
        id: '5',
        title: 'Campus Bike',
        context: 'Offered: $180',
        meta: 'From: Jessica Kim • 2 hours ago',
        status: 'Pending',
        statusTone: 'yellow',
        offeredText: 'Offered: $180 • Your price: $220',
        avatarAlt: 'bicycle',
        imageUrl: '/assets/images/products/vintage-jacket.png'
      },
      {
        id: '6',
        title: 'Scientific Calculator',
        context: 'Offered: $45',
        meta: 'From: David Park • 5 hours ago',
        status: 'Pending',
        statusTone: 'yellow',
        offeredText: 'Offered: $45 • Your price: $60',
        avatarAlt: 'calculator',
        imageUrl: '/assets/images/products/protective-phone-case.jpg'
      }
    ];

    this.applyFilters();
  }

  statusBadge(tone: OfferCard['statusTone']): string {
    switch (tone) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  createNewOffer(): void {
    this.router.navigate(['/app/offers/create']);
  }

  // Navigation moved to template via [routerLink] for simplicity

  applyFilters(): void {
    const apply = (items: OfferCard[]): OfferCard[] => {
      let list = items;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(i => i.title.toLowerCase().includes(q));
      }
      if (this.statusFilter) {
        list = list.filter(i => i.status === this.statusFilter);
      }
      switch (this.sortBy) {
        case 'amount':
          return list; // demo only
        case 'status':
          return [...list].sort((a, b) => a.status.localeCompare(b.status));
        case 'date':
        default:
          return list;
      }
    };

    this.filteredSent = apply(this.sentOffers);
    this.filteredReceived = apply(this.receivedOffers);
  }
}