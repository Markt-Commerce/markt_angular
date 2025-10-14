import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faComments, faEllipsisH, faEye, faMapMarkerAlt, faPlus, faRedo, faSearch, faShoppingBag, faStar, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { NgOptimizedImage } from '@angular/common';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';

interface RequestCard {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  locationLabel: string;
  status: 'Active' | 'Pending' | 'Fulfilled' | 'Negotiating' | 'Closed';
  badgeRight?: string;
  viewsLabel: string;
  responsesLabel: string;
  timeLeftLabel: string;
  imageUrl: string;
  purchasedLabel?: string;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule, NgOptimizedImage],
  template: `
    <!-- Wrapper only, no global layout/header/footer here -->
    <section class="bg-gradient-to-r from-orange-50 to-red-50 h-[200px] relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <img 
          ngSrc="https://storage.googleapis.com/uxpilot-auth.appspot.com/39ff1fe0bb-ed110b944d6d197d5102.png" 
          width="1200" 
          height="200" 
          class="w-full h-full object-cover" 
          alt="university students shopping together on campus, modern marketplace, community commerce" 
        />
      </div>
      <div class="relative mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">My Buy Requests</h1>
          <p class="text-gray-600">Manage your item requests and connect with campus sellers</p>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Active Requests</p>
              <p class="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-lg">
              <fa-icon [icon]="faShoppingBag" class="text-blue-600"></fa-icon>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Responses</p>
              <p class="text-2xl font-bold text-gray-900">48</p>
            </div>
            <div class="bg-green-100 p-3 rounded-lg">
              <fa-icon [icon]="faComments" class="text-green-600"></fa-icon>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Fulfilled</p>
              <p class="text-2xl font-bold text-gray-900">25</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-lg">
              <fa-icon [icon]="faCheckCircle" class="text-purple-600"></fa-icon>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Avg. Response Time</p>
              <p class="text-2xl font-bold text-gray-900">2.4h</p>
            </div>
            <div class="bg-orange-100 p-3 rounded-lg">
              <fa-icon [icon]="faClock" class="text-orange-600"></fa-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class=" mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <div class="relative">
              <fa-icon [icon]="faSearch" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></fa-icon>
              <input type="text" placeholder="Search requests..." class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-markt-primary focus:border-transparent">
            </div>
          </div>
          <div>
            <select class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-markt-primary focus:border-transparent">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Books</option>
              <option>Furniture</option>
              <option>Clothing</option>
            </select>
          </div>
          <div>
            <select class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-markt-primary focus:border-transparent">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Fulfilled</option>
              <option>Closed</option>
            </select>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <span class="bg-markt-primary text-white px-3 py-1 rounded-full text-sm">Active</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200">Electronics</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200">Campus Only</span>
          <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200">Under $100</span>
        </div>
      </div>
    </section>

    <section class="mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let card of cards()" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div class="relative h-48">
            <img [ngSrc]="card.imageUrl" width="480" height="192" class="w-full h-full object-cover" [alt]="card.title">
            <div class="absolute top-4 left-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800': card.status==='Active',
                      'bg-blue-100 text-blue-800': card.status==='Pending',
                      'bg-purple-100 text-purple-800': card.status==='Fulfilled',
                      'bg-yellow-100 text-yellow-800': card.status==='Negotiating',
                      'bg-red-100 text-red-800': card.status==='Closed'
                    }">
                {{ card.status }}
              </span>
            </div>
            <div *ngIf="card.badgeRight" class="absolute top-4 right-4">
              <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">{{ card.badgeRight }}</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ card.title }}</h3>
            <p class="text-gray-600 text-sm mb-3">{{ card.description }}</p>
            <div class="flex items-center justify-between mb-3">
              <span class="text-markt-primary font-semibold" [class.text-green-600]="card.purchasedLabel">{{ card.purchasedLabel ?? card.priceLabel }}</span>
              <span class="text-gray-500 text-sm flex items-center">
                <fa-icon [icon]="faMapMarkerAlt" class="mr-1"></fa-icon>
                {{ card.locationLabel }}
              </span>
            </div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-4 text-sm text-gray-500">
                <span><fa-icon [icon]="faEye" class="mr-1"></fa-icon>{{ card.viewsLabel }}</span>
                <span><fa-icon [icon]="faComments" class="mr-1"></fa-icon>{{ card.responsesLabel }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ card.timeLeftLabel }}</span>
            </div>
            <div class="flex space-x-2">
              <button 
                class="flex-1 bg-markt-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-markt-secondary transition-colors" 
                *ngIf="card.status!=='Fulfilled' && card.status!=='Closed'"
                [routerLink]="[ROUTES_ABSOLUTE.APP.REQUESTS.ROOT, card.id]"
              >
                View Responses
              </button>
              <button 
                class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" 
                *ngIf="card.status==='Fulfilled'"
                [routerLink]="[ROUTES_ABSOLUTE.APP.REQUESTS.ROOT, card.id]"
              >
                View Details
              </button>
              <button class="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" [title]="'More options'">
                <fa-icon [icon]="card.status==='Closed' ? faTrash : (card.status==='Fulfilled' ? faRedo : faEllipsisH)"></fa-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <button class="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">Load More Requests</button>
      </div>
    </section>
  `,
})
export class MyRequestsComponent {
  // Expose routes for template access
  protected readonly ROUTES_ABSOLUTE = ROUTES_ABSOLUTE;
  
