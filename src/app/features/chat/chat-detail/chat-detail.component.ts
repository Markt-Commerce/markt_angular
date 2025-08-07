import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';

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
}

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent],
  template: `
    <div class="chat-detail-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-left">
          <app-button 
            variant="secondary" 
            size="sm"
            [outline]="true"
            [routerLink]="['/app/chat']"
          >
            ← Back
          </app-button>
          
          <div class="participant-info" *ngIf="participant">
            <img [src]="participant.avatar" [alt]="participant.name" class="participant-avatar">
            <div class="participant-details">
              <h3>{{ participant.name }}</h3>
              <span class="status" [class.online]="participant.isOnline">
                {{ participant.isOnline ? 'Online' : 'Last seen ' + formatTime(participant.lastSeen || '') }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <app-button 
            variant="secondary" 
            size="sm"
            [outline]="true"
            (clicked)="toggleInfo()"
          >
            ℹ️ Info
          </app-button>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="messages-container" #messagesContainer>
        <div class="messages-list">
          <div class="message-group" *ngFor="let group of messageGroups">
            <div class="date-separator">
              <span>{{ formatDate(group.date) }}</span>
            </div>
            
            <div class="message-item" 
                 *ngFor="let message of group.messages"
                 [class.sent]="message.sender_id === 'currentUser'"
                 [class.received]="message.sender_id !== 'currentUser'">
              
              <div class="message-avatar" *ngIf="message.sender_id !== 'currentUser'">
                <img [src]="message.senderAvatar" [alt]="message.senderName">
              </div>
              
              <div class="message-content">
                <div class="message-bubble">
                  <div class="message-text" *ngIf="message.message_type === 'text'">
                    {{ message.content }}
                  </div>
                  
                  <div class="message-attachment" *ngIf="message.message_type === 'image'">
                    <img [src]="message.attachmentUrl" [alt]="message.attachmentName">
                  </div>
                  
                  <div class="message-file" *ngIf="message.message_type === 'file'">
                    <div class="file-info">
                      <span class="file-icon">📎</span>
                      <span class="file-name">{{ message.attachmentName }}</span>
                    </div>
                    <app-button 
                      variant="secondary" 
                      size="sm"
                      [outline]="true"
                      (clicked)="downloadFile(message.attachmentUrl || '')"
                    >
                      Download
                    </app-button>
                  </div>
                  
                  <div class="message-meta">
                    <span class="message-time">{{ formatTime(message.created_at) }}</span>
                    <span class="message-status" *ngIf="message.sender_id === 'currentUser'">
                      {{ message.is_read ? '✓✓' : '✓' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Typing Indicator -->
          <div class="typing-indicator" *ngIf="isTyping">
            <div class="typing-avatar">
              <img [src]="participant?.avatar" [alt]="participant?.name">
            </div>
            <div class="typing-bubble">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <div class="input-actions">
          <button type="button" class="action-btn" (click)="attachFile()">
            📎
          </button>
          <button type="button" class="action-btn" (click)="attachImage()">
            🖼️
          </button>
        </div>
        
        <div class="input-wrapper">
          <textarea
            [(ngModel)]="newMessage"
            (keydown.enter)="sendMessage($event)"
            (input)="onTyping()"
            placeholder="Type a message..."
            class="message-input"
            rows="1"
            #messageInput
          ></textarea>
        </div>
        
        <app-button 
          variant="primary" 
          size="md"
          (clicked)="sendMessage()"
          [disabled]="!newMessage.trim()"
        >
          Send
        </app-button>
      </div>

      <!-- Chat Info Sidebar -->
      <div class="chat-info" *ngIf="showInfo">
        <div class="info-header">
          <h3>Chat Info</h3>
          <button type="button" class="close-btn" (click)="toggleInfo()">×</button>
        </div>
        
        <div class="info-content" *ngIf="participant">
          <div class="participant-card">
            <img [src]="participant.avatar" [alt]="participant.name" class="large-avatar">
            <h4>{{ participant.name }}</h4>
            <p class="status" [class.online]="participant.isOnline">
              {{ participant.isOnline ? 'Online' : 'Offline' }}
            </p>
          </div>
          
          <div class="info-actions">
            <app-button 
              variant="secondary" 
              size="md"
              [outline]="true"
              (clicked)="viewProfile()"
            >
              View Profile
            </app-button>
            <app-button 
              variant="danger" 
              size="md"
              [outline]="true"
              (clicked)="blockUser()"
            >
              Block User
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-detail-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f8f9fa;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .participant-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .participant-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .participant-details h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #2c3e50;
    }

    .status {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .status.online {
      color: #28a745;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 2rem;
      position: relative;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .date-separator {
      text-align: center;
      margin: 1rem 0;
    }

    .date-separator span {
      background: #e9ecef;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .message-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message-item {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .message-item.sent {
      flex-direction: row-reverse;
    }

    .message-avatar {
      flex-shrink: 0;
    }

    .message-avatar img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .message-content {
      max-width: 70%;
    }

    .message-bubble {
      background: white;
      border-radius: 18px;
      padding: 0.75rem 1rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      position: relative;
    }

    .message-item.sent .message-bubble {
      background: #007bff;
      color: white;
    }

    .message-text {
      line-height: 1.4;
      word-wrap: break-word;
    }

    .message-attachment img {
      max-width: 100%;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .message-file {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }

    .file-icon {
      font-size: 1.2rem;
    }

    .file-name {
      font-size: 0.9rem;
      color: #495057;
    }

    .message-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.25rem;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .message-item.sent .message-meta {
      color: rgba(255, 255, 255, 0.8);
    }

    .message-status {
      font-size: 0.9rem;
    }

    .typing-indicator {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
      padding: 0.5rem 0;
    }

    .typing-avatar img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .typing-bubble {
      background: white;
      border-radius: 18px;
      padding: 0.75rem 1rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .typing-dots {
      display: flex;
      gap: 0.25rem;
    }

    .typing-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #6c757d;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .message-input-container {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      padding: 1rem 2rem;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .input-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
    }

    .input-wrapper {
      flex: 1;
    }

    .message-input {
      width: 100%;
      border: 1px solid #e9ecef;
      border-radius: 20px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      outline: none;
      resize: none;
      max-height: 120px;
      transition: border-color 0.2s ease;
    }

    .message-input:focus {
      border-color: #007bff;
    }

    .chat-info {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: white;
      border-left: 1px solid #e9ecef;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .chat-info.show {
      transform: translateX(0);
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .info-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
    }

    .info-content {
      padding: 1rem;
    }

    .participant-card {
      text-align: center;
      margin-bottom: 2rem;
    }

    .large-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
    }

    .participant-card h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .info-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .chat-header {
        padding: 1rem;
      }

      .messages-container {
        padding: 1rem;
      }

      .message-input-container {
        padding: 1rem;
      }

      .chat-info {
        width: 100%;
      }
    }
  `]
})
export class ChatDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  participant: ChatParticipant | null = null;
  messages: ChatMessage[] = [];
  messageGroups: { date: string; messages: ChatMessage[] }[] = [];
  newMessage = '';
  isTyping = false;
  showInfo = false;
  loading = false;
  roomId: string = '';

  ngOnInit(): void {
    this.loadChat();
  }

  private loadChat(): void {
    const conversationId = this.route.snapshot.paramMap.get('id');
    
    if (conversationId) {
      this.loading = true;
      
      // Load chat room details
      this.apiService.getChatRoom(conversationId).subscribe({
        next: (response) => {
          // ChatRoom doesn't have participants, we need to get participant info differently
          // For now, we'll set a placeholder participant
          this.participant = {
            id: response.data.buyer_id || response.data.seller_id,
            name: 'Chat Participant',
            avatar: '/assets/default-avatar.png',
            isOnline: false
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading chat room:', error);
          this.loading = false;
        }
      });

      // Load chat messages
      this.apiService.getChatMessages(conversationId).subscribe({
        next: (response) => {
          this.messages = response.data || [];
          this.groupMessages();
        },
        error: (error) => {
          console.error('Error loading chat messages:', error);
          this.messages = [];
        }
      });
    }
  }

  private groupMessages(): void {
    const groups: Record<string, ChatMessage[]> = {};
    
    this.messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    this.messageGroups = Object.keys(groups).map(date => ({
      date,
      messages: groups[date]
    }));
  }

  sendMessage(event?: Event): void {
    if (event && event instanceof KeyboardEvent && event.shiftKey) {
      return; // Allow new line with Shift+Enter
    }
    
    if (event) {
      event.preventDefault();
    }

    if (!this.newMessage.trim()) return;

    if (this.route.snapshot.paramMap.get('id')) {
      const conversationId = this.route.snapshot.paramMap.get('id')!;
      const messageData = {
        content: this.newMessage,
        type: 'text'
      };

      this.apiService.sendMessage(conversationId, messageData).subscribe({
        next: (response) => {
          this.messages.push(response.data);
          this.newMessage = '';
          this.groupMessages();
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error sending message:', error);
        }
      });
    }
  }

  onTyping(): void {
    // TODO: Send typing indicator to server
    
  }

  attachFile(): void {
    // TODO: Implement file attachment
    
  }

  attachImage(): void {
    // TODO: Implement image attachment
    
  }

  downloadFile(url: string): void {
    // TODO: Implement file download
    
  }

  toggleInfo(): void {
    this.showInfo = !this.showInfo;
  }

  viewProfile(): void {
    // TODO: Navigate to user profile
    
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
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  private scrollToBottom(): void {
    // TODO: Implement scroll to bottom
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  // Additional chat endpoint integrations
  createChatRoom(roomData: any): void {
    this.apiService.createChatRoom(roomData).subscribe({
      next: (response) => {
        console.log('Chat room created:', response.data);
      },
      error: (error) => {
        console.error('Error creating chat room:', error);
      }
    });
  }

  deleteChatRoom(roomId: string): void {
    this.apiService.deleteChatRoom(roomId).subscribe({
      next: (response) => {
        console.log('Chat room deleted:', response.data);
        this.router.navigate(['/app/chat']);
      },
      error: (error) => {
        console.error('Error deleting chat room:', error);
      }
    });
  }

  getChatRooms(): void {
    this.apiService.getChatRooms().subscribe({
      next: (response) => {
        console.log('Chat rooms loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading chat rooms:', error);
      }
    });
  }

  getCommentReactions(commentId: string): void {
    this.apiService.getCommentReactions(commentId).subscribe({
      next: (response) => {
        console.log('Comment reactions loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading comment reactions:', error);
      }
    });
  }

  getMessageReactions(messageId: string): void {
    this.apiService.getMessageReactions(messageId).subscribe({
      next: (response) => {
        console.log('Message reactions loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading message reactions:', error);
      }
    });
  }

  markMessagesAsRead(messageIds: string[]): void {
    this.apiService.markMessagesAsRead(this.roomId, messageIds).subscribe({
      next: (response) => {
        console.log('Messages marked as read:', response.data);
      },
      error: (error) => {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  muteChatRoom(roomId: string): void {
    this.apiService.muteChatRoom(roomId).subscribe({
      next: (response) => {
        console.log('Chat room muted:', response.data);
      },
      error: (error) => {
        console.error('Error muting chat room:', error);
      }
    });
  }

  pinChatRoom(roomId: string): void {
    this.apiService.pinChatRoom(roomId).subscribe({
      next: (response) => {
        console.log('Chat room pinned:', response.data);
      },
      error: (error) => {
        console.error('Error pinning chat room:', error);
      }
    });
  }

  removeCommentReaction(commentId: string, reactionType: string): void {
    this.apiService.removeCommentReaction(commentId, reactionType).subscribe({
      next: (response) => {
        console.log('Comment reaction removed:', response.data);
      },
      error: (error) => {
        console.error('Error removing comment reaction:', error);
      }
    });
  }

  removeMessageReaction(messageId: string, reactionType: string): void {
    this.apiService.removeMessageReaction(messageId, reactionType).subscribe({
      next: (response) => {
        console.log('Message reaction removed:', response.data);
      },
      error: (error) => {
        console.error('Error removing message reaction:', error);
      }
    });
  }
} 