import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { ClassicResponse, Product } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`).pipe(
      tap((data) => {
        // Handle successful products retrieval
      }),
      catchError((err) => {
        // Handle products retrieval error appropriately
        return throwError(() => new Error('Failed to load products'));
      })
    );
  }

  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`).pipe(
      tap((data) => {
        // Handle successful product retrieval
      }),
      catchError((err) => {
        // Handle product retrieval error appropriately
        return throwError(() => new Error('Failed to load product details'));
      })
    );
  }

  createProduct(productData: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, productData).pipe(
      tap((data) => {
        // Handle successful product creation
      }),
      catchError((err) => {
        // Handle product creation error appropriately
        return throwError(() => new Error('Failed to create product'));
      })
    );
  }

  deleteProduct(productId: string): Observable<HttpResponse<ClassicResponse>> {
    return this.http
      .delete<ClassicResponse>(ApiStore.mergeEndpoint('products', productId), {
        observe: 'response',
      })
      .pipe(
        tap((data) => {
          // Handle successful product deletion
        }),
        retry(3),
        catchError((err) => {
          // Handle product deletion error appropriately
          return throwError(() => new Error('Failed to delete product'));
        })
      );
  }
}
