import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSearch, 
  faRocket, 
  faShoppingBag, 
  faUsers, 
  faShield, 
  faTruck, 
  faWrench,
  faComments,
  faTicketAlt,
  faEnvelope,
  faPhone,
  faClock,
  faBook,
  faPlay,
  faChevronDown,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

/**
 * Support Component - Help Center/Knowledge Base
 * 
 * This component provides a comprehensive help center interface with:
 * - Hero section with search functionality and suggested search terms
 * - Category browsing in left sidebar
 * - Popular articles, FAQs, and video tutorials in main content
 * - Live chat and support options
 * 
 * The design follows the Figma specifications for a clean, modern help center
 * that makes it easy for users to find answers and get support.
 */

interface SupportCategory {
  id: string;
  name: string;
  icon: any;
  articleCount: number;
  color: string;
}

interface SupportArticle {
  id: string;
  title: string;
  description: string;
  views: number;
  rating: number;
  tag: string;
  tagColor: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  description: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="support-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <img 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c436e43726-62ab0b7f5743104117d3.png" 
            alt="Professional customer service team helping students with support tickets"
            class="hero-image"
          />
        </div>
        <div class="hero-content">
          <h1 class="hero-title">How can we help you?</h1>
          <p class="hero-subtitle">Search our knowledge base or get in touch with our support team</p>
          
          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <fa-icon [icon]="faSearch" class="search-icon"></fa-icon>
              <input 
                type="text" 
                class="search-input"
                placeholder="Search for help articles, guides, and FAQs..."
                [(ngModel)]="searchQuery"
                (keyup.enter)="performSearch()"
                #searchInput
              />
            </div>
          </div>
          