  faPlus = faPlus; // kept for parity if needed in future
  faSearch = faSearch;
  faComments = faComments;
  faEye = faEye;
  faMapMarkerAlt = faMapMarkerAlt;
  faShoppingBag = faShoppingBag;
  faClock = faClock;
  faEllipsisH = faEllipsisH;
  faRedo = faRedo;
  faTrash = faTrash;
  faStar = faStar;
  faCheckCircle = faCheckCircle;

  private readonly initialCards: RequestCard[] = [
    {
      id: '1',
      title: 'MacBook Pro 13" (Used)',
      description: 'Looking for a reliable MacBook Pro for coding projects. Preferably 2019 or newer.',
      priceLabel: '$800 - $1200',
      locationLabel: 'Main Campus',
      status: 'Active',
      badgeRight: 'Urgent',
      viewsLabel: '24 views',
      responsesLabel: '5 responses',
      timeLeftLabel: '2 days left',
      imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/0d0079286f-ae54b24d4bc91d67c80f.png'
    },
    {
      id: '2',
      title: 'Chemistry Textbooks',
      description: 'Need Organic Chemistry and Physical Chemistry textbooks for spring semester.',
      priceLabel: '$50 - $150',
      locationLabel: 'Science Building',
      status: 'Pending',
      viewsLabel: '18 views',
      responsesLabel: '3 responses',
      timeLeftLabel: '5 days left',
      imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/f454f4cd72-ca47cf10563e20819d3b.png'
    },
    {
      id: '3',
      title: 'Ergonomic Desk Chair',
      description: 'Completed! Found a great chair from a graduating senior. Perfect condition.',
      priceLabel: '$85',
      purchasedLabel: 'Purchased: $85',
      locationLabel: 'Dorm Area',
      status: 'Fulfilled',
      viewsLabel: '5.0 rating',
      responsesLabel: 'Completed',
      timeLeftLabel: '1 week ago',
      imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/22e8e649eb-d5859894279067719e22.png'
    },
    {
      id: '4',
      title: 'Campus Bike',
      description: 'Looking for a reliable bike to get around campus. Mountain or hybrid bike preferred.',
      priceLabel: '$100 - $300',
      locationLabel: 'Any Campus',
      status: 'Active',
      viewsLabel: '31 views',
      responsesLabel: '8 responses',
      timeLeftLabel: '1 week left',
      imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e74d6f98a7-a69543e68c869d26d079.png'
    },
    {
      id: '5',
      title: 'Mini Fridge for Dorm',
      description: 'Need a compact fridge for my dorm room. Currently negotiating with 2 sellers.',
      priceLabel: '$75 - $150',
      locationLabel: 'North Dorms',
      status: 'Negotiating',
      viewsLabel: '15 views',
      responsesLabel: '4 responses',
      timeLeftLabel: '3 days left',
      imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/2dad7f1c81-102e3631fe673dd2e4a9.png'
    },
    {
      id: '6',
      title: 'Gaming Console',
      description: 'Request closed - decided to wait for new semester sales instead.',
      priceLabel: '$200 - $400',
      locationLabel: 'Student Center',
      status: 'Closed',
      viewsLabel: '42 views',
      responsesLabel: '12 responses',
      timeLeftLabel: 'Closed',
      imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/8f5e97f7d8-2220ec7a65d0bafecdb1.png'
    }
  ];

  readonly cards = signal<RequestCard[]>(this.initialCards);
}


