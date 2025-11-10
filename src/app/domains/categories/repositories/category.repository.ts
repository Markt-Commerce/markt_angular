import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ApiResponse } from '../../../core/infrastructure/http/api-response.types';
import {
  CategoryCreateDto,
  CategoryDto,
  CategoryProductsDto,
  CategoryTreeDto,
  TagCreateDto,
  TagDto,
} from '../models/category.dto';
import {
  Category,
  CategorySummary,
  CategoryTreeNode,
  Tag,
  mapCategoryDtoToModel,
  mapCategoryTreeDtoToNode,
  mapTagDtoToModel,
} from '../models/category.model';

export interface CategoryProductsParams {
  page?: number;
  per_page?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryRepository {
  private readonly apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/categories';

  getCategoryTree(): Observable<CategoryTreeNode[]> {
    return this.apiClient
      .get<CategoryTreeDto[]>(`${this.baseEndpoint}/`)
      .pipe(
        map((response: ApiResponse<CategoryTreeDto[]>) =>
          (response.data ?? []).map((node) => mapCategoryTreeDtoToNode(node))
        )
      );
  }

  getCategory(categoryId: number): Observable<Category> {
    return this.apiClient
      .get<CategoryDto>(`${this.baseEndpoint}/${categoryId}`)
      .pipe(
        map((response: ApiResponse<CategoryDto>) =>
          mapCategoryDtoToModel(response.data)
        )
      );
  }

  createCategory(payload: CategoryCreateDto): Observable<Category> {
    return this.apiClient
      .post<CategoryDto>(`${this.baseEndpoint}/`, payload)
      .pipe(
        map((response: ApiResponse<CategoryDto>) =>
          mapCategoryDtoToModel(response.data)
        )
      );
  }

  updateCategory(
    categoryId: number,
    payload: CategoryCreateDto
  ): Observable<Category> {
    return this.apiClient
      .put<CategoryDto>(`${this.baseEndpoint}/${categoryId}`, payload)
      .pipe(
        map((response: ApiResponse<CategoryDto>) =>
          mapCategoryDtoToModel(response.data)
        )
      );
  }

  getCategoryProducts(
    categoryId: number,
    params?: CategoryProductsParams
  ): Observable<CategoryProductsDto> {
    const query: Record<string, unknown> | undefined = params
      ? {
          ...(params.page !== undefined ? { page: params.page } : {}),
          ...(params.per_page !== undefined
            ? { per_page: params.per_page }
            : {}),
        }
      : undefined;

    return this.apiClient
      .get<CategoryProductsDto>(
        `${this.baseEndpoint}/${categoryId}/products`,
        query
      )
      .pipe(map((response: ApiResponse<CategoryProductsDto>) => response.data));
  }

  getPopularTags(): Observable<Tag[]> {
    return this.apiClient
      .get<TagDto[]>(`${this.baseEndpoint}/tags`)
      .pipe(
        map((response: ApiResponse<TagDto[]>) =>
          (response.data ?? []).map((tag) => mapTagDtoToModel(tag))
        )
      );
  }

  createTag(payload: TagCreateDto): Observable<Tag> {
    return this.apiClient
      .post<TagDto>(`${this.baseEndpoint}/tags`, payload)
      .pipe(
        map((response: ApiResponse<TagDto>) => mapTagDtoToModel(response.data))
      );
  }

  buildSummariesFromTree(nodes: CategoryTreeNode[]): CategorySummary[] {
    return nodes.map((node) => ({
      id: node.category.id,
      name: node.category.name,
      slug: node.category.slug,
      imageUrl: node.category.imageUrl,
      childCount: node.children.length,
    }));
  }
}
