import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { BuyerResponse } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class BuyerService {
  private http = inject(HttpClient);

  getBuyerDetails(buyerId: string): Observable<BuyerResponse> {
    return this.http
      .get<BuyerResponse>(ApiStore.mergeEndpoint('user', 'buyer', buyerId))
      .pipe(
        tap((data) => {
          // Handle successful buyers retrieval
        }),
        catchError((err) => {
          // Handle buyers retrieval error appropriately
          return throwError(() => new Error('Failed to load buyers'));
        })
      );
  }

  getBuyers(): Observable<BuyerResponse[]> {
    return this.http.get<BuyerResponse[]>(`${this.apiUrl}/buyers`).pipe(
      tap((data) => {
        // Handle successful buyers retrieval
      }),
      catchError((err) => {
        // Handle buyers retrieval error appropriately
        return throwError(() => new Error('Failed to load buyers'));
      })
    );
  }
}
