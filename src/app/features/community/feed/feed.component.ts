import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="feed-container">
      <div class="feed-header">
        <h1>Community Feed</h1>
        <p>Stay updated with the latest posts and discussions</p>
      </div>

      <div class="feed-content">
        <!-- Create Post Section -->
        <div class="create-post-section">
          <div class="post-input">
            <textarea 
              placeholder="What's on your mind? Share a post with the community..."
              class="post-textarea"
            ></textarea>
            <div class="post-actions">
              <button class="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Photo
              </button>
              <button class="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                </svg>
                Poll
              </button>
              <app-button variant="primary" size="sm">Post</app-button>
            </div>
          </div>
        </div>

        <!-- Feed Posts -->
        <div class="posts-section">
          <div class="post-item" *ngFor="let post of mockPosts">
            <div class="post-header">
              <div class="post-author">
                <img [src]="post.author.avatar" [alt]="post.author.name" class="author-avatar">
                <div class="author-info">
                  <div class="author-name">{{ post.author.name }}</div>
                  <div class="post-time">{{ post.createdAt | date:'short' }}</div>
                </div>
              </div>
              <button class="post-menu-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>

            <div class="post-content">
              <p class="post-text">{{ post.content }}</p>
              <div class="post-image" *ngIf="post.image">
                <img [src]="post.image" [alt]="post.content" class="post-img">
              </div>
            </div>

            <div class="post-actions">
              <button class="action-btn" [class.liked]="post.isLiked">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {{ post.likes }} Like{{ post.likes !== 1 ? 's' : '' }}
              </button>
              <button class="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {{ post.comments }} Comment{{ post.comments !== 1 ? 's' : '' }}
              </button>
              <button class="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16,6 12,2 8,6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feed-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .feed-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .feed-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .feed-header p {
      color: #6b7280;
      font-size: 1.125rem;
    }

    .feed-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Create Post Section */
    .create-post-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .post-input {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .post-textarea {
      width: 100%;
      min-height: 100px;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      font-size: 1rem;
    }

    .post-textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .post-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      color: #6b7280;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .action-btn.liked {
      color: #ef4444;
    }

    /* Posts Section */
    .posts-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .post-item {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-name {
      font-weight: 600;
      color: #1f2937;
    }

    .post-time {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .post-menu-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
    }

    .post-menu-btn:hover {
      background: #f3f4f6;
    }

    .post-content {
      margin-bottom: 1rem;
    }

    .post-text {
      color: #374151;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .post-image {
      border-radius: 8px;
      overflow: hidden;
    }

    .post-img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }

    .post-actions {
      display: flex;
      gap: 1rem;
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .feed-container {
        padding: 1rem;
      }

      .post-actions {
        flex-wrap: wrap;
      }

      .action-btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class FeedComponent {
  mockPosts = [
    {
      id: 1,
      author: {
        name: 'John Doe',
        avatar: '/assets/placeholder-avatar.jpg'
      },
      content: 'Just found an amazing deal on the marketplace! Check out this vintage camera I scored for a great price. The seller was super helpful and the item was exactly as described.',
      image: '/assets/placeholder-product.jpg',
      likes: 24,
      comments: 8,
      isLiked: false,
      createdAt: new Date('2024-01-15T10:30:00Z')
    },
    {
      id: 2,
      author: {
        name: 'Sarah Wilson',
        avatar: '/assets/placeholder-avatar.jpg'
      },
      content: 'Looking for recommendations on the best local sellers for handmade jewelry. Anyone have suggestions? I love supporting local artisans!',
      likes: 12,
      comments: 15,
      isLiked: true,
      createdAt: new Date('2024-01-15T09:15:00Z')
    },
    {
      id: 3,
      author: {
        name: 'Mike Johnson',
        avatar: '/assets/placeholder-avatar.jpg'
      },
      content: 'Successfully completed my first sale on Markt! The buyer was great to work with and the transaction went smoothly. Highly recommend this platform for buying and selling.',
      likes: 31,
      comments: 5,
      isLiked: false,
      createdAt: new Date('2024-01-15T08:45:00Z')
    }
  ];
} 