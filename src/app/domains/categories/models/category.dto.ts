import { Pagination } from '../../../core/infrastructure/http/api-response.types';
import { ProductDto } from '../../marketplace/models/product.dto';

export interface CategoryDto {
  id: number;
  name: string;
  description?: string | null;
  slug?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  is_active: boolean;
  category_metadata?: Record<string, unknown> | null;
}

export interface CategoryTreeDto {
  id: number;
  name: string;
  slug?: string | null;
  image_url?: string | null;
  children?: CategoryTreeDto[];
}

export interface CategoryCreateDto {
  name: string;
  description?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface CategoryProductsDto {
  category: CategoryDto;
  products: ProductDto[];
  pagination: Pagination;
}

export interface TagDto {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
}

export interface TagCreateDto {
  name: string;
  description?: string | null;
  slug?: string | null;
}
