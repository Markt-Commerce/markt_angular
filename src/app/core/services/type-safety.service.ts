import { Injectable } from '@angular/core';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | string[];
  success?: boolean;
  status?: number;
}

export interface ServerError {
  message?: string;
  errors?: Record<string, string[]> | string[];
  detail?: string;
  error?: string;
  status?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TypeSafetyService {

  /**
   * Safely check if a value is an object
   */
  isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Safely check if a value is an array
   */
  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  /**
   * Safely check if a value is a string
   */
  isString(value: any): value is string {
    return typeof value === 'string';
  }

  /**
   * Safely check if a value is a number
   */
  isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Safely check if a value is a boolean
   */
  isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
  }

  /**
   * Safely get a property from an object
   */
  getProperty<T>(obj: any, key: string, defaultValue?: T): T | undefined {
    if (this.isObject(obj) && key in obj) {
      return obj[key] as T;
    }
    return defaultValue;
  }

  /**
   * Safely get a nested property using dot notation
   */
  getNestedProperty<T>(obj: any, path: string, defaultValue?: T): T | undefined {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (this.isObject(current) && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current as T;
  }

  /**
   * Safely convert a value to string
   */
  toString(value: any, defaultValue: string = ''): string {
    if (this.isString(value)) {
      return value;
    }
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return String(value);
  }

  /**
   * Safely convert a value to number
   */
  toNumber(value: any, defaultValue: number = 0): number {
    if (this.isNumber(value)) {
      return value;
    }
    if (this.isString(value)) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  }

  /**
   * Safely convert a value to boolean
   */
  toBoolean(value: any, defaultValue: boolean = false): boolean {
    if (this.isBoolean(value)) {
      return value;
    }
    if (this.isString(value)) {
      return value.toLowerCase() === 'true';
    }
    if (this.isNumber(value)) {
      return value !== 0;
    }
    return defaultValue;
  }

  /**
   * Safely convert a value to array
   */
  toArray<T>(value: any, defaultValue: T[] = []): T[] {
    if (this.isArray(value)) {
      return value as T[];
    }
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return [value] as T[];
  }

  /**
   * Safely check if an object has a specific property
   */
  hasProperty(obj: any, key: string): boolean {
    return this.isObject(obj) && key in obj;
  }

  /**
   * Safely check if an object has all required properties
   */
  hasRequiredProperties(obj: any, requiredKeys: string[]): boolean {
    if (!this.isObject(obj)) {
      return false;
    }
    return requiredKeys.every(key => key in obj);
  }

  /**
   * Create a type-safe API response wrapper
   */
  createApiResponse<T>(data: any): ApiResponse<T> {
    if (this.isObject(data)) {
      return {
        data: this.getProperty(data, 'data', undefined) as T | undefined,
        success: this.toBoolean(this.getProperty(data, 'success', false)),
        message: this.toString(this.getProperty(data, 'message', '')),
        errors: this.getProperty(data, 'errors'),
        status: this.toNumber(this.getProperty(data, 'status'))
      };
    }
    
    return {
      data: data as T | undefined,
      success: true,
      message: ''
    };
  }

  /**
   * Safely extract user data from API response
   */
  extractUserData(response: any): { user?: any; token?: string; message?: string } {
    if (!this.isObject(response)) {
      return {};
    }

    const data = this.getProperty(response, 'data', {});
    
    return {
      user: this.getProperty(response, 'user') || this.getProperty(data, 'user'),
      token: this.toString(this.getProperty(response, 'token') || this.getProperty(data, 'token')),
      message: this.toString(this.getProperty(response, 'message'))
    };
  }

  /**
   * Safely extract paginated data from API response
   */
  extractPaginatedData<T>(response: any): { items: T[]; total: number; page: number; limit: number } {
    if (!this.isObject(response)) {
      return { items: [], total: 0, page: 1, limit: 10 };
    }

    const data = this.getProperty(response, 'data', response);
    
    return {
      items: this.toArray(this.getProperty(data, 'items', [])),
      total: this.toNumber(this.getProperty(data, 'total', 0)),
      page: this.toNumber(this.getProperty(data, 'page', 1)),
      limit: this.toNumber(this.getProperty(data, 'limit', 10))
    };
  }

  /**
   * Safely extract error data from API response
   */
  extractErrorData(error: any): ServerError {
    if (!this.isObject(error)) {
      return { message: 'An unexpected error occurred' };
    }

    // Check for nested error structure
    const errorData = this.getProperty(error, 'error', error);
    
    return {
      message: this.toString(this.getProperty(errorData, 'message') || this.getProperty(error, 'message')),
      errors: this.getProperty(errorData, 'errors') || this.getProperty(error, 'errors'),
      detail: this.toString(this.getProperty(errorData, 'detail')),
      error: this.toString(this.getProperty(errorData, 'error')),
      status: this.toNumber(this.getProperty(error, 'status'))
    };
  }

  /**
   * Type-safe property access with fallback
   */
  safeAccess<T>(obj: any, path: string, defaultValue: T): T {
    const value = this.getNestedProperty(obj, path);
    return value !== undefined ? value as T : defaultValue;
  }

  /**
   * Type-safe array access
   */
  safeArrayAccess<T>(arr: any, index: number, defaultValue: T): T {
    if (!this.isArray(arr) || index < 0 || index >= arr.length) {
      return defaultValue;
    }
    return arr[index] as T;
  }

  /**
   * Type-safe object merge
   */
  safeMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    const result = { ...target };
    
    for (const source of sources) {
      if (this.isObject(source)) {
        Object.assign(result, source);
      }
    }
    
    return result;
  }
}
