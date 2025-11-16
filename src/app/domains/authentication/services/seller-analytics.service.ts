/**
 * Seller Analytics Service
 * 
 * Business logic layer for seller analytics operations.
 */

import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SellerAnalyticsRepository } from '../repositories/seller-analytics.repository';
import {
  SellerAnalyticsOverview,
  SellerAnalyticsTimeseries
} from '../models/seller-analytics.model';
import {
  SellerAnalyticsOverviewQueryDto,
  SellerAnalyticsTimeseriesQueryDto
} from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class SellerAnalyticsService {
  private analyticsRepository = inject(SellerAnalyticsRepository);

  private readonly overviewSignal = signal<SellerAnalyticsOverview | null>(null);
  private readonly timeseriesSignal = signal<SellerAnalyticsTimeseries | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  private readonly overviewState = this.overviewSignal.asReadonly();
  private readonly timeseriesState = this.timeseriesSignal.asReadonly();
  private readonly loadingState = this.loadingSignal.asReadonly();
  private readonly errorState = this.errorSignal.asReadonly();

  readonly overview$ = toObservable(this.overviewState);
  readonly timeseries$ = toObservable(this.timeseriesState);
  readonly isLoading$ = toObservable(this.loadingState);
  readonly error$ = toObservable(this.errorState);

  /**
   * Get analytics overview
   */
  getAnalyticsOverview(params?: SellerAnalyticsOverviewQueryDto): Observable<SellerAnalyticsOverview> {
    this.startLoading();
    return this.analyticsRepository.getAnalyticsOverview(params).pipe(
      tap((overview) => this.overviewSignal.set(overview)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  /**
   * Get analytics overview snapshot
   */
  getAnalyticsOverviewSnapshot(): SellerAnalyticsOverview | null {
    return this.overviewSignal();
  }

  /**
   * Get analytics timeseries
   */
  getAnalyticsTimeseries(params: SellerAnalyticsTimeseriesQueryDto): Observable<SellerAnalyticsTimeseries> {
    this.startLoading();
    return this.analyticsRepository.getAnalyticsTimeseries(params).pipe(
      tap((timeseries) => this.timeseriesSignal.set(timeseries)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  /**
   * Get analytics timeseries snapshot
   */
  getAnalyticsTimeseriesSnapshot(): SellerAnalyticsTimeseries | null {
    return this.timeseriesSignal();
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

