import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbItem } from './breadcrumb.service';

/**
 * Navigation service for generating links and handling navigation
 * This service provides utilities for creating navigation links that can be used
 * in notifications, emails, and other parts of the application
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);

  /**
   * Generate a request detail URL
   * @param requestId - The ID of the request
   * @returns The full URL path for the request detail page
   */
  getRequestDetailUrl(requestId: string): string {
    return `/app/requests/${requestId}`;
  }

  /**
   * Generate an offer detail URL
   * @param offerId - The ID of the offer
   * @returns The full URL path for the offer detail page
   */
  getOfferDetailUrl(offerId: string): string {
    return `/app/offers/${offerId}`;
  }

  /**
   * Generate a product detail URL
   * @param productId - The ID of the product
   * @returns The full URL path for the product detail page
   */
  getProductDetailUrl(productId: string): string {
    return `/app/marketplace/product-detail/${productId}`;
  }

  /**
   * Generate a user profile URL
   * @param userId - The ID of the user
   * @returns The full URL path for the user profile page
   */
  getUserProfileUrl(userId: string): string {
    return `/app/profile/user/${userId}`;
  }

  /**
   * Generate an order detail URL
   * @param orderId - The ID of the order
   * @returns The full URL path for the order detail page
   */
  getOrderDetailUrl(orderId: string): string {
    return `/app/orders/${orderId}`;
  }

  /**
   * Navigate to request detail page
   * @param requestId - The ID of the request
   */
  navigateToRequestDetail(requestId: string): void {
    this.router.navigate(['/app/requests', requestId]);
  }

  /**
   * Navigate to offer detail page
   * @param offerId - The ID of the offer
   */
  navigateToOfferDetail(offerId: string): void {
    this.router.navigate(['/app/offers', offerId]);
  }

  /**
   * Navigate to product detail page
   * @param productId - The ID of the product
   */
  navigateToProductDetail(productId: string): void {
    this.router.navigate(['/app/marketplace/product-detail', productId]);
  }

  /**
   * Navigate to user profile page
   * @param userId - The ID of the user
   */
  navigateToUserProfile(userId: string): void {
    this.router.navigate(['/app/profile/user', userId]);
  }

  /**
   * Navigate to order detail page
   * @param orderId - The ID of the order
   */
  navigateToOrderDetail(orderId: string): void {
    this.router.navigate(['/app/orders', orderId]);
  }

  /**
   * Generate breadcrumb data for request detail page
   * @param requestId - The ID of the request
   * @param requestTitle - Optional title of the request
   * @returns Breadcrumb configuration
   */
  getRequestDetailBreadcrumbs(requestId: string, requestTitle?: string): BreadcrumbItem[] {
    return [
      { 
        label: 'Dashboard', 
        url: '/app/dashboard',
        icon: 'home',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      { 
        label: 'Requests', 
        url: '/app/requests',
        icon: 'clipboard',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      { 
        label: requestTitle || 'Request Detail', 
        url: `/app/requests/${requestId}`,
        icon: 'clipboard',
        isClickable: false,
        isCurrentPage: true,
        metadata: {
          id: requestId,
          type: 'request'
        }
      }
    ];
  }

  /**
   * Generate breadcrumb data for offer detail page
   * @param offerId - The ID of the offer
   * @param offerTitle - Optional title of the offer
   * @returns Breadcrumb configuration
   */
  getOfferDetailBreadcrumbs(offerId: string, offerTitle?: string): BreadcrumbItem[] {
    return [
      { 
        label: 'Dashboard', 
        url: '/app/dashboard',
        icon: 'home',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      { 
        label: 'Offers', 
        url: '/app/offers',
        icon: 'tag',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      { 
        label: offerTitle || 'Offer Detail', 
        url: `/app/offers/${offerId}`,
        icon: 'tag',
        isClickable: false,
        isCurrentPage: true,
        metadata: {
          id: offerId,
          type: 'offer'
        }
      }
    ];
  }

  /**
   * Generate breadcrumb data for product detail page
   * @param productId - The ID of the product
   * @param productTitle - Optional title of the product
   * @returns Breadcrumb configuration
   */
  getProductDetailBreadcrumbs(productId: string, productTitle?: string): BreadcrumbItem[] {
    return [
      { 
        label: 'Dashboard', 
        url: '/app/dashboard',
        icon: 'home',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      { 
        label: 'Marketplace', 
        url: '/app/marketplace',
        icon: 'store',
        isClickable: true,
        isCurrentPage: false,
        metadata: {}
      },
      { 
        label: productTitle || 'Product Detail', 
        url: `/app/marketplace/product-detail/${productId}`,
        icon: 'box',
        isClickable: false,
        isCurrentPage: true,
        metadata: {
          id: productId,
          type: 'product'
        }
      }
    ];
  }
}
