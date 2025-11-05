/**
 * Notification Repository
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { Notification } from '../models/notification.model';
import { NotificationDto } from '../models/notification.dto';

@Injectable({
  providedIn: 'root'
})
export class NotificationRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/notifications';

  private toDomain(dto: NotificationDto): Notification {
    return new Notification(
      dto.id,
      dto.title,
      dto.message,
      dto.type,
      dto.is_read,
      dto.created_at,
      dto.reference_type,
      dto.reference_id
    );
  }

  findAll(params?: Record<string, unknown>): Observable<Notification[]> {
    return this.apiClient.get<NotificationDto[]>(this.baseEndpoint, params).pipe(
      map(response => response.data.map(dto => this.toDomain(dto)))
    );
  }

  markAsRead(ids: string[]): Observable<{ updated: number }> {
    return this.apiClient.post<{ updated: number }>(`${this.baseEndpoint}/mark-read`, { notification_ids: ids }).pipe(
      map(response => response.data)
    );
  }

  getUnreadCount(): Observable<number> {
    return this.apiClient.get<{ count: number }>(`${this.baseEndpoint}/unread-count`).pipe(
      map(response => response.data.count)
    );
  }

  /**
   * Get VAPID public key for push notifications
   */
  getVapidPublicKey(): Observable<{ publicKey: string }> {
    return this.apiClient.get<{ publicKey: string }>(`${this.baseEndpoint}/vapid-key`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update push subscription
   */
  updatePushSubscription(subscription: PushSubscriptionJSON): Observable<{ message: string }> {
    return this.apiClient.post<{ message: string }>(
      `${this.baseEndpoint}/push-subscription`,
      subscription
    ).pipe(
      map(response => response.data)
    );
  }
}

