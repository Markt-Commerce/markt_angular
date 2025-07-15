import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { Favorite } from '../../api/models';
import { ClassicResponse } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private http = inject(HttpClient);
  private apiUrl = ApiStore.apiUrl;

  createFavorite(favoriteData: Favorite): Observable<Favorite> {
    return this.http
      .post<Favorite>(ApiStore.mergeEndpoint('favorites', 'new'), favoriteData)
      .pipe(
        tap((data) => {
          // Handle successful favorite addition
        }),
        catchError((err) => {
          // Handle favorite addition error appropriately
          return throwError(() => new Error('Failed to add to favorites'));
        })
      );
  }

  getBuyerFavorites(buyerId: string): Observable<Favorite[]> {
    return this.http
      .get<Favorite[]>(ApiStore.mergeEndpoint('favorites', 'buyer', buyerId))
      .pipe(
        tap((response) => {
          // Handle successful favorites retrieval
        }),
        catchError((err) => {
          // Handle favorites retrieval error appropriately
          return throwError(() => new Error('Failed to load favorites'));
        })
      );
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`).pipe(
      tap((response) => {
        // Handle successful favorites retrieval
      }),
      catchError((err) => {
        // Handle favorites retrieval error appropriately
        return throwError(() => new Error('Failed to load favorites'));
      })
    );
  }

  addToFavorites(productId: string): Observable<Favorite> {
    return this.http
      .post<Favorite>(`${this.apiUrl}/favorites`, { productId })
      .pipe(
        tap((data) => {
          // Handle successful favorite addition
        }),
        catchError((err) => {
          // Handle favorite addition error appropriately
          return throwError(() => new Error('Failed to add to favorites'));
        })
      );
  }

  removeFromFavorites(productId: string): Observable<ClassicResponse> {
    return this.http
      .delete<ClassicResponse>(`${this.apiUrl}/favorites/${productId}`)
      .pipe(
        tap((data) => {
          // Handle successful favorite removal
        }),
        catchError((err) => {
          // Handle favorite removal error appropriately
          return throwError(() => new Error('Failed to remove from favorites'));
        })
      );
  }
}
