import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private auth = inject(AuthService);

  get role(): UserRole | null { return this.auth.getCurrentRole(); }
  role$ = this.auth.authState$.pipe(map(s => (s.user?.current_role ?? null) as UserRole | null));

  isRole(role: UserRole): boolean { return this.role === role; }

  canViewCart(): boolean { return this.role === 'buyer'; }
  canCheckout(): boolean { return this.role === 'buyer'; }
  canCreateListing(): boolean { return this.role === 'seller'; }
  canSeeSellerNav(): boolean { return this.role === 'seller'; }
  canMessageSeller(): boolean { return this.role === 'buyer'; }
} 