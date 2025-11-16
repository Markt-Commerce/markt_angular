import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ROUTES_ABSOLUTE, buildPath, RouteParams } from '../../../core/config/routes.config';
import { MarketplaceService } from '../../../domains/marketplace/services/marketplace.service';
import { ApiService } from '../../../core/services/api.service'; // Still needed for operations not yet migrated
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faStar, 
  faPlus, 
  faBox, 
  faSearch, 
  faSliders, 
  faChevronRight, 
  faChevronLeft,
  faEye,
  faClock,
  faPause,
  faPlay,
  faEdit,
  faChartLine,
  faEllipsisVertical,
  faExclamationTriangle,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';

// TODO: Migrate to Product domain model from domains/marketplace/models/product.model when domain model includes all properties (images, seller, category, description, etc.)
import { Product } from '../../../core/models';
import { RoleIntentService } from '../../../core/services/role-intent.service';
import { TypeSafetyService } from '../../../core/services/type-safety.service';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css']
})
export class ListingsComponent implements OnInit {
  private router = inject(Router);
  private marketplaceService = inject(MarketplaceService);
  private apiService = inject(ApiService); // Still needed for operations not yet migrated
  private roleIntent = inject(RoleIntentService);
  private typeSafety = inject(TypeSafetyService);

  // Font Awesome Icons
  faStar = faStar;
  faPlus = faPlus;
  faSearch = faSearch;
  faSliders = faSliders;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faEye = faEye;
  faClock = faClock;
  faPause = faPause;
  faPlay = faPlay;
  faEdit = faEdit;
  faChartLine = faChartLine;
  faEllipsisVertical = faEllipsisVertical;
  faExclamationTriangle = faExclamationTriangle;
  faRefresh = faRefresh;

  // Signals for reactive state management
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  selectedProducts = signal<string[]>([]);
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';
  sortBy = 'date';
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 6;
  loading = false;

  // Mock data from Figma design
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'MacBook Pro 13" M1',
      description: 'High-performance laptop perfect for students and professionals',
      price: 899,
      status: 'active',
      view_count: 127,
      stock: 5,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: { id: '1', name: 'Electronics' },
      images: [{ 
        media: { 
          thumbnail_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e101ca9fce-72293a94c4d6bafa4a65.png',
          desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/e101ca9fce-72293a94c4d6bafa4a65.png'
        }
      }]
    } as Product,
    {
      id: '2',
      name: 'Calculus Textbook Bundle',
      description: 'Complete set of calculus textbooks for advanced mathematics',
      price: 120,
      status: 'draft',
      view_count: 0,
      stock: 10,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      category: { id: '2', name: 'Textbooks' },
      images: [{ 
        media: { 
          thumbnail_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/bde6a74a74-c86422a519b190bb331c.png',
          desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/bde6a74a74-c86422a519b190bb331c.png'
        }
      }]
    } as Product,
    {
      id: '3',
      name: 'Ergonomic Desk Chair',
      description: 'Comfortable office chair for long study sessions',
      price: 85,
      status: 'active',
      view_count: 89,
      stock: 8,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: { id: '3', name: 'Furniture' },
      images: [{ 
        media: { 
          thumbnail_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7cf1d65f8f-a280d14440d917f50223.png',
          desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/7cf1d65f8f-a280d14440d917f50223.png'
        }
      }]
    } as Product,
    {
      id: '4',
      name: 'Vintage Denim Jacket',
      description: 'Classic vintage-style denim jacket in excellent condition',
      price: 45,
      status: 'inactive',
      view_count: 156,
      stock: 3,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: { id: '4', name: 'Clothing' },
      images: [{ 
        media: { 
          thumbnail_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/0553436777-7773969a27d954433ed8.png',
          desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/0553436777-7773969a27d954433ed8.png'
        }
      }]
    } as Product,
    {
      id: '5',
      name: 'iPhone 12 Pro',
      description: 'Latest iPhone model with advanced camera system',
      price: 650,
      status: 'active',
      view_count: 203,
      stock: 2, // Low stock - needs attention
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: { id: '1', name: 'Electronics' },
      images: [{ 
        media: { 
          thumbnail_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/59929e1a6d-85489e30f101f85abb80.png',
          desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/59929e1a6d-85489e30f101f85abb80.png'
        }
      }]
    } as Product,
    {
      id: '6',
      name: 'Student Backpack',
      description: 'Durable backpack perfect for carrying books and laptop',
      price: 35,
      status: 'active',
      view_count: 64,
      stock: 15,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: { id: '5', name: 'Accessories' },
      images: [{ 
        media: { 
          thumbnail_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/32a7781805-768ce154b3358003c409.png',
          desktop_url: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/32a7781805-768ce154b3358003c409.png'
        }
      }]
    } as Product
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  // Computed signals for UI data - will be calculated from mock data
  listingOverview = signal({
    active: 0,
    draft: 0,
    paused: 0,
    attention: 0
  });

  categoryCounts = signal({
    Electronics: 0,
    Textbooks: 0,
    Furniture: 0,
    Clothing: 0
  });

  paginatedProducts = signal<Product[]>([]);

  private loadProducts(): void {
    this.loading = true;
    
    // Use mock data from Figma design instead of API
    setTimeout(() => {
      this.products.set(this.mockProducts);
      this.calculateOverviewStats(this.mockProducts);
      this.calculateCategoryCounts(this.mockProducts);
      this.applyFilters();
      this.loading = false;
    }, 500); // Simulate loading delay
  }

  private calculateOverviewStats(products: Product[]): void {
    const stats = {
      active: products.filter(p => p.status === 'active').length,
      draft: products.filter(p => p.status === 'draft').length,
      paused: products.filter(p => p.status === 'inactive').length, // Using inactive as paused
      attention: products.filter(p => this.needsAttention(p)).length
    };
    this.listingOverview.set(stats);
  }

  private calculateCategoryCounts(products: Product[]): void {
    const counts = {
      Electronics: 0,
      Textbooks: 0,
      Furniture: 0,
      Clothing: 0
    };
    products.forEach(product => {
      const category = this.getPrimaryCategoryName(product);
      if (category === 'Electronics') counts.Electronics++;
      else if (category === 'Textbooks') counts.Textbooks++;
      else if (category === 'Furniture') counts.Furniture++;
      else if (category === 'Clothing') counts.Clothing++;
    });
    this.categoryCounts.set(counts);
  }

  private needsAttention(product: Product): boolean {
    // Check if product needs attention (expiring, low stock, etc.)
    return (product.stock !== undefined && product.stock <= 5);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.applyFilters();
  }

  onSort(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products()];

    // Search filter
    if (this.searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(product => product.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(product => 
        this.getPrimaryCategoryName(product) === this.categoryFilter
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'performance':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'views':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
    }

    this.filteredProducts.set(filtered);
    this.currentPage.set(1);
    this.calculatePagination();
    this.updatePaginatedProducts();
  }

  private calculatePagination(): void {
    const totalPages = Math.ceil(this.filteredProducts().length / this.itemsPerPage);
    this.totalPages.set(totalPages);
  }

  private updatePaginatedProducts(): void {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginated = this.filteredProducts().slice(startIndex, endIndex);
    this.paginatedProducts.set(paginated);
  }

  toggleSelection(productId: string): void {
    const current = this.selectedProducts();
    const index = current.indexOf(productId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(productId);
    }
    this.selectedProducts.set([...current]);
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts().includes(productId);
  }

  clearSelection(): void {
    this.selectedProducts.set([]);
  }

  // New methods for Figma design features
  setCategoryFilter(category: string): void {
    this.categoryFilter = category;
    this.applyFilters();
  }

  applySavedFilter(filterType: string): void {
    switch (filterType) {
      case 'high-performance':
        this.sortBy = 'performance';
        this.statusFilter = 'active';
        break;
      case 'recently-updated':
        this.sortBy = 'date';
        break;
      case 'expiring-soon':
        this.statusFilter = '';
        this.sortBy = 'date';
        break;
    }
    this.applyFilters();
  }

  getProductImage(product: Product): string {
    return (product.images?.[0]?.media?.thumbnail_url || 
            product.images?.[0]?.media?.desktop_url || 
            product.images?.[0]?.media?.mobile_url || 
            product.images?.[0]?.media?.original_url) || 
           '/assets/images/products/default-product.png';
  }

  getProductMeta(product: Product): string {
    const category = this.getPrimaryCategoryName(product);
    const status = product.status;
    
    // Return exact text from Figma design
    if (status === 'draft') {
      return `${category} • Last edited 1 hour ago`;
    } else if (status === 'inactive') {
      return `${category} • Paused 3 days ago`;
    } else if (this.needsAttention(product)) {
      return `${category} • Expires in 2 days`;
    } else {
      return `${category} • Posted 2 days ago`;
    }
  }

  getStatusClass(product: Product): string {
    if (product.status === 'active') return 'active';
    if (product.status === 'draft') return 'draft';
    if (product.status === 'inactive') return 'paused';
    if (this.needsAttention(product)) return 'attention';
    return 'active';
  }

  getStatusLabel(product: Product): string {
    if (product.status === 'active') return 'Active';
    if (product.status === 'draft') return 'Draft';
    if (product.status === 'inactive') return 'Paused';
    if (this.needsAttention(product)) return 'Attention';
    return 'Active';
  }

  getViewsClass(product: Product): string {
    if (this.needsAttention(product)) return 'expiring';
    return '';
  }

  getViewsIcon(product: Product): any {
    if (product.status === 'draft') return this.faClock;
    if (product.status === 'inactive') return this.faPause;
    if (this.needsAttention(product)) return this.faExclamationTriangle;
    return this.faEye;
  }

  getViewsText(product: Product): string {
    if (product.status === 'draft') return 'Draft';
    if (product.status === 'inactive') return 'Paused';
    if (this.needsAttention(product)) return 'Expiring';
    return `${product.view_count || 0} views`;
  }

  getPrimaryActionIcon(product: Product): any {
    if (product.status === 'draft') return this.faEdit;
    if (product.status === 'inactive') return this.faPlay;
    if (this.needsAttention(product)) return this.faRefresh;
    return this.faEdit;
  }

  getPrimaryActionText(product: Product): string {
    if (product.status === 'draft') return 'Continue';
    if (product.status === 'inactive') return 'Resume';
    if (this.needsAttention(product)) return 'Renew';
    return 'Edit';
  }

  handlePrimaryAction(product: Product): void {
    if (product.status === 'draft') {
      this.router.navigate([RouteParams.sellerListingEdit(product.id)]);
    } else if (product.status === 'inactive') {
      this.resumeProduct(product.id);
    } else if (this.needsAttention(product)) {
      this.renewProduct(product.id);
    } else {
      this.router.navigate([RouteParams.sellerListingEdit(product.id)]);
    }
  }

  showAnalytics(product: Product): void {
    // Navigate to analytics or show analytics modal
    this.router.navigate([ROUTES_ABSOLUTE.APP.SELLER.ANALYTICS], { queryParams: { product: product.id } });
  }

  showMoreOptions(product: Product): void {
    // Show more options menu or modal
  }

  private resumeProduct(productId: string): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      // Domain service returns Product directly, not wrapped in ApiResponse
      this.marketplaceService.updateProduct(productId, {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category_ids: product.category_ids,
        status: 'active'
      }).subscribe({
        next: () => this.loadProducts(),
        error: (error) => console.error('Error resuming product:', error)
      });
    }
  }

  private renewProduct(productId: string): void {
    // Implement product renewal logic
  }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'low';
    if (stock <= 15) return 'medium';
    return 'high';
  }

  getPrimaryCategoryName(product: Product): string {
    if (product?.category?.name) return product.category.name;
    // Try from product_metadata or first categories item if present
    const metaCategory = this.typeSafety.getNestedProperty(product, 'product_metadata.category_name');
    if (metaCategory) return this.typeSafety.toString(metaCategory);
    const categories = this.typeSafety.getProperty(product, 'categories');
    if (this.typeSafety.isArray(categories) && categories.length > 0) {
      const firstCategory = categories[0];
      return this.typeSafety.toString(this.typeSafety.getProperty(firstCategory, 'name'), 'Uncategorized');
    }
    return 'Uncategorized';
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      // Domain service returns void directly, not wrapped in ApiResponse
      this.marketplaceService.deleteProduct(productId).subscribe({
        next: () => {
          const updatedProducts = this.products().filter(p => p.id !== productId);
          this.products.set(updatedProducts);
          this.calculateOverviewStats(updatedProducts);
          this.calculateCategoryCounts(updatedProducts);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  bulkActivate(): void {
    const selected = this.selectedProducts();
    if (selected.length > 0) {
      // Domain service returns Product directly, not wrapped in ApiResponse
      const updatePromises = selected.map(productId => {
        const product = this.products().find(p => p.id === productId);
        if (product) {
          return this.marketplaceService.updateProduct(productId, {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category_ids: product.category_ids,
            status: 'active'
          }).toPromise();
        }
        return Promise.resolve();
      });
      
      Promise.all(updatePromises).then(() => {
        this.loadProducts(); // Reload to get updated status
        this.clearSelection();
      }).catch(error => {
        console.error('Error bulk activating products:', error);
      });
    }
  }

  bulkPause(): void {
    const selected = this.selectedProducts();
    if (selected.length > 0) {
      // Domain service returns Product directly, not wrapped in ApiResponse
      const updatePromises = selected.map(productId => {
        const product = this.products().find(p => p.id === productId);
        if (product) {
          return this.marketplaceService.updateProduct(productId, {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category_ids: product.category_ids,
            status: 'draft'
          }).toPromise();
        }
        return Promise.resolve();
      });
      
      Promise.all(updatePromises).then(() => {
        this.loadProducts(); // Reload to get updated status
        this.clearSelection();
      }).catch(error => {
        console.error('Error bulk pausing products:', error);
      });
    }
  }

  bulkEditPrice(): void {
    const selected = this.selectedProducts();
    if (selected.length > 0) {
      // Show bulk edit price modal or navigate to bulk edit page
      // Implement bulk price editing logic
    }
  }

  bulkDelete(): void {
    const selected = this.selectedProducts();
    if (selected.length > 0 && confirm(`Are you sure you want to delete ${selected.length} products?`)) {
      // Domain service returns void directly, not wrapped in ApiResponse
      const deletePromises = selected.map(productId =>
        this.marketplaceService.deleteProduct(productId).toPromise()
      );
      
      Promise.all(deletePromises).then(() => {
        this.loadProducts(); // Reload to get updated list
        this.clearSelection();
      }).catch(error => {
        console.error('Error bulk deleting products:', error);
      });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.updatePaginatedProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.updatePaginatedProducts();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePaginatedProducts();
    }
  }

  getPaginationStart(): number {
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  }

  getPaginationEnd(): number {
    const end = this.currentPage() * this.itemsPerPage;
    return Math.min(end, this.filteredProducts().length);
  }

  goToCreate(): void {
    this.roleIntent.switchAndNavigate('seller', ROUTES_ABSOLUTE.APP.SELLER.LISTINGS_CREATE);
  }

  goToEdit(id: string): void {
    this.roleIntent.switchAndNavigate('seller', RouteParams.sellerListingEdit(id));
  }
} 