import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  is_liked: boolean;
  tags: string[];
}

interface CommunityDiscussion {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  replies: number;
  views: number;
  created_at: string;
  category: string;
  is_pinned: boolean;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="community-container">
      <div class="community-header">
        <div class="header-content">
          <h1>Community</h1>
          <p>Connect with other buyers and sellers in the Markt community</p>
        </div>
        <div class="header-actions">
          <app-button
            variant="primary"
            size="md"
            (click)="showCreatePost = true"
          >
            Create Post
          </app-button>
        </div>
      </div>

      <div class="community-content">
        <div class="community-sidebar">
          <div class="sidebar-section">
            <h3>Categories</h3>
            <div class="category-list">
              <button 
                *ngFor="let category of categories" 
                class="category-item"
                [class.active]="selectedCategory === category.id"
                (click)="selectCategory(category.id)"
              >
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.count }}</span>
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Trending Topics</h3>
            <div class="trending-topics">
              <div *ngFor="let topic of trendingTopics" class="trending-topic">
                <span class="topic-tag">#{{ topic.name }}</span>
                <span class="topic-posts">{{ topic.posts }} posts</span>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Community Guidelines</h3>
            <div class="guidelines">
              <div class="guideline-item">
                <span class="guideline-icon">✅</span>
                <span>Be respectful and kind</span>
              </div>
              <div class="guideline-item">
                <span class="guideline-icon">✅</span>
                <span>Share relevant content</span>
              </div>
              <div class="guideline-item">
                <span class="guideline-icon">✅</span>
                <span>No spam or advertising</span>
              </div>
              <div class="guideline-item">
                <span class="guideline-icon">✅</span>
                <span>Follow community rules</span>
              </div>
            </div>
          </div>
        </div>

        <div class="community-main">
          <div class="content-tabs">
            <button 
              class="tab-button"
              [class.active]="activeTab === 'posts'"
              (click)="setActiveTab('posts')"
            >
              Posts
            </button>
            <button 
              class="tab-button"
              [class.active]="activeTab === 'discussions'"
              (click)="setActiveTab('discussions')"
            >
              Discussions
            </button>
            <button 
              class="tab-button"
              [class.active]="activeTab === 'events'"
              (click)="setActiveTab('events')"
            >
              Events
            </button>
          </div>

          <div class="content-filters">
            <div class="filter-group">
              <label>Sort by:</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Time:</label>
              <select [(ngModel)]="timeFilter" (change)="applyFilters()" class="filter-select">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <div class="content-list" *ngIf="activeTab === 'posts'">
            <div *ngFor="let post of posts" class="post-card">
              <div class="post-header">
                <div class="post-author">
                  <img [src]="post.author.avatar" [alt]="post.author.name" class="author-avatar">
                  <div class="author-info">
                    <h4>{{ post.author.name }}</h4>
                    <span class="post-time">{{ formatTime(post.created_at) }}</span>
                  </div>
                </div>
                <div class="post-actions">
                  <button class="action-button">⋯</button>
                </div>
              </div>

              <div class="post-content">
                <p>{{ post.content }}</p>
                <img *ngIf="post.image" [src]="post.image" [alt]="'Post image'" class="post-image">
              </div>

              <div class="post-tags" *ngIf="post.tags.length > 0">
                <span *ngFor="let tag of post.tags" class="post-tag">#{{ tag }}</span>
              </div>

              <div class="post-actions-bar">
                <button 
                  class="action-button"
                  [class.liked]="post.is_liked"
                  (click)="toggleLike(post)"
                >
                  <span class="action-icon">❤️</span>
                  <span>{{ post.likes }}</span>
                </button>
                
                <button class="action-button" (click)="showComments(post)">
                  <span class="action-icon">💬</span>
                  <span>{{ post.comments }}</span>
                </button>
                
                <button class="action-button" (click)="sharePost(post)">
                  <span class="action-icon">📤</span>
                  <span>{{ post.shares }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="content-list" *ngIf="activeTab === 'discussions'">
            <div *ngFor="let discussion of discussions" class="discussion-card">
              <div class="discussion-header">
                <div class="discussion-category">
                  <span class="category-badge">{{ discussion.category }}</span>
                  <span *ngIf="discussion.is_pinned" class="pinned-badge">📌 Pinned</span>
                </div>
                <div class="discussion-stats">
                  <span class="stat">{{ discussion.replies }} replies</span>
                  <span class="stat">{{ discussion.views }} views</span>
                </div>
              </div>

              <div class="discussion-content">
                <h3>{{ discussion.title }}</h3>
                <p>{{ discussion.content }}</p>
              </div>

              <div class="discussion-footer">
                <div class="discussion-author">
                  <img [src]="discussion.author.avatar" [alt]="discussion.author.name" class="author-avatar">
                  <span>{{ discussion.author.name }}</span>
                </div>
                <span class="discussion-time">{{ formatTime(discussion.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="content-list" *ngIf="activeTab === 'events'">
            <div class="events-placeholder">
              <h3>Community Events</h3>
              <p>Stay tuned for upcoming community events, meetups, and virtual gatherings!</p>
              <app-button
                variant="primary"
                size="md"
                [outline]="true"
                (click)="subscribeToEvents()"
              >
                Subscribe to Events
              </app-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Post Modal -->
      <div *ngIf="showCreatePost" class="modal-overlay" (click)="closeCreatePost()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Create Post</h2>
            <button class="close-button" (click)="closeCreatePost()">×</button>
          </div>

          <form [formGroup]="createPostForm" (ngSubmit)="submitPost()" class="modal-form">
            <div class="form-group">
              <app-input
                id="content"
                name="content"
                type="textarea"
                label="What's on your mind?"
                placeholder="Share something with the community..."
                formControlName="content"
                [required]="true"
                [fullWidth]="true"
              ></app-input>
            </div>

            <div class="form-group">
              <app-input
                id="tags"
                name="tags"
                type="text"
                label="Tags (optional)"
                placeholder="Add tags separated by commas"
                formControlName="tags"
                [fullWidth]="true"
              ></app-input>
            </div>

            <div class="form-actions">
              <app-button
                type="button"
                variant="secondary"
                size="md"
                [outline]="true"
                (click)="closeCreatePost()"
              >
                Cancel
              </app-button>
              
              <app-button
                type="submit"
                variant="primary"
                size="md"
                [loading]="submitting"
                [disabled]="createPostForm.invalid || submitting"
              >
                Post
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .community-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .community-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .header-content p {
      color: #718096;
      margin: 0;
    }

    .community-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    .community-sidebar {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
      height: fit-content;
    }

    .sidebar-section {
      margin-bottom: 2rem;
    }

    .sidebar-section h3 {
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
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background 0.2s ease;
      text-align: left;
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
    }

    .category-name {
      flex: 1;
      font-weight: 500;
    }

    .category-count {
      background: #e2e8f0;
      color: #4a5568;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .trending-topics {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .trending-topic {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .topic-tag {
      color: #3182ce;
      font-weight: 500;
    }

    .topic-posts {
      color: #718096;
      font-size: 0.875rem;
    }

    .guidelines {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .guideline-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #4a5568;
    }

    .guideline-icon {
      font-size: 1rem;
    }

    .community-main {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .content-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
    }

    .tab-button {
      flex: 1;
      padding: 1rem;
      border: none;
      background: none;
      font-weight: 500;
      color: #718096;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-button:hover {
      background: #f7fafc;
    }

    .tab-button.active {
      color: #3182ce;
      border-bottom: 2px solid #3182ce;
    }

    .content-filters {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: #f7fafc;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #4a5568;
    }

    .filter-select {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .content-list {
      padding: 1rem;
    }

    .post-card {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .post-time {
      font-size: 0.875rem;
      color: #718096;
    }

    .post-content {
      margin-bottom: 1rem;
    }

    .post-content p {
      color: #2d3748;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .post-image {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .post-tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .post-tag {
      background: #ebf8ff;
      color: #3182ce;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .post-actions-bar {
      display: flex;
      gap: 1rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      color: #718096;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background: #f7fafc;
    }

    .action-button.liked {
      color: #e53e3e;
    }

    .action-icon {
      font-size: 1.125rem;
    }

    .discussion-card {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .discussion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .discussion-category {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-badge {
      background: #ebf8ff;
      color: #3182ce;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .pinned-badge {
      background: #fef5e7;
      color: #d69e2e;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .discussion-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      font-size: 0.875rem;
      color: #718096;
    }

    .discussion-content h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .discussion-content p {
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .discussion-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .discussion-author {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #4a5568;
    }

    .discussion-author .author-avatar {
      width: 24px;
      height: 24px;
    }

    .discussion-time {
      font-size: 0.875rem;
      color: #718096;
    }

    .events-placeholder {
      text-align: center;
      padding: 3rem 1rem;
    }

    .events-placeholder h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    .events-placeholder p {
      color: #718096;
      margin: 0 0 2rem 0;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #718096;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .community-container {
        padding: 1rem;
      }

      .community-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .community-content {
        grid-template-columns: 1fr;
      }

      .community-sidebar {
        order: 2;
      }

      .content-filters {
        flex-direction: column;
        gap: 0.5rem;
      }

      .post-actions-bar {
        flex-wrap: wrap;
      }

      .discussion-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CommunityComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  activeTab = 'posts';
  selectedCategory = 'all';
  sortBy = 'recent';
  timeFilter = 'all';
  showCreatePost = false;
  submitting = false;

  createPostForm!: FormGroup;

  categories = [
    { id: 'all', name: 'All Posts', icon: '📱', count: 1250 },
    { id: 'general', name: 'General', icon: '💬', count: 450 },
    { id: 'buying', name: 'Buying Tips', icon: '🛒', count: 320 },
    { id: 'selling', name: 'Selling Tips', icon: '💰', count: 280 },
    { id: 'reviews', name: 'Product Reviews', icon: '⭐', count: 200 }
  ];

  trendingTopics = [
    { name: 'markettips', posts: 45 },
    { name: 'productreview', posts: 32 },
    { name: 'buyingguide', posts: 28 },
    { name: 'sellingadvice', posts: 25 },
    { name: 'community', posts: 22 }
  ];

  posts: CommunityPost[] = [
    {
      id: '1',
      author: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://via.placeholder.com/40',
        username: 'sarahj'
      },
      content: 'Just found an amazing deal on electronics! The seller was super helpful and the product was exactly as described. Highly recommend checking out their store!',
      likes: 24,
      comments: 8,
      shares: 3,
      created_at: '2024-01-15T10:30:00Z',
      is_liked: false,
      tags: ['electronics', 'review', 'recommendation']
    },
    {
      id: '2',
      author: {
        id: '2',
        name: 'Mike Chen',
        avatar: 'https://via.placeholder.com/40',
        username: 'mikechen'
      },
      content: 'Tips for new sellers: Always take clear photos, be honest about condition, and respond quickly to messages. It makes a huge difference!',
      likes: 56,
      comments: 12,
      shares: 15,
      created_at: '2024-01-15T09:15:00Z',
      is_liked: true,
      tags: ['selling', 'tips', 'newbie']
    }
  ];

  discussions: CommunityDiscussion[] = [
    {
      id: '1',
      title: 'Best practices for shipping fragile items',
      author: {
        id: '3',
        name: 'Emma Wilson',
        avatar: 'https://via.placeholder.com/40'
      },
      content: 'I\'ve been selling vintage items and need advice on the best way to ship fragile items safely...',
      replies: 15,
      views: 234,
      created_at: '2024-01-15T08:00:00Z',
      category: 'Selling Tips',
      is_pinned: true
    },
    {
      id: '2',
      title: 'How to spot fake products when buying',
      author: {
        id: '4',
        name: 'David Brown',
        avatar: 'https://via.placeholder.com/40'
      },
      content: 'I\'ve encountered several fake products lately. What are the red flags to look out for?',
      replies: 23,
      views: 456,
      created_at: '2024-01-15T07:30:00Z',
      category: 'Buying Tips',
      is_pinned: false
    }
  ];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.createPostForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: ['']
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  applyFilters(): void {
    // Mock filter application - replace with actual API call
    console.log('Applying filters:', { category: this.selectedCategory, sort: this.sortBy, time: this.timeFilter });
  }

  toggleLike(post: CommunityPost): void {
    post.is_liked = !post.is_liked;
    post.likes += post.is_liked ? 1 : -1;
  }

  showComments(post: CommunityPost): void {
    // Mock comment display - replace with actual implementation
    alert(`Show comments for post: ${post.id}`);
  }

  sharePost(post: CommunityPost): void {
    post.shares += 1;
    // Mock share functionality - replace with actual implementation
    alert(`Share post: ${post.id}`);
  }

  closeCreatePost(): void {
    this.showCreatePost = false;
    this.createPostForm.reset();
  }

  submitPost(): void {
    if (this.createPostForm.valid) {
      this.submitting = true;
      
      const formData = this.createPostForm.value;
      const tags = formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [];

      // Mock post creation - replace with actual API call
      setTimeout(() => {
        const newPost: CommunityPost = {
          id: Date.now().toString(),
          author: {
            id: 'current-user',
            name: 'Current User',
            avatar: 'https://via.placeholder.com/40',
            username: 'currentuser'
          },
          content: formData.content,
          likes: 0,
          comments: 0,
          shares: 0,
          created_at: new Date().toISOString(),
          is_liked: false,
          tags: tags
        };

        this.posts.unshift(newPost);
        this.submitting = false;
        this.closeCreatePost();
      }, 1000);
    }
  }

  subscribeToEvents(): void {
    // Mock event subscription - replace with actual implementation
    alert('Subscribed to community events!');
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  }
} 