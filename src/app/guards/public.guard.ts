import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/http/auth.service';

export const publicGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/feed']);
    return false;
  } else {
    return true;
  }
};
