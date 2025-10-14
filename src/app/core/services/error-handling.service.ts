import { Injectable, inject } from '@angular/core';
import { AppStateService } from './app-state.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
  private app = inject(AppStateService);

  notify(error: unknown, fallback: string = 'Something went wrong. Please try again.') {
    const message = this.toMessage(error) || fallback;
    this.app.showNotification({
      type: 'error',
      message
    });
  }

  toMessage(error: unknown): string | null {
    if (!error || typeof error !== 'object') return null;
    
    const errorObj = error as { status?: unknown; message?: unknown; error?: { message?: unknown } };
    const msg = errorObj.message || errorObj.error?.message;
    
    if (msg) return String(msg);
    
    switch (errorObj.status) {
      case 401: return 'Please sign in to continue.';
      case 403: return "You don't have permission to do that.";
      case 404: return 'We could not find what you were looking for.';
      case 422: return 'Please check your input and try again.';
      case 500: return 'The server had an issue. Please try again later.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  }
} 