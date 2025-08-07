import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="post-detail-container">
      <div class="post-detail-content">
        <!-- Back Button -->
        <div class="back-section">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Back to Feed
          </button>
        </div>

        <!-- Post Content -->
        <div class="post-card">
          <div class="post-header">
            <div class="post-author">
              <img [src]="post.author.avatar" [alt]="post.author.name" class="author-avatar">
              <div class="author-info">
                <div class="author-name">{{ post.author.name }}</div>
                <div class="post-time">{{ post.createdAt | date:'medium' }}</div>
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

          <div class="post-stats">
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {{ post.likes }} likes
            </div>
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {{ post.comments }} comments
            </div>
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16,6 12,2 8,6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              {{ post.shares }} shares
            </div>
          </div>

          <div class="post-actions">
            <button class="action-btn" [class.liked]="post.isLiked">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Like
            </button>
            <button class="action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Comment
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

        <!-- Comments Section -->
        <div class="comments-section">
          <h3>Comments ({{ post.comments }})</h3>
          
          <!-- Add Comment -->
          <div class="add-comment">
            <textarea 
              placeholder="Write a comment..."
              class="comment-input"
              [(ngModel)]="newComment"
            ></textarea>
            <app-button 
              variant="primary" 
              size="sm"
              (clicked)="addComment()"
              [disabled]="!newComment.trim()"
            >
              Post Comment
            </app-button>
          </div>

          <!-- Comments List -->
          <div class="comments-list">
            <div class="comment-item" *ngFor="let comment of comments">
              <div class="comment-author">
                <img [src]="comment.author.avatar" [alt]="comment.author.name" class="comment-avatar">
                <div class="comment-info">
                  <div class="comment-author-name">{{ comment.author.name }}</div>
                  <div class="comment-time">{{ comment.createdAt | date:'short' }}</div>
                </div>
              </div>
              <div class="comment-content">
                <p>{{ comment.content }}</p>
              </div>
              <div class="comment-actions">
                <button class="comment-action-btn">Like</button>
                <button class="comment-action-btn">Reply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .back-section {
      margin-bottom: 2rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .post-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .author-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-name {
      font-weight: 600;
      color: #1f2937;
      font-size: 1.125rem;
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
      padding: 0.5rem;
      border-radius: 6px;
    }

    .post-menu-btn:hover {
      background: #f3f4f6;
    }

    .post-content {
      margin-bottom: 1.5rem;
    }

    .post-text {
      color: #374151;
      line-height: 1.7;
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }

    .post-image {
      border-radius: 12px;
      overflow: hidden;
    }

    .post-img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }

    .post-stats {
      display: flex;
      gap: 2rem;
      padding: 1rem 0;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .post-actions {
      display: flex;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      background: none;
      color: #6b7280;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      font-weight: 500;
    }

    .action-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .action-btn.liked {
      color: #ef4444;
    }

    /* Comments Section */
    .comments-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .comments-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1.5rem;
    }

    .add-comment {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: flex-start;
    }

    .comment-input {
      flex: 1;
      min-height: 80px;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      font-size: 1rem;
    }

    .comment-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .comment-item {
      padding: 1rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .comment-item:last-child {
      border-bottom: none;
    }

    .comment-author {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .comment-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .comment-author-name {
      font-weight: 600;
      color: #1f2937;
    }

    .comment-time {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .comment-content p {
      color: #374151;
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    .comment-actions {
      display: flex;
      gap: 1rem;
    }

    .comment-action-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.25rem 0;
    }

    .comment-action-btn:hover {
      color: #374151;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .post-detail-container {
        padding: 1rem;
      }

      .post-card {
        padding: 1.5rem;
      }

      .post-stats {
        flex-direction: column;
        gap: 0.5rem;
      }

      .post-actions {
        flex-wrap: wrap;
      }

      .add-comment {
        flex-direction: column;
      }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  post = {
    id: 1,
    author: {
              name: 'User',
      avatar: '""'
    },
    content: 'Just found an amazing deal on the marketplace! Check out this vintage camera I scored for a great price. The seller was super helpful and the item was exactly as described. I\'ve been looking for this model for months and finally found it in perfect condition. The community here is really great for finding unique items and connecting with local sellers.',
    image: '""',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    createdAt: new Date('2024-01-15T10:30:00Z')
  };

  comments = [
    {
      id: 1,
      author: {
        name: 'Sarah Wilson',
        avatar: '""'
      },
      content: 'That\'s a beautiful camera! I love vintage photography equipment. How much did you get it for?',
      createdAt: new Date('2024-01-15T11:00:00Z')
    },
    {
      id: 2,
      author: {
        name: 'Mike Johnson',
        avatar: '""'
      },
      content: 'Great find! I\'ve been using Markt for a while now and the quality of items is always impressive.',
      createdAt: new Date('2024-01-15T11:30:00Z')
    }
  ];

  newComment = '';
  loading = false;

  ngOnInit(): void {
    this.loadPost();
  }

  private loadPost(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    
    if (postId) {
      this.loading = true;
      
      this.apiService.getPost(postId).subscribe({
        next: (response) => {
          this.post = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading post:', error);
          this.loading = false;
        }
      });

      // Load post comments
      this.apiService.getPostComments(postId).subscribe({
        next: (response) => {
          this.comments = response.data || [];
        },
        error: (error) => {
          console.error('Error loading post comments:', error);
          this.comments = [];
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/app/feed']);
  }

  likePost(): void {
    if (this.post) {
      this.apiService.likePost(this.post.id.toString()).subscribe({
        next: (response) => {
          this.post!.isLiked = !this.post!.isLiked;
          this.post!.likes += this.post!.isLiked ? 1 : -1;
        },
        error: (error) => {
          console.error('Error liking post:', error);
        }
      });
    }
  }

  addComment(): void {
    if (this.newComment.trim() && this.post) {
      this.apiService.commentOnPost(this.post.id.toString(), { content: this.newComment }).subscribe({
        next: (response) => {
          this.comments.push(response.data);
          this.post!.comments += 1;
          this.newComment = '';
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }
} 