import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CategoryProductsDto } from '../models/category.dto';
import {
  Category,
  CategorySummary,
  CategoryTreeNode,
  Tag,
} from '../models/category.model';
import {
  CategoryProductsParams,
  CategoryRepository,
} from '../repositories/category.repository';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly categoryRepository = inject(CategoryRepository);

  private readonly categoryTreeSubject = new BehaviorSubject<
    CategoryTreeNode[] | null
  >(null);

  readonly categoryTree$ = this.categoryTreeSubject.asObservable();

  getCategoryTree(refresh = false): Observable<CategoryTreeNode[]> {
    if (!refresh) {
      const snapshot = this.categoryTreeSubject.value;
      if (snapshot && snapshot.length > 0) {
        return of(snapshot);
      }
    }

    return this.categoryRepository
      .getCategoryTree()
      .pipe(tap((tree) => this.categoryTreeSubject.next(tree)));
  }

  getCategorySummaries(refresh = false): Observable<CategorySummary[]> {
    return this.getCategoryTree(refresh).pipe(
      map((tree) => this.categoryRepository.buildSummariesFromTree(tree))
    );
  }

  getAllCategories(refresh = false): Observable<Category[]> {
    return this.getCategoryTree(refresh).pipe(
      map((tree) => tree.flatMap((node) => node.flatten()))
    );
  }

  getCategory(categoryId: number): Observable<Category> {
    return this.categoryRepository.getCategory(categoryId);
  }

  getCategoryProducts(
    categoryId: number,
    params?: CategoryProductsParams
  ): Observable<CategoryProductsDto> {
    return this.categoryRepository.getCategoryProducts(categoryId, params);
  }

  getPopularTags(): Observable<Tag[]> {
    return this.categoryRepository.getPopularTags();
  }

  createCategory(payload: Parameters<CategoryRepository['createCategory']>[0]) {
    return this.categoryRepository
      .createCategory(payload)
      .pipe(tap(() => this.refreshCategoryTree()));
  }

  updateCategory(
    categoryId: number,
    payload: Parameters<CategoryRepository['updateCategory']>[1]
  ) {
    return this.categoryRepository
      .updateCategory(categoryId, payload)
      .pipe(tap(() => this.refreshCategoryTree()));
  }

  createTag(payload: Parameters<CategoryRepository['createTag']>[0]) {
    return this.categoryRepository.createTag(payload);
  }

  private refreshCategoryTree(): void {
    this.categoryRepository
      .getCategoryTree()
      .pipe(tap((tree) => this.categoryTreeSubject.next(tree)))
      .subscribe({
        error: () => {
          // Silently ignore refresh errors to avoid breaking the calling stream
        },
      });
  }
}
