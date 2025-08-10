import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private auth = inject(AuthService);

  get role(): 'buyer' | 'seller' | null { return this.auth.getCurrentRole(); }

  canViewCart(): boolean { return this.role === 'buyer'; }
  canCheckout(): boolean { return this.role === 'buyer'; }
  canCreateListing(): boolean { return this.role === 'seller'; }
  canSeeSellerNav(): boolean { return this.role === 'seller'; }
  canMessageSeller(): boolean { return true; }
} 