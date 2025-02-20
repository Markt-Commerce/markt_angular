import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { Category } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);

  getProductCategories(): Observable<Category[]> {
    return this.http.get<any[]>(ApiStore.mergeEndpoint('categories','categorynames')).pipe(
      tap((data) => console.log(data)),
      retry(3),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );
  }

  getProductCategoriesAndTags(): Observable<Category[]> {
    return this.http.get<any[]>(ApiStore.mergeEndpoint('categories','all')).pipe(
      tap((data) => console.log(data)),
      retry(3),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );
  }

  getProductTags(): Observable<Category[]> {
    return this.http.get<any[]>(ApiStore.mergeEndpoint('categories','tags')).pipe(
      tap((data) => console.log(data)),
      retry(3),
      catchError((err) => {
        console.error(err);
        return EMPTY;
      })
    );
  }
}
