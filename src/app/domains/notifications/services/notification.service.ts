/**
 * Notification Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../models/notification.model';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationRepository = inject(NotificationRepository);
  private apiService = inject(ApiService); // Temporary: for methods not yet migrated to repository
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notificationsSubject.asObservable();

  getNotifications(params?: Record<string, unknown>): Observable<Notification[]> {
    return this.notificationRepository.findAll(params).pipe(
      tap((notifications) => this.notificationsSubject.next([...notifications]))
    );
  }

  markAsRead(ids: string[]): Observable<{ updated: number }> {
    if (ids.length === 0) {
      return of({ updated: 0 });
    }

    return this.notificationRepository.markAsRead(ids);
  }

  getUnreadCount(): Observable<number> {
    return this.notificationRepository.getUnreadCount();
  }

  /**
   * Stream of notifications for components expecting observable updates.
   */
  getNotifications$(): Observable<Notification[]> {
    return this.notifications$;
  }

  /**
   * Mark all notifications as read using ApiService and mirror state locally.
   */
  markAllAsRead(): Observable<{ updated: number }> {
    const unreadIds = this.notificationsSubject.value
      .filter(notification => notification.isUnread())
      .map(notification => notification.id);

    if (unreadIds.length === 0) {
      return of({ updated: 0 });
    }

    return this.apiService.markAsRead(unreadIds.map(id => Number(id))).pipe(
      map(response => response.data ?? response),
      tap(() => {
        const updated = this.notificationsSubject.value.map(notification =>
          notification.isUnread()
            ? new Notification(
                notification.id,
                notification.title,
                notification.message,
                notification.type,
                true,
                notification.createdAt,
                notification.referenceType,
                notification.referenceId
              )
            : notification
        );
        this.notificationsSubject.next(updated);
      }),
      map((payload: any) => ({
        updated: payload?.updated ?? unreadIds.length
      }))
    );
  }

  /**
   * Derive action URL for a notification using reference metadata.
   */
  getNotificationActionUrl(notification: Notification | any): string {
    const context = (notification?.context ?? {}) as { type?: string; id?: string | number };

    const referenceType = (notification as Notification)?.referenceType ?? context.type;
    const referenceId = (notification as Notification)?.referenceId ?? context.id;

    if (!referenceType || !referenceId) {
      return '';
    }

    const id = String(referenceId);
    switch (referenceType) {
      case 'order':
        return `/app/orders/${id}`;
      case 'offer':
        return `/app/offers/${id}`;
      case 'request':
        return `/app/requests/${id}`;
      case 'product':
        return `/app/marketplace/product/${id}`;
      case 'chat':
        return `/app/chat/${id}`;
      default:
        return '';
    }
  }

  /**
   * Get notification settings
   * TODO: Migrate to NotificationRepository when settings methods are added
   * Temporary: delegates to ApiService
   */
  getSettings(): Observable<any> {
    return this.apiService.getNotificationSettings();
  }

  /**
   * Update notification settings
   * TODO: Migrate to NotificationRepository when settings methods are added
   * Temporary: delegates to ApiService
   */
  updateSettings(data: any): Observable<any> {
    return this.apiService.updateNotificationSettings(data);
  }
}

