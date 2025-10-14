import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE, buildPath } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMessage,
  faCog,
  faBell,
  faSearch,
  faLaptop,
  faCheckCircle,
  faHandshake,
  faBook,
  faStar,
  faCheckDouble,
  faArchive,
  faPlus,
  faCircle,
  faShield
} from '@fortawesome/free-solid-svg-icons';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
    isOnline: boolean;
    status?: 'online' | 'offline' | 'away';
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  category: 'product' | 'order' | 'negotiation' | 'study' | 'review' | 'general';
  categoryIcon: string;
  categoryLabel: string;
}

@Component({
  selector: 'app-chat-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <!-- Main Layout -->
    <div class="flex h-screen bg-gray-50">
      
      <!-- Sidebar -->
      <aside class="w-80 bg-white border-r border-gray-200 flex flex-col">
        
        <!-- Search Section -->
        <div class="p-4 border-b border-gray-200">
          <div class="relative">
            <fa-icon [icon]="faSearch" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></fa-icon>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
          </div>
          
          <!-- Quick Filters -->
          <div class="flex space-x-2 mt-3">
            <button 
              *ngFor="let filter of quickFilters"
              (click)="selectFilter(filter.id)"
              [class]="getFilterClass(filter.id)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Categories Tabs -->
        <div class="flex border-b border-gray-200">
          <button 
            *ngFor="let tab of categoryTabs"
            (click)="selectTab(tab.id)"
            class="flex-1 py-3 text-sm font-medium transition-colors"
            [class.text-red-500]="selectedTab === tab.id"
            [class.border-b-2]="selectedTab === tab.id"
            [class.border-red-500]="selectedTab === tab.id"
            [class.text-gray-500]="selectedTab !== tab.id"
            [class.hover:text-gray-900]="selectedTab !== tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto">
          
          <div 
            *ngFor="let conversation of filteredConversations"
            (click)="openConversation(conversation)"
            class="p-4 border-b border-gray-200 hover:bg-gray-50/50 cursor-pointer transition-colors"
          >
            <div class="flex items-start space-x-3">
              <div class="relative">
                <img 
                  [src]="conversation.user.avatar" 
                  [alt]="conversation.user.name" 
                  class="w-12 h-12 rounded-full object-cover"
                >
                <div 
                  class="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full"
                  [class.bg-green-500]="conversation.user.status === 'online'"
                  [class.bg-gray-400]="conversation.user.status === 'offline'"
                  [class.bg-yellow-500]="conversation.user.status === 'away'"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900 truncate">{{ conversation.user.name }}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">{{ conversation.timestamp }}</span>
                    <div 
                      *ngIf="conversation.unreadCount > 0"
                      class="w-2 h-2 bg-red-500 rounded-full"
                    ></div>
                  </div>
                </div>
                <p class="text-sm text-gray-500 truncate mt-1">{{ conversation.lastMessage }}</p>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center space-x-2">
                    <fa-icon 
                      [icon]="getCategoryIcon(conversation.category)" 
                      class="text-xs text-gray-400"
                    ></fa-icon>
                    <span class="text-xs text-gray-500">{{ conversation.categoryLabel }}</span>
                  </div>
                  <div 
                    *ngIf="conversation.unreadCount > 0"
                    class="bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {{ conversation.unreadCount }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div 
            *ngIf="filteredConversations.length === 0"
            class="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <fa-icon [icon]="faMessage" class="text-gray-300 text-5xl mb-4"></fa-icon>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p class="text-sm text-gray-500 mb-4">Start a new conversation to connect with your campus community</p>
            <button 
              (click)="startNewConversation()"
              class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <fa-icon [icon]="faPlus" class="mr-2"></fa-icon>
              New Conversation
            </button>
          </div>

        </div>

        <!-- Quick Actions -->
        <div class="p-4 border-t border-gray-200">
          <div class="flex space-x-2">
            <button 
              (click)="markAllAsRead()"
              class="flex-1 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <fa-icon [icon]="faCheckDouble" class="mr-2"></fa-icon>
              Mark All Read
            </button>
            <button 
              (click)="archiveSelected()"
              class="flex-1 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <fa-icon [icon]="faArchive" class="mr-2"></fa-icon>
              Archive
            </button>
          </div>
        </div>

      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col overflow-hidden">
        
        <!-- Hero Section -->
        <div class="h-[400px] bg-gradient-to-br from-red-500 to-red-600 relative overflow-hidden">
          <img 
            class="absolute inset-0 w-full h-full object-cover opacity-20" 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d5d8957ed8-201f11e115c3383ea06b.png" 
            alt="Students chatting" 
          />
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="relative z-10 flex items-center justify-center h-full">
            <div class="text-center text-white px-4">
              <h1 class="text-4xl font-bold mb-4">Stay Connected with Your Campus Community</h1>
              <p class="text-xl opacity-90 mb-8">Chat, negotiate, and build trust through seamless messaging</p>
              <button 
                (click)="startNewConversation()"
                class="bg-white text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <fa-icon [icon]="faPlus" class="mr-2"></fa-icon>
                Start New Conversation
              </button>
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-8">
            <div class="max-w-6xl mx-auto">
              <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Messaging Features</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <!-- Feature Cards -->
                <div 
                  *ngFor="let feature of features"
                  class="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div 
                    class="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    [style.background-color]="feature.bgColor"
                  >
                    <fa-icon 
                      [icon]="feature.icon" 
                      class="text-xl"
                      [style.color]="feature.iconColor"
                    ></fa-icon>
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
                  <p class="text-gray-500 text-sm">{{ feature.description }}</p>
                </div>

              </div>
            </div>
          </div>

          <!-- CTA Section -->
          <div class="bg-gray-100 p-8">
            <div class="max-w-4xl mx-auto text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Ready to Connect?</h2>
              <p class="text-gray-500 mb-6">Join thousands of students building trust through meaningful conversations</p>
              <button 
                (click)="startNewConversation()"
                class="bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <fa-icon [icon]="faMessage" class="mr-2"></fa-icon>
                Start Messaging Now
              </button>
            </div>
          </div>
        </div>

      </main>

    </div>

    <!-- Floating New Chat Button -->
    <button 
      (click)="startNewConversation()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center z-50"
    >
      <fa-icon [icon]="faPlus" class="text-xl"></fa-icon>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    /* Hide scrollbar but keep functionality */
    ::-webkit-scrollbar {
      display: none;
    }

    * {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* Smooth transitions */
    * {
      transition-property: background-color, border-color, color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .w-80 {
        width: 100%;
        max-width: 100%;
      }

      .flex.h-screen {
        flex-direction: column;
      }

      main {
        display: none;
      }
    }
  `]
})
export class ChatOverviewComponent implements OnInit {
  private router = inject(Router);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  // Icons
  faMessage = faMessage;
  faCog = faCog;
  faBell = faBell;
  faSearch = faSearch;
  faLaptop = faLaptop;
  faCheckCircle = faCheckCircle;
  faHandshake = faHandshake;
  faBook = faBook;
  faStar = faStar;
  faCheckDouble = faCheckDouble;
  faArchive = faArchive;
  faPlus = faPlus;
  faCircle = faCircle;
  faShield = faShield;

  // State
  searchQuery = '';
  selectedFilter = 'all';
  selectedTab = 'active';

  // Data
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];

  // Filters and Tabs
  quickFilters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'orders', label: 'Orders' }
  ];

  categoryTabs = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
    { id: 'blocked', label: 'Blocked' }
  ];

  // Features
  features = [
    {
      title: 'Smart Search',
      description: 'Find conversations by user, content, or product context instantly',
      icon: faSearch,
      bgColor: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#ef4444'
    },
    {
      title: 'Real-time Status',
      description: 'See who\'s online and active for immediate responses',
      icon: faCircle,
      bgColor: 'rgba(34, 197, 94, 0.1)',
      iconColor: '#22c55e'
    },
    {
      title: 'Smart Notifications',
      description: 'Priority alerts for urgent messages and order updates',
      icon: faBell,
      bgColor: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#3b82f6'
    },
    {
      title: 'Negotiation Tools',
      description: 'Built-in offer system for seamless price negotiations',
      icon: faHandshake,
      bgColor: 'rgba(168, 85, 247, 0.1)',
      iconColor: '#a855f7'
    },
    {
      title: 'Trust & Safety',
      description: 'Report, block, and maintain safe campus communications',
      icon: faShield,
      bgColor: 'rgba(234, 179, 8, 0.1)',
      iconColor: '#eab308'
    },
    {
      title: 'Organization',
      description: 'Archive, categorize, and manage conversation history',
      icon: faArchive,
      bgColor: 'rgba(239, 68, 68, 0.1)',
      iconColor: '#ef4444'
    }
  ];

  ngOnInit(): void {
    this.loadConversations();
    this.applyFilters();
  }

  private loadConversations(): void {
    // Mock data - replace with actual API call
    this.conversations = [
      {
        id: '1',
        user: {
          name: 'Alex Chen',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
          isOnline: true,
          status: 'online'
        },
        lastMessage: 'Is the MacBook still available? I\'m interested in...',
        timestamp: '2m',
        unreadCount: 3,
        category: 'product',
        categoryIcon: 'laptop',
        categoryLabel: 'Product Inquiry'
      },
      {
        id: '2',
        user: {
          name: 'Sarah Wilson',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
          isOnline: false,
          status: 'offline'
        },
        lastMessage: 'Thanks for the quick delivery! The textbooks are perfect',
        timestamp: '1h',
        unreadCount: 0,
        category: 'order',
        categoryIcon: 'check-circle',
        categoryLabel: 'Order Complete'
      },
      {
        id: '3',
        user: {
          name: 'Mike Rodriguez',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
          isOnline: true,
          status: 'online'
        },
        lastMessage: 'Could you do $45 for the guitar? I can pick it up today',
        timestamp: '3h',
        unreadCount: 1,
        category: 'negotiation',
        categoryIcon: 'handshake',
        categoryLabel: 'Negotiation'
      },
      {
        id: '4',
        user: {
          name: 'Emma Thompson',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
          isOnline: true,
          status: 'away'
        },
        lastMessage: 'Hi! I saw your study notes for Chemistry 101...',
        timestamp: '1d',
        unreadCount: 0,
        category: 'study',
        categoryIcon: 'book',
        categoryLabel: 'Study Materials'
      },
      {
        id: '5',
        user: {
          name: 'David Kim',
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
          isOnline: false,
          status: 'offline'
        },
        lastMessage: 'Perfect! I\'ll leave a review. Great seller!',
        timestamp: '2d',
        unreadCount: 0,
        category: 'review',
        categoryIcon: 'star',
        categoryLabel: 'Review'
      }
    ];
  }

  onSearchInput(): void {
    this.applyFilters();
  }

  selectFilter(filterId: string): void {
    this.selectedFilter = filterId;
    this.applyFilters();
  }

  selectTab(tabId: string): void {
    this.selectedTab = tabId;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.conversations];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.user.name.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.categoryLabel.toLowerCase().includes(query)
      );
    }

    // Apply quick filter
    if (this.selectedFilter === 'unread') {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    } else if (this.selectedFilter === 'orders') {
      filtered = filtered.filter(conv => conv.category === 'order');
    }

    // Apply tab filter (active/archived/blocked)
    // For now, showing all in active tab
    if (this.selectedTab === 'archived') {
      filtered = [];
    } else if (this.selectedTab === 'blocked') {
      filtered = [];
    }

    this.filteredConversations = filtered;
  }

  getFilterClass(filterId: string): string {
    const baseClasses = 'px-3 py-1.5 text-sm rounded-full transition-colors';
    if (filterId === this.selectedFilter) {
      return `${baseClasses} bg-red-500 text-white`;
    }
    return `${baseClasses} bg-gray-100 text-gray-500 hover:bg-gray-200`;
  }

  getCategoryIcon(category: string): any {
    switch (category) {
      case 'product':
        return faLaptop;
      case 'order':
        return faCheckCircle;
      case 'negotiation':
        return faHandshake;
      case 'study':
        return faBook;
      case 'review':
        return faStar;
      default:
        return faMessage;
    }
  }

  openConversation(conversation: Conversation): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT, conversation.id]);
  }

  startNewConversation(): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.CHAT, 'start')]);
  }

  markAllAsRead(): void {
    // TODO: Implement mark all as read
    console.log('Mark all as read');
  }

  archiveSelected(): void {
    // TODO: Implement archive
    console.log('Archive selected');
  }
}

