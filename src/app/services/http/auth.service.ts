import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap } from 'rxjs';
import { ApiStore } from '../apiSpecificData';
import {
  ClassicResponse,
  UserLogin,
  UserLoginResponse,
} from '../../api/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {
    this.setCurrentUserId('buyer-123'); //  temporary mock ID
  }

  http = inject(HttpClient);

  // Signal to store current user ID
  private currentUserId = signal<string | null>(null);

  getCurrentUserId(): string | null {
    return this.currentUserId();
  }

  private setCurrentUserId(id: string) {
    this.currentUserId.set(id);
  }

  isAuthenticated(): boolean {
    return this.currentUserId() !== null;
  }

  authenticateUser(
    authData: UserLogin
  ): Observable<HttpResponse<UserLoginResponse>> {
    return this.http
      .post<UserLoginResponse>(
        ApiStore.mergeEndpoint('auth', 'login'),
        authData,
        {
          observe: 'response',
        }
      )
      .pipe(
        tap((response) => {
          const userId = response.body?.user_id;
          if (userId) {
            this.setCurrentUserId(userId); // Save logged-in user ID
          }
        }),
        retry(3),
        catchError((err) => {
          // Handle authentication error appropriately
          return EMPTY;
        })
      );
  }

  logoutUser(): Observable<HttpResponse<UserLoginResponse>> {
    return this.http
      .post<UserLoginResponse>(
        ApiStore.mergeEndpoint('auth', 'logout'),
        {},
        {
          observe: 'response',
        }
      )
      .pipe(
        retry(3),
        catchError((err) => {
          // Handle logout error appropriately
          return EMPTY;
        })
      );
  }

  switchRole(): Observable<HttpResponse<ClassicResponse>> {
    return this.http
      .post<ClassicResponse>(
        ApiStore.mergeEndpoint('auth', 'switch-role'),
        {},
        {
          observe: 'response',
        }
      )
      .pipe(
        retry(3),
        catchError((err) => {
          // Handle role switch error appropriately
          return EMPTY;
        })
      );
  }
}
