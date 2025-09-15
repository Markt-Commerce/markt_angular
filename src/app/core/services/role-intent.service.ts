import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';

@Injectable({ providedIn: 'root' })
export class RoleIntentService {
	private auth = inject(AuthService);
	private access = inject(AccessControlService);
	private router = inject(Router);
	private switching = false;

	ensureRoleAndExecute(target: 'buyer' | 'seller', action: () => void): void {
		if (this.access.role === target) {
			action();
			return;
		}
		if (this.switching) return;
		this.switching = true;
		this.auth.switchRole(target).subscribe({
			next: () => action(),
			complete: () => { this.switching = false; }
		});
	}

	switchAndNavigate(target: 'buyer' | 'seller', url: string, extras?: any): void {
		this.ensureRoleAndExecute(target, () => this.router.navigateByUrl(url, extras));
	}
} 