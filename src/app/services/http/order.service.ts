import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiStore } from '../apiSpecificData';
import { ClassicResponse, Order } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = ApiStore.apiUrl;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      tap((data) => {
        // Handle successful orders retrieval
      }),
      catchError((err) => {
        // Handle orders retrieval error appropriately
        return throwError(() => new Error('Failed to load orders'));
      })
    );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`).pipe(
      tap((data) => {
        // Handle successful order retrieval
      }),
      catchError((err) => {
        // Handle order retrieval error appropriately
        return throwError(() => new Error('Failed to load order details'));
      })
    );
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData).pipe(
      tap((data) => {
        // Handle successful order creation
      }),
      catchError((err) => {
        // Handle order creation error appropriately
        return throwError(() => new Error('Failed to create order'));
      })
    );
  }

  getSellerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/seller/orders`).pipe(
      tap((data) => {
        // Handle successful seller orders retrieval
      }),
      catchError((err) => {
        // Handle seller orders retrieval error appropriately
        return throwError(() => new Error('Failed to load seller orders'));
      })
    );
  }

  cancelOrder(orderId: string): Observable<ClassicResponse> {
    return this.http
      .put<ClassicResponse>(`${this.apiUrl}/orders/${orderId}/cancel`, {})
      .pipe(
        tap((data) => {
          // Handle successful order cancellation
        }),
        catchError((err) => {
          // Handle order cancellation error appropriately
          return throwError(() => new Error('Failed to cancel order'));
        })
      );
  }

  updateOrderStatus(
    orderId: string,
    status: string
  ): Observable<ClassicResponse> {
    return this.http
      .put<ClassicResponse>(`${this.apiUrl}/orders/${orderId}/status`, {
        status,
      })
      .pipe(
        tap((data) => {
          // Handle successful status update
        }),
        catchError((err) => {
          // Handle status update error appropriately
          return throwError(() => new Error('Failed to update order status'));
        })
      );
  }

  getOrdersByStatus(
    userType: 'buyer' | 'seller',
    status: string
  ): Observable<Order[]> {
    return this.http
      .get<Order[]>(`${this.apiUrl}/orders/${userType}/${status}`)
      .pipe(
        tap((data) => {
          // Handle successful status-based orders retrieval
        }),
        catchError((err) => {
          // Handle status-based orders retrieval error appropriately
          return throwError(() => new Error(`Failed to load ${status} orders`));
        })
      );
  }
}
