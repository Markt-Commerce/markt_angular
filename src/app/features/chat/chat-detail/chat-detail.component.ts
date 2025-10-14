import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';
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
  faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import { ChatService } from '../../../core/services/chat.service';
import { CartService } from '../../../core/services/cart.service';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  message_data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  // Additional properties for UI
  senderName?: string;
  senderAvatar?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  occupation?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  timestamp?: string;
  isOnline?: boolean;
  unreadCount?: number;
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
            <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors" (click)="startNewChat()">
              <fa-icon [icon]="faPenToSquare" class="text-gray-600"></fa-icon>
            </button>
          </div>
          
          <!-- Search Bar -->
          <div class="relative">
            <fa-icon [icon]="faSearch" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></fa-icon>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
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
                <img [src]="chat.avatar" [alt]="chat.name" class="w-12 h-12 rounded-full object-cover">
                <div 
                  class="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full"
                  [class.bg-green-500]="chat.isOnline"
                  [class.bg-gray-400]="!chat.isOnline"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium text-gray-900 truncate">{{ chat.name }}</h3>
                  <span class="text-xs text-gray-500">{{ chat.timestamp }}</span>
                </div>
                <p class="text-sm text-gray-500 truncate">{{ chat.lastMessage }}</p>
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
              <img [src]="participant.avatar" [alt]="participant.name" class="w-10 h-10 rounded-full object-cover">
              <div>
                <h2 class="font-semibold text-gray-900">{{ participant.name }}</h2>
                <div class="text-sm flex items-center" [class.text-green-500]="participant.isOnline" [class.text-gray-500]="!participant.isOnline">
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
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <fa-icon [icon]="faPhone" class="text-gray-600"></fa-icon>
              </button>
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <fa-icon [icon]="faVideo" class="text-gray-600"></fa-icon>
              </button>
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <fa-icon [icon]="faEllipsisVertical" class="text-gray-600"></fa-icon>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
          
          <!-- Product Context Card -->
          <div class="mb-6 bg-white rounded-lg border border-gray-200 p-4 mx-auto max-w-md" *ngIf="productContext">
            <div class="flex items-center space-x-3">
              <img [src]="productContext.image" [alt]="productContext.title" class="w-16 h-16 rounded-lg object-cover" />
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ productContext.title }}</h3>
                <p class="text-sm text-gray-500">{{ productContext.subtitle }}</p>
                <p class="text-lg font-semibold text-red-500">{{ productContext.price }}</p>
              </div>
            </div>
          </div>
          
          <!-- Messages -->
          <div class="space-y-4">
            
            <!-- Received Message -->
            <div 
              *ngFor="let message of messages" 
              class="flex items-start space-x-3"
              [class.justify-end]="message.sender_id === 'currentUser'"
              [class.flex-row-reverse]="message.sender_id === 'currentUser'"
            >
              <img 
                [src]="message.senderAvatar || '/Logo.png'" 
                [alt]="message.senderName || 'User'" 
                class="w-8 h-8 rounded-full object-cover"
              >
              <div class="flex-1" [class.text-right]="message.sender_id === 'currentUser'">
                <div 
                  class="rounded-lg p-3 shadow-sm max-w-xs"
                  [class.bg-white]="message.sender_id !== 'currentUser'"
                  [class.bg-red-500]="message.sender_id === 'currentUser'"
                  [class.text-gray-900]="message.sender_id !== 'currentUser'"
                  [class.text-white]="message.sender_id === 'currentUser'"
                  [class.ml-auto]="message.sender_id === 'currentUser'"
                  [class.border]="message.sender_id !== 'currentUser'"
                  [class.border-gray-200]="message.sender_id !== 'currentUser'"
                >
                  <div *ngIf="message.message_type === 'text'">
                    <p>{{ message.content }}</p>
                  </div>
                  
                  <div *ngIf="message.message_type === 'image'">
                    <img [src]="message.attachmentUrl" [alt]="message.attachmentName" class="w-full h-32 rounded-lg object-cover mb-2" />
                    <p *ngIf="message.content">{{ message.content }}</p>
                  </div>
                </div>
                <p 
                  class="text-xs text-gray-500 mt-1"
                  [class.flex]="message.sender_id === 'currentUser'"
                  [class.items-center]="message.sender_id === 'currentUser'"
                  [class.justify-end]="message.sender_id === 'currentUser'"
                >
                  {{ formatTime(message.created_at) }}
                  <fa-icon 
                    *ngIf="message.sender_id === 'currentUser' && message.is_read"
                    [icon]="faCheckDouble" 
                    class="text-blue-500 ml-1"
                  ></fa-icon>
                </p>
              </div>
            </div>
            
            <!-- Typing Indicator -->
            <div class="flex items-start space-x-3" *ngIf="isTyping">
              <img [src]="participant?.avatar || '/Logo.png'" [alt]="participant?.name" class="w-8 h-8 rounded-full object-cover">
              <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        <!-- Message Input -->
        <div class="bg-white border-t border-gray-200 p-4">
          
          <!-- Quick Actions -->
          <div class="flex items-center space-x-2 mb-3">
            <button class="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-200 transition-colors">
              <fa-icon [icon]="faHandshake" class="text-red-500"></fa-icon>
              <span>Make Offer</span>
            </button>
            <button class="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-200 transition-colors">
              <fa-icon [icon]="faCalendar" class="text-red-500"></fa-icon>
              <span>Schedule Meetup</span>
            </button>
            <button class="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm hover:bg-gray-200 transition-colors">
              <fa-icon [icon]="faShield" class="text-red-500"></fa-icon>
              <span>Safe Exchange</span>
            </button>
          </div>
          
          <!-- Input Area -->
          <div class="flex items-end space-x-3">
            <div class="flex items-center space-x-2">
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors" (click)="attachFile()">
                <fa-icon [icon]="faPaperclip" class="text-gray-600"></fa-icon>
              </button>
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors" (click)="attachImage()">
                <fa-icon [icon]="faImage" class="text-gray-600"></fa-icon>
              </button>
              <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
              <button class="absolute right-2 bottom-2 p-1 hover:bg-gray-200 rounded">
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
      <div class="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto" *ngIf="showInfo && participant">
        
        <!-- User Profile -->
        <div class="text-center mb-6">
          <img [src]="participant.avatar" [alt]="participant.name" class="w-20 h-20 rounded-full object-cover mx-auto mb-3">
          <h3 class="font-semibold text-gray-900">{{ participant.name }}</h3>
          <p class="text-sm text-gray-500" *ngIf="participant.occupation">{{ participant.occupation }}</p>
          <div class="flex items-center justify-center space-x-1 mt-2" *ngIf="participant.rating">
            <fa-icon [icon]="faStar" class="text-yellow-400"></fa-icon>
            <span class="text-sm font-medium">{{ participant.rating }}</span>
            <span class="text-sm text-gray-500">({{ participant.reviewCount }} reviews)</span>
          </div>
          <div class="flex items-center justify-center space-x-1 mt-1" *ngIf="participant.isVerified">
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
          <button class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors" (click)="viewProfile()">
            <fa-icon [icon]="faUser" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">View Profile</span>
          </button>
          <button class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <fa-icon [icon]="faBell" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">Mute Notifications</span>
          </button>
          <button class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <fa-icon [icon]="faSearch" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">Search Messages</span>
          </button>
          <button class="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <fa-icon [icon]="faDownload" class="text-gray-600"></fa-icon>
            <span class="text-gray-900">Export Chat</span>
          </button>
          <button class="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors" (click)="reportUser()">
            <fa-icon [icon]="faFlag"></fa-icon>
            <span>Report User</span>
          </button>
          <button class="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors" (click)="blockUser()">
            <fa-icon [icon]="faBan"></fa-icon>
            <span>Block User</span>
          </button>
        </div>
        
      </div>
      
    </div>
  `,
  styles: [`
    /* Hide scrollbars but keep functionality */
    ::-webkit-scrollbar {
      display: none;
    }
    
    html, body {
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
      0%, 80%, 100% { 
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
  `]
})
export class ChatDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private cartService = inject(CartService);
  
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
  participant: ChatParticipant | null = null;
  messages: ChatMessage[] = [];
  chatRooms: ChatRoom[] = [];
  filteredChatRooms: ChatRoom[] = [];
  newMessage = '';
  searchQuery = '';
  isTyping = false;
  showInfo = true; // Show info sidebar by default
  loading = false;
  roomId: string = '';
  selectedChatId: string | null = null;
  
  // Product context
  productContext: { title: string; subtitle: string; price: string; image: string } | null = null;
  
  // Shared media
  sharedMedia: { url: string; name: string }[] = [];
  
  ngOnInit(): void {
    this.loadChatRooms();
    
    const conversationId = this.route.snapshot.paramMap.get('id');
    if (conversationId) {
      this.roomId = conversationId;
      this.selectedChatId = conversationId;
      this.loading = true;
      
      // Load chat room data
      this.chatService.getChatRooms().subscribe({
        next: () => {
          this.chatService.selectRoom(this.roomId);
          this.loadParticipantData();
          this.loadProductContext();
          this.loadSharedMedia();
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
      
      // Subscribe to messages
      this.chatService.getMessages$().subscribe(msgs => {
        this.messages = msgs as any;
      });

      // Subscribe to typing events
      this.chatService.typing$.subscribe(evt => {
        if (evt.roomId === this.roomId) {
          this.isTyping = evt.isTyping;
        }
      });

      // Load initial messages
      this.chatService.loadMessages(this.roomId);
      // Mark as read
      this.chatService.markMessagesAsRead(this.roomId).subscribe();
    }
    
    // Auto-resize textarea
    this.setupTextareaAutoResize();
  }

  private loadChatRooms(): void {
    // Mock data for chat rooms - replace with actual API call
    this.chatRooms = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        lastMessage: 'That textbook looks perfect! Is it still available?',
        timestamp: '2m',
        isOnline: true,
        unreadCount: 1
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        lastMessage: 'Thanks for the quick delivery!',
        timestamp: '1h',
        isOnline: false,
        unreadCount: 0
      },
      {
        id: '3',
        name: 'Emma Wilson',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
        lastMessage: 'Would you consider $15 for the calculator?',
        timestamp: '3h',
        isOnline: true,
        unreadCount: 1
      }
    ];
    this.filteredChatRooms = [...this.chatRooms];
  }

  private loadParticipantData(): void {
    // Mock participant data - replace with actual API call
    this.participant = {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
      isOnline: true,
      occupation: 'Computer Science Student',
      rating: 4.9,
      reviewCount: 127,
      isVerified: true
    };
  }

  private loadProductContext(): void {
    // Mock product context - replace with actual API call
    this.productContext = {
      title: 'Calculus: Early Transcendentals',
      subtitle: '8th Edition - James Stewart',
      price: '$45',
      image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e0d401247f-9997e01609a3ea0e2343.png'
    };
  }

  private loadSharedMedia(): void {
    // Mock shared media - replace with actual API call
    this.sharedMedia = [
      {
        url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/89e16caafb-653f6fec79323304f79e.png',
        name: 'textbook photo'
      },
      {
        url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/d291e441ba-330f182d534cb1f3ebef.png',
        name: 'calculator photo'
      },
      {
        url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/3ace164e2c-f79ce894a24478e560a8.png',
        name: 'notebook photo'
      }
    ];
  }

  private setupTextareaAutoResize(): void {
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.addEventListener('input', () => {
          this.messageInput.nativeElement.style.height = 'auto';
          this.messageInput.nativeElement.style.height = Math.min(this.messageInput.nativeElement.scrollHeight, 120) + 'px';
        });
      }
    }, 100);
  }

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.filteredChatRooms = [...this.chatRooms];
      return;
    }
    
    this.filteredChatRooms = this.chatRooms.filter(chat =>
      chat.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectChat(chat: ChatRoom): void {
    this.selectedChatId = chat.id;
    this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT, chat.id]);
  }

  startNewChat(): void {
    this.router.navigate(['/app/chat/start']);
  }

  sendMessage(event?: Event): void {
    if (event && event instanceof KeyboardEvent && event.shiftKey) {
      return;
    }
    if (event) event.preventDefault();
    if (!this.newMessage.trim() || !this.roomId) return;
    
    this.chatService.sendTextMessage(this.roomId, this.newMessage).subscribe({
      next: () => {
        this.newMessage = '';
        this.chatService.stopTyping(this.roomId);
        this.scrollToBottom();
      },
      error: (error) => { console.error('Error sending message:', error); }
    });
  }

  onTyping(): void {
    if (!this.roomId) return;
    this.chatService.startTyping(this.roomId);
  }

  attachFile(): void {
    // TODO: Implement file attachment
    console.log('Attach file clicked');
  }

  attachImage(): void {
    // TODO: Implement image attachment
    console.log('Attach image clicked');
  }

  viewProfile(): void {
    if (this.participant) {
      this.router.navigate([ROUTES_ABSOLUTE.APP.PROFILE, this.participant.id]);
    }
  }

  reportUser(): void {
    if (confirm('Are you sure you want to report this user?')) {
      // TODO: Implement report user
      console.log('Report user clicked');
    }
  }

  blockUser(): void {
    if (confirm('Are you sure you want to block this user?')) {
      // TODO: Implement block user
      console.log('Block user clicked');
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    // Auto-scroll to bottom of messages
    setTimeout(() => {
      const container = document.querySelector('.overflow-y-auto');
      if (container) {
        (container as HTMLElement).scrollTop = (container as HTMLElement).scrollHeight;
      }
    }, 100);
  }
} 