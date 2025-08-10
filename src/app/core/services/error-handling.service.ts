import { Injectable, inject } from '@angular/core';
import { AppStateService } from './app-state.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlingService {
  private app = inject(AppStateService);

  notify(error: any, fallback: string = 'Something went wrong. Please try again.') {
    const message = this.toMessage(error) || fallback;
    this.app.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Error',
      message,
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  toMessage(error: any): string | null {
    if (!error) return null;
    const status = error?.status;
    const msg = error?.message || error?.error?.message;
    if (msg) return msg;
    switch (status) {
      case 401: return 'Please sign in to continue.';
      case 403: return 'You don’t have permission to do that.';
      case 404: return 'We could not find what you were looking for.';
      case 422: return 'Please check your input and try again.';
      case 500: return 'The server had an issue. Please try again later.';
      default: return null;
    }
  }
} 