import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import {
  FilterBarComponent,
  Category,
  FilterData,
} from '../../components/filter-bar/filter-bar.component';
import {
  FeaturedListComponent,
  FeaturedItem,
} from '../../components/featured-list/featured-list.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

// Interfaces
interface MarketplaceProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  sellerId: string;
  sellerName: string;
  rating: number;
  ratingCount: number;
  discount?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

interface CategoryWithCount extends Category {
  count: number;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    FilterBarComponent,
    FeaturedListComponent,
    SearchBarComponent,
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css',
})
export class MarketplaceComponent {
  private router = inject(Router);

  // Categories for filter bar
  categories: CategoryWithCount[] = [
    { id: 'all', name: 'All', count: 150 },
    { id: 'electronics', name: 'Electronics', count: 45 },
    { id: 'fashion', name: 'Fashion', count: 38 },
    { id: 'books', name: 'Books', count: 22 },
    { id: 'sports', name: 'Sports', count: 18 },
    { id: 'home', name: 'Home', count: 27 },
  ];

  // Marketplace data
  products = signal<MarketplaceProduct[]>([]);
  featuredProducts = signal<FeaturedItem[]>([]);
  currentFilter = signal<string>('all');
  currentCategory = signal<string>('all');
  loading = signal<boolean>(false);
  hasMore = signal<boolean>(true);

  constructor() {
    this.loadMarketplaceData();
  }

  private loadMarketplaceData() {
    this.loading.set(true);

    // Mock data
    setTimeout(() => {
      this.products.set([
        {
          id: '1',
          name: 'Vintage Camera Collection',
          price: 299.99,
          originalPrice: 399.99,
          image:
            '/assets/547953_9C2ST_8746_001_082_0000_Light-Gucci-Savoy-medium-duffle-bag 1.png',
          sellerId: 'seller1',
          sellerName: 'Sarah Johnson',
          rating: 4.8,
          ratingCount: 24,
          discount: 25,
          isNew: true,
        },
        {
          id: '2',
          name: 'The North Face x Gucci Coat',
          price: 899.99,
          image:
            '/assets/672462_ZAH9D_5626_002_100_0000_Light-The-North-Face-x-Gucci-coat 1.png',
          sellerId: 'seller2',
          sellerName: 'Mike Chen',
          rating: 4.9,
          ratingCount: 156,
          isTrending: true,
        },
      ]);

      this.featuredProducts.set([
        {
          id: '3',
          name: 'Limited Edition Sneakers',
          description: 'Rare collectible sneakers in excellent condition',
          price: 199.99,
          image:
            '/assets/547953_9C2ST_8746_001_082_0000_Light-Gucci-Savoy-medium-duffle-bag 1.png',
          stock: 5,
          rating: 4.7,
          reviews: 89,
          isNew: true,
          isFeatured: true,
          isFavorited: false,
          seller: {
            id: 'seller3',
            name: 'Emma Davis',
            avatar: '/assets/icons/default-avatar.png',
            rating: 4.8,
          },
          views: 1200,
          favorites: 45,
          sales: 12,
        },
      ]);

      this.loading.set(false);
    }, 1000);
  }

  onSearch(query: string) {
    // Handle search
    console.log('Search query:', query);
  }

  onFilterChange(filter: FilterData) {
    // For demo, just set the first selected category as the filter
    if (filter.categories && filter.categories.length > 0) {
      this.currentFilter.set(filter.categories[0]);
    } else {
      this.currentFilter.set('all');
    }
    // Implement actual filtering logic as needed
  }

  onProductClick(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  onCategoryChange(categoryId: string) {
    this.currentCategory.set(categoryId);
    // Handle category selection
    console.log('Category selected:', categoryId);
  }

  getFilteredProducts(): MarketplaceProduct[] {
    // Simple filtering logic - in real app, this would be more sophisticated
    return this.products();
  }

  getDiscountPercentage(product: MarketplaceProduct): number | null {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    }
    return null;
  }

  hasMoreProducts(): boolean {
    return this.hasMore();
  }

  onLoadMore() {
    // Implement load more logic
    console.log('Load more products');
    this.hasMore.set(false); // For demo, just disable after first click
  }

  get isLoading() {
    return this.loading();
  }
}
