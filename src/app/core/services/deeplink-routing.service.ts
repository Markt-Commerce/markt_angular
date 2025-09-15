import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DeepLinkRoutingService {
  private router = inject(Router);

  toProduct(id: string) { return ['/app/marketplace/product', id]; }
  toSellerListings(sellerId: string) { return ['/app/marketplace']; }
  toChatWith(userId: string, productId?: string) {
    return this.router.navigate(['/app/chat'], { queryParams: { user: userId, product: productId } });
  }
  toCheckoutFrom(source: string, productId?: string) {
    return this.router.navigate(['/app/checkout'], { queryParams: { source, productId } });
  }
} 