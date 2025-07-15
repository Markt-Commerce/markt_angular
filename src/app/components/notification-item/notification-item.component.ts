import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NotificationSender {
  id: string;
  name: string;
  avatar: string;
  username: string;
}

export interface NotificationAction {
  text: string;
  icon: string;
  action: string;
}

export interface NotificationBadge {
  text: string;
  count?: number;
  type?: 'success' | 'warning' | 'error' | 'info';
}

export interface NotificationMeta {
  icon: string;
  text: string;
}

export interface Notification {
  id: string;
  type:
    | 'message'
    | 'order'
    | 'offer'
    | 'system'
    | 'promotion'
    | 'security'
    | 'social';
  sender: NotificationSender;
  message: string;
  timestamp: Date;
  read: boolean;
  important: boolean;
  preview?: string;
  image?: string;
  meta?: NotificationMeta[];
  primaryAction?: NotificationAction;
  secondaryAction?: NotificationAction;
  badge?: NotificationBadge;
  data?: any;
}

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.css',
})
export class NotificationItemComponent {
  @Input() notification!: Notification;
  @Input() showActionButtons: boolean = true;

  @Output() markAsRead = new EventEmitter<Notification>();
  @Output() dismiss = new EventEmitter<Notification>();
  @Output() primaryAction = new EventEmitter<{
    notification: Notification;
    action: string;
  }>();
  @Output() secondaryAction = new EventEmitter<{
    notification: Notification;
    action: string;
  }>();
  @Output() click = new EventEmitter<Notification>();

  getNotificationIcon(): string {
    const icons = {
      message: 'fas fa-comment',
      order: 'fas fa-shopping-bag',
      offer: 'fas fa-tag',
      system: 'fas fa-cog',
      promotion: 'fas fa-gift',
      security: 'fas fa-shield-alt',
      social: 'fas fa-users',
    };
    return icons[this.notification.type] || 'fas fa-bell';
  }

  getNotificationMessage(): string {
    return this.notification.message;
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  onMarkAsRead() {
    this.notification.read = true;
    this.markAsRead.emit(this.notification);
  }

  onDismiss() {
    this.dismiss.emit(this.notification);
  }

  onPrimaryAction() {
    if (this.notification.primaryAction) {
      this.primaryAction.emit({
        notification: this.notification,
        action: this.notification.primaryAction.action,
      });
    }
  }

  onSecondaryAction() {
    if (this.notification.secondaryAction) {
      this.secondaryAction.emit({
        notification: this.notification,
        action: this.notification.secondaryAction.action,
      });
    }
  }

  onNotificationClick() {
    this.click.emit(this.notification);
  }
}
