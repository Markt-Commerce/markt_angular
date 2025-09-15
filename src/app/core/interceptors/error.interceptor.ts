import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> {
  const errorHandler = inject(ErrorHandlerService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Extract error message using our centralized error handler
      const errorMessage = errorHandler.extractErrorMessage(error);
      
      // Log the error with context
      errorHandler.logError(error, `HTTP Error for ${req.method} ${req.url}`);
      
      // Create a properly formatted error object
      const formattedError = new Error(errorMessage) as any;
      formattedError.status = error.status;
      formattedError.statusText = error.statusText;
      formattedError.url = error.url;
      formattedError.originalError = error;
      
      // Handle specific error types
      if (error.status === 401) {
        // Handle unauthorized - could redirect to login
        console.warn('Unauthorized request detected');
      } else if (error.status === 403) {
        // Handle forbidden
        console.warn('Access forbidden');
      } else if (error.status === 404) {
        // Handle not found
        console.warn('Resource not found');
      } else if (error.status >= 500) {
        // Handle server errors
        console.error('Server error occurred');
      }
      
      // Return the formatted error to be handled by the calling code
      return throwError(() => formattedError);
    })
  );
}
