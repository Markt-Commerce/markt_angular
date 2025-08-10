import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NotificationService } from '../../core/services/notification.service';

interface UINotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  action_text?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="notifications-container">
      <div class="notifications-header">
        <h1>Notifications</h1>
        <div class="header-actions">
          <app-button 
            variant="secondary" 
            size="sm" 
            (clicked)="markAllAsRead()"
            [disabled]="!hasUnreadNotifications"
          >
            Mark All as Read
          </app-button>
          <app-button 
            variant="secondary" 
            size="sm" 
            (clicked)="clearAllNotifications()"
          >
            Clear All
          </app-button>
        </div>
      </div>

      <div class="notifications-content">
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >
            All ({{ notifications.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeFilter === 'unread'"
            (click)="setFilter('unread')"
          >
            Unread ({{ unreadCount }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeFilter === 'orders'"
            (click)="setFilter('orders')"
          >
            Orders
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeFilter === 'messages'"
            (click)="setFilter('messages')"
          >
            Messages
          </button>
        </div>

        <!-- Notifications List -->
        <div class="notifications-list" *ngIf="filteredNotifications.length > 0; else emptyState">
          <div 
            class="notification-item" 
            *ngFor="let notification of filteredNotifications"
            [class.unread]="!notification.read"
            [class]="'type-' + notification.type"
          >
            <div class="notification-icon">
              <svg *ngIf="notification.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
              <svg *ngIf="notification.type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg *ngIf="notification.type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <svg *ngIf="notification.type === 'info'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <h3 class="notification-title">{{ notification.title }}</h3>
                <span class="notification-time">{{ notification.timestamp | date:'short' }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              
              <div class="notification-actions" *ngIf="notification.action_url">
                <app-button 
                  variant="primary" 
                  size="sm"
                  [routerLink]="[notification.action_url]"
                >
                  {{ notification.action_text || 'View Details' }}
                </app-button>
              </div>
            </div>

            <div class="notification-actions-menu">
              <button 
                class="action-btn"
                (click)="toggleRead(notification)"
                [title]="notification.read ? 'Mark as unread' : 'Mark as read'"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button 
                class="action-btn"
                (click)="deleteNotification(notification.id)"
                title="Delete notification"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #emptyState>
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <h3>No notifications</h3>
            <p *ngIf="activeFilter === 'all'">You're all caught up! Check back later for new updates.</p>
            <p *ngIf="activeFilter === 'unread'">No unread notifications at the moment.</p>
            <p *ngIf="activeFilter === 'orders'">No order-related notifications.</p>
            <p *ngIf="activeFilter === 'messages'">No message notifications.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .notifications-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1rem;
    }

    .tab-btn {
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .tab-btn.active {
      background: #3b82f6;
      color: white;
    }

    /* Notifications List */
    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-item {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      position: relative;
    }

    .notification-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .notification-item.unread {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }

    .notification-item.type-success {
      border-left: 4px solid #10b981;
    }

    .notification-item.type-warning {
      border-left: 4px solid #f59e0b;
    }

    .notification-item.type-error {
      border-left: 4px solid #ef4444;
    }

    .notification-item.type-info {
      border-left: 4px solid #3b82f6;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
    }

    .notification-item.type-success .notification-icon {
      background: #d1fae5;
      color: #10b981;
    }

    .notification-item.type-warning .notification-icon {
      background: #fef3c7;
      color: #f59e0b;
    }

    .notification-item.type-error .notification-icon {
      background: #fee2e2;
      color: #ef4444;
    }

    .notification-item.type-info .notification-icon {
      background: #dbeafe;
      color: #3b82f6;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .notification-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #9ca3af;
      white-space: nowrap;
      margin-left: 1rem;
    }

    .notification-message {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .notification-actions {
      margin-top: 1rem;
    }

    .notification-actions-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .notification-actions-menu {
      opacity: 1;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #f3f4f6;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #6b7280;
    }

    .action-btn:hover {
      background: #e5e7eb;
      color: #374151;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: #6b7280;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .notifications-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }

      .filter-tabs {
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }

      .notification-item {
        padding: 1rem;
      }

      .notification-header {
        flex-direction: column;
        gap: 0.5rem;
      }

      .notification-time {
        margin-left: 0;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications: UINotification[] = [];
  activeFilter = 'all';
  hasUnreadNotifications = false;
  loading = false;

  get filteredNotifications(): UINotification[] {
    switch (this.activeFilter) {
      case 'unread':
        return this.notifications.filter(n => !n.read);
      case 'orders':
        return this.notifications.filter(n => n.title.toLowerCase().includes('order'));
      case 'messages':
        return this.notifications.filter(n => n.title.toLowerCase().includes('message'));
      default:
        return this.notifications;
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  ngOnInit(): void {
    // initial load
    this.notificationService.getNotifications().subscribe();
    this.notificationService.getUnreadCount().subscribe();

    // subscribe to realtime/state
    this.notificationService.getNotifications$().subscribe(list => {
      this.notifications = (list || []).map(n => this.mapNotification(n));
      this.hasUnreadNotifications = this.unreadCount > 0;
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  toggleRead(notification: UINotification): void {
    // Mark single notification as read via service if we had ids; simulate local for now
    notification.read = !notification.read;
    this.hasUnreadNotifications = this.unreadCount > 0;
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.hasUnreadNotifications = false;
      },
      error: () => {
        // fallback to local update
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.hasUnreadNotifications = false;
      }
    });
  }

  deleteNotification(id: string): void {
    // No backend delete; remove locally
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.hasUnreadNotifications = this.unreadCount > 0;
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.hasUnreadNotifications = false;
  }

  private mapNotification(n: any): UINotification {
    let actionUrl = '';
    // Prefer service mapping; else derive common patterns
    const mapped = this.notificationService.getNotificationActionUrl(n);
    if (mapped) {
      actionUrl = mapped;
    } else if (n.context?.type && n.context?.id) {
      const t = String(n.context.type);
      const id = String(n.context.id);
      if (t === 'order') actionUrl = `/app/orders/${id}`;
      else if (t === 'offer') actionUrl = `/app/offers/${id}`;
      else if (t === 'request') actionUrl = `/app/requests/${id}`;
      else if (t === 'product') actionUrl = `/app/marketplace/product/${id}`;
      else if (t === 'chat') actionUrl = `/app/chat/${id}`;
    }
    return {
      id: String(n.id),
      type: (n.type as any) || 'info',
      title: n.title || 'Notification',
      message: n.message || '',
      timestamp: n.created_at || new Date().toISOString(),
      read: !!n.is_read,
      action_url: actionUrl
    };
  }
} 