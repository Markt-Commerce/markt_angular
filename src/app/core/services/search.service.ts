import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { Product, User, BuyerRequest, PaginatedResponse } from '../models';
import { tap, map } from 'rxjs/operators';

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: {
    products: Product[];
    users: User[];
    requests: BuyerRequest[];
  };
  isLoading: boolean;
  error: string | null;
  totalResults: number;
}

export interface SearchFilters {
  category_ids?: number[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  status?: string;
  seller_id?: number;
  tags?: string[];
  sort_by?: 'relevance' | 'price' | 'rating' | 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface SearchParams {
  query: string;
  filters?: SearchFilters;
}

export interface ProductSearchParams {
  query: string;
  category_ids?: number[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface RequestSearchParams {
  query: string;
  category_ids?: number[];
  budget_min?: number;
  budget_max?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface GlobalSearchResponse {
  products?: Product[];
  users?: User[];
  requests?: BuyerRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiService = inject(ApiService);

  private searchQuerySubject = new BehaviorSubject<string>('');
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Search users
   */
  searchUsers(query: string, filters?: SearchFilters): Observable<PaginatedResponse<User>> {
    return this.apiService.searchUsers(query, filters).pipe(
      map(response => ({
        items: response.data?.items || [],
        pagination: response.data?.pagination || { page: 1, limit: 10, total: 0 }
      }))
    );
  }

  searchProducts(params: ProductSearchParams): Observable<PaginatedResponse<Product>> {
    return this.apiService.searchProducts(params.query, params).pipe(
      map(response => ({
        items: response.data?.items || [],
        pagination: response.data?.pagination || { page: 1, limit: 10, total: 0 }
      }))
    );
  }

  searchRequests(params: RequestSearchParams): Observable<PaginatedResponse<BuyerRequest>> {
    return this.apiService.searchRequests(params.query, params).pipe(
      map(response => ({
        items: response.data?.items || [],
        pagination: response.data?.pagination || { page: 1, limit: 10, total: 0 }
      }))
    );
  }

  searchAll(query: string, filters?: SearchFilters): Observable<{
    products: Product[];
    users: User[];
    requests: BuyerRequest[];
  }> {
    const productParams: ProductSearchParams = { query, ...filters };
    const requestParams: RequestSearchParams = { query, ...filters };
    
    return forkJoin({
      products: this.searchProducts(productParams),
      users: this.searchUsers(query, filters),
      requests: this.searchRequests(requestParams)
    }).pipe(
      map(response => ({
        products: response.products.items || [],
        users: response.users.items || [],
        requests: response.requests.items || []
      }))
    );
  }

  /**
   * Get search query observable
   */
  getSearchQuery$(): Observable<string> {
    return this.searchQuerySubject.asObservable();
  }

  /**
   * Set search query
   */
  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  /**
   * Get loading state
   */
  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Search all content
   */
  search(params: SearchParams): Observable<{
    products: Product[];
    users: User[];
    requests: BuyerRequest[];
  }> {
    this.loadingSubject.next(true);
    return this.searchAll(params.query, params.filters).pipe(
      tap(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Get search suggestions
   */
  getSuggestions(query: string): Observable<string[]> {
    // Use global search to get suggestions
    return this.apiService.globalSearch(query, { limit: 5 }).pipe(
      map(response => {
        const suggestions: string[] = [];
        const data = response.data as GlobalSearchResponse;
        
        if (data?.products) {
          suggestions.push(...data.products.map(product => product.name));
        }
        if (data?.users) {
          suggestions.push(...data.users.map(user => user.username));
        }
        return suggestions.slice(0, 5);
      })
    );
  }
} 