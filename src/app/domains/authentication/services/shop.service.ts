/**
 * Shop Service
 * 
 * Business logic layer for shop discovery operations.
 */

import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import type { PaginatedResponse } from '../../../core/infrastructure/http/api-response.types';
import { ShopRepository } from '../repositories/shop.repository';
import { Shop, ShopDetail, ShopCategory } from '../models/shop.model';
import { ShopSearchParamsDto } from '../models/user.dto';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private shopRepository = inject(ShopRepository);

  private readonly shopsSignal = signal<PaginatedResponse<Shop> | null>(null);
  private readonly trendingShopsSignal = signal<Shop[]>([]);
  private readonly selectedShopSignal = signal<ShopDetail | null>(null);
  private readonly categoriesSignal = signal<ShopCategory[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  private readonly shopsState = this.shopsSignal.asReadonly();
  private readonly trendingShopsState = this.trendingShopsSignal.asReadonly();
  private readonly selectedShopState = this.selectedShopSignal.asReadonly();
  private readonly categoriesState = this.categoriesSignal.asReadonly();
  private readonly loadingState = this.loadingSignal.asReadonly();
  private readonly errorState = this.errorSignal.asReadonly();

  readonly shops$ = toObservable(this.shopsState);
  readonly trendingShops$ = toObservable(this.trendingShopsState);
  readonly selectedShop$ = toObservable(this.selectedShopState);
  readonly categories$ = toObservable(this.categoriesState);
  readonly isLoading$ = toObservable(this.loadingState);
  readonly error$ = toObservable(this.errorState);

  /**
   * Search shops with filters
   */
  searchShops(params?: ShopSearchParamsDto): Observable<PaginatedResponse<Shop>> {
    this.startLoading();
    return this.shopRepository.searchShops(params).pipe(
      tap((result) => this.shopsSignal.set(result)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  /**
   * Get shops snapshot
   */
  getShopsSnapshot(): PaginatedResponse<Shop> | null {
    return this.shopsSignal();
  }

  /**
   * Get trending shops
   */
  getTrendingShops(limit: number = 10): Observable<Shop[]> {
    this.startLoading();
    return this.shopRepository.getTrendingShops(limit).pipe(
      tap((shops) => this.trendingShopsSignal.set(shops)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  /**
   * Get trending shops snapshot
   */
  getTrendingShopsSnapshot(): Shop[] {
    return this.trendingShopsSignal();
  }

  /**
   * Get shop categories
   */
  getShopCategories(): Observable<ShopCategory[]> {
    return this.shopRepository.getShopCategories().pipe(
      tap((categories) => this.categoriesSignal.set(categories)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Get categories snapshot
   */
  getCategoriesSnapshot(): ShopCategory[] {
    return this.categoriesSignal();
  }

  /**
   * Get shop details
   */
  getShopDetails(shopId: number): Observable<ShopDetail> {
    this.startLoading();
    return this.shopRepository.getShopDetails(shopId).pipe(
      tap((shop) => this.selectedShopSignal.set(shop)),
      catchError((error) => this.handleError(error)),
      finalize(() => this.stopLoading())
    );
  }

  /**
   * Get selected shop snapshot
   */
  getSelectedShopSnapshot(): ShopDetail | null {
    return this.selectedShopSignal();
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

