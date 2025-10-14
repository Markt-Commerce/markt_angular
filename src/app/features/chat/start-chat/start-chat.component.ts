import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faStore,
  faHandshake,
  faHeadset,
  faUsers,
  faPlus,
  faBell,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

/**
 * Interface for user suggestions in the chat creation flow
 * This defines the structure of user data used for contact suggestions
 */
interface SuggestedUser {
  id: string;
  username: string;
  name: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  user_type?: 'seller' | 'buyer' | 'campus_verified';
  is_online?: boolean;
  last_seen?: string;
}

/**
 * Interface for message templates
 * Provides predefined message templates for common chat scenarios
 */
interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'general' | 'order';
}

/**
 * Interface for group chat creation form
 * Defines the structure for creating new group chats
 */
interface GroupChatForm {
  name: string;
  description: string;
}

@Component({
  selector: 'app-start-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-markt-light">
      <!-- Header -->
      <header class="bg-white border-b border-markt-border px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h2 class="text-2xl font-bold text-markt-dark">Start New Chat</h2>
            <div class="text-sm text-markt-muted">Connect with your campus community</div>
          </div>
          <div class="flex items-center space-x-4">
            <button 
              class="p-2 text-markt-muted hover:text-markt-primary transition-colors"
              title="Notifications"
            >
              <fa-icon [icon]="faBell" class="w-5 h-5"></fa-icon>
            </button>
            <img 
              [src]="currentUser?.profile_picture_url || '/Logo.png'" 
              alt="Profile" 
              class="w-8 h-8 rounded-full object-cover"
            >
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <div class="relative h-48 bg-gradient-to-r from-markt-primary to-markt-secondary">
        <img 
          class="absolute inset-0 w-full h-full object-cover opacity-20" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/570afc017e-beed48fec2233b1c46f7.png" 
          alt="diverse college students connecting and chatting in modern campus setting" 
        />
        <div class="absolute inset-0 bg-gradient-to-r from-markt-primary/80 to-markt-secondary/80"></div>
        <div class="relative h-full flex items-center justify-center text-center">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Start a New Conversation</h1>
            <p class="text-white/90 text-lg">Connect with sellers, buyers, and your campus community</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6">
        <div class="mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Column - Main Features -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- User Search Section -->
              <div class="bg-white rounded-xl border border-markt-border p-6">
                <h3 class="text-lg font-semibold text-markt-dark mb-4">Find People to Chat With</h3>
                
                <!-- Search Input -->
                <div class="relative mb-4">
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    (input)="onSearchInput()"
                    placeholder="Search by username, email, or product..." 
                    class="w-full pl-10 pr-4 py-3 border border-markt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-markt-primary focus:border-transparent"
                  >
                  <fa-icon [icon]="faSearch" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-markt-muted"></fa-icon>
                </div>

                <!-- Filter Buttons -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <button 
                    *ngFor="let filter of userFilters"
                    [class]="getFilterButtonClass(filter)"
                    (click)="selectUserFilter(filter)"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Suggested Contacts -->
              <div class="bg-white rounded-xl border border-markt-border p-6">
                <h3 class="text-lg font-semibold text-markt-dark mb-4">Suggested Contacts</h3>
                
                <!-- Loading State -->
                <div *ngIf="isLoadingContacts" class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-markt-primary"></div>
                </div>

                <!-- Contacts List -->
                <div *ngIf="!isLoadingContacts" class="space-y-3">
                  <div 
                    *ngFor="let contact of filteredContacts"
                    class="flex items-center justify-between p-3 border border-markt-border rounded-lg hover:bg-markt-light transition-colors cursor-pointer"
                    (click)="startChatWithUser(contact)"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="relative">
                        <img 
                          [src]="contact.profile_picture_url || '/Logo.png'" 
                          [alt]="contact.name"
                          class="w-10 h-10 rounded-full object-cover"
                        >
                        <div 
                          class="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full"
                          [class.bg-green-500]="contact.is_online"
                          [class.bg-gray-400]="!contact.is_online"
                        ></div>
                      </div>
                      <div>
                        <div class="font-medium text-markt-dark">{{ contact.name }}</div>
                        <div class="text-sm text-markt-muted">
                          @{{ contact.username }} • {{ getUserTypeLabel(contact.user_type) }}
                        </div>
                      </div>
                    </div>
                    <button 
                      class="px-4 py-2 bg-markt-primary text-white text-sm rounded-lg hover:bg-markt-secondary transition-colors"
                      (click)="startChatWithUser(contact, $event)"
                    >
                      Chat
                    </button>
                  </div>

                  <!-- Empty State -->
                  <div *ngIf="filteredContacts.length === 0" class="text-center py-8 text-markt-muted">
                    <fa-icon [icon]="faComment" class="w-12 h-12 mb-4"></fa-icon>
                    <p>No contacts found. Try adjusting your search or filters.</p>
                  </div>
                </div>
              </div>

              <!-- Group Chat Creation -->
              <div class="bg-white rounded-xl border border-markt-border p-6">
                <h3 class="text-lg font-semibold text-markt-dark mb-4">Create Group Chat</h3>
                
                <form (ngSubmit)="createGroupChat()" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-markt-dark mb-2">Group Name</label>
                    <input 
                      type="text" 
                      [(ngModel)]="groupChat.name"
                      placeholder="Enter group name..." 
                      class="w-full px-3 py-2 border border-markt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-markt-primary"
                      name="groupName"
                    >
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-markt-dark mb-2">Description</label>
                    <textarea 
                      [(ngModel)]="groupChat.description"
                      placeholder="What's this group about?" 
                      rows="3" 
                      class="w-full px-3 py-2 border border-markt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-markt-primary"
                      name="groupDescription"
                    ></textarea>
                  </div>

                  <div class="flex space-x-3">
                    <button 
                      type="submit"
                      class="flex-1 px-4 py-2 bg-markt-primary text-white rounded-lg hover:bg-markt-secondary transition-colors"
                      [disabled]="!groupChat.name.trim() || isCreatingGroup"
                    >
                      <span *ngIf="!isCreatingGroup">Create Group</span>
                      <span *ngIf="isCreatingGroup">Creating...</span>
                    </button>
                    <button 
                      type="button"
                      (click)="resetGroupForm()"
                      class="px-4 py-2 border border-markt-border text-markt-muted rounded-lg hover:bg-markt-light transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Right Column - Sidebar Options -->
            <div class="space-y-6">
              
              <!-- Quick Start Actions -->
              <div class="bg-white rounded-xl border border-markt-border p-6">
                <h3 class="text-lg font-semibold text-markt-dark mb-4">Quick Start</h3>
                
                <div class="space-y-3">
                  <button 
                    *ngFor="let action of quickStartActions"
                    class="w-full flex items-center space-x-3 p-3 border border-markt-border rounded-lg hover:bg-markt-light transition-colors text-left"
                    (click)="handleQuickStartAction(action)"
                  >
                    <fa-icon [icon]="action.icon" class="text-markt-primary"></fa-icon>
                    <div>
                      <div class="font-medium text-markt-dark">{{ action.title }}</div>
                      <div class="text-sm text-markt-muted">{{ action.description }}</div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Message Templates -->
              <div class="bg-white rounded-xl border border-markt-border p-6">
                <h3 class="text-lg font-semibold text-markt-dark mb-4">Message Templates</h3>
                
                <div class="space-y-3">
                  <div 
                    *ngFor="let template of messageTemplates"
                    class="p-3 border border-markt-border rounded-lg cursor-pointer hover:bg-markt-light transition-colors"
                    (click)="selectTemplate(template)"
                  >
                    <div class="font-medium text-markt-dark text-sm">{{ template.title }}</div>
                    <div class="text-xs text-markt-muted mt-1">"{{ template.content }}"</div>
                  </div>
                </div>
              </div>

              <!-- Product Context -->
              <div class="bg-white rounded-xl border border-markt-border p-6">
                <h3 class="text-lg font-semibold text-markt-dark mb-4">Add Product Context</h3>
                
                <div class="border-2 border-dashed border-markt-border rounded-lg p-4 text-center">
                  <fa-icon [icon]="faPlus" class="text-markt-muted text-2xl mb-2"></fa-icon>
                  <div class="text-sm text-markt-muted">Select a product to discuss</div>
                  <button 
                    (click)="browseProducts()"
                    class="mt-2 px-4 py-2 bg-markt-primary text-white text-sm rounded-lg hover:bg-markt-secondary transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    
    html, body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class StartChatComponent implements OnInit {
  private router = inject(Router);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private searchService = inject(SearchService);
  
  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  // Icons
  faSearch = faSearch;
  faStore = faStore;
  faHandshake = faHandshake;
  faHeadset = faHeadset;
  faUsers = faUsers;
  faPlus = faPlus;
  faBell = faBell;
  faComment = faComment;

  // Component State
  currentUser: any = null;
  searchQuery = '';
  selectedUserFilter = 'all';
  isLoadingContacts = false;
  isCreatingGroup = false;
  
  // Data
  suggestedContacts: SuggestedUser[] = [];
  groupChat: GroupChatForm = { name: '', description: '' };

  // User Filter Options
  userFilters = [
    { id: 'all', label: 'All Users', active: true },
    { id: 'recent', label: 'Recent Contacts', active: false },
    { id: 'campus', label: 'Campus Only', active: false },
    { id: 'verified', label: 'Verified Users', active: false }
  ];

  // Quick Start Actions
  quickStartActions = [
    {
      id: 'chat_seller',
      title: 'Chat with Seller',
      description: 'About a product',
      icon: faStore,
      action: () => this.handleChatWithSeller()
    },
    {
      id: 'negotiate_offer',
      title: 'Negotiate Offer',
      description: 'Make a deal',
      icon: faHandshake,
      action: () => this.handleNegotiateOffer()
    },
    {
      id: 'get_support',
      title: 'Get Support',
      description: 'Need help?',
      icon: faHeadset,
      action: () => this.handleGetSupport()
    },
    {
      id: 'campus_group',
      title: 'Campus Group',
      description: 'Join community',
      icon: faUsers,
      action: () => this.handleCampusGroup()
    }
  ];

  // Message Templates
  messageTemplates: MessageTemplate[] = [
    {
      id: 'product_inquiry',
      title: 'Product Inquiry',
      content: 'Hi! I\'m interested in your...',
      category: 'product'
    },
    {
      id: 'general_hello',
      title: 'General Hello',
      content: 'Hey! How\'s it going?',
      category: 'general'
    },
    {
      id: 'order_question',
      title: 'Order Question',
      content: 'I have a question about...',
      category: 'order'
    }
  ];

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadSuggestedContacts();
    this.setupSearchDebounce();
  }
  
  /**
   * Setup search debouncing to prevent excessive API calls
   * Waits 300ms after user stops typing before triggering search
   */
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }
  
  /**
   * Perform actual search using the SearchService
   * Fetches users based on search query
   */
  private performSearch(query: string): void {
    if (!query.trim()) {
      this.loadSuggestedContacts();
      return;
    }
    
    this.isLoadingContacts = true;
    
    this.searchService.searchUsers(query).subscribe({
      next: (response) => {
        this.suggestedContacts = response.items.map(user => ({
          id: user.id,
          username: user.username || 'unknown',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Unknown User',
          profile_picture_url: user.profile_picture_url,
          is_verified: (user as any).is_verified || false,
          user_type: this.determineUserType(user),
          is_online: false, // Backend doesn't provide this yet
          last_seen: undefined
        }));
        this.isLoadingContacts = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.isLoadingContacts = false;
      }
    });
  }
  
  /**
   * Determine user type based on available data
   * Helper method to categorize users for display
   */
  private determineUserType(user: any): 'seller' | 'buyer' | 'campus_verified' {
    if (user.seller_account) return 'seller';
    if (user.buyer_account) return 'buyer';
    return 'buyer'; // Default to buyer
  }

  /**
   * Load current user data for profile display and authentication context
   * Uses the AuthService to get the current authenticated user
   */
  private loadCurrentUser(): void {
    this.authService.authState$.subscribe(authState => {
      this.currentUser = authState.user;
    });
  }

  /**
   * Load suggested contacts for the user to start conversations with
   * Fetches users based on current filters and search criteria
   */
  private loadSuggestedContacts(): void {
    this.isLoadingContacts = true;
    
    // Mock data for now - replace with actual API call
    setTimeout(() => {
      this.suggestedContacts = [
        {
          id: '1',
          username: 'alexchen',
          name: 'Alex Chen',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
          is_verified: true,
          user_type: 'seller',
          is_online: true
        },
        {
          id: '2',
          username: 'sarahj',
          name: 'Sarah Johnson',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
          is_verified: false,
          user_type: 'buyer',
          is_online: false
        },
        {
          id: '3',
          username: 'mikerod',
          name: 'Mike Rodriguez',
          profile_picture_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
          is_verified: true,
          user_type: 'campus_verified',
          is_online: true
        }
      ];
      this.isLoadingContacts = false;
    }, 1000);
  }

  /**
   * Handle search input changes to filter contacts
   * Triggers contact filtering based on search query with debouncing
   */
  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  /**
   * Get filtered contacts based on search query and selected filter
   * Applies search and filter logic to the suggested contacts list
   */
  get filteredContacts(): SuggestedUser[] {
    let filtered = this.suggestedContacts;

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.username.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (this.selectedUserFilter) {
      case 'recent':
        // TODO: Implement recent contacts logic
        break;
      case 'campus':
        filtered = filtered.filter(contact => contact.user_type === 'campus_verified');
        break;
      case 'verified':
        filtered = filtered.filter(contact => contact.is_verified);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  }

  /**
   * Get CSS classes for filter buttons based on active state
   * Returns appropriate styling for active/inactive filter buttons
   */
  getFilterButtonClass(filter: any): string {
    const baseClasses = 'px-3 py-1 text-sm rounded-full transition-colors';
    if (filter.id === this.selectedUserFilter) {
      return `${baseClasses} bg-markt-primary text-white`;
    }
    return `${baseClasses} bg-markt-light text-markt-muted hover:bg-markt-border`;
  }

  /**
   * Select a user filter and update the active state
   * Updates the selected filter and refreshes the contacts list
   */
  selectUserFilter(filter: any): void {
    this.selectedUserFilter = filter.id;
    this.userFilters.forEach(f => f.active = f.id === filter.id);
  }

  /**
   * Get user-friendly label for user type
   * Converts internal user type to display-friendly text
   */
  getUserTypeLabel(userType?: string): string {
    switch (userType) {
      case 'seller':
        return 'Verified Seller';
      case 'buyer':
        return 'Active Buyer';
      case 'campus_verified':
        return 'Campus Verified';
      default:
        return 'User';
    }
  }

  /**
   * Start a chat with a specific user
   * Creates or navigates to a chat room with the selected user
   */
  startChatWithUser(contact: SuggestedUser, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    // Determine buyer/seller roles for room creation
    const buyerId = this.currentUser.id;
    const sellerId = contact.id;

    // Use existing chat service to create or get chat room
    this.chatService.getOrCreateRoom(String(buyerId), String(sellerId)).subscribe({
      next: (response) => {
        const roomId = response?.data?.id || response?.id;
        if (roomId) {
          this.router.navigate(['/app/chat', roomId]);
        }
      },
      error: (error) => {
        console.error('Error creating chat room:', error);
        // Show error message to user
      }
    });
  }

  /**
   * Create a new group chat
   * Handles group chat creation form submission using ChatService
   * 
   * Note: Group chat creation requires backend support for multi-participant rooms.
   * The current implementation uses the standard room creation endpoint.
   * This may need to be updated when the backend adds dedicated group chat support.
   */
  createGroupChat(): void {
    if (!this.groupChat.name.trim()) {
      return;
    }

    this.isCreatingGroup = true;

    // Create group chat room data
    // TODO: Update this when backend adds proper group chat support
    const roomData = {
      name: this.groupChat.name,
      description: this.groupChat.description,
      type: 'group', // This may need backend support
      buyer_id: this.currentUser?.id,
      seller_id: this.currentUser?.id, // For now, use same user as creator
      is_group: true
    };

    this.chatService.createChatRoom(roomData).subscribe({
      next: (response) => {
        if (response.success) {
          const roomId = response?.data?.id || response?.id;
          if (roomId) {
            this.resetGroupForm();
            this.router.navigate(['/app/chat', roomId]);
          }
        }
        this.isCreatingGroup = false;
      },
      error: (error) => {
        console.error('Error creating group chat:', error);
        this.isCreatingGroup = false;
        // TODO: Show error message to user
      }
    });
  }

  /**
   * Reset the group chat form
   * Clears all form fields for creating a new group
   */
  resetGroupForm(): void {
    this.groupChat = { name: '', description: '' };
  }

  /**
   * Handle quick start action clicks
   * Routes to appropriate pages or opens relevant modals based on action type
   */
  handleQuickStartAction(action: any): void {
    action.action();
  }

  /**
   * Handle "Chat with Seller" quick start action
   * Navigates to marketplace to find sellers
   */
  private handleChatWithSeller(): void {
    this.router.navigate(['/app/marketplace']);
  }

  /**
   * Handle "Negotiate Offer" quick start action
   * Navigates to offers page for negotiations
   */
  private handleNegotiateOffer(): void {
    this.router.navigate(['/app/offers']);
  }

  /**
   * Handle "Get Support" quick start action
   * Navigates to support page
   */
  private handleGetSupport(): void {
    this.router.navigate(['/app/support']);
  }

  /**
   * Handle "Campus Group" quick start action
   * Navigates to community page for campus groups
   */
  private handleCampusGroup(): void {
    this.router.navigate(['/app/community']);
  }

  /**
   * Select a message template
   * Copies template content for use in new chat
   */
  selectTemplate(template: MessageTemplate): void {
    // TODO: Implement template selection logic
    console.log('Selected template:', template);
  }

  /**
   * Browse products for context
   * Opens product browser or navigates to marketplace
   */
  browseProducts(): void {
    this.router.navigate(['/app/marketplace']);
  }
}
