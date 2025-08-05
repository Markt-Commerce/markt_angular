import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = 'https://test.api.marktcommerce.com/api/v1';

  /**
   * Make a GET request
   */
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    const httpParams = this.buildHttpParams(params);
    
    return this.http.get<ApiResponse<T>>(url, { 
      params: httpParams,
      withCredentials: true 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a POST request
   */
  post<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.post<ApiResponse<T>>(url, data, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a PUT request
   */
  put<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.put<ApiResponse<T>>(url, data, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a PATCH request
   */
  patch<T>(endpoint: string, data?: unknown): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.patch<ApiResponse<T>>(url, data, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Make a DELETE request
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    
    return this.http.delete<ApiResponse<T>>(url, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload a single file
   */
  upload<T>(endpoint: string, file: File, data?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, String(data[key]));
      });
    }
    
    return this.http.post<ApiResponse<T>>(url, formData, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload multiple files
   */
  uploadMultiple<T>(endpoint: string, files: File[], data?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const url = this.getUrl(endpoint);
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, String(data[key]));
      });
    }
    
    return this.http.post<ApiResponse<T>>(url, formData, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Build HTTP parameters from object
   */
  private buildHttpParams(params?: Record<string, unknown>): HttpParams {
    if (!params) {
      return new HttpParams();
    }
    
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            httpParams = httpParams.append(key, item.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });
    
    return httpParams;
  }

  /**
   * Get full URL for endpoint
   */
  private getUrl(endpoint: string): string {
    return `${this.API_BASE_URL}${endpoint}`;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: unknown): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (typeof error === 'object' && error !== null && 'error' in error && 
        typeof (error as any).error === 'object' && (error as any).error?.message) {
      errorMessage = (error as any).error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as any).message;
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
} 