import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessControlService } from '../../../core/services/access-control.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-role-gate',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!isAllowed()) {
      <div class="rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center justify-between">
        <div>
          {{ message || defaultMessage }}
        </div>
        <button (click)="switchRole()" class="ml-4 bg-markt-primary text-white px-3 py-1.5 rounded-md hover:bg-markt-secondary transition-colors">Switch to {{ requiredRole | titlecase }}</button>
      </div>
    } @else {
      <ng-content></ng-content>
    }
  `
})
export class RoleGateComponent {
  @Input() requiredRole: 'buyer' | 'seller' = 'buyer';
  @Input() message: string = '';

  private access = inject(AccessControlService);
  private auth = inject(AuthService);

  get defaultMessage(): string {
    return this.requiredRole === 'buyer'
      ? 'This section is available in Buyer mode. Switch to continue.'
      : 'This section is available in Seller mode. Switch to continue.';
  }

  isAllowed(): boolean {
    return this.requiredRole === 'buyer' ? this.access.isBuyer : this.access.isSeller;
  }

  switchRole(): void {
    this.auth.switchRole().subscribe();
  }
} 