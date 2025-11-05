/**
 * Notification Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationRepository = inject(NotificationRepository);

  getNotifications(params?: Record<string, unknown>): Observable<Notification[]> {
    return this.notificationRepository.findAll(params);
  }

  markAsRead(ids: string[]): Observable<{ updated: number }> {
    if (ids.length === 0) {
      throw new Error('At least one notification ID is required');
    }

    return this.notificationRepository.markAsRead(ids);
  }

  getUnreadCount(): Observable<number> {
    return this.notificationRepository.getUnreadCount();
  }
}

