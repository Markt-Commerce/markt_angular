import { ErrorHandler, Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { ErrorHandlingService } from './error-handling.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private typeSafety = inject(TypeSafetyService);
  private errors = inject(ErrorHandlingService);

  handleError(error: unknown): void {
    try {
      this.errors.notify(error);
    } catch {}
    // Preserve default console output for debugging
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

export function setupGlobalErrorListeners() {
  const errors = inject(ErrorHandlingService);
  return () => {
    window.addEventListener('error', (event: ErrorEvent) => {
      errors.notify(event.error || event.message);
    });
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      errors.notify(this.typeSafety.toString(this.typeSafety.getProperty(event, 'reason'), 'Unhandled promise rejection'));
    });
  };
} 