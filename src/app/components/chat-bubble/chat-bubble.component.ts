import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'product';
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  isRead: boolean;
  altText?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-bubble.component.html',
  styleUrl: './chat-bubble.component.css',
})
export class ChatBubbleComponent {
  @Input() message!: ChatMessage;
  @Input() currentUserId!: string;
  @Input() showActions: boolean = false;

  @Output() reply = new EventEmitter<ChatMessage>();
  @Output() copy = new EventEmitter<ChatMessage>();
  @Output() delete = new EventEmitter<ChatMessage>();

  get isOwnMessage(): boolean {
    return this.message.senderId === this.currentUserId;
  }

  get isRead(): boolean {
    return this.message.isRead;
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  onReply() {
    this.reply.emit(this.message);
  }

  onCopy() {
    this.copy.emit(this.message);
  }

  onDelete() {
    this.delete.emit(this.message);
  }
}
