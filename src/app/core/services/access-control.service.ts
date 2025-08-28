import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private auth = inject(AuthService);

  get role(): UserRole | null { return this.auth.getCurrentRole(); }
  role$ = this.auth.authState$.pipe(map(s => (s.user?.current_role ?? null) as UserRole | null));

  // Core role checking method
  isRole(role: UserRole): boolean { return this.role === role; }

  // Computed properties for common role checks (more efficient than methods)
  get isBuyer(): boolean { return this.role === 'buyer'; }
  get isSeller(): boolean { return this.role === 'seller'; }

  // For more complex access control logic, use methods
  // For simple role checks, use isRole() directly or the computed properties above
} 