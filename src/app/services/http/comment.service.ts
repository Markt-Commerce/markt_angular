import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, throwError } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import { Comment } from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);

  createComment(commentData: Comment): Observable<Comment> {
    return this.http
      .post<Comment>(ApiStore.mergeEndpoint('comments', 'new'), commentData)
      .pipe(
        tap((data) => {
          // Handle successful comment creation
        }),
        retry(3),
        catchError((err) => {
          // Handle comment creation error appropriately
          return throwError(() => new Error('Failed to create comment'));
        })
      );
  }

  createRateAndComment(commentData: Comment): Observable<Comment> {
    return this.http
      .post<Comment>(
        ApiStore.mergeEndpoint('comments', 'rate_and_comment'),
        commentData
      )
      .pipe(
        tap((data) => {
          // Handle successful rate and comment creation
        }),
        retry(3),
        catchError((err) => {
          // Handle rate and comment creation error appropriately
          return throwError(
            () => new Error('Failed to create rate and comment')
          );
        })
      );
  }

  getProductComments(productId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(ApiStore.mergeEndpoint('comments', productId))
      .pipe(
        tap((data) => {
          // Handle successful comments retrieval
        }),
        retry(3),
        catchError((err) => {
          // Handle comments retrieval error appropriately
          return throwError(() => new Error('Failed to load comments'));
        })
      );
  }

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments`).pipe(
      tap((data) => {
        // Handle successful comments retrieval
      }),
      retry(3),
      catchError((err) => {
        // Handle comments retrieval error appropriately
        return throwError(() => new Error('Failed to load comments'));
      })
    );
  }

  getCommentById(commentId: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/comments/${commentId}`).pipe(
      tap((data) => {
        // Handle successful comment retrieval
      }),
      retry(3),
      catchError((err) => {
        // Handle comment retrieval error appropriately
        return throwError(() => new Error('Failed to load comment details'));
      })
    );
  }

  updateComment(commentId: string, commentData: any): Observable<Comment> {
    return this.http
      .put<Comment>(`${this.apiUrl}/comments/${commentId}`, commentData)
      .pipe(
        tap((data) => {
          // Handle successful comment update
        }),
        retry(3),
        catchError((err) => {
          // Handle comment update error appropriately
          return throwError(() => new Error('Failed to update comment'));
        })
      );
  }

  removeComment(commentId: string): Observable<any> {
    return this.http.delete(ApiStore.mergeEndpoint('comments', commentId)).pipe(
      tap((data) => {
        // Handle successful comment removal
      }),
      retry(3),
      catchError((err) => {
        // Handle comment removal error appropriately
        return throwError(() => new Error('Failed to remove comment'));
      })
    );
  }
}
