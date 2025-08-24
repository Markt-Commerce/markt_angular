import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorHandlingService } from './error-handling.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errors = inject(ErrorHandlingService);

  handleError(error: unknown): void {
    try {
      // Handle different types of errors appropriately
      if (error instanceof Error) {
        this.errors.notify(error, error.message);
      } else if (typeof error === 'string') {
        this.errors.notify(error, error);
      } else {
        this.errors.notify(error);
      }
    } catch (handlerError) {
      // Fallback to console if error handling fails
      console.error('Error in global error handler:', handlerError);
      console.error('Original error:', error);
    }
    
    // Preserve default console output for debugging
    // eslint-disable-next-line no-console
    console.error('Global error:', error);
  }
} 