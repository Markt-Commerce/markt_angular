import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchSuggestion {
  text: string;
  category: string;
  value: string;
}

export interface SearchFilter {
  type: string;
  value: string;
  label: string;
}

export interface Category {
  value: string;
  label: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Search products, sellers, or categories...';
  @Input() showFilters: boolean = true;

  @Output() search = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<SearchFilter[]>();
  @Output() suggestionSelect = new EventEmitter<SearchSuggestion>();

  searchQuery: string = '';
  showSuggestions: boolean = false;
  showFilterMenu: boolean = false;
  activeFilters: SearchFilter[] = [];
  suggestions: SearchSuggestion[] = [];

  priceRange = {
    min: null as number | null,
    max: null as number | null,
  };

  categories: Category[] = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Health' },
  ];

  onSearchInput() {
    this.generateSuggestions();
    this.search.emit(this.searchQuery);
  }

  onFocus() {
    this.showSuggestions = true;
    this.generateSuggestions();
  }

  onBlur() {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  clearSearch() {
    this.searchQuery = '';
    this.suggestions = [];
    this.search.emit('');
  }

  generateSuggestions() {
    if (!this.searchQuery.trim()) {
      this.suggestions = [];
      return;
    }

    // Mock suggestions based on search query
    this.suggestions = [
      { text: this.searchQuery, category: 'Products', value: this.searchQuery },
      {
        text: `${this.searchQuery} - Electronics`,
        category: 'Category',
        value: `${this.searchQuery} electronics`,
      },
      {
        text: `${this.searchQuery} - Clothing`,
        category: 'Category',
        value: `${this.searchQuery} clothing`,
      },
      {
        text: `Seller: ${this.searchQuery}`,
        category: 'Seller',
        value: `seller:${this.searchQuery}`,
      },
    ];
  }

  selectSuggestion(suggestion: SearchSuggestion) {
    this.searchQuery = suggestion.text;
    this.showSuggestions = false;
    this.suggestionSelect.emit(suggestion);
    this.search.emit(suggestion.text);
  }

  toggleFilterMenu() {
    this.showFilterMenu = !this.showFilterMenu;
  }

  toggleFilter(type: string, value: string, label: string) {
    const existingFilter = this.activeFilters.find(
      (f) => f.type === type && f.value === value
    );

    if (existingFilter) {
      this.activeFilters = this.activeFilters.filter(
        (f) => f !== existingFilter
      );
    } else {
      this.activeFilters.push({ type, value, label });
    }

    this.filterChange.emit(this.activeFilters);
  }

  removeFilter(filter: SearchFilter) {
    this.activeFilters = this.activeFilters.filter((f) => f !== filter);
    this.filterChange.emit(this.activeFilters);
  }

  isFilterActive(type: string, value: string): boolean {
    return this.activeFilters.some((f) => f.type === type && f.value === value);
  }

  applyFilters() {
    this.showFilterMenu = false;
    this.filterChange.emit(this.activeFilters);
  }

  clearFilters() {
    this.activeFilters = [];
    this.priceRange = { min: null, max: null };
    this.showFilterMenu = false;
    this.filterChange.emit([]);
  }
}
