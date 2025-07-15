import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import {
  BuyerRegister,
  SellerRegister,
  BuyerResponse,
  SellerResponse,
} from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  registerBuyer(
    registerData: BuyerRegister
  ): Observable<HttpResponse<BuyerResponse>> {
    return this.http
      .post<BuyerResponse>(
        ApiStore.mergeEndpoint('auth', 'register', 'buyer'),
        registerData,
        { observe: 'response' }
      )
      .pipe(
        tap((data) => {
          // Handle successful buyer registration
        }),
        retry(3),
        catchError((err) => {
          // Handle buyer registration error appropriately
          return throwError(() => new Error('Failed to register buyer'));
        })
      );
  }

  registerSeller(
    registerData: SellerRegister
  ): Observable<HttpResponse<SellerResponse>> {
    return this.http
      .post<SellerResponse>(
        ApiStore.mergeEndpoint('auth', 'register', 'seller'),
        registerData,
        { observe: 'response' }
      )
      .pipe(
        tap((data) => {
          // Handle successful seller registration
        }),
        retry(3),
        catchError((err) => {
          // Handle seller registration error appropriately
          return throwError(() => new Error('Failed to register seller'));
        })
      );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      tap((data) => {
        // Handle successful users retrieval
      }),
      catchError((err) => {
        // Handle users retrieval error appropriately
        return throwError(() => new Error('Failed to load users'));
      })
    );
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
      tap((data) => {
        // Handle successful user retrieval
      }),
      catchError((err) => {
        // Handle user retrieval error appropriately
        return throwError(() => new Error('Failed to load user details'));
      })
    );
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      tap((data) => {
        // Handle successful user update
      }),
      catchError((err) => {
        // Handle user update error appropriately
        return throwError(() => new Error('Failed to update user'));
      })
    );
  }
}
