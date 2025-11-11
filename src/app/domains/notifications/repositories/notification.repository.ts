/**
 * Notification Repository
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { Notification } from '../models/notification.model';
import {
  MarkAsReadResponseDto,
  NotificationDto,
  NotificationListDto,
  UnreadCountDto,
} from '../models/notification.dto';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';

@Injectable({
  providedIn: 'root'
})
export class NotificationRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/notifications';

  private toDomain(dto: NotificationDto): Notification {
    return new Notification(
      dto.id,
      dto.user_id,
      dto.type,
      dto.message,
      dto.created_at,
      dto.is_read,
      dto.is_seen,
      dto.title,
      dto.reference_type,
      dto.reference_id,
      dto.metadata_ ?? null
    );
  }

  findAll(params?: Record<string, unknown>): Observable<Notification[]> {
    return this.findPaginated(params).pipe(map((result) => result.items));
  }

  findPaginated(
    params?: Record<string, unknown>
  ): Observable<PaginatedResponse<Notification>> {
    return this.apiClient
      .get<NotificationListDto>(this.baseEndpoint, params)
      .pipe(
        map((response) => ({
          items: response.data.items.map((dto) => this.toDomain(dto)),
          pagination: response.data.pagination,
        }))
      );
  }

  markAsRead(notificationIds: number[]): Observable<MarkAsReadResponseDto> {
    return this.apiClient
      .post<MarkAsReadResponseDto>(`${this.baseEndpoint}/mark-read`, {
        notification_ids: notificationIds,
      })
      .pipe(map((response) => response.data));
  }

  getUnreadCount(): Observable<number> {
    return this.apiClient
      .get<UnreadCountDto>(`${this.baseEndpoint}/unread/count`)
      .pipe(map((response) => response.data.count));
  }

  getVapidPublicKey(): Observable<{ publicKey: string }> {
    return this.apiClient
      .get<{ publicKey: string }>(`${this.baseEndpoint}/vapid-public-key`)
      .pipe(map((response) => response.data));
  }

  updatePushSubscription(
    subscription: PushSubscriptionJSON
  ): Observable<{ message: string }> {
    return this.apiClient
      .post<{ message: string }>(
        `${this.baseEndpoint}/push-subscription`,
        subscription
      )
      .pipe(map((response) => response.data));
  }

  getSettings(): Observable<Record<string, unknown>> {
    return this.apiClient
      .get<Record<string, unknown>>('/users/notification-settings')
      .pipe(map((response) => response.data));
  }

  updateSettings(
    settings: Record<string, unknown>
  ): Observable<Record<string, unknown>> {
    return this.apiClient
      .patch<Record<string, unknown>>('/users/notification-settings', settings)
      .pipe(map((response) => response.data));
  }
}