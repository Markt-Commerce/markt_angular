import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { ApiStore } from './apiSpecificData';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiIntegrationService {
  private http = inject(HttpClient);

  // API State Management
  private _isLoading = signal<boolean>(false);
  private _lastError = signal<ApiError | null>(null);
  private _apiStatus = signal<'online' | 'offline' | 'connecting'>('online');

  // Public signals
  readonly isLoading = this._isLoading.asReadonly();
  readonly lastError = this._lastError.asReadonly();
  readonly apiStatus = this._apiStatus.asReadonly();

  // API Base URL
  private readonly baseUrl = ApiStore.apiUrl;

  constructor() {
    this.checkApiStatus();
  }

  // Generic API Methods
  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    this.setLoading(true);
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => this.handleError(error))
      );
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    this.setLoading(true);
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => this.handleError(error))
      );
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    this.setLoading(true);
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => this.handleError(error))
      );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    this.setLoading(true);
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => this.handleError(error))
    );
  }

  // File Upload
  uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: any
  ): Observable<ApiResponse<T>> {
    this.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData)
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => this.handleError(error))
      );
  }

  // Batch Operations
  batchGet<T>(endpoints: string[]): Observable<ApiResponse<T>[]> {
    this.setLoading(true);
    const requests = endpoints.map((endpoint) =>
      this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`)
    );

    return this.http
      .get<ApiResponse<T>[]>(`${this.baseUrl}/batch`, {
        params: { endpoints: endpoints.join(',') },
      })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => this.handleError(error))
      );
  }

  // Real-time Updates
  subscribeToUpdates<T>(endpoint: string): Observable<T> {
    return new Observable((observer) => {
      // In production, this would use WebSocket or Server-Sent Events
      const eventSource = new EventSource(`${this.baseUrl}${endpoint}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (error) {
          observer.error(error);
        }
      };

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }

  // Error Handling
  private handleError(error: any): Observable<never> {
    this.setLoading(false);

    const apiError: ApiError = {
      status: error.status || 500,
      message: error.error?.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    this._lastError.set(apiError);

    // Update API status based on error
    if (error.status === 0 || error.status === 503) {
      this._apiStatus.set('offline');
    }

    return throwError(() => apiError);
  }

  // Loading State Management
  private setLoading(loading: boolean) {
    this._isLoading.set(loading);
  }

  // API Status Check
  private checkApiStatus() {
    this.http
      .get(`${this.baseUrl}/health`)
      .pipe(
        tap(() => this._apiStatus.set('online')),
        catchError(() => {
          this._apiStatus.set('offline');
          return throwError(() => new Error('API offline'));
        })
      )
      .subscribe();
  }

  // Retry Logic
  retryRequest<T>(
    request: Observable<ApiResponse<T>>,
    maxRetries: number = 3
  ): Observable<ApiResponse<T>> {
    return request.pipe(
      catchError((error, caught) => {
        if (maxRetries > 0) {
          return this.retryRequest(request, maxRetries - 1);
        }
        return throwError(() => error);
      })
    );
  }

  // Clear Error
  clearError() {
    this._lastError.set(null);
  }

  // Force API Status Check
  forceApiStatusCheck() {
    this._apiStatus.set('connecting');
    this.checkApiStatus();
  }
}
