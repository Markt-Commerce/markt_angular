/**
 * Shared API Response Types
 * 
 * These types are used across all domains for consistent API response handling.
 * They represent the technical structure of API responses, not business logic.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]> | string[];
  status?: number;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  first_page: number;
  last_page: number;
  previous_page: number | null;
  next_page: number | null;
  has_next: boolean;
  has_prev: boolean;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: number;
  status?: string;
}


