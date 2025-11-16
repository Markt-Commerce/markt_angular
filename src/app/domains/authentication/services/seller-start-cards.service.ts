/**
 * Seller Start Cards Service
 * 
 * Business logic layer for seller onboarding/start cards operations.
 */

import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SellerStartCardsRepository } from '../repositories/seller-start-cards.repository';
import { StartCardsResponse } from '../models/seller-start-cards.model';

@Injectable({
  providedIn: 'root'
})
export class SellerStartCardsService {
  private startCardsRepository = inject(SellerStartCardsRepository);

  private readonly startCardsSignal = signal<StartCardsResponse | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  private readonly startCardsState = this.startCardsSignal.asReadonly();
  private readonly loadingState = this.loadingSignal.asReadonly();
  private readonly errorState = this.errorSignal.asReadonly();

  readonly startCards$ = toObservable(this.startCardsState);
  readonly isLoading$ = toObservable(this.loadingState);
  readonly error$ = toObservable(this.errorState);

  /**
   * Get seller start cards
   */
  getStartCards(): Observable<StartCardsResponse> {
    this.startLoading();
    return this.startCardsRepository.getStartCards().pipe(
      tap((response) => this.startCardsSignal.set(response)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  /**
   * Get start cards snapshot
   */
  getStartCardsSnapshot(): StartCardsResponse | null {
    return this.startCardsSignal();
  }

  private handleError(error: unknown): Observable<never> {
    const message =
      error instanceof Error ? error.message : 'Unable to complete request';
    this.errorSignal.set(message);
    return throwError(() => new Error(message));
  }

  private startLoading(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  private stopLoading(): void {
    this.loadingSignal.set(false);
  }
}

