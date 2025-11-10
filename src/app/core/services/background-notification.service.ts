import { Injectable, inject } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, interval, fromEvent, of } from 'rxjs';
import { filter, switchMap, tap, catchError, map } from 'rxjs/operators';
import { NotificationRepository } from '../../domains/notifications/repositories/notification.repository';
import type { Notification } from '../models';

export interface BackgroundNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  subscription: PushSubscription | null;
  lastCheck: Date | null;
  backgroundSync: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BackgroundNotificationService {
  private notificationRepository = inject(NotificationRepository);
  private swPush = inject(SwPush);
  private swUpdate = inject(SwUpdate);

  private stateSubject = new BehaviorSubject<BackgroundNotificationState>({
    isSupported: false,
    isEnabled: false,
    subscription: null,
    lastCheck: null,
    backgroundSync: false
  });

  public state$ = this.stateSubject.asObservable();

  // VAPID key will be retrieved from server for security
  private vapidPublicKey: string | null = null;

  constructor() {
    this.initializeBackgroundNotifications();
  }

  /**
   * Initialize background notification capabilities
   */
  private async initializeBackgroundNotifications(): Promise<void> {
    try {
      // Check if service worker is supported
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        this.updateState({ isSupported: true });
        
        // Check if push notifications are enabled
        const permission = await Notification.requestPermission();
        this.updateState({ isEnabled: permission === 'granted' });

        // Setup service worker updates
        this.setupServiceWorkerUpdates();
        
        // Setup background sync
        this.setupBackgroundSync();
        
        // Setup periodic background sync
        this.setupPeriodicBackgroundSync();
      }
    } catch (error) {
      console.error('Failed to initialize background notifications:', error);
    }
  }

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      const isEnabled = permission === 'granted';
      
      this.updateState({ isEnabled });
      
      if (isEnabled) {
        await this.subscribeToPushNotifications();
      }
      
      return isEnabled;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Get VAPID public key from server
   * Uses NotificationRepository (DDD pattern)
   */
  private async getVapidPublicKey(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.notificationRepository.getVapidPublicKey().subscribe({
        next: (response) => resolve(response.publicKey),
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    try {
      // Get VAPID key from server first
      if (!this.vapidPublicKey) {
        this.vapidPublicKey = await this.getVapidPublicKey();
      }

      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.vapidPublicKey
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      this.updateState({ subscription });
      
      // Listen for push notifications
      this.swPush.messages.subscribe((message: any) => {
        this.handlePushNotification(message);
      });

      // Listen for subscription changes
      this.swPush.subscription.subscribe((subscription: PushSubscription | null) => {
        this.updateState({ subscription });
      });

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Send subscription to server
   * Uses NotificationRepository (DDD pattern)
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData: PushSubscriptionJSON = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      return new Promise((resolve, reject) => {
        this.notificationRepository.updatePushSubscription(subscriptionData).subscribe({
          next: () => resolve(),
        error: (error) => {
          console.error('Failed to send subscription to server:', error);
            reject(error);
        }
        });
      });
    } catch (error) {
      console.error('Failed to prepare subscription data:', error);
      throw error;
    }
  }

  /**
   * Handle incoming push notification
   */
  private handlePushNotification(message: any): void {
    try {
      const notification = message.notification;
      
      // Show browser notification
      if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(notification.title, {
            body: notification.body,
            icon: notification.icon || '/assets/icons/notification-icon.png',
            badge: '/assets/icons/badge-icon.png',
            data: notification.data,
                               // actions: notification.actions || [], // Removed - not supported in NotificationOptions
            requireInteraction: notification.requireInteraction || false,
            silent: notification.silent || false
          });
        });
      }

      // Update local notification state
      this.updateNotificationState(notification);
      
    } catch (error) {
      console.error('Failed to handle push notification:', error);
    }
  }

  /**
   * Setup service worker updates
   */
  private setupServiceWorkerUpdates(): void {
    // Check for updates
    this.swUpdate.versionUpdates.subscribe((event) => {
      switch (event.type) {
        case 'VERSION_READY':
          // You can show a notification to the user
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.error('Failed to install new version');
          break;
      }
    });

    // Check for updates every hour
    interval(60 * 60 * 1000).pipe(
      switchMap(() => this.swUpdate.checkForUpdate())
    ).subscribe();
  }

  /**
   * Setup background sync
   */
  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register background sync for notifications
        (registration as any).sync.register('background-notification-sync').then(() => {
          this.updateState({ backgroundSync: true });
        }).catch((error: unknown) => {
          console.error('Failed to register background sync:', error);
        });
      });
    }
  }

  /**
   * Setup periodic background sync
   */
  private setupPeriodicBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(async (registration) => {
        try {
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync' as PermissionName
          });

          if (status.state === 'granted') {
            await (registration as any).periodicSync.register('notification-sync', {
              minInterval: 24 * 60 * 60 * 1000 // 24 hours
            });
          }
        } catch (error) {
          console.error('Failed to setup periodic background sync:', error);
        }
      });
    }
  }

  /**
   * Update notification state
   */
  private updateNotificationState(notification: any): void {
    // This would typically update your main notification service
    // For now, we'll just log it
  }

  /**
   * Check for new notifications in background
   * Uses NotificationRepository (DDD pattern)
   */
  checkForNewNotifications(): Observable<any> {
    return this.notificationRepository.getUnreadCount().pipe(
      map((count: number) => {
        if (count > 0) {
          this.showBackgroundNotification({
            body: `You have ${count} new notification(s)`,
            icon: '/assets/icons/notification-icon.png'
          });
        }
        return { success: true, data: { count } };
      }),
      catchError((error) => {
        console.error('Background notification check failed:', error);
        return of({ success: false, data: { count: 0 } });
      })
    );
  }

  /**
   * Show background notification
   */
  private showBackgroundNotification(options: NotificationOptions): void {
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
                 registration.showNotification('Notification', options);
      });
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    try {
      await this.swPush.unsubscribe();
      this.updateState({ subscription: null, isEnabled: false });
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }

  /**
   * Get current state
   */
  getState(): BackgroundNotificationState {
    return this.stateSubject.value;
  }

  /**
   * Update state
   */
  private updateState(partial: Partial<BackgroundNotificationState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...partial };
    this.stateSubject.next(newState);
  }

  /**
   * Check if background notifications are supported
   */
  isSupported(): boolean {
    return this.getState().isSupported;
  }

  /**
   * Check if background notifications are enabled
   */
  isEnabled(): boolean {
    return this.getState().isEnabled;
  }

  /**
   * Get subscription status
   */
  getSubscription(): PushSubscription | null {
    return this.getState().subscription;
  }
}
