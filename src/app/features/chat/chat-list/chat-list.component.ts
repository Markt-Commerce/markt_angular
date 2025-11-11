import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ROUTES_ABSOLUTE, buildPath } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faComments,
  faSearch,
  faEllipsisH,
  faTimes,
  faUser,
  faStore,
  faRulerVertical,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ChatService } from '../../../domains/chat/services/chat.service';
import { AuthService, User, UserRole } from '../../../domains/authentication';
import {
  ChatRoomSummary,
  ChatMessageType,
  LastMessagePreview,
} from '../../../domains/chat';

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
            <p class="text-sm text-gray-500">
              {{ chatRooms.length }} conversations
            </p>
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
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <fa-icon
                [icon]="faSearch"
                class="w-5 h-5 text-gray-400"
              ></fa-icon>
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-markt-primary focus:border-markt-primary sm:text-sm"
            />
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
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"
          ></div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading && chatRooms.length === 0"
          class="text-center py-12"
        >
          <fa-icon
            [icon]="faUser"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          ></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">
            No conversations yet
          </h2>
          <p class="text-gray-500 mb-6">
            Start a conversation with other users or sellers
          </p>
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
              />
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
                  <span class="text-xs text-gray-500">
                    {{ formatTimestamp(getLastMessageTimestamp(chat)) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between mt-1">
                <p class="text-sm text-gray-500 truncate">
                  <span
                    *ngIf="isLastMessageFromCurrentUser(chat)"
                    class="text-gray-400"
                    >You:
                  </span>
                  {{ getLastMessagePreview(chat) }}
                </p>
                <div class="flex items-center space-x-2">
                  <span
                    *ngIf="getUnreadCount(chat) > 0"
                    class="inline-flex items-center justify-center w-5 h-5 bg-markt-primary text-white text-xs rounded-full"
                  >
                    {{
                      getUnreadCount(chat) > 99 ? '99+' : getUnreadCount(chat)
                    }}
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
                  *ngIf="chat.product"
                  class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  <fa-icon [icon]="faStore" class="w-3 h-3 mr-1"></fa-icon>
                  Product Chat
                </span>
                <span
                  *ngIf="chat.request"
                  class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  <fa-icon
                    [icon]="faRulerVertical"
                    class="w-3 h-3 mr-1"
                  ></fa-icon>
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
          (click)="deleteChat(selectedChat)"
          class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <fa-icon [icon]="faTrash" class="w-4 h-4 mr-2"></fa-icon>
          Delete Chat
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class ChatListComponent implements OnInit {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // Icons
  faComments = faComments;
  faSearch = faSearch;
  faEllipsisH = faEllipsisH;
  faTimes = faTimes;
  faUser = faUser;
  faStore = faStore;
  faRulerVertical = faRulerVertical;
  faTrash = faTrash;

  // Data
  chatRooms: ChatRoomSummary[] = [];
  user: User | null = null;
  currentRole: UserRole | null = null;
  isLoading = false;
  private deeplinkHandled = false;

  // UI State
  showSearch = false;
  searchQuery = '';
  selectedChatId: number | null = null;
  showMenu = false;
  selectedChat: ChatRoomSummary | null = null;
  menuPosition = { x: 0, y: 0 };

  get filteredChatRooms(): ChatRoomSummary[] {
    if (!this.searchQuery) {
      return this.chatRooms;
    }

    const query = this.searchQuery.toLowerCase();
    return this.chatRooms.filter((chat) => {
      const nameMatch = this.getChatName(chat).toLowerCase().includes(query);
      const lastMessageMatch = this.getLastMessagePreview(chat)
        .toLowerCase()
        .includes(query);
      return nameMatch || lastMessageMatch;
    });
  }

  ngOnInit(): void {
    this.observeAuthState();
    this.observeRooms();
    this.observeNewMessages();
    this.observeRouteParams();
    this.loadChatList();
  }

  private observeAuthState(): void {
    this.authService.authState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authState) => {
        this.user = authState.user;
        this.currentRole = authState.user?.currentRole ?? null;
      });
  }

  private observeRooms(): void {
    this.chatService.rooms$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rooms) => {
        this.chatRooms = rooms;
      });
  }

  private observeNewMessages(): void {
    this.chatService.newMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadChatList(false);
      });
  }

  private observeRouteParams(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (this.deeplinkHandled || !this.user) {
          return;
        }

        const otherUserId = params.get('user');
        const productId = params.get('product') || undefined;

        if (!otherUserId) {
          return;
        }

        const buyerId =
          this.currentRole === 'buyer'
            ? this.user.id
            : this.user.buyerAccount?.id ?? this.user.id;
        const sellerId = otherUserId;

        this.deeplinkHandled = true;

        this.chatService
          .getOrCreateRoom(String(buyerId), String(sellerId), productId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (room) => {
              this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT, room.id]);
            },
            error: () => {
              this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT]);
            },
          });
      });
  }

  private loadChatList(showSpinner = true): void {
    if (showSpinner) {
      this.isLoading = true;
    }

    this.chatService
      .loadRooms()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (showSpinner) {
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error loading chat list:', error);
          if (showSpinner) {
            this.chatRooms = [];
          }
        },
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

  selectChat(chat: ChatRoomSummary): void {
    this.selectedChatId = chat.id;
    this.chatService.selectRoom(chat.id);
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT, chat.id]);
  }

  startNewChat(): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.CHAT, 'start')]);
  }

  getChatAvatar(chat: ChatRoomSummary): string {
    return chat.otherUser.profilePicture ?? '/Logo.png';
  }

  getChatName(chat: ChatRoomSummary): string {
    return chat.otherUser.displayName();
  }

  getChatOnlineStatus(_chat: ChatRoomSummary): boolean {
    return false; // backend may provide presence later
  }

  getLastMessagePreview(chat: ChatRoomSummary): string {
    const lastMessage = chat.lastMessage;
    if (!lastMessage) {
      return 'No messages yet';
    }

    return this.describeLastMessage(lastMessage);
  }

  private describeLastMessage(lastMessage: LastMessagePreview): string {
    switch (lastMessage.messageType as ChatMessageType) {
      case 'text':
        return lastMessage.content;
      case 'image':
        return 'Image shared';
      case 'offer':
        return 'Offer shared';
      case 'product':
        return 'Product shared';
      case 'discount':
        return 'Discount offer';
      case 'discount_response':
        return 'Discount update';
      default:
        return 'New message';
    }
  }

  getLastMessageTimestamp(chat: ChatRoomSummary): string | undefined {
    return chat.lastMessage?.createdAt ?? chat.lastMessageAt ?? undefined;
  }

  isLastMessageFromCurrentUser(chat: ChatRoomSummary): boolean {
    if (!this.user) {
      return false;
    }

    const lastMessage = chat.lastMessage;
    return lastMessage?.senderId === this.user.id;
  }

  formatTimestamp(timestamp?: string): string {
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

  getUnreadCount(chat: ChatRoomSummary): number {
    return chat.unreadCount;
  }

  showChatMenu(chat: ChatRoomSummary, event: MouseEvent): void {
    event.stopPropagation();

    this.selectedChat = chat;
    this.menuPosition = {
      x: event.clientX,
      y: event.clientY,
    };
    this.showMenu = true;
  }

  hideChatMenu(): void {
    this.showMenu = false;
    this.selectedChat = null;
  }

  deleteChat(chat: ChatRoomSummary | null): void {
    if (!chat) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this conversation? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    this.chatService
      .deleteRoom(chat.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.chatRooms = this.chatRooms.filter((c) => c.id !== chat.id);
          this.hideChatMenu();
        },
        error: (error) => {
          console.error('Error deleting chat:', error);
        },
      });
  }
}
