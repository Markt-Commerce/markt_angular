/**
 * API Client Service
 *
 * Low-level HTTP client that handles:
 * - Base URL resolution
 * - Headers and authentication
 * - Error handling
 * - Request/response transformation
 *
 * This service is used by repositories, not directly by components or domain services.
 * It provides a clean abstraction over Angular's HttpClient.
 */

import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from './api-response.types';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.apiBaseUrl;

  /**
   * Resolve absolute API base URL safely at runtime.
   * - If env base is absolute (http/https), use it as-is
   * - If env base is relative: keep relative to use dev proxy
   */
  private resolveApiBaseUrl(): string {
    const isAbsolute = /^https?:\/\//i.test(this.API_BASE_URL);
    if (isAbsolute) return this.API_BASE_URL;
    return this.API_BASE_URL; // Use relative for dev proxy
  }

  /**
   * Configure HTTP options to include credentials (cookies)
   */
  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }),
  };

  /**
   * Generic GET request
   */
  get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Observable<ApiResponse<T>> {
    const url = `${this.resolveApiBaseUrl()}${endpoint}`;
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<ApiResponse<T>>(url, {
        ...this.httpOptions,
        params: httpParams,
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, body?: unknown): Observable<ApiResponse<T>> {
    const url = `${this.resolveApiBaseUrl()}${endpoint}`;
    return this.http
      .post<ApiResponse<T>>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, body?: unknown): Observable<ApiResponse<T>> {
    const url = `${this.resolveApiBaseUrl()}${endpoint}`;
    return this.http
      .patch<ApiResponse<T>>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, body?: unknown): Observable<ApiResponse<T>> {
    const url = `${this.resolveApiBaseUrl()}${endpoint}`;
    return this.http
      .put<ApiResponse<T>>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    const url = `${this.resolveApiBaseUrl()}${endpoint}`;
    return this.http
      .delete<ApiResponse<T>>(url, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Build HttpParams from a plain object
   */
  private buildHttpParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            httpParams = httpParams.append(key, String(item));
          });
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });

    return httpParams;
  }

  /**
   * Handle HTTP errors consistently
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
  }
}
