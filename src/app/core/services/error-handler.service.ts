import { Injectable } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Extract error message from various error types, preferring server messages
   */
  extractErrorMessage(error: any): string {
    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      return this.extractFromHttpError(error);
    }

    // Handle server error objects
    if (error && typeof error === 'object') {
      return this.extractFromServerError(error);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Handle Error objects
    if (error instanceof Error) {
      return error.message;
    }

    // Fallback
    return 'An unexpected error occurred';
  }

  /**
   * Extract error message from HttpErrorResponse
   */
  private extractFromHttpError(error: HttpErrorResponse): string {
    // Client-side error
    if (error.error instanceof ErrorEvent) {
      return error.error.message;
    }

    // Server-side error - prefer server message
    if (error.error && typeof error.error === 'object') {
      const serverMessage = this.extractFromServerError(error.error);
      if (serverMessage !== 'An unexpected error occurred') {
        return serverMessage;
      }
    }

    // Fallback to status-based messages only if no server message
    return this.getStatusBasedMessage(error.status);
  }

  /**
   * Extract error message from server error object
   */
  private extractFromServerError(error: any): string {
    if (!error || typeof error !== 'object') {
      return 'An unexpected error occurred';
    }

    // Check for common server error patterns
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }

    if (error.detail && typeof error.detail === 'string') {
      return error.detail;
    }

    if (error.error && typeof error.error === 'string') {
      return error.error;
    }

    if (error.errors) {
      if (Array.isArray(error.errors)) {
        return error.errors.join(', ');
      }
      if (typeof error.errors === 'object') {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .join(' | ');
        return errorMessages || 'Validation errors occurred';
      }
    }

    return 'An unexpected error occurred';
  }

  /**
   * Get status-based error messages (fallback only)
   */
  private getStatusBasedMessage(status?: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The requested resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 0:
        return 'Network error. Please check your internet connection.';
      default:
        return 'Server error. Please try again later.';
    }
  }

  /**
   * Log error with context
   */
  logError(error: any, context?: string): void {
    const errorMessage = this.extractErrorMessage(error);
    const logMessage = context ? `[${context}] ${errorMessage}` : errorMessage;
    
    console.error(logMessage, error);
  }
}
