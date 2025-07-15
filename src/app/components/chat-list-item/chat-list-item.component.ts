import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChatListItemData {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list-item.component.html',
  styleUrl: './chat-list-item.component.css',
})
export class ChatListItemComponent {
  @Input() chat!: ChatListItemData;
  @Input() isActive = false;
  @Output() chatClick = new EventEmitter<ChatListItemData>();

  onClick() {
    this.chatClick.emit(this.chat);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
  }
}
