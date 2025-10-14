import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { NavigationService } from './navigation.service';
import { ROUTES_ABSOLUTE } from '../config/routes.config';

/**
 * Notification service for managing notifications
 * This service demonstrates how to include navigation links in notifications
 * and emails that can direct users to specific pages like request details
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private navigationService = inject(NavigationService);
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  /**
   * Get all notifications as Observable
   * @returns Observable of notifications array
   */
  getNotifications$(): Observable<any[]> {
    return this.notificationsSubject.asObservable();
  }

  /**
   * Get notifications (for backward compatibility)
   * @returns Observable of notifications array
   */
  getNotifications(): Observable<any[]> {
    return this.getNotifications$();
  }

  /**
   * Get unread count as Observable
   * @returns Observable of unread count
   */
  getUnreadCount$(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  /**
   * Get unread count (for backward compatibility)
   * @returns Observable of unread count
   */
  getUnreadCount(): Observable<number> {
    return this.getUnreadCount$();
  }

  /**
   * Mark all notifications as read
   * @returns Observable of success response
   */
  markAllAsRead(): Observable<any> {
    // Mock implementation - in real app, this would call the API
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.unreadCountSubject.next(0);
    return of({ success: true });
  }

  /**
   * Get notification action URL
   * @param notification - The notification object
   * @returns The action URL for the notification
   */
  getNotificationActionUrl(notification: any): string {
    return notification.actionUrl || ROUTES_ABSOLUTE.APP.NOTIFICATIONS;
  }

  /**
   * Generate notification data for new request responses
   * @param requestId - The ID of the request
   * @param requestTitle - The title of the request
   * @param responseCount - Number of new responses
   * @returns Notification data with navigation link
   */
  generateRequestResponseNotification(
    requestId: string, 
    requestTitle: string, 
    responseCount: number
  ) {
    const requestDetailUrl = this.navigationService.getRequestDetailUrl(requestId);
    
    return {
      id: `request-response-${requestId}-${Date.now()}`,
      type: 'request_response',
      title: 'New Request Responses',
      message: `You have ${responseCount} new response${responseCount > 1 ? 's' : ''} on your request "${requestTitle}"`,
      actionUrl: requestDetailUrl,
      actionText: 'View Responses',
      timestamp: new Date(),
      read: false,
      priority: 'medium'
    };
  }

  /**
   * Generate notification data for offer acceptance
   * @param requestId - The ID of the request
   * @param requestTitle - The title of the request
   * @param sellerName - Name of the seller
   * @returns Notification data with navigation link
   */
  generateOfferAcceptedNotification(
    requestId: string,
    requestTitle: string,
    sellerName: string
  ) {
    const requestDetailUrl = this.navigationService.getRequestDetailUrl(requestId);
    
    return {
      id: `offer-accepted-${requestId}-${Date.now()}`,
      type: 'offer_accepted',
      title: 'Offer Accepted!',
      message: `${sellerName} accepted your offer for "${requestTitle}"`,
      actionUrl: requestDetailUrl,
      actionText: 'View Request',
      timestamp: new Date(),
      read: false,
      priority: 'high'
    };
  }

  /**
   * Generate notification data for new offers on user's listings
   * @param offerId - The ID of the offer
   * @param productTitle - The title of the product
   * @param buyerName - Name of the buyer
   * @returns Notification data with navigation link
   */
  generateNewOfferNotification(
    offerId: string,
    productTitle: string,
    buyerName: string
  ) {
    const offerDetailUrl = this.navigationService.getOfferDetailUrl(offerId);
    
    return {
      id: `new-offer-${offerId}-${Date.now()}`,
      type: 'new_offer',
      title: 'New Offer Received',
      message: `${buyerName} made an offer on your "${productTitle}"`,
      actionUrl: offerDetailUrl,
      actionText: 'View Offer',
      timestamp: new Date(),
      read: false,
      priority: 'high'
    };
  }

  /**
   * Generate email content for request responses
   * This shows how to include navigation links in emails
   * @param requestId - The ID of the request
   * @param requestTitle - The title of the request
   * @param responseCount - Number of responses
   * @param baseUrl - Base URL of the application
   * @returns Email content with navigation link
   */
  generateRequestResponseEmail(
    requestId: string,
    requestTitle: string,
    responseCount: number,
    baseUrl: string = 'https://markt.app'
  ) {
    const requestDetailUrl = `${baseUrl}${this.navigationService.getRequestDetailUrl(requestId)}`;
    
    return {
      subject: `You have ${responseCount} new response${responseCount > 1 ? 's' : ''} on your request`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E94C2A;">New Responses on Your Request</h2>
          <p>Hello!</p>
          <p>You have <strong>${responseCount}</strong> new response${responseCount > 1 ? 's' : ''} on your request:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">${requestTitle}</h3>
          </div>
          <p>Check out the responses and manage your request:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${requestDetailUrl}" 
               style="background: #E94C2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Request & Responses
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${requestDetailUrl}" style="color: #E94C2A;">${requestDetailUrl}</a>
          </p>
        </div>
      `,
      textContent: `
        New Responses on Your Request
        
        Hello!
        
        You have ${responseCount} new response${responseCount > 1 ? 's' : ''} on your request:
        
        ${requestTitle}
        
        Check out the responses and manage your request:
        ${requestDetailUrl}
        
        Best regards,
        The Markt Team
      `
    };
  }

  /**
   * Generate email content for offer acceptance
   * @param requestId - The ID of the request
   * @param requestTitle - The title of the request
   * @param sellerName - Name of the seller
   * @param baseUrl - Base URL of the application
   * @returns Email content with navigation link
   */
  generateOfferAcceptedEmail(
    requestId: string,
    requestTitle: string,
    sellerName: string,
    baseUrl: string = 'https://markt.app'
  ) {
    const requestDetailUrl = `${baseUrl}${this.navigationService.getRequestDetailUrl(requestId)}`;
    
    return {
      subject: `Great news! Your offer was accepted`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E94C2A;">🎉 Offer Accepted!</h2>
          <p>Hello!</p>
          <p>Great news! <strong>${sellerName}</strong> has accepted your offer for:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">${requestTitle}</h3>
          </div>
          <p>You can now proceed with the transaction:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${requestDetailUrl}" 
               style="background: #E94C2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Request Details
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${requestDetailUrl}" style="color: #E94C2A;">${requestDetailUrl}</a>
          </p>
        </div>
      `,
      textContent: `
        🎉 Offer Accepted!
        
        Hello!
        
        Great news! ${sellerName} has accepted your offer for:
        
        ${requestTitle}
        
        You can now proceed with the transaction:
        ${requestDetailUrl}
        
        Best regards,
        The Markt Team
      `
    };
  }
}