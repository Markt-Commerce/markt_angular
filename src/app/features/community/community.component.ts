import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ApiService } from '../../core/services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCommentDots, 
  faHeart, 
  faShare, 
  faEllipsisV, 
  faCamera, 
  faTimes,
  faMobileAlt,
  faComment,
  faShoppingCart,
  faMoneyBill,
  faStar,
  faExclamationTriangle,
  faEdit,
  faComments,
  faCalendarAlt,
  faThumbtack
} from '@fortawesome/free-solid-svg-icons';

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent, InputComponent, FontAwesomeModule],
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
              @for (category of categories; track category.id) {
                <button 
                  class="category-item"
                  [class.active]="selectedCategory === category.id"
                  (click)="selectCategory(category.id)"
                >
                   <span class="category-icon"><fa-icon [icon]="category.icon"></fa-icon></span>
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-count">{{ category.count }}</span>
                </button>
              }
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Trending Topics</h3>
            <div class="trending-topics">
              @for (topic of trendingTopics; track topic.name) {
                <div class="trending-topic">
                  <span class="topic-tag">#{{ topic.name }}</span>
                  <span class="topic-posts">{{ topic.posts }} posts</span>
                </div>
              }
            </div>
          </div>

          <div class="sidebar-section">
            <h3>Community Guidelines</h3>
            <div class="guidelines">
              <div class="guideline-item">
                <i class="fas fa-check text-green-500"></i>
                <span>Be respectful and kind</span>
              </div>
              <div class="guideline-item">
                <i class="fas fa-check text-green-500"></i>
                <span>Share relevant content</span>
              </div>
              <div class="guideline-item">
                <i class="fas fa-check text-green-500"></i>
                <span>No spam or advertising</span>
              </div>
              <div class="guideline-item">
                <i class="fas fa-check text-green-500"></i>
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

          @if (activeTab === 'posts') {
            <!-- Loading State for Posts -->
            @if (loadingPosts) {
              <div class="content-list">
                @for (i of [1,2,3]; track i) {
                  <div class="post-card">
                    <div class="post-header">
                      <div class="post-author">
                        <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div class="author-info">
                          <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          <div class="h-3 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                        </div>
                      </div>
                    </div>
                    <div class="post-content">
                      <div class="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div class="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div class="post-actions-bar">
                      <div class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (errorPosts) {
              <!-- Error State for Posts -->
               <div class="content-list">
                 <div class="text-center py-12">
                   <div class="text-4xl mb-4"><fa-icon [icon]="faExclamationTriangle"></fa-icon></div>
                   <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading posts</h3>
                  <p class="text-gray-500 mb-6">{{ errorPosts }}</p>
                  <app-button
                    variant="primary"
                    size="md"
                    (click)="loadPosts()"
                  >
                    Try Again
                  </app-button>
                </div>
              </div>
            } @else if (posts.length === 0) {
              <!-- Empty State for Posts -->
               <div class="content-list">
                 <div class="text-center py-12">
                   <div class="text-4xl mb-4"><fa-icon [icon]="faEdit"></fa-icon></div>
                   <h3 class="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p class="text-gray-500 mb-6">Be the first to share something with the community!</p>
                  <app-button
                    variant="primary"
                    size="md"
                    (click)="showCreatePost = true"
                  >
                    Create First Post
                  </app-button>
                </div>
              </div>
            } @else {
              <!-- Posts Content -->
              <div class="content-list">
                @for (post of posts; track post.id) {
                  <div class="post-card">
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
                      @if (post.image) {
                        <img [src]="post.image" [alt]="'Post image'" class="post-image">
                      }
                    </div>

                    @if (post.tags.length > 0) {
                      <div class="post-tags">
                        @for (tag of post.tags; track tag) {
                          <span class="post-tag">#{{ tag }}</span>
                        }
                      </div>
                    }

                    <div class="post-actions-bar">
                       <button 
                         class="action-button"
                         [class.liked]="post.is_liked"
                         (click)="toggleLike(post)"
                       >
                         <span class="action-icon"><fa-icon [icon]="faHeart"></fa-icon></span>
                         <span>{{ post.likes }}</span>
                       </button>
                      
                      <button class="action-button" (click)="showComments(post)">
                        <span class="action-icon"><fa-icon [icon]="faCommentDots"></fa-icon></span>
                        <span>{{ post.comments }}</span>
                      </button>
                      
                       <button class="action-button" (click)="sharePost(post)">
                         <span class="action-icon"><fa-icon [icon]="faShare"></fa-icon></span>
                         <span>{{ post.shares }}</span>
                       </button>
                    </div>
                  </div>
                }
              </div>
            }
          }

          @if (activeTab === 'discussions') {
            <!-- Loading State for Discussions -->
            @if (loadingDiscussions) {
              <div class="content-list">
                @for (i of [1,2,3]; track i) {
                  <div class="discussion-card">
                    <div class="discussion-header">
                      <div class="discussion-category">
                        <div class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div class="discussion-stats">
                        <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div class="discussion-content">
                      <div class="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div class="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div class="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div class="discussion-footer">
                      <div class="discussion-author">
                        <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                        <div class="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (errorDiscussions) {
              <!-- Error State for Discussions -->
               <div class="content-list">
                 <div class="text-center py-12">
                   <div class="text-4xl mb-4"><fa-icon [icon]="faExclamationTriangle"></fa-icon></div>
                   <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading discussions</h3>
                  <p class="text-gray-500 mb-6">{{ errorDiscussions }}</p>
                  <app-button
                    variant="primary"
                    size="md"
                    (click)="loadDiscussions()"
                  >
                    Try Again
                  </app-button>
                </div>
              </div>
            } @else if (discussions.length === 0) {
              <!-- Empty State for Discussions -->
               <div class="content-list">
                 <div class="text-center py-12">
                   <div class="text-4xl mb-4"><fa-icon [icon]="faComments"></fa-icon></div>
                   <h3 class="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                  <p class="text-gray-500 mb-6">Start a conversation with the community!</p>
                  <app-button
                    variant="primary"
                    size="md"
                    (click)="showCreatePost = true"
                  >
                    Start Discussion
                  </app-button>
                </div>
              </div>
            } @else {
              <!-- Discussions Content -->
              <div class="content-list">
                @for (discussion of discussions; track discussion.id) {
                  <div class="discussion-card">
                    <div class="discussion-header">
                      <div class="discussion-category">
                        <span class="category-badge">{{ discussion.category }}</span>
                         @if (discussion.is_pinned) {
                           <span class="pinned-badge"><fa-icon [icon]="faThumbtack"></fa-icon> Pinned</span>
                         }
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
                }
              </div>
            }
          }

          @if (activeTab === 'events') {
            <div class="content-list">
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
          }
        </div>
      </div>

      <!-- Create Post Modal -->
      @if (showCreatePost) {
        <div class="modal-overlay" (click)="closeCreatePost()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Create Post</h2>
              <button class="close-button" (click)="closeCreatePost()"><fa-icon [icon]="faTimes"></fa-icon></button>
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
      }
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

    /* Utility classes for loading skeleton */
    .w-10 { width: 2.5rem; }
    .h-10 { height: 2.5rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
    .w-32 { width: 8rem; }
    .h-4 { height: 1rem; }
    .w-20 { width: 5rem; }
    .h-3 { height: 0.75rem; }
    .h-5 { height: 1.25rem; }
    .h-8 { height: 2rem; }
    .w-16 { width: 4rem; }
    .w-24 { width: 6rem; }
    .w-full { width: 100%; }
    .w-3\/4 { width: 75%; }
    .w-2\/3 { width: 66.666667%; }
    .mt-1 { margin-top: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-center { text-align: center; }
    .font-medium { font-weight: 500; }
    .bg-gray-200 { background-color: #e5e7eb; }
    .text-gray-900 { color: #111827; }
    .text-gray-500 { color: #6b7280; }
    .text-green-500 { color: #10b981; }
    .rounded-full { border-radius: 9999px; }
    .rounded { border-radius: 0.25rem; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
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
  private apiService = inject(ApiService);

  activeTab = 'posts';
  selectedCategory = 'all';
  sortBy = 'recent';
  timeFilter = 'all';
  showCreatePost = false;
  submitting = false;

  createPostForm!: FormGroup;

  // Font Awesome icons
  faCommentDots = faCommentDots;
  faHeart = faHeart;
  faShare = faShare;
  faEllipsisV = faEllipsisV;
  faCamera = faCamera;
  faTimes = faTimes;
  faMobileAlt = faMobileAlt;
  faComment = faComment;
  faShoppingCart = faShoppingCart;
  faMoneyBill = faMoneyBill;
  faStar = faStar;
  faExclamationTriangle = faExclamationTriangle;
  faEdit = faEdit;
  faComments = faComments;
  faCalendarAlt = faCalendarAlt;
  faThumbtack = faThumbtack;

  categories = [
    { id: 'all', name: 'All Posts', icon: faMobileAlt, count: 1250 },
    { id: 'general', name: 'General', icon: faComment, count: 450 },
    { id: 'buying', name: 'Buying Tips', icon: faShoppingCart, count: 320 },
    { id: 'selling', name: 'Selling Tips', icon: faMoneyBill, count: 280 },
    { id: 'reviews', name: 'Product Reviews', icon: faStar, count: 200 }
  ];

  trendingTopics = [
    { name: 'markettips', posts: 45 },
    { name: 'productreview', posts: 32 },
    { name: 'buyingguide', posts: 28 },
    { name: 'sellingadvice', posts: 25 },
    { name: 'community', posts: 22 }
  ];

  posts: CommunityPost[] = [];
  discussions: CommunityDiscussion[] = [];
  
  // Loading states
  loadingPosts = false;
  loadingDiscussions = false;
  
  // Error states
  errorPosts = '';
  errorDiscussions = '';

  ngOnInit(): void {
    this.initForm();
    this.loadPosts();
  }

  private initForm(): void {
    this.createPostForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: ['']
    });
  }

  loadPosts(): void {
    this.loadingPosts = true;
    this.errorPosts = '';
    
    this.apiService.getPersonalizedFeed().subscribe({
      next: (response) => {
        this.posts = response.data || [];
        this.loadingPosts = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.posts = [];
        this.loadingPosts = false;
        this.errorPosts = error.message || 'Failed to load posts. Please try again.';
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'discussions' && this.discussions.length === 0 && !this.loadingDiscussions) {
      this.loadDiscussions();
    }
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  applyFilters(): void {
    const params = {
      category: this.selectedCategory,
      sort: this.sortBy,
      time: this.timeFilter
    };
    
    this.loadingPosts = true;
    this.errorPosts = '';
    
    this.apiService.getPersonalizedFeed(params).subscribe({
      next: (response) => {
        this.posts = response.data || [];
        this.loadingPosts = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.loadingPosts = false;
        this.errorPosts = error.message || 'Failed to apply filters. Please try again.';
      }
    });
  }

  loadDiscussions(): void {
    this.loadingDiscussions = true;
    this.errorDiscussions = '';
    
    // TODO: Implement when backend endpoint is available
    // For now, simulate loading
    setTimeout(() => {
      this.discussions = [];
      this.loadingDiscussions = false;
    }, 1000);
  }

  toggleLike(post: CommunityPost): void {
    this.apiService.togglePostLike(post.id).subscribe({
      next: (response) => {
        post.is_liked = !post.is_liked;
        post.likes += post.is_liked ? 1 : -1;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }

  showComments(post: CommunityPost): void {
    this.router.navigate(['/app/community/post', post.id]);
  }

  sharePost(post: CommunityPost): void {
    this.apiService.shareProduct(post.id).subscribe({
      next: (response) => {
        post.shares += 1;
      },
      error: (error) => {
        console.error('Error sharing post:', error);
      }
    });
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

      const postData = {
        caption: formData.content,
        tags: tags
      };

      this.apiService.createPost(postData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.closeCreatePost();
          this.loadPosts();
        },
        error: (error) => {
          console.error('Error creating post:', error);
          this.submitting = false;
        }
      });
    }
  }

  subscribeToEvents(): void {
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