import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiStore } from '../apiSpecificData';
import { ClassicResponse, Cart } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = ApiStore.apiUrl;

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart`).pipe(
      tap((data) => {
        // Handle successful cart retrieval
      }),
      catchError((err) => {
        // Handle cart retrieval error appropriately
        return throwError(() => new Error('Failed to load cart'));
      })
    );
  }

  addToCart(productId: string, quantity: number): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.apiUrl}/cart/add`, { productId, quantity })
      .pipe(
        tap((data) => {
          // Handle successful add to cart
        }),
        catchError((err) => {
          // Handle add to cart error appropriately
          return throwError(() => new Error('Failed to add item to cart'));
        })
      );
  }

  removeFromCart(productId: string): Observable<ClassicResponse> {
    return this.http
      .delete<ClassicResponse>(`${this.apiUrl}/cart/${productId}`)
      .pipe(
        tap((data) => {
          // Handle successful cart removal
        }),
        catchError((err) => {
          // Handle cart removal error appropriately
          return throwError(() => new Error('Failed to remove item from cart'));
        })
      );
  }
}
