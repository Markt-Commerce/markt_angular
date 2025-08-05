import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: number;
  category_name: string;
  seller_id: number;
  seller_name: string;
  seller_avatar?: string;
  images: string[];
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  tags: string[];
  is_negotiable: boolean;
  is_featured: boolean;
  is_verified: boolean;
  is_favorited?: boolean;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  products_count: number;
}

export interface SearchFilters {
  query?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  condition?: 'new' | 'used' | 'refurbished';
  location?: string;
  is_negotiable?: boolean;
  is_featured?: boolean;
  sort_by?: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'oldest' | 'popular';
  page?: number;
  per_page?: number;
  [key: string]: unknown;
}

export interface ProductCreateRequest {
  title: string;
  description: string;
  price: number;
  category_id: number;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  tags?: string[];
  is_negotiable?: boolean;
  images?: File[];
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private apiService = inject(ApiService);
  
  // BehaviorSubjects for state management
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private searchFiltersSubject = new BehaviorSubject<SearchFilters>({});
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private totalProductsSubject = new BehaviorSubject<number>(0);
  private currentProductSubject = new BehaviorSubject<Product | null>(null);
  private relatedProductsSubject = new BehaviorSubject<Product[]>([]);

  // Public observables
  public products$ = this.productsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public searchFilters$ = this.searchFiltersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public totalProducts$ = this.totalProductsSubject.asObservable();
  public currentProduct$ = this.currentProductSubject.asObservable();
  public relatedProducts$ = this.relatedProductsSubject.asObservable();

  constructor() {
    this.loadCategories();
  }

  /**
   * Get all products with optional filters
   */
  getProducts(filters: SearchFilters = {}): Observable<PaginatedResponse<Product>> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<PaginatedResponse<Product>>('/products', filters).pipe(
      tap(response => {
        if (response.data) {
          this.productsSubject.next(response.data.data || []);
          this.totalProductsSubject.next(response.data.pagination?.total || 0);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: number): Observable<Product> {
    this.loadingSubject.next(true);
    
    return this.apiService.get<Product>(`/products/${id}`).pipe(
      tap(response => {
        if (response.data) {
          this.currentProductSubject.next(response.data);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Search products
   */
  searchProducts(filters: SearchFilters): Observable<PaginatedResponse<Product>> {
    this.searchFiltersSubject.next(filters);
    return this.getProducts(filters);
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: number, filters: SearchFilters = {}): Observable<PaginatedResponse<Product>> {
    const categoryFilters = { ...filters, category_id: categoryId };
    return this.getProducts(categoryFilters);
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit = 10): Observable<Product[]> {
    return this.apiService.get<Product[]>('/products/featured', { limit }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get trending products
   */
  getTrendingProducts(limit = 10): Observable<Product[]> {
    return this.apiService.get<Product[]>('/products/trending', { limit }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get products by seller
   */
  getProductsBySeller(sellerId: number, filters: SearchFilters = {}): Observable<PaginatedResponse<Product>> {
    const sellerFilters = { ...filters, seller_id: sellerId };
    return this.getProducts(sellerFilters);
  }

  /**
   * Create a new product
   */
  createProduct(productData: ProductCreateRequest): Observable<Product> {
    this.loadingSubject.next(true);
    
    return this.apiService.post<Product>('/products', productData).pipe(
      tap(response => {
        if (response.data) {
          const currentProducts = this.productsSubject.value;
          this.productsSubject.next([response.data, ...currentProducts]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Update a product
   */
  updateProduct(productData: ProductUpdateRequest): Observable<Product> {
    this.loadingSubject.next(true);
    
    return this.apiService.put<Product>(`/products/${productData.id}`, productData).pipe(
      tap(response => {
        if (response.data) {
          const currentProducts = this.productsSubject.value;
          const updatedProducts = currentProducts.map(product => 
            product.id === productData.id ? response.data! : product
          );
          this.productsSubject.next(updatedProducts);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      }),
      map(response => response.data!)
    );
  }

  /**
   * Delete a product
   */
  deleteProduct(productId: number): Observable<any> {
    this.loadingSubject.next(true);
    
    return this.apiService.delete<any>(`/products/${productId}`).pipe(
      tap(() => {
        const currentProducts = this.productsSubject.value;
        const filteredProducts = currentProducts.filter(product => product.id !== productId);
        this.productsSubject.next(filteredProducts);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload product images
   */
  uploadProductImages(productId: number, images: File[]): Observable<string[]> {
    return this.apiService.uploadMultiple<string[]>(`/products/${productId}/images`, images).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('/categories').pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Load categories into state
   */
  private loadCategories(): void {
    this.getCategories().subscribe(categories => {
      this.categoriesSubject.next(categories);
    });
  }

  /**
   * Get category by ID
   */
  getCategory(id: number): Observable<Category> {
    return this.apiService.get<Category>(`/categories/${id}`).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Get subcategories
   */
  getSubcategories(parentId: number): Observable<Category[]> {
    return this.apiService.get<Category[]>(`/categories/${parentId}/subcategories`).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Add product to favorites
   */
  addToFavorites(productId: number): Observable<any> {
    return this.apiService.post<any>(`/products/${productId}/favorite`);
  }

  /**
   * Remove product from favorites
   */
  removeFromFavorites(productId: number): Observable<any> {
    return this.apiService.delete<any>(`/products/${productId}/favorite`);
  }

  /**
   * Get user's favorite products
   */
  getFavoriteProducts(filters: SearchFilters = {}): Observable<PaginatedResponse<Product>> {
    return this.apiService.get<PaginatedResponse<Product>>('/products/favorites', filters).pipe(
      map(response => response.data || { 
        data: [], 
        pagination: { page: 1, per_page: 10, total: 0, total_pages: 0 },
        message: '',
        success: true
      })
    );
  }

  /**
   * Increment product view count
   */
  incrementViewCount(productId: number): Observable<any> {
    return this.apiService.post<any>(`/products/${productId}/view`);
  }

  /**
   * Get related products
   */
  getRelatedProducts(productId: number, limit = 6): Observable<Product[]> {
    return this.apiService.get<Product[]>(`/products/${productId}/related`, { limit }).pipe(
      tap(response => {
        if (response.data) {
          this.relatedProductsSubject.next(response.data);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      }),
      map(response => response.data || [])
    );
  }

  /**
   * Get current search filters
   */
  get currentFilters(): SearchFilters {
    return this.searchFiltersSubject.value;
  }

  /**
   * Update search filters
   */
  updateFilters(filters: Partial<SearchFilters>): void {
    const currentFilters = this.searchFiltersSubject.value;
    this.searchFiltersSubject.next({ ...currentFilters, ...filters });
  }

  /**
   * Clear search filters
   */
  clearFilters(): void {
    this.searchFiltersSubject.next({});
  }

  /**
   * Get current products
   */
  get currentProducts(): Product[] {
    return this.productsSubject.value;
  }

  /**
   * Get current categories
   */
  get currentCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get total products count
   */
  get totalProducts(): number {
    return this.totalProductsSubject.value;
  }
} 