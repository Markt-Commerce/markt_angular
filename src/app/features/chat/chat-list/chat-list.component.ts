import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';

interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="chat-list-container">
      <div class="chat-list-header">
        <h1>Messages</h1>
        <p>Your conversations and messages</p>
      </div>

      <!-- Search -->
      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search conversations..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input"
          >
        </div>
      </div>

      <!-- Chat List -->
      <div class="chat-list">
        <div class="conversation-item" 
             *ngFor="let conversation of filteredConversations"
             [class.active]="selectedConversationId === conversation.id"
             (click)="selectConversation(conversation.id)"
             [routerLink]="['/app/chat', conversation.id]">
          
          <div class="conversation-avatar">
            <img [src]="conversation.participantAvatar" [alt]="conversation.participantName">
            <div class="online-indicator" [class.online]="conversation.isOnline"></div>
          </div>
          
          <div class="conversation-content">
            <div class="conversation-header">
              <h3 class="participant-name">{{ conversation.participantName }}</h3>
              <span class="last-message-time">{{ formatTime(conversation.lastMessageTime) }}</span>
            </div>
            
            <div class="conversation-preview">
              <p class="last-message">{{ conversation.lastMessage }}</p>
              <div class="conversation-meta">
                <span class="unread-count" *ngIf="conversation.unreadCount > 0">
                  {{ conversation.unreadCount }}
                </span>
                <span class="last-seen" *ngIf="!conversation.isOnline && conversation.lastSeen">
                  Last seen {{ formatTime(conversation.lastSeen) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredConversations.length === 0">
        <div class="empty-icon">💬</div>
        <h3>No conversations yet</h3>
        <p>Start a conversation by messaging a seller or buyer</p>
        <app-button 
          variant="primary" 
          size="lg"
          [routerLink]="['/app/marketplace']"
        >
          Browse Marketplace
        </app-button>
      </div>

      <!-- New Message Button -->
      <div class="new-message-fab">
        <app-button 
          variant="primary" 
          size="lg"
          (clicked)="startNewConversation()"
        >
          ✉️ New Message
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .chat-list-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      min-height: 100vh;
    }

    .chat-list-header {
      margin-bottom: 2rem;
    }

    .chat-list-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .chat-list-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .search-section {
      margin-bottom: 2rem;
    }

    .search-box {
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease;
      background: white;
    }

    .search-input:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      color: #6c757d;
      z-index: 1;
    }

    .chat-list {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .conversation-item:last-child {
      border-bottom: none;
    }

    .conversation-item:hover {
      background-color: #f8f9fa;
    }

    .conversation-item.active {
      background-color: #e3f2fd;
      border-left: 4px solid #007bff;
    }

    .conversation-avatar {
      position: relative;
      flex-shrink: 0;
    }

    .conversation-avatar img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e9ecef;
    }

    .online-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #6c757d;
      border: 2px solid white;
    }

    .online-indicator.online {
      background: #28a745;
    }

    .conversation-content {
      flex: 1;
      min-width: 0;
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .participant-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .last-message-time {
      font-size: 0.8rem;
      color: #6c757d;
      flex-shrink: 0;
    }

    .conversation-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .last-message {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .conversation-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .unread-count {
      background: #007bff;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .last-seen {
      font-size: 0.8rem;
      color: #adb5bd;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .new-message-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
    }

    @media (max-width: 768px) {
      .chat-list-container {
        padding: 1rem;
      }

      .conversation-item {
        padding: 1rem;
      }

      .conversation-avatar img {
        width: 50px;
        height: 50px;
      }

      .participant-name {
        font-size: 1rem;
      }

      .last-message {
        font-size: 0.8rem;
      }

      .new-message-fab {
        bottom: 1rem;
        right: 1rem;
      }
    }
  `]
})
export class ChatListComponent implements OnInit {
  private router = inject(Router);

  conversations: ChatConversation[] = [
    {
      id: '1',
      participantId: 'user1',
      participantName: 'John Doe',
      participantAvatar: 'https://via.placeholder.com/60x60?text=JD',
      lastMessage: 'Hi, I\'m interested in your wireless headphones. Is it still available?',
      lastMessageTime: '2025-01-03T15:30:00Z',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      participantId: 'user2',
      participantName: 'Jane Smith',
      participantAvatar: 'https://via.placeholder.com/60x60?text=JS',
      lastMessage: 'Thanks for the quick delivery! The product is exactly as described.',
      lastMessageTime: '2025-01-03T14:15:00Z',
      unreadCount: 0,
      isOnline: false,
      lastSeen: '2025-01-03T14:20:00Z'
    },
    {
      id: '3',
      participantId: 'user3',
      participantName: 'Mike Johnson',
      participantAvatar: 'https://via.placeholder.com/60x60?text=MJ',
      lastMessage: 'Do you have this in other colors?',
      lastMessageTime: '2025-01-03T13:45:00Z',
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '4',
      participantId: 'user4',
      participantName: 'Sarah Wilson',
      participantAvatar: 'https://via.placeholder.com/60x60?text=SW',
      lastMessage: 'Can you provide more details about the warranty?',
      lastMessageTime: '2025-01-03T12:30:00Z',
      unreadCount: 0,
      isOnline: false,
      lastSeen: '2025-01-03T12:35:00Z'
    },
    {
      id: '5',
      participantId: 'user5',
      participantName: 'David Brown',
      participantAvatar: 'https://via.placeholder.com/60x60?text=DB',
      lastMessage: 'I\'ll place the order now. Thanks!',
      lastMessageTime: '2025-01-03T11:20:00Z',
      unreadCount: 0,
      isOnline: false,
      lastSeen: '2025-01-03T11:25:00Z'
    }
  ];

  filteredConversations: ChatConversation[] = [];
  searchQuery = '';
  selectedConversationId: string | null = null;

  ngOnInit(): void {
    this.loadConversations();
    this.applyFilters();
  }

  private loadConversations(): void {
    // TODO: Load conversations from API
    console.log('Loading conversations...');
    this.filteredConversations = [...this.conversations];
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.filteredConversations = this.conversations.filter(conversation =>
        conversation.participantName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
      );
    } else {
      this.filteredConversations = [...this.conversations];
    }
  }

  selectConversation(conversationId: string): void {
    this.selectedConversationId = conversationId;
    // Mark as read
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  startNewConversation(): void {
    // TODO: Implement new conversation modal
    console.log('Starting new conversation...');
    // For now, navigate to marketplace to find users
    this.router.navigate(['/app/marketplace']);
  }
} 