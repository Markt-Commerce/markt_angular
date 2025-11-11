import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { NotificationRepository } from '../repositories/notification.repository';
import { Notification } from '../models/notification.model';
import type { Pagination } from '../../../core/infrastructure/http/api-response.types';
import type { MarkAsReadResponseDto } from '../models/notification.dto';

interface NotificationState {
  items: Notification[];
  pagination: Pagination | null;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notificationRepository = inject(NotificationRepository);

  private readonly state = signal<NotificationState>({
    items: [],
    pagination: null,
    unreadCount: 0,
    loading: false,
    error: null,
  });

  private readonly notificationsSignal = computed(() => this.state().items);
  private readonly unreadCountSignal = computed(() => this.state().unreadCount);

  readonly notifications$ = toObservable(this.notificationsSignal);
  readonly unreadCount$ = toObservable(this.unreadCountSignal);

  get notifications(): Notification[] {
    return this.state().items;
  }

  get notificationState(): NotificationState {
    return this.state();
  }

  getNotifications(
    params?: Record<string, unknown>
  ): Observable<Notification[]> {
    this.patchState({ loading: true, error: null });

    return this.notificationRepository.findPaginated(params).pipe(
      tap(({ items, pagination }) => {
        this.patchState({
          items,
          pagination,
          error: null,
        });
      }),
      map(({ items }) => items),
      finalize(() => {
        this.patchState({ loading: false });
      }),
      catchError((error) => {
        this.patchState({
          error: this.resolveErrorMessage(error),
          loading: false,
        });
        return throwError(() => error);
      })
    );
  }

  getNotifications$(): Observable<Notification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.notificationRepository.getUnreadCount().pipe(
      tap((count) => {
        this.patchState({ unreadCount: count });
      }),
      catchError((error) => {
        this.patchState({ error: this.resolveErrorMessage(error) });
        return throwError(() => error);
      })
    );
  }

  markAsRead(ids: Array<number | string>): Observable<MarkAsReadResponseDto> {
    const notificationIds = (ids ?? [])
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    if (notificationIds.length === 0) {
      return of({ updated: 0 });
    }

    return this.notificationRepository.markAsRead(notificationIds).pipe(
      tap(() => {
        const updatedItems = this.state().items.map((notification) =>
          notificationIds.includes(notification.id)
            ? notification.markAsRead()
            : notification
        );

        const unreadCount = updatedItems.filter((notification) =>
          notification.isUnread()
        ).length;

        this.patchState({
          items: updatedItems,
          unreadCount,
        });
      }),
      catchError((error) => {
        this.patchState({ error: this.resolveErrorMessage(error) });
        return throwError(() => error);
      })
    );
  }

  markAllAsRead(): Observable<MarkAsReadResponseDto> {
    const unreadIds = this.state()
      .items.filter((notification) => notification.isUnread())
      .map((notification) => notification.id);

    if (unreadIds.length === 0) {
      return of({ updated: 0 });
    }

    return this.markAsRead(unreadIds);
  }

  getNotificationActionUrl(notification: Notification | any): string {
    const context = (notification?.context ?? {}) as {
      type?: string;
      id?: string | number;
    };

    const referenceType =
      (notification as Notification)?.referenceType ?? context.type;
    const referenceId =
      (notification as Notification)?.referenceId ?? context.id;

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

  getSettings(): Observable<Record<string, unknown>> {
    return this.notificationRepository.getSettings().pipe(
      tap({
        error: (error) => {
          this.patchState({ error: this.resolveErrorMessage(error) });
        },
      })
    );
  }

  updateSettings(
    data: Record<string, unknown>
  ): Observable<Record<string, unknown>> {
    return this.notificationRepository.updateSettings(data).pipe(
      tap({
        error: (error) => {
          this.patchState({ error: this.resolveErrorMessage(error) });
        },
      })
    );
  }

  removeNotificationLocally(id: number | string): void {
    const notificationId = Number(id);
    if (Number.isNaN(notificationId)) {
      return;
    }

    const remaining = this.state().items.filter(
      (notification) => notification.id !== notificationId
    );

    this.patchState({
      items: remaining,
      unreadCount: remaining.filter((notification) => notification.isUnread())
        .length,
    });
  }

  clearNotificationsLocally(): void {
    this.patchState({
      items: [],
      unreadCount: 0,
    });
  }

  private patchState(partial: Partial<NotificationState>): void {
    this.state.update((current) => ({
      ...current,
      ...partial,
    }));
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unable to process notification request';
  }
}
