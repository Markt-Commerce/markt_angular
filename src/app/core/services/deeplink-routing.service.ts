import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES_ABSOLUTE } from '../config/routes.config';

@Injectable({ providedIn: 'root' })
export class DeepLinkRoutingService {
  private router = inject(Router);

  toProduct(id: string) { return ['/app/marketplace/product', id]; }
  toSellerListings(sellerId: string) { return [ROUTES_ABSOLUTE.APP.MARKETPLACE]; }
  toChatWith(userId: string, productId?: string) {
    return this.router.navigate([ROUTES_ABSOLUTE.APP.CHAT], { queryParams: { user: userId, product: productId } });
  }
  toCheckoutFrom(source: string, productId?: string) {
    return this.router.navigate([ROUTES_ABSOLUTE.APP.CHECKOUT], { queryParams: { source, productId } });
  }
} 