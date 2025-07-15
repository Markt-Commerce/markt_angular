import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Location {
  id: string;
  name: string;
  count: number;
}

export interface Condition {
  value: string;
  name: string;
  count: number;
}

export interface Rating {
  value: number;
  text: string;
  count: number;
}

export interface SortOption {
  value: string;
  name: string;
}

export interface QuickFilter {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface FilterData {
  categories: string[];
  priceRange: { min: number; max: number };
  locations: string[];
  conditions: string[];
  ratings: number[];
  sort: string;
  quickFilters: string[];
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.css',
})
export class FilterBarComponent {
  @Input() categories: Category[] = [];
  @Input() locations: Location[] = [];
  @Input() conditions: Condition[] = [];
  @Input() ratings: Rating[] = [];
  @Input() sortOptions: SortOption[] = [];
  @Input() quickFilters: QuickFilter[] = [];

  @Output() filterChange = new EventEmitter<FilterData>();
  @Output() applyFilters = new EventEmitter<FilterData>();

  selectedCategories: string[] = [];
  selectedLocations: string[] = [];
  selectedConditions: string[] = [];
  selectedRatings: number[] = [];
  selectedSort: string = 'relevance';

  priceRange = { min: 0, max: 1000 };
  priceSlider = { min: 0, max: 1000, value: 500 };

  locationSearch: string = '';
  filteredLocations: Location[] = [];

  expandedSections = {
    category: true,
    price: false,
    location: false,
    condition: false,
    rating: false,
    sort: false,
  };

  get activeFilterCount(): number {
    return (
      this.selectedCategories.length +
      this.selectedLocations.length +
      this.selectedConditions.length +
      this.selectedRatings.length +
      (this.priceRange.min > 0 || this.priceRange.max < 1000 ? 1 : 0) +
      this.quickFilters.filter((f) => f.active).length
    );
  }

  ngOnInit() {
    this.filteredLocations = [...this.locations];
  }

  toggleSection(section: keyof typeof this.expandedSections) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  onCategoryChange() {
    this.emitFilterChange();
  }

  onPriceChange() {
    this.emitFilterChange();
  }

  onSliderChange() {
    this.priceRange.max = this.priceSlider.value;
    this.emitFilterChange();
  }

  onLocationSearch() {
    this.filteredLocations = this.locations.filter((location) =>
      location.name.toLowerCase().includes(this.locationSearch.toLowerCase())
    );
  }

  onLocationChange() {
    this.emitFilterChange();
  }

  onConditionChange() {
    this.emitFilterChange();
  }

  onRatingChange() {
    this.emitFilterChange();
  }

  onSortChange() {
    this.emitFilterChange();
  }

  onQuickFilter(filter: QuickFilter) {
    filter.active = !filter.active;
    this.emitFilterChange();
  }

  onClearAll() {
    this.selectedCategories = [];
    this.selectedLocations = [];
    this.selectedConditions = [];
    this.selectedRatings = [];
    this.selectedSort = 'relevance';
    this.priceRange = { min: 0, max: 1000 };
    this.priceSlider.value = 500;
    this.locationSearch = '';
    this.filteredLocations = [...this.locations];

    this.quickFilters.forEach((filter) => (filter.active = false));

    this.emitFilterChange();
  }

  onApplyFilters() {
    const filterData: FilterData = {
      categories: this.selectedCategories,
      priceRange: { ...this.priceRange },
      locations: this.selectedLocations,
      conditions: this.selectedConditions,
      ratings: this.selectedRatings,
      sort: this.selectedSort,
      quickFilters: this.quickFilters.filter((f) => f.active).map((f) => f.id),
    };

    this.applyFilters.emit(filterData);
  }

  private emitFilterChange() {
    const filterData: FilterData = {
      categories: this.selectedCategories,
      priceRange: { ...this.priceRange },
      locations: this.selectedLocations,
      conditions: this.selectedConditions,
      ratings: this.selectedRatings,
      sort: this.selectedSort,
      quickFilters: this.quickFilters.filter((f) => f.active).map((f) => f.id),
    };

    this.filterChange.emit(filterData);
  }
}
