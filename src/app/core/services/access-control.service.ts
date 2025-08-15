import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private auth = inject(AuthService);

  get role(): 'buyer' | 'seller' | null { return this.auth.getCurrentRole(); }
  role$ = this.auth.authState$.pipe(map(s => (s.user?.current_role ?? null) as 'buyer' | 'seller' | null));

  isRole(role: 'buyer' | 'seller'): boolean { return this.role === role; }

  canViewCart(): boolean { return this.role === 'buyer'; }
  canCheckout(): boolean { return this.role === 'buyer'; }
  canCreateListing(): boolean { return this.role === 'seller'; }
  canSeeSellerNav(): boolean { return this.role === 'seller'; }
  canMessageSeller(): boolean { return true; }
} 