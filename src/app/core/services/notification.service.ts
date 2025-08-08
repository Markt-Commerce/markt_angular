import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  Notification, 
  NotificationPagination, 
  UnreadCount, 
  MarkAsReadRequest, 
  MarkAsReadResponse 
} from '../models';
import { map } from 'rxjs/operators';
import { RealtimeService } from './realtime.service';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiService = inject(ApiService);
  private realtime = inject(RealtimeService);
  
  private notificationStateSubject = new BehaviorSubject<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    lastUpdate: new Date()
  });

  public notificationState$ = this.notificationStateSubject.asObservable();

  // Auto-refresh interval (5 minutes)
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000;

  constructor() {
    this.initializeNotifications();
    this.startAutoRefresh();
    this.setupRealtime();
  }

  // ============================================================================
  // NOTIFICATION OPERATIONS
  // ============================================================================

  /**
   * Get all notifications
   */
  getNotifications(params?: any): Observable<any> {
    this.setLoading(true);
    
    return this.apiService.getNotifications(params).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateNotificationState({
              notifications: response.data.items,
              unreadCount: response.data.pagination.unread_count || 0,
              isLoading: false,
              lastUpdate: new Date()
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching notifications:', error);
          this.setLoading(false);
        }
      })
    );
  }

  /**
   * Get unread count
   */
  getUnreadCount(): Observable<any> {
    return this.apiService.getUnreadCount().pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.updateUnreadCount(response.data.count);
          }
        },
        error: (error: any) => {
          console.error('Error fetching unread count:', error);
        }
      })
    );
  }

  /**
   * Mark notifications as read
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.apiService.markAsRead([parseInt(notificationId)]).pipe(
      tap({
        next: () => {
          const currentNotifications = this.getNotificationState().notifications;
          const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
          this.updateNotificationState({ notifications: updatedNotifications });
        },
        error: (error: any) => {
          console.error('Error marking notification as read:', error);
        }
      })
    );
  }

  /**
   * Mark single notification as read
   */
  markAsReadSingle(notificationId: string): Observable<MarkAsReadResponse> {
    const request: MarkAsReadRequest = { notification_ids: [notificationId] };
    return this.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    const unreadIds = this.getUnreadNotificationIds();
    const request: MarkAsReadRequest = { notification_ids: unreadIds };
    return this.apiService.markAsRead(unreadIds.map(id => parseInt(id)));
  }

  /**
   * Refresh notifications
   */
  refreshNotifications(): void {
    this.getNotifications().subscribe();
  }

  // ============================================================================
  // NOTIFICATION UTILITIES
  // ============================================================================

  /**
   * Get current notification state
   */
  getNotificationState(): NotificationState {
    return this.notificationStateSubject.value;
  }

  /**
   * Get current notifications
   */
  getCurrentNotifications(): Notification[] {
    return this.getNotificationState().notifications;
  }

  /**
   * Get current unread count
   */
  getCurrentUnreadCount(): number {
    return this.getNotificationState().unreadCount;
  }

  /**
   * Get unread count observable
   */
  getUnreadCount$(): Observable<number> {
    return this.notificationState$.pipe(
      map(state => state.unreadCount)
    );
  }

  /**
   * Get notifications observable
   */
  getNotifications$(): Observable<Notification[]> {
    return this.notificationState$.pipe(
      map(state => state.notifications)
    );
  }

  /**
   * Get loading state observable
   */
  getLoading$(): Observable<boolean> {
    return this.notificationState$.pipe(
      map(state => state.isLoading)
    );
  }

  /**
   * Update notification state
   */
  private updateNotificationState(partial: Partial<NotificationState>): void {
    const currentState = this.getNotificationState();
    const newState = { ...currentState, ...partial };
    this.notificationStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateNotificationState({ isLoading });
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(count: number): void {
    this.updateNotificationState({ unreadCount: count });
  }

  /**
   * Update notifications as read
   */
  private updateNotificationsAsRead(notificationIds: string[]): void {
    const currentNotifications = this.getNotificationState().notifications;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      is_read: notificationIds.includes(notification.id) || notification.is_read
    }));
    
    this.updateNotificationState({ notifications: updatedNotifications });
  }

  /**
   * Initialize notifications
   */
  private initializeNotifications(): void {
    this.getNotifications().subscribe();
    this.getUnreadCount().subscribe();
  }

  /**
   * Start auto-refresh
   */
  private startAutoRefresh(): void {
    interval(this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe();
  }

  /**
   * Add notification to state (for real-time updates)
   */
  addNotification(notification: Notification): void {
    const currentNotifications = this.getCurrentNotifications();
    const updatedNotifications = [notification, ...currentNotifications];
    
    this.updateNotificationState({
      notifications: updatedNotifications,
      unreadCount: this.getCurrentUnreadCount() + 1
    });
  }

  /**
   * Remove notification from state
   */
  removeNotification(notificationId: string): void {
    const currentNotifications = this.getCurrentNotifications();
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    
    this.updateNotificationState({ notifications: updatedNotifications });
  }

  /**
   * Get notification by ID
   */
  getNotificationById(notificationId: string): Notification | null {
    const notifications = this.getNotificationState().notifications;
    return notifications.find(n => n.id === notificationId) || null;
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => !n.is_read);
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: string): Notification[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => n.type === type);
  }

  /**
   * Get notifications by reference
   */
  getNotificationsByReference(referenceType: string, referenceId: string): Notification[] {
    const notifications = this.getCurrentNotifications();
    return notifications.filter(n => 
      n.reference_type === referenceType && n.reference_id === referenceId
    );
  }

  /**
   * Format notification timestamp
   */
  formatNotificationTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get notification icon
   */
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'order': 'shopping-bag',
      'message': 'message-circle',
      'like': 'heart',
      'comment': 'message-square',
      'follow': 'user-plus',
      'product': 'package',
      'payment': 'credit-card',
      'system': 'bell',
      'offer': 'tag',
      'request': 'file-text'
    };
    
    return iconMap[type] || 'bell';
  }

  /**
   * Get notification color
   */
  getNotificationColor(type: string): string {
    const colorMap: Record<string, string> = {
      'order': 'text-blue-600',
      'message': 'text-green-600',
      'like': 'text-red-600',
      'comment': 'text-purple-600',
      'follow': 'text-indigo-600',
      'product': 'text-orange-600',
      'payment': 'text-emerald-600',
      'system': 'text-gray-600',
      'offer': 'text-yellow-600',
      'request': 'text-cyan-600'
    };
    
    return colorMap[type] || 'text-gray-600';
  }

  /**
   * Get notification priority
   */
  getNotificationPriority(type: string): 'high' | 'medium' | 'low' {
    const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
      'order': 'high',
      'payment': 'high',
      'message': 'medium',
      'offer': 'medium',
      'request': 'medium',
      'like': 'low',
      'comment': 'low',
      'follow': 'low',
      'product': 'low',
      'system': 'low'
    };
    
    return priorityMap[type] || 'low';
  }

  /**
   * Check if notification is actionable
   */
  isNotificationActionable(notification: Notification): boolean {
    const actionableTypes = ['order', 'message', 'offer', 'request', 'payment'];
    return actionableTypes.includes(notification.type);
  }

  /**
   * Get notification action URL
   */
  getNotificationActionUrl(notification: Notification): string {
    switch (notification.type) {
      case 'order':
        return `/app/orders/${notification.reference_id}`;
      case 'message':
        return `/app/chat/${notification.reference_id}`;
      case 'offer':
        return `/app/requests/${notification.reference_id}`;
      case 'request':
        return `/app/requests/${notification.reference_id}`;
      case 'payment':
        return `/app/orders/${notification.reference_id}`;
      case 'product':
        return `/app/marketplace/products/${notification.reference_id}`;
      case 'follow':
        return `/app/profile/${notification.reference_id}`;
      default:
        return '/app/notifications';
    }
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.updateNotificationState({
      notifications: [],
      unreadCount: 0
    });
  }

  /**
   * Get notification summary
   */
  getNotificationSummary(): {
    total: number;
    unread: number;
    byType: Record<string, number>;
  } {
    const notifications = this.getCurrentNotifications();
    const unread = notifications.filter(n => !n.is_read).length;
    
    const byType: Record<string, number> = {};
    notifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
    });
    
    return {
      total: notifications.length,
      unread,
      byType
    };
  }

  private getUnreadNotificationIds(): string[] {
    const notifications = this.getNotificationState().notifications;
    return notifications.filter(n => !n.is_read).map(n => n.id);
  }

  private findNotificationById(notificationId: string): Notification | null {
    const notifications = this.getNotificationState().notifications;
    return notifications.find(n => n.id === notificationId) || null;
  }

  private setupRealtime(): void {
    this.realtime.connect('/notification');
    this.realtime.notification$.subscribe(({ event, data }) => {
      switch (event) {
        case 'connected':
          // Optionally fetch latest unread count on connect
          this.getUnreadCount().subscribe();
          break;
        case 'notification':
        case 'new_notification':
          if (data) {
            this.addNotification(data as Notification);
          }
          break;
        case 'unread_count':
          if (data && typeof (data as any).count === 'number') {
            this.updateUnreadCount((data as any).count);
          }
          break;
        case 'mark_read':
          // Backend might push mark_read acknowledgements
          if (data && Array.isArray((data as any).notification_ids)) {
            const ids = (data as any).notification_ids as string[];
            this.updateNotificationsAsRead(ids);
          }
          break;
        default:
          break;
      }
    });
  }
} 