          <!-- Suggested Search Terms -->
          <div class="suggested-terms">
            <button 
              *ngFor="let term of suggestedTerms" 
              class="suggested-term"
              (click)="searchForTerm(term)"
            >
              {{ term }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Left Sidebar -->
        <div class="sidebar">
          <!-- Browse by Category -->
          <div class="sidebar-section">
            <h3 class="section-title">Browse by Category</h3>
            <div class="category-list">
              <button 
                *ngFor="let category of supportCategories" 
                class="category-item"
                [class.active]="selectedCategory === category.id"
                (click)="selectCategory(category.id)"
              >
                <fa-icon [icon]="category.icon" class="category-icon" [style.color]="category.color"></fa-icon>
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.articleCount }} articles</span>
              </button>
            </div>
          </div>

          <!-- Need More Help? -->
          <div class="sidebar-section">
            <h3 class="section-title">Need More Help?</h3>
            <div class="help-options">
              <button class="help-option primary">
                <fa-icon [icon]="faComments" class="help-icon"></fa-icon>
                <span>Start Live Chat</span>
              </button>
              <button class="help-option secondary">
                <fa-icon [icon]="faTicketAlt" class="help-icon"></fa-icon>
                <span>Submit Ticket</span>
              </button>
              <button class="help-option secondary">
                <fa-icon [icon]="faEnvelope" class="help-icon"></fa-icon>
                <span>Email Support</span>
              </button>
            </div>
            
            <!-- Live Chat Status -->
            <div class="live-chat-status">
              <div class="status-indicator"></div>
              <span class="status-text">Live Chat Available</span>
              <p class="response-time">Average response time: 2 minutes</p>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="content-area">
          <!-- Popular Articles -->
          <div class="content-section">
            <div class="section-header">
              <h2 class="section-title">Popular Articles</h2>
              <a href="#" class="view-all-link">View All</a>
            </div>
            
            <div class="articles-grid">
              <div *ngFor="let article of popularArticles" class="article-card">
                <div class="article-tag" [style.background-color]="article.tagColor">
                  {{ article.tag }}
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-description">{{ article.description }}</p>
                <div class="article-stats">
                  <span class="article-views">{{ article.views }} views</span>
                  <span class="article-rating">{{ article.rating }}%</span>
                </div>
                <a href="#" class="read-more-link">Read More</a>
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="content-section">
            <h2 class="section-title">Frequently Asked Questions</h2>
            <div class="faq-list">
              <div *ngFor="let faq of faqs" class="faq-item">
                <button 
                  class="faq-question"
                  (click)="toggleFAQ(faq.id)"
                >
                  <span>{{ faq.question }}</span>
                  <fa-icon 
                    [icon]="faChevronDown" 
                    class="faq-chevron"
                    [class.rotated]="faq.expanded"
                  ></fa-icon>
                </button>
                <div class="faq-answer" [class.expanded]="faq.expanded">
                  <p>{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Video Tutorials -->
          <div class="content-section">
            <h2 class="section-title">Video Tutorials</h2>
            <div class="video-grid">
              <div *ngFor="let video of videoTutorials" class="video-card">
                <div class="video-thumbnail">
                  <img [src]="video.thumbnail" [alt]="video.title" class="thumbnail-image">
                  <div class="play-button">
                    <fa-icon [icon]="faPlay"></fa-icon>
                  </div>
                  <div class="video-duration">{{ video.duration }}</div>
                </div>
                <h3 class="video-title">{{ video.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .support-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, #E94C2A 0%, #E94B26 100%);
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.2;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      color: white;
      max-width: 800px;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin: 0 0 2rem 0;
      opacity: 0.9;
      line-height: 1.5;
    }

    .search-container {
      margin-bottom: 2rem;
    }

    .search-input-wrapper {
      position: relative;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      font-size: 1.1rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    .search-input::placeholder {
      color: #6c757d;
    }

    .suggested-terms {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .suggested-term {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 25px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggested-term:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Sidebar */
    .sidebar {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar-section {
      margin-bottom: 2rem;
    }

    .sidebar-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: none;
      background: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      width: 100%;
    }

    .category-item:hover {
      background: #f7fafc;
    }

    .category-item.active {
      background: #ebf8ff;
      color: #3182ce;
    }

    .category-icon {
      font-size: 1.25rem;
      width: 20px;
      text-align: center;
    }

    .category-name {
      flex: 1;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .category-count {
      background: #e2e8f0;
      color: #4a5568;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .help-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .help-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      width: 100%;
    }

    .help-option.primary {
      background: #E94C2A;
      color: white;
      border-color: #E94C2A;
    }

    .help-option.primary:hover {
      background: #d4411f;
    }

    .help-option.secondary:hover {
      border-color: #E94C2A;
      color: #E94C2A;
    }

    .help-icon {
      font-size: 1rem;
    }

    .live-chat-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s infinite;
    }

    .status-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #10b981;
    }

    .response-time {
      font-size: 0.75rem;
      color: #6c757d;
      margin: 0;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Content Area */
    .content-area {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .content-section {
      margin-bottom: 3rem;
    }

    .content-section:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .view-all-link {
      color: #E94C2A;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    /* Articles Grid */
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .article-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      position: relative;
      transition: all 0.2s ease;
    }

    .article-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .article-tag {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
    }

    .article-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .article-description {
      color: #4a5568;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .article-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.75rem;
      color: #6c757d;
    }

    .read-more-link {
      color: #E94C2A;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
      float: right;
    }

    .read-more-link:hover {
      text-decoration: underline;
    }

    /* FAQ Section */
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .faq-item {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .faq-question {
      width: 100%;
      padding: 1rem;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      color: #2d3748;
      transition: background 0.2s ease;
    }

    .faq-question:hover {
      background: #f7fafc;
    }

    .faq-chevron {
      transition: transform 0.2s ease;
    }

    .faq-chevron.rotated {
      transform: rotate(180deg);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background: #f7fafc;
    }

    .faq-answer.expanded {
      max-height: 200px;
    }

    .faq-answer p {
      padding: 1rem;
      margin: 0;
      color: #4a5568;
      line-height: 1.5;
    }

    /* Video Tutorials */
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .video-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .video-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .video-thumbnail {
      position: relative;
      aspect-ratio: 16/9;
      overflow: hidden;
    }

    .thumbnail-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: rgba(233, 76, 42, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .play-button:hover {
      background: rgba(233, 76, 42, 1);
      transform: translate(-50%, -50%) scale(1.1);
    }

    .video-duration {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .video-title {
      padding: 1rem;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      line-height: 1.4;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .sidebar {
        order: 2;
      }

      .hero-title {
        font-size: 2.5rem;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }

      .hero-content {
        padding: 0 1rem;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1.125rem;
      }

      .search-input {
        padding: 0.875rem 0.875rem 0.875rem 2.5rem;
        font-size: 0.9rem;
      }

      .articles-grid {
        grid-template-columns: 1fr;
      }

      .video-grid {
        grid-template-columns: 1fr;
      }

      .suggested-terms {
        flex-direction: column;
        align-items: center;
      }

      .suggested-term {
        width: fit-content;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        min-height: 300px;
      }

      .hero-title {
        font-size: 1.75rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .content-area {
        padding: 1rem;
      }

      .sidebar {
        padding: 1rem;
      }
    }
  `]
})
export class SupportComponent implements OnInit {
  // FontAwesome icons
  faSearch = faSearch;
  faRocket = faRocket;
  faShoppingBag = faShoppingBag;
  faUsers = faUsers;
  faShield = faShield;
  faTruck = faTruck;
  faWrench = faWrench;
  faComments = faComments;
  faTicketAlt = faTicketAlt;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faClock = faClock;
  faBook = faBook;
  faPlay = faPlay;
  faChevronDown = faChevronDown;
  faExternalLinkAlt = faExternalLinkAlt;

  // Component state
  searchQuery = '';
  selectedCategory = '';
  suggestedTerms = ['account setup', 'payment issues', 'verification', 'order tracking'];

  // Support categories with icons and colors
  supportCategories: SupportCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: faRocket,
      articleCount: 24,
      color: '#E94C2A'
    },
    {
      id: 'buying-selling',
      name: 'Buying & Selling',
      icon: faShoppingBag,
      articleCount: 18,
      color: '#E94C2A'
    },
    {
      id: 'community-social',
      name: 'Community & Social',
      icon: faUsers,
      articleCount: 15,
      color: '#E94C2A'
    },
    {
      id: 'account-security',
      name: 'Account & Security',
      icon: faShield,
      articleCount: 12,
      color: '#E94C2A'
    },
    {
      id: 'orders-shipping',
      name: 'Orders & Shipping',
      icon: faTruck,
      articleCount: 20,
      color: '#E94C2A'
    },
    {
      id: 'technical-support',
      name: 'Technical Support',
      icon: faWrench,
      articleCount: 8,
      color: '#E94C2A'
    }
  ];

  // Popular articles data
  popularArticles: SupportArticle[] = [
    {
      id: '1',
      title: 'How to create your first listing',
      description: 'Step-by-step guide to creating your first product listing on Markt and reaching potential buyers.',
      views: 1245,
      rating: 96,
      tag: 'Popular',
      tagColor: '#10b981'
    },
    {
      id: '2',
      title: 'How to verify your account',
      description: 'Learn how to verify your student status and build trust with the Markt community.',
      views: 892,
      rating: 95,
      tag: 'Security',
      tagColor: '#3b82f6'
    },
    {
      id: '3',
      title: 'How to make secure payments',
      description: 'Understanding payment protection and secure transaction methods on Markt.',
      views: 756,
      rating: 97,
      tag: 'Popular',
      tagColor: '#10b981'
    },
    {
      id: '4',
      title: 'How to track your orders',
      description: 'Track your purchases and stay updated on delivery status and shipping information.',
      views: 643,
      rating: 94,
      tag: 'Orders',
      tagColor: '#f59e0b'
    }
  ];

  // FAQ data
  faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your email.',
      expanded: false
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, PayPal, and campus-specific payment methods. All transactions are secured with SSL encryption.',
      expanded: false
    },
    {
      id: '3',
      question: 'How do I contact a seller?',
      answer: 'You can contact sellers directly through our messaging system. Click on any listing and use the "Contact Seller" button to start a conversation.',
      expanded: false
    },
    {
      id: '4',
      question: 'What is the return policy?',
      answer: 'We offer a 7-day return policy for most items. Returns must be in original condition and packaging. Contact the seller first before initiating a return.',
      expanded: false
    }
  ];

  // Video tutorials data
  videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'Getting Started with Markt',
      duration: '5:32',
      thumbnail: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c436e43726-62ab0b7f5743104117d3.png',
      description: 'Learn the basics of using Markt platform'
    },
    {
      id: '2',
      title: 'Making Your First Purchase',
      duration: '3:45',
      thumbnail: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c436e43726-62ab0b7f5743104117d3.png',
      description: 'Step-by-step guide to making your first purchase'
    },
    {
      id: '3',
      title: 'Creating Great Listings',
      duration: '7:21',
      thumbnail: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/c436e43726-62ab0b7f5743104117d3.png',
      description: 'Tips for creating attractive and effective product listings'
    }
  ];

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Performs search with the current search query
   * In a real implementation, this would call a search service
   */
  performSearch(): void {
    if (this.searchQuery.trim()) {
      // TODO: Implement actual search functionality
      // this.searchService.searchArticles(this.searchQuery);
    }
  }

  /**
   * Searches for a specific suggested term
   * @param term - The search term to use
   */
  searchForTerm(term: string): void {
    this.searchQuery = term;
    this.performSearch();
  }

  /**
   * Selects a support category for filtering
   * @param categoryId - The ID of the category to select
   */
  selectCategory(categoryId: string): void {
    this.selectedCategory = this.selectedCategory === categoryId ? '' : categoryId;
    // TODO: Implement category filtering
    // this.filterArticlesByCategory(this.selectedCategory);
  }

  /**
   * Toggles the expanded state of an FAQ item
   * @param faqId - The ID of the FAQ to toggle
   */
  toggleFAQ(faqId: string): void {
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.expanded = !faq.expanded;
    }
  }

  /**
   * Starts live chat support
   * In a real implementation, this would integrate with a chat service
   */
  startLiveChat(): void {
    // TODO: Implement live chat functionality
    // this.chatService.openLiveChat();
  }

  /**
   * Opens support ticket submission
   * In a real implementation, this would navigate to ticket creation
   */
  submitTicket(): void {
    // TODO: Navigate to ticket creation form
    // this.router.navigate(['/support/tickets/create']);
  }

  /**
   * Opens email support
   * In a real implementation, this would open email client or contact form
   */
  emailSupport(): void {
    // TODO: Open email client or contact form
    // window.location.href = 'mailto:support@markt.com';
  }
}

