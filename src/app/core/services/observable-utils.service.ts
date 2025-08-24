import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap, filter, debounceTime, distinctUntilChanged, switchMap, retry } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { TypeSafetyService } from './type-safety.service';

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface SafeObservableConfig<T> {
  source: Observable<T>;
  loadingSetter?: (loading: boolean) => void;
  errorSetter?: (error: string | null) => void;
  successHandler?: (data: T) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ObservableUtilsService {
  constructor(
    private errorHandler: ErrorHandlerService,
    private typeSafety: TypeSafetyService
  ) {}

  /**
   * Creates a safe observable with proper error handling and loading states
   */
  createSafeObservable<T>(config: SafeObservableConfig<T>): Observable<T> {
    const { source, loadingSetter, errorSetter, successHandler, retryAttempts = 0, retryDelay = 1000 } = config;

    if (loadingSetter) {
      loadingSetter(true);
    }

    return source.pipe(
      retry(retryAttempts),
      tap((data) => {
        if (data && successHandler) {
          successHandler(data);
        }
        if (errorSetter) {
          errorSetter(null);
        }
      }),
      catchError((error) => {
        const errorMessage = this.errorHandler.extractErrorMessage(error);
        this.errorHandler.logError(error, 'Observable error');
        
        if (errorSetter) {
          errorSetter(errorMessage);
        }
        
        return of(null as T);
      }),
      finalize(() => {
        if (loadingSetter) {
          loadingSetter(false);
        }
      })
    );
  }

  /**
   * Creates a type-safe API response handler
   */
  handleTypedApiResponse<T>(
    source: Observable<any>,
    successHandler?: (data: T) => void,
    errorHandler?: (error: string | null) => void,
    loadingSetter?: (loading: boolean) => void
  ): Observable<T> {
    return this.createSafeObservable({
      source: source.pipe(
        map((response) => {
          const apiResponse = this.typeSafety.createApiResponse<T>(response);
          return apiResponse.data as T;
        })
      ),
      successHandler,
      errorSetter: errorHandler,
      loadingSetter
    });
  }

  /**
   * Creates a debounced search observable
   */
  createDebouncedSearch<T>(
    source: Observable<string>,
    searchFn: (query: string) => Observable<T>,
    debounceMs: number = 300,
    minLength: number = 2
  ): Observable<T> {
    return source.pipe(
      map((query: string) => query.trim()),
      filter((query: string) => query.length >= minLength),
      debounceTime(debounceMs),
      distinctUntilChanged(),
      switchMap((query: string) => searchFn(query))
    );
  }

  /**
   * Creates a safe subscription with automatic cleanup
   */
  createSafeSubscription<T>(
    source: Observable<T>,
    next: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ) {
    return source.pipe(
      catchError((err) => {
        const errorMessage = this.errorHandler.extractErrorMessage(err);
        this.errorHandler.logError(err, 'Subscription error');
        
        if (error) {
          error(err);
        }
        
        return of(null as T);
      })
    ).subscribe({
      next: (value) => {
        if (value !== null) {
          next(value);
        }
      },
      error,
      complete
    });
  }

  /**
   * Creates a retry mechanism for failed requests
   */
  createRetryObservable<T>(
    source: Observable<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Observable<T> {
    return source.pipe(
      retry({
        count: maxRetries,
        delay: delayMs,
        resetOnSuccess: true
      }),
      catchError((error) => {
        this.errorHandler.logError(error, `Request failed after ${maxRetries} retries`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Creates an observable that handles loading states
   */
  withLoadingState<T>(
    source: Observable<T>,
    loadingState: LoadingState
  ): Observable<T> {
    return source.pipe(
      tap(() => {
        loadingState.loading = true;
        loadingState.error = null;
      }),
      catchError((error) => {
        const errorMessage = this.errorHandler.extractErrorMessage(error);
        loadingState.error = errorMessage;
        this.errorHandler.logError(error, 'Loading state error');
        return of(null as T);
      }),
      finalize(() => {
        loadingState.loading = false;
      })
    );
  }

  /**
   * Creates an observable that handles pagination
   */
  withPagination<T>(
    source: Observable<any>,
    pageSetter: (page: number) => void,
    totalSetter: (total: number) => void
  ): Observable<T[]> {
    return source.pipe(
      map((response) => {
        const paginatedData = this.typeSafety.extractPaginatedData<T>(response);
        pageSetter(paginatedData.page);
        totalSetter(paginatedData.total);
        return paginatedData.items;
      })
    );
  }

  /**
   * Creates an observable that handles infinite scrolling
   */
  withInfiniteScroll<T>(
    source: Observable<any>,
    items: T[],
    appendItems: (newItems: T[]) => void
  ): Observable<T[]> {
    return source.pipe(
      map((response) => {
        const paginatedData = this.typeSafety.extractPaginatedData<T>(response);
        appendItems(paginatedData.items);
        return [...items, ...paginatedData.items];
      })
    );
  }

  /**
   * Creates an observable that handles optimistic updates
   */
  withOptimisticUpdate<T, U>(
    source: Observable<T>,
    optimisticData: U,
    updateFn: (data: U) => void,
    rollbackFn: () => void
  ): Observable<T> {
    // Apply optimistic update
    updateFn(optimisticData);

    return source.pipe(
      catchError((error) => {
        // Rollback on error
        rollbackFn();
        this.errorHandler.logError(error, 'Optimistic update failed');
        return throwError(() => error);
      })
    );
  }

  /**
   * Creates an observable that handles caching
   */
  withCache<T>(
    source: Observable<T>,
    cacheKey: string,
    cacheDuration: number = 5 * 60 * 1000 // 5 minutes
  ): Observable<T> {
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return source.pipe(
      tap((data) => {
        this.setCache(cacheKey, data, cacheDuration);
      })
    );
  }

  /**
   * Cache utilities
   */
  private getFromCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes
          return data;
        }
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  }

  private setCache<T>(key: string, data: T, duration: number): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        duration
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Creates an observable that handles polling
   */
  withPolling<T>(
    source: Observable<T>,
    interval: number = 30000 // 30 seconds
  ): Observable<T> {
    return source.pipe(
      switchMap((initialData) => {
        return new Observable<T>((observer) => {
          observer.next(initialData);
          
          const intervalId = setInterval(() => {
            source.subscribe({
              next: (data) => observer.next(data),
              error: (error) => observer.error(error)
            });
          }, interval);

          return () => clearInterval(intervalId);
        });
      })
    );
  }
}
