import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { SellerResponse } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private http = inject(HttpClient);

  getSellerDetails(sellerId: string): Observable<SellerResponse> {
    return this.http
      .get<SellerResponse>(ApiStore.mergeEndpoint('user', 'seller', sellerId))
      .pipe(
        tap((data) => {
          // Handle successful sellers retrieval
        }),
        catchError((err) => {
          // Handle sellers retrieval error appropriately
          return throwError(() => new Error('Failed to load sellers'));
        })
      );
  }

  getSellers(): Observable<SellerResponse[]> {
    return this.http.get<SellerResponse[]>(`${this.apiUrl}/sellers`).pipe(
      tap((data) => {
        // Handle successful sellers retrieval
      }),
      catchError((err) => {
        // Handle sellers retrieval error appropriately
        return throwError(() => new Error('Failed to load sellers'));
      })
    );
  }
}
