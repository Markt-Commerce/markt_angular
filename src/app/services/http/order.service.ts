import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { ClassicResponse, Order } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  
  createOrder(order: Order): Observable<HttpResponse<ClassicResponse>> {
    return this.http
      .post<ClassicResponse>(ApiStore.mergeEndpoint('orders', 'new'), order, {
        observe: 'response',
      })
      .pipe(
        tap((data) => console.log(data)),
        retry(3),
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
  }

  getBuyerOrders(buyerId: string): Observable<Order[]> {
    return this.http
      .get<Order[]>(ApiStore.mergeEndpoint('orders', 'buyers', buyerId))
      .pipe(
        tap((data) => console.log(data)),
        retry(3),
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
  }

  getSellerAcceptedOrders(sellerId: string): Observable<Order[]> {
    return this.http
      .get<Order[]>(
        ApiStore.mergeEndpoint('orders', 'sellers', 'accepted', sellerId)
      )
      .pipe(
        tap((data) => console.log(data)),
        retry(3),
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
  }

  // NEW METHODS 

  // Get single order details
  getOrderById(orderId: string): Observable<Order> {
    return this.http
      .get<Order>(ApiStore.mergeEndpoint('orders', orderId))
      .pipe(
        tap((data) => console.log('Order details:', data)),
        retry(3),
        catchError((err) => {
          console.error('Error getting order details:', err);
          return EMPTY;
        })
      );
  }

  // Get all seller orders (not just accepted)
  getSellerOrders(sellerId: string): Observable<Order[]> {
    return this.http
      .get<Order[]>(ApiStore.mergeEndpoint('orders', 'sellers', sellerId))
      .pipe(
        tap((data) => console.log('All seller orders:', data)),
        retry(3),
        catchError((err) => {
          console.error('Error getting seller orders:', err);
          return EMPTY;
        })
      );
  }

  // Cancel order (for buyers)
  cancelOrder(orderId: string): Observable<HttpResponse<ClassicResponse>> {
    return this.http
      .patch<ClassicResponse>(
        ApiStore.mergeEndpoint('orders', orderId, 'cancel'),
        {},
        { observe: 'response' }
      )
      .pipe(
        tap((data) => console.log('Order cancelled:', data)),
        retry(3),
        catchError((err) => {
          console.error('Error cancelling order:', err);
          return EMPTY;
        })
      );
  }

  // Update order status (for sellers)
  updateOrderStatus(orderId: string, status: string): Observable<HttpResponse<ClassicResponse>> {
    return this.http
      .patch<ClassicResponse>(
        ApiStore.mergeEndpoint('orders', orderId, 'status'),
        { status },
        { observe: 'response' }
      )
      .pipe(
        tap((data) => console.log('Order status updated:', data)),
        retry(3),
        catchError((err) => {
          console.error('Error updating order status:', err);
          return EMPTY;
        })
      );
  }

  // Get orders by status (useful for filtering)
  getOrdersByStatus(userId: string, status: string, userType: 'buyer' | 'seller'): Observable<Order[]> {
    const endpoint = userType === 'buyer' 
      ? ApiStore.mergeEndpoint('orders', 'buyers', userId, 'status', status)
      : ApiStore.mergeEndpoint('orders', 'sellers', userId, 'status', status);
    
    return this.http
      .get<Order[]>(endpoint)
      .pipe(
        tap((data) => console.log(`${userType} orders with status ${status}:`, data)),
        retry(3),
        catchError((err) => {
          console.error(`Error getting ${status} orders:`, err);
          return EMPTY;
        })
      );
  }
}

