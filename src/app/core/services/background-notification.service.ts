import { Injectable, inject } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable, interval, fromEvent } from 'rxjs';
import { filter, switchMap, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
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
  private apiService = inject(ApiService);
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
   */
  private async getVapidPublicKey(): Promise<string> {
    try {
      // Get VAPID key from server instead of hardcoding
      const response = await this.apiService.getVapidPublicKey().toPromise();
      if (!response) {
        throw new Error('No response from server');
      }
      return response.data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      throw new Error('Unable to get VAPID public key from server');
    }
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
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      // Send to your API endpoint
      this.apiService.updatePushSubscription(subscriptionData).subscribe({
        next: (response) => {
          console.log('Push subscription sent to server:', response);
        },
        error: (error) => {
          console.error('Failed to send subscription to server:', error);
        }
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
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
          console.log('New version available');
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
    console.log('Background notification received:', notification);
  }

  /**
   * Check for new notifications in background
   */
  checkForNewNotifications(): Observable<any> {
    return this.apiService.getUnreadCount().pipe(
      tap((response) => {
        if (response.success && response.data.count > 0) {
          this.showBackgroundNotification({
                             // title: 'New Notifications', // Removed - title is first parameter
            body: `You have ${response.data.count} new notification(s)`,
            icon: '/assets/icons/notification-icon.png'
          });
        }
      }),
      catchError((error) => {
        console.error('Background notification check failed:', error);
        return [];
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
