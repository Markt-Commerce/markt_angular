import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faComments,
  faSearch,
  faEllipsisH,
  faTimes,
  faCheck,
  faClock,
  faUser,
  faStore,
  faPrint,
  faRulerVertical,
  faVolumeMute,
  faThumbtack,
  faTrash,
  faArchive,
  faEllipsisV,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatRoom, ChatMessage } from '../../../core/models';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-900">Messages</h1>
            <p class="text-sm text-gray-500">{{ chatRooms.length }} conversations</p>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              (click)="startNewChat()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="New Chat"
            >
              <fa-icon [icon]="faComments" class="w-5 h-5"></fa-icon>
            </button>
            <button 
              (click)="toggleSearch()"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Search"
            >
              <fa-icon [icon]="faSearch" class="w-5 h-5"></fa-icon>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div *ngIf="showSearch" class="mt-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <fa-icon [icon]="faSearch" class="w-5 h-5 text-gray-400"></fa-icon>
            </div>
            <input 
              type="text" 
              placeholder="Search conversations..."
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
            >
            <button 
              (click)="toggleSearch()"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <fa-icon [icon]="faTimes" class="w-4 h-4"></fa-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && chatRooms.length === 0" class="text-center py-12">
          <fa-icon [icon]="faUser" class="w-16 h-16 text-gray-400 mx-auto mb-4"></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No conversations yet</h2>
          <p class="text-gray-500 mb-6">Start a conversation with other users or sellers</p>
          <button 
            (click)="startNewChat()"
            class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            Start a Chat
          </button>
        </div>

        <!-- Chat Rooms -->
        <div class="divide-y divide-gray-200">
          <div 
            *ngFor="let chat of filteredChatRooms"
            (click)="selectChat(chat)"
            class="flex items-center space-x-3 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            [class.bg-blue-50]="selectedChatId === chat.id"
          >
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <img 
                [src]="getChatAvatar(chat)" 
                [alt]="getChatName(chat)"
                class="w-12 h-12 rounded-full object-cover"
              >
              <div 
                *ngIf="getChatOnlineStatus(chat)"
                class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"
              ></div>
            </div>

            <!-- Chat Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium text-gray-900 truncate">
                  {{ getChatName(chat) }}
                </h3>
                <div class="flex items-center space-x-2">
                  <span *ngIf="chat.pinned" class="text-yellow-500">
                    <fa-icon [icon]="faPrint" class="w-3 h-3"></fa-icon>
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatTimestamp(chat.last_message?.created_at) }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between mt-1">
                <p class="text-sm text-gray-500 truncate">
                  <span *ngIf="chat.last_message?.sender_id === user?.id" class="text-gray-400">You: </span>
                  {{ getLastMessagePreview(chat) }}
                </p>
                <div class="flex items-center space-x-2">
                  <span 
                    *ngIf="unreadCountGetter(chat) > 0"
                    class="inline-flex items-center justify-center w-5 h-5 bg-markt-primary text-white text-xs rounded-full"
                  >
                    {{ unreadCountGetter(chat) > 99 ? '99+' : unreadCountGetter(chat) }}
                  </span>
                  <button 
                    (click)="showChatMenu(chat, $event)"
                    class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <fa-icon [icon]="faEllipsisH" class="w-3 h-3"></fa-icon>
                  </button>
                </div>
              </div>

              <!-- Chat Type Indicator -->
              <div class="flex items-center space-x-2 mt-1">
                <span 
                  *ngIf="chat.type === 'product'"
                  class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  <fa-icon [icon]="faStore" class="w-3 h-3 mr-1"></fa-icon>
                  Product Chat
                </span>
                <span 
                  *ngIf="chat.type === 'order'"
                  class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  <fa-icon [icon]="faRulerVertical" class="w-3 h-3 mr-1"></fa-icon>
                  Order Chat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Menu Dropdown -->
      <div 
        *ngIf="showMenu"
        class="fixed inset-0 z-50"
        (click)="hideChatMenu()"
      ></div>
      <div 
        *ngIf="showMenu"
        class="fixed z-50 bg-white rounded-md shadow-lg py-1 min-w-[160px]"
        [style.left.px]="menuPosition.x"
        [style.top.px]="menuPosition.y"
      >
        <button 
          (click)="pinChat(selectedChat)"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <fa-icon [icon]="faPrint" class="w-4 h-4 mr-2"></fa-icon>
          {{ selectedChat?.pinned ? 'Unpin' : 'Pin' }}
        </button>
        <button 
          (click)="muteChat(selectedChat)"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <fa-icon [icon]="faVolumeMute" class="w-4 h-4 mr-2"></fa-icon>
          {{ selectedChat?.muted ? 'Unmute' : 'Mute' }}
        </button>
        <button 
          (click)="archiveChat(selectedChat)"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <fa-icon [icon]="faArchive" class="w-4 h-4 mr-2"></fa-icon>
          Archive
        </button>
        <hr class="my-1">
        <button 
          (click)="deleteChat(selectedChat)"
          class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <fa-icon [icon]="faTrash" class="w-4 h-4 mr-2"></fa-icon>
          Delete Chat
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ChatListComponent implements OnInit {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Icons
  faComments = faComments;
  faSearch = faSearch;
  faEllipsisH = faEllipsisH;
  faTimes = faTimes;
  faCheck = faCheck;
  faClock = faClock;
  faUser = faUser;
  faStore = faStore;
  faPrint = faPrint;
  faRulerVertical = faRulerVertical;
  faVolumeMute = faVolumeMute;
  faThumbtack = faThumbtack;
  faTrash = faTrash;
  faArchive = faArchive;
  faEllipsisV = faEllipsisV;
  faCircle = faCircle;

  // Data
  chatRooms: any[] = [];
  user: any = null;
  currentRole: 'buyer' | 'seller' | null = null;
  isLoading = false;
  private deeplinkHandled = false;
  
  // UI State
  showSearch = false;
  searchQuery = '';
  selectedChatId: string | null = null;
  showMenu = false;
  selectedChat: any = null;
  menuPosition = { x: 0, y: 0 };

  get filteredChatRooms(): any[] {
    if (!this.searchQuery) {
      return this.chatRooms;
    }
    
    return this.chatRooms.filter(chat => 
      this.getChatName(chat).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      this.getLastMessagePreview(chat).toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadChatList();

    // Live update chat list on new messages
    this.chatService.newMessage$.subscribe(message => {
      const room = this.chatRooms.find(r => r.id === message.room_id);
      if (room) {
        room.last_message = {
          id: message.id,
          content: message.content,
          message_type: message.message_type,
          sender_id: message.sender_id,
          created_at: message.created_at
        };
        // Increment unread count for current user
        if (this.user) {
          if (this.user.id === room.buyer_id) {
            room.unread_count_buyer = (room.unread_count_buyer || 0) + 1;
          } else if (this.user.id === room.seller_id) {
            room.unread_count_seller = (room.unread_count_seller || 0) + 1;
          }
        }
        // Move room to top
        this.chatRooms = [room, ...this.chatRooms.filter(r => r.id !== room.id)];
      }
    });

    // Handle deep-links like /app/chat?user=<sellerId>&product=<productId>
    this.route.queryParamMap.subscribe(params => {
      if (this.deeplinkHandled) return;
      const otherUserId = params.get('user');
      const productId = params.get('product') || undefined;
      if (!otherUserId || !this.user) return;
      // Determine buyer/seller roles for room creation
      const buyerId = this.currentRole === 'buyer' ? this.user.id : this.user?.buyer_account?.id || this.user?.id;
      const sellerId = otherUserId;
      if (!buyerId || !sellerId) return;
      this.deeplinkHandled = true;
      this.chatService.getOrCreateRoom(String(buyerId), String(sellerId), productId).subscribe({
        next: (response) => {
          const roomId = response?.data?.id || response?.id;
          if (roomId) {
            this.router.navigate(['/app/chat', roomId]);
          }
        },
        error: () => {
          // Fallback to chat list
          this.router.navigate(['/app/chat']);
        }
      });
    });
  }

  private loadUserData(): void {
    this.authService.authState$.subscribe(authState => {
      this.user = authState.user;
      this.currentRole = (authState as any)?.current_role || (authState.user?.current_role as any) || null;
    });
  }

  private loadChatList(): void {
    this.isLoading = true;
    
    this.chatService.getChatRooms().subscribe({
      next: (response) => {
        if (response.success) {
          this.chatRooms = (response.data?.rooms) || [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chat list:', error);
        this.chatRooms = [];
        this.isLoading = false;
      }
    });
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
    }
  }

  onSearchInput(): void {
    // Search is handled by the filteredChatRooms getter
  }

  selectChat(chat: any): void {
    this.selectedChatId = chat.id;
    this.router.navigate(['/app/chat', chat.id]);
  }

  startNewChat(): void {
    this.router.navigate(['/app/chat']);
  }

  // Helpers adapted to Ife's response shape
  getChatAvatar(chat: any): string {
    const other = chat.other_user;
    if (other) {
      return other.profile_picture || other.profile_picture_url || '""';
    }
    return '""';
  }

  getChatName(chat: any): string {
    const other = chat.other_user;
    if (other) {
      return other.username || 'Unknown User';
    }
    return 'Unknown User';
  }

  getOtherUser(chat: any): any {
    if (!this.user) return null;
    
    return chat.participants.find((participant: any) => participant.id !== this.user.id);
  }

  getChatOnlineStatus(_chat: any): boolean {
    return false; // backend may provide presence later
  }

  getLastMessagePreview(chat: any): string {
    const lm = chat.last_message;
    if (!lm) return 'No messages yet';
    switch (lm.message_type) {
      case 'text':
        return lm.content;
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      case 'file':
        return '📎 File';
      default:
        return 'Message';
    }
  }

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  }

  // Unread badge helper for either role
  get unreadCountGetter() { return (chat: any) => {
    if (this.user?.id === chat?.buyer_id) return chat.unread_count_buyer || 0;
    if (this.user?.id === chat?.seller_id) return chat.unread_count_seller || 0;
    return 0;
  }}

  showChatMenu(chat: any, event: MouseEvent): void {
    event.stopPropagation();
    
    this.selectedChat = chat;
    this.menuPosition = {
      x: event.clientX,
      y: event.clientY
    };
    this.showMenu = true;
  }

  hideChatMenu(): void {
    this.showMenu = false;
    this.selectedChat = null;
  }

  pinChat(chat: any): void {
    if (!chat) return;
    
    this.chatService.pinChat(chat.id).subscribe({
      next: (response) => {
        if (response.success) {
          chat.pinned = !chat.pinned;
          this.hideChatMenu();
        }
      },
      error: (error) => {
        console.error('Error pinning chat:', error);
      }
    });
  }

  muteChat(chat: any): void {
    if (!chat) return;
    
    this.chatService.muteChat(chat.id).subscribe({
      next: (response) => {
        if (response.success) {
          chat.muted = !chat.muted;
          this.hideChatMenu();
        }
      },
      error: (error) => {
        console.error('Error muting chat:', error);
      }
    });
  }

  archiveChat(chat: any): void {
    if (!chat) return;
    
    this.chatService.archiveChat(chat.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.chatRooms = this.chatRooms.filter(c => c.id !== chat.id);
          this.hideChatMenu();
        }
      },
      error: (error) => {
        console.error('Error archiving chat:', error);
      }
    });
  }

  deleteChat(chat: any): void {
    if (!chat) return;
    
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      this.chatService.deleteChat(chat.id).subscribe({
        next: () => {
          this.chatRooms = this.chatRooms.filter(c => c.id !== chat.id);
          this.hideChatMenu();
        },
        error: (error) => {
          console.error('Error deleting chat:', error);
        }
      });
    }
  }
} 