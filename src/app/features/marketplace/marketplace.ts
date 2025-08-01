import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  location: string;
  tags: string[];
  createdAt: Date;
  likes: number;
  views: number;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css'
})
export class MarketplaceComponent {
  // Search and filter signals
  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedCondition = signal('all');
  sortBy = signal('newest');

  // Mock product data based on campus commerce research
  products = signal<Product[]>([
    {
      id: '1',
      title: 'MacBook Air M1 - Excellent Condition',
      description: 'Perfect for students! 13-inch MacBook Air with M1 chip, 8GB RAM, 256GB SSD. No scratches, comes with original charger.',
      price: 750,
      originalPrice: 999,
      image: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=MacBook',
      seller: {
        name: 'Sarah Chen',
        avatar: 'https://via.placeholder.com/40x40/10b981/ffffff?text=SC',
        rating: 4.8,
        verified: true
      },
      category: 'Electronics',
      condition: 'like-new',
      location: 'Engineering Campus',
      tags: ['laptop', 'apple', 'student-friendly'],
      createdAt: new Date('2024-01-15'),
      likes: 23,
      views: 156
    },
    {
      id: '2',
      title: 'Calculus Textbook Bundle',
      description: 'Complete set of calculus textbooks (Calculus I, II, III) by Stewart. Great condition, minimal highlighting.',
      price: 45,
      originalPrice: 120,
      image: 'https://via.placeholder.com/300x200/64748b/ffffff?text=Books',
      seller: {
        name: 'Mike Rodriguez',
        avatar: 'https://via.placeholder.com/40x40/f59e0b/ffffff?text=MR',
        rating: 4.6,
        verified: true
      },
      category: 'Books',
      condition: 'good',
      location: 'Science Building',
      tags: ['textbooks', 'math', 'calculus'],
      createdAt: new Date('2024-01-14'),
      likes: 12,
      views: 89
    },
    {
      id: '3',
      title: 'Vintage Denim Jacket',
      description: 'Authentic vintage denim jacket from the 90s. Perfect fit for medium build. Great for campus fashion!',
      price: 35,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Fashion',
      seller: {
        name: 'Emma Thompson',
        avatar: 'https://via.placeholder.com/40x40/ef4444/ffffff?text=ET',
        rating: 4.9,
        verified: false
      },
      category: 'Fashion',
      condition: 'good',
      location: 'Arts Campus',
      tags: ['vintage', 'denim', 'fashion'],
      createdAt: new Date('2024-01-13'),
      likes: 31,
      views: 203
    },
    {
      id: '4',
      title: 'Bike - Perfect for Campus',
      description: 'Mountain bike in great condition. Perfect for getting around campus. Includes lock and helmet.',
      price: 120,
      originalPrice: 300,
      image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Bike',
      seller: {
        name: 'Alex Johnson',
        avatar: 'https://via.placeholder.com/40x40/2563eb/ffffff?text=AJ',
        rating: 4.7,
        verified: true
      },
      category: 'Transportation',
      condition: 'good',
      location: 'Student Housing',
      tags: ['bike', 'transportation', 'campus'],
      createdAt: new Date('2024-01-12'),
      likes: 18,
      views: 134
    },
    {
      id: '5',
      title: 'Gaming Setup - Complete',
      description: 'Full gaming setup including monitor, keyboard, mouse, and headset. Great for gaming or study sessions.',
      price: 280,
      originalPrice: 450,
      image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Gaming',
      seller: {
        name: 'David Kim',
        avatar: 'https://via.placeholder.com/40x40/8b5cf6/ffffff?text=DK',
        rating: 4.5,
        verified: true
      },
      category: 'Electronics',
      condition: 'like-new',
      location: 'Computer Science Building',
      tags: ['gaming', 'setup', 'electronics'],
      createdAt: new Date('2024-01-11'),
      likes: 27,
      views: 178
    }
  ]);

  // Categories based on campus commerce research
  categories = [
    { value: 'all', label: 'All Categories', icon: '🏪' },
    { value: 'Electronics', label: 'Electronics', icon: '💻' },
    { value: 'Books', label: 'Books & Textbooks', icon: '📚' },
    { value: 'Fashion', label: 'Fashion & Clothing', icon: '👕' },
    { value: 'Transportation', label: 'Transportation', icon: '🚲' },
    { value: 'Furniture', label: 'Furniture', icon: '🪑' },
    { value: 'Sports', label: 'Sports & Fitness', icon: '⚽' },
    { value: 'Services', label: 'Services', icon: '🔧' }
  ];

  // Filter conditions
  conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  // Sort options
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Computed filtered products
  get filteredProducts(): Product[] {
    let filtered = this.products();

    // Search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(product => product.category === this.selectedCategory());
    }

    // Condition filter
    if (this.selectedCondition() !== 'all') {
      filtered = filtered.filter(product => product.condition === this.selectedCondition());
    }

    // Sort
    switch (this.sortBy()) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.likes - a.likes);
        break;
    }

    return filtered;
  }

  // Update search query
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  // Update category filter
  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }

  // Update condition filter
  onConditionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCondition.set(target.value);
  }

  // Update sort
  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value);
  }

  // Handle product click
  onProductClick(productId: string): void {
    console.log('View product:', productId);
  }

  // Format price
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  // Calculate discount percentage
  getDiscountPercentage(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  // Get time ago
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  }
}
