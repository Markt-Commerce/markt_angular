import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE, buildPath } from '../../../core/config/routes.config';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPenToSquare,
  faSearch,
  faPhone,
  faVideo,
  faEllipsisVertical,
  faHandshake,
  faCalendar,
  faShield,
  faPaperclip,
  faImage,
  faMicrophone,
  faFaceSmile,
  faPaperPlane,
  faUser,
  faBell,
  faDownload,
  faFlag,
  faBan,
  faStar,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatService } from '../../../domains/chat/services/chat.service';
import {
  ChatMessage as ChatMessageModel,
  ChatRoomSummary,
  ChatMessageType,
} from '../../../domains/chat';
import { AuthService } from '../../../domains/authentication/services/auth.service';

interface ChatMessageView {
  id: number;
  roomId: number;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  type: ChatMessageType;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  isOutgoing: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}

interface ChatParticipantView {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen?: string;
  occupation?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
}

interface ChatRoomView {
  id: number;
  name: string;
  avatar: string | null;
  lastMessage?: string;
  timestamp?: string;
  isOnline: boolean;
  unreadCount: number;
  productTitle?: string;
  productPrice?: string;
  productImage?: string | null;
}

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <!-- Main Chat Container -->
    <div class="flex h-screen bg-gray-50">
      <!-- Chat Sidebar -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <h1 class="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              (click)="startNewChat()"
            >
              <fa-icon [icon]="faPenToSquare" class="text-gray-600"></fa-icon>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="relative">
            <fa-icon
              [icon]="faSearch"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
            ></fa-icon>
            <input
              type="text"
              placeholder="Search conversations..."
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Chat List -->
        <div class="flex-1 overflow-y-auto">
          <!-- Active Chat -->
          <div
            *ngFor="let chat of filteredChatRooms"
            (click)="selectChat(chat)"
            class="p-4 border-b border-gray-200 cursor-pointer transition-colors"
            [class.bg-red-50]="selectedChatId === chat.id"
            [class.hover:bg-gray-50]="selectedChatId !== chat.id"
          >
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  [src]="chat.avatar"
                  [alt]="chat.name"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full"
                  [class.bg-green-500]="chat.isOnline"
                  [class.bg-gray-400]="!chat.isOnline"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium text-gray-900 truncate">
                    {{ chat.name }}
                  </h3>
                  <span class="text-xs text-gray-500">{{
                    chat.timestamp
                  }}</span>
                </div>
                <p class="text-sm text-gray-500 truncate">
                  {{ chat.lastMessage }}
                </p>
              </div>
              <div
                *ngIf="chat.unreadCount && chat.unreadCount > 0"
                class="w-2 h-2 bg-red-500 rounded-full"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Chat Header -->
        <div class="bg-white border-b border-gray-200 p-4" *ngIf="participant">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img
                [src]="participant.avatar"
                [alt]="participant.name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 class="font-semibold text-gray-900">
                  {{ participant.name }}
                </h2>
                <div
                  class="text-sm flex items-center"
                  [class.text-green-500]="participant.isOnline"
                  [class.text-gray-500]="!participant.isOnline"
                >
                  <div
                    class="w-2 h-2 rounded-full mr-2"
                    [class.bg-green-500]="participant.isOnline"
                    [class.bg-gray-400]="!participant.isOnline"
                  ></div>
                  {{ participant.isOnline ? 'Online' : 'Offline' }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <fa-icon [icon]="faPhone" class="text-gray-600"></fa-icon>
              </button>
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <fa-icon [icon]="faVideo" class="text-gray-600"></fa-icon>
              </button>
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <fa-icon
                  [icon]="faEllipsisVertical"
                  class="text-gray-600"
                ></fa-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
          <!-- Product Context Card -->
          <div
            class="mb-6 bg-white rounded-lg border border-gray-200 p-4 mx-auto max-w-md"
            *ngIf="productContext"
          >
            <div class="flex items-center space-x-3">
              <img
                [src]="productContext.image"
                [alt]="productContext.title"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">
                  {{ productContext.title }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ productContext.subtitle }}
                </p>
                <p class="text-lg font-semibold text-red-500">
                  {{ productContext.price }}
                </p>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div class="space-y-4">
            <!-- Received Message -->
            <div
              *ngFor="let message of messages"
              class="flex items-start space-x-3"
              [class.justify-end]="message.isOutgoing"
              [class.flex-row-reverse]="message.isOutgoing"
            >
              <img
                [src]="message.senderAvatar || '/Logo.png'"
                [alt]="message.senderName || 'User'"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div class="flex-1" [class.text-right]="message.isOutgoing">
                <div
                  class="rounded-lg p-3 shadow-sm max-w-xs"
                  [class.bg-white]="!message.isOutgoing"
                  [class.bg-red-500]="message.isOutgoing"
                  [class.text-gray-900]="!message.isOutgoing"
                  [class.text-white]="message.isOutgoing"
                  [class.ml-auto]="message.isOutgoing"
                  [class.border]="!message.isOutgoing"
                  [class.border-gray-200]="!message.isOutgoing"
                >
                  <div *ngIf="message.type === 'text'">
                    <p>{{ message.content }}</p>
                  </div>

                  <div *ngIf="message.type === 'image'">
                    <img
                      [src]="message.attachmentUrl"
                      [alt]="message.attachmentName"
                      class="w-full h-32 rounded-lg object-cover mb-2"
                    />
                    <p *ngIf="message.content">{{ message.content }}</p>
                  </div>
                </div>
                <p
                  class="text-xs text-gray-500 mt-1"
                  [class.flex]="message.isOutgoing"
                  [class.items-center]="message.isOutgoing"
                  [class.justify-end]="message.isOutgoing"
                >
                  {{ formatTime(message.createdAt) }}
                  <fa-icon
                    *ngIf="message.isOutgoing && message.isRead"
                    [icon]="faCheckDouble"
                    class="text-blue-500 ml-1"
                  ></fa-icon>
                </p>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div class="flex items-start space-x-3" *ngIf="isTyping">
              <img
                [src]="participant?.avatar || '/Logo.png'"
                [alt]="participant?.name"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div
                class="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
              >
                <div class="flex space-x-1">
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  ></div>
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0.1s"
                  ></div>
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0.2s"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="bg-white border-t border-gray-200 p-4">
          <!-- Quick Actions -->
          <div class="flex items-center space-x-2 mb-3">
            <button
              class="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              <fa-icon [icon]="faHandshake" class="text-red-500"></fa-icon>
              <span>Make Offer</span>
            </button>
            <button
              class="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              <fa-icon [icon]="faCalendar" class="text-red-500"></fa-icon>
              <span>Schedule Meetup</span>
            </button>
            <button
              class="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              <fa-icon [icon]="faShield" class="text-red-500"></fa-icon>
              <span>Safe Exchange</span>
            </button>
          </div>

          <!-- Input Area -->
          <div class="flex items-end space-x-3">
            <div class="flex items-center space-x-2">
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                (click)="attachFile()"
              >
                <fa-icon [icon]="faPaperclip" class="text-gray-600"></fa-icon>
              </button>
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                (click)="attachImage()"
              >
                <fa-icon [icon]="faImage" class="text-gray-600"></fa-icon>
              </button>
              <button
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <fa-icon [icon]="faMicrophone" class="text-gray-600"></fa-icon>
              </button>
            </div>

            <div class="flex-1 relative">
              <textarea
                placeholder="Type a message..."
                [(ngModel)]="newMessage"
                (keydown.enter)="sendMessage($event)"
                (input)="onTyping()"
                class="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="1"
                #messageInput
              ></textarea>
              <button
                class="absolute right-2 bottom-2 p-1 hover:bg-gray-200 rounded"
              >
                <fa-icon [icon]="faFaceSmile" class="text-gray-600"></fa-icon>
              </button>
            </div>

            <button
              class="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              (click)="sendMessage()"
              [disabled]="!newMessage.trim()"
            >
              <fa-icon [icon]="faPaperPlane"></fa-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Info Sidebar -->
      <div
        class="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto"
        *ngIf="showInfo && participant"
      >
        <!-- User Profile -->
        <div class="text-center mb-6">
          <img
            [src]="participant.avatar"
            [alt]="participant.name"
            class="w-20 h-20 rounded-full object-cover mx-auto mb-3"
          />
          <h3 class="font-semibold text-gray-900">{{ participant.name }}</h3>
          <p class="text-sm text-gray-500" *ngIf="participant.occupation">
            {{ participant.occupation }}
          </p>
          <div
            class="flex items-center justify-center space-x-1 mt-2"
            *ngIf="participant.rating"
          >
            <fa-icon [icon]="faStar" class="text-yellow-400"></fa-icon>
            <span class="text-sm font-medium">{{ participant.rating }}</span>
            <span class="text-sm text-gray-500"
              >({{ participant.reviewCount }} reviews)</span
            >
          </div>
          <div
            class="flex items-center justify-center space-x-1 mt-1"
            *ngIf="participant.isVerified"
          >
            <fa-icon [icon]="faShield" class="text-green-500"></fa-icon>
            <span class="text-sm text-green-600">Verified Student</span>
          </div>
        </div>

        <!-- Shared Media -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3">Shared Media</h4>
          <div class="grid grid-cols-3 gap-2">
            <img
              *ngFor="let media of sharedMedia"
              [src]="media.url"
              [alt]="media.name"
              class="w-full h-16 rounded-lg object-cover"
            />
          </div>
        </div>

        <!-- Conversation Actions -->
        <div class="space-y-2">
          <button
            class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
            (click)="viewProfile()"
          >
            <fa-icon [icon]="faUser" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">View Profile</span>
          </button>
          <button
            class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <fa-icon [icon]="faBell" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">Mute Notifications</span>
          </button>
          <button
            class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <fa-icon [icon]="faSearch" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">Search Messages</span>
          </button>
          <button
            class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <fa-icon [icon]="faDownload" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">Export Chat</span>
          </button>
          <button
            class="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            (click)="reportUser()"
          >
            <fa-icon [icon]="faFlag"></fa-icon>
            <span>Report User</span>
          </button>
          <button
            class="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            (click)="blockUser()"
          >
            <fa-icon [icon]="faBan"></fa-icon>
            <span>Block User</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Hide scrollbars but keep functionality */
      ::-webkit-scrollbar {
        display: none;
      }

      html,
      body {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      /* Auto-resize textarea */
      textarea {
        resize: none;
        overflow: hidden;
      }

      /* Typing animation */
      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .animate-bounce {
        animation: bounce 1.4s infinite ease-in-out;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .w-80 {
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .w-80.show {
          transform: translateX(0);
        }

        .flex.h-screen {
          flex-direction: column;
        }

        .flex-1 {
          min-height: 0;
        }

        .p-4 {
          padding: 1rem;
        }

        .space-x-3 > * + * {
          margin-left: 0.5rem;
        }

        .max-w-xs {
          max-width: 80%;
        }
      }

      @media (max-width: 640px) {
        .w-80 {
          width: 100vw;
        }

        .p-4 {
          padding: 0.75rem;
        }

        .text-xl {
          font-size: 1.125rem;
        }

        .text-lg {
          font-size: 1rem;
        }
      }
    `,
  ],
})
export class ChatDetailComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  // Icons
  faPenToSquare = faPenToSquare;
  faSearch = faSearch;
  faPhone = faPhone;
  faVideo = faVideo;
  faEllipsisVertical = faEllipsisVertical;
  faHandshake = faHandshake;
  faCalendar = faCalendar;
  faShield = faShield;
  faPaperclip = faPaperclip;
  faImage = faImage;
  faMicrophone = faMicrophone;
  faFaceSmile = faFaceSmile;
  faPaperPlane = faPaperPlane;
  faUser = faUser;
  faBell = faBell;
  faDownload = faDownload;
  faFlag = faFlag;
  faBan = faBan;
  faStar = faStar;
  faCheckDouble = faCheckDouble;

  // Data properties
  participant: ChatParticipantView | null = null;
  messages: ChatMessageView[] = [];
  chatRooms: ChatRoomView[] = [];
  filteredChatRooms: ChatRoomView[] = [];
  newMessage = '';
  searchQuery = '';
  isTyping = false;
  showInfo = true; // Show info sidebar by default
  loading = false;
  roomId: number | null = null;
  selectedChatId: number | null = null;
  private currentUserId: string | null = null;

  // Product context
  productContext: {
    title: string;
    subtitle?: string;
    price?: string;
    image?: string | null;
  } | null = null;

  // Shared media
  sharedMedia: { url: string; name: string }[] = [];

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? null;

    this.chatService.rooms$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rooms) => {
        this.chatRooms = rooms.map((room) => this.toRoomView(room));
        this.filteredChatRooms = [...this.chatRooms];
        if (this.roomId) {
          this.participant = this.resolveParticipant(this.roomId);
          this.productContext = this.resolveProductContext(this.roomId);
        }
      });

    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages) => {
        this.messages = messages.map((message) => this.toMessageView(message));
      });

    this.chatService.typing$.pipe(takeUntil(this.destroy$)).subscribe((evt) => {
      if (evt.roomId === this.roomId) {
        this.isTyping = evt.isTyping;
      }
    });

    this.chatService
      .loadRooms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: () => {
          this.chatRooms = [];
          this.filteredChatRooms = [];
        },
      });

    const conversationId = this.route.snapshot.paramMap.get('id');
    if (conversationId) {
      const numericId = Number(conversationId);
      if (!Number.isNaN(numericId)) {
        this.openRoom(numericId);
      }
    }

    this.setupTextareaAutoResize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private openRoom(roomId: number): void {
    this.selectedChatId = roomId;
    this.roomId = roomId;
    this.loading = true;
    this.chatService.selectRoom(roomId);
    this.chatService
      .getMessages(roomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.participant = this.resolveParticipant(roomId);
          this.productContext = this.resolveProductContext(roomId);
          this.sharedMedia = [];
          void this.chatService.markMessagesAsRead(roomId).subscribe();
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private toRoomView(room: ChatRoomSummary): ChatRoomView {
    return {
      id: room.id,
      name: room.otherUser.displayName(),
      avatar: room.otherUser.profilePicture,
      lastMessage: room.lastMessage?.content,
      timestamp: room.lastMessage?.createdAt
        ? this.formatRelativeTime(room.lastMessage.createdAt)
        : undefined,
      isOnline: false,
      unreadCount: room.unreadCount,
      productTitle: room.product?.name,
      productPrice: room.product
        ? this.formatCurrency(room.product.price)
        : undefined,
      productImage: room.product?.image ?? null,
    };
  }

  private toMessageView(message: ChatMessageModel): ChatMessageView {
    const isOutgoing = this.currentUserId
      ? message.senderId === this.currentUserId
      : false;
    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.sender.displayName(),
      senderAvatar: message.sender.profilePicture,
      content: message.content,
      type: message.messageType,
      data: message.messageData ?? null,
      isRead: !message.isUnread(),
      readAt: message.readAt ?? null,
      createdAt: message.createdAt,
      isOutgoing,
    };
  }

  private resolveParticipant(roomId: number): ChatParticipantView | null {
    const room = this.chatRooms.find((item) => item.id === roomId);
    if (!room) {
      return null;
    }
    return {
      id: String(room.id),
      name: room.name,
      avatar: room.avatar,
      isOnline: room.isOnline,
    };
  }

  private resolveProductContext(roomId: number): {
    title: string;
    subtitle?: string;
    price?: string;
    image?: string | null;
  } | null {
    const summary = this.chatService
      .getRoomsSnapshot()
      .find((room) => room.id === roomId);
    if (!summary?.product) {
      return null;
    }

    return {
      title: summary.product.name,
      price: this.formatCurrency(summary.product.price),
      image: summary.product.image ?? null,
    };
  }

  private formatRelativeTime(dateIso: string): string {
    const date = new Date(dateIso);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 1) {
      return 'just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d`;
  }

  private formatCurrency(amount: number): string {
    return Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  private setupTextareaAutoResize(): void {
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.addEventListener('input', () => {
          this.messageInput.nativeElement.style.height = 'auto';
          this.messageInput.nativeElement.style.height =
            Math.min(this.messageInput.nativeElement.scrollHeight, 120) + 'px';
        });
      }
    }, 100);
  }

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.filteredChatRooms = [...this.chatRooms];
      return;
    }

    this.filteredChatRooms = this.chatRooms.filter(
      (chat) =>
        chat.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectChat(chat: ChatRoomView): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT, chat.id]);
    this.openRoom(chat.id);
  }

  startNewChat(): void {
    this.router.navigate([buildPath(ROUTES_ABSOLUTE.APP.CHAT, 'start')]);
  }

  sendMessage(event?: Event): void {
    if (event && event instanceof KeyboardEvent && event.shiftKey) {
      return;
    }
    if (event) event.preventDefault();
    if (!this.newMessage.trim() || this.roomId === null) return;

    const currentRoomId = this.roomId;

    this.chatService
      .sendMessage(currentRoomId, this.newMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newMessage = '';
          this.chatService.stopTyping(currentRoomId);
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error sending message:', error);
        },
      });
  }

  onTyping(): void {
    if (this.roomId === null) return;
    this.chatService.startTyping(this.roomId);
  }

  attachFile(): void {
    // TODO: Implement file attachment
  }

  attachImage(): void {
    // TODO: Implement image attachment
  }

  viewProfile(): void {
    if (this.participant) {
      this.router.navigate([ROUTES_ABSOLUTE.APP.PROFILE, this.participant.id]);
    }
  }

  reportUser(): void {
    if (confirm('Are you sure you want to report this user?')) {
      // TODO: Implement report user
    }
  }

  blockUser(): void {
    if (confirm('Are you sure you want to block this user?')) {
      // TODO: Implement block user
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private scrollToBottom(): void {
    // Auto-scroll to bottom of messages
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        (container as HTMLElement).scrollTop = (
          container as HTMLElement
        ).scrollHeight;
      }
    }, 100);
  }
}
