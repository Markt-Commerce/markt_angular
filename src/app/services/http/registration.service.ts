import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import {
  ClassicResponse,
  BuyerRegister,
  SellerRegister,
} from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  http = inject(HttpClient);

  registerBuyer(buyerData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/register/buyer`, buyerData)
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

  registerSeller(sellerData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/register/seller`, sellerData)
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
}
