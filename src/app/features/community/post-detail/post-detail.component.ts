import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SocialService, Post, PostComment } from '../../../domains/social';

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

        <!-- Loading State -->
        <div *ngIf="loading" class="post-card">
          <div class="loading-state">Loading post...</div>
        </div>

        <!-- Post Content -->
        <div class="post-card" *ngIf="!loading && post">
          <div class="post-header">
            <div class="post-author">
              <img [src]="post.author?.profilePictureUrl || '/markt-text-logo.png'" [alt]="post.author?.displayName || 'User'" class="author-avatar">
              <div class="author-info">
                <div class="author-name">{{ post.author?.displayName || post.author?.username || 'Unknown' }}</div>
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
            <p class="post-text">{{ post.caption || '' }}</p>
            <div class="post-image" *ngIf="post.media && post.media.length > 0">
              <img [src]="post.media[0]?.media?.original_url || post.media[0]?.media?.thumbnail_url || post.media[0]?.media?.social_post_url || post.media[0]?.media?.social_square_url || ''" [alt]="post.caption || 'Post image'" class="post-img">
            </div>
          </div>

          <div class="post-stats">
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {{ post.likeCount || 0 }} likes
            </div>
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {{ post.commentCount || 0 }} comments
            </div>
            <div class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16,6 12,2 8,6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              0 shares
            </div>
          </div>

          <div class="post-actions">
            <button class="action-btn" [class.liked]="post.isLiked" (click)="likePost()">
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
        <div class="comments-section" *ngIf="post">
          <h3>Comments ({{ post?.commentCount || 0 }})</h3>
          
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
                <img [src]="comment.author?.profilePictureUrl || '/markt-text-logo.png'" [alt]="comment.author?.displayName || comment.author?.username || 'User'" class="comment-avatar">
                <div class="comment-info">
                  <div class="comment-author-name">{{ comment.author?.displayName || comment.author?.username || 'Unknown' }}</div>
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

    .loading-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
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
  private socialService = inject(SocialService);
  private destroyRef = inject(DestroyRef);

  post: Post | null = null;
  comments: PostComment[] = [];
  newComment = '';
  loading = false;

  ngOnInit(): void {
    // Subscribe to selectedPost$ signal for reactive updates
    this.socialService.selectedPost$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((post) => {
        if (post) {
          this.post = post;
        }
      });

    // Subscribe to comments$ signal for reactive updates
    this.socialService.comments$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.comments = response?.items ?? [];
      });

    this.loadPost();
  }

  private loadPost(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    
    if (postId) {
      this.loading = true;
      
      // Use SocialService.getPost() - returns Post domain model
      this.socialService.getPost(postId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (post) => {
            this.post = post;
            this.loadComments(postId);
          },
          error: (error) => {
            console.error('Error loading post:', error);
          }
        });
    }
  }

  private loadComments(postId: string): void {
    // Use SocialService.getPostComments() - returns PaginatedResponse<PostComment>
    this.socialService.getPostComments(postId).subscribe({
      next: () => {
        // Comments are automatically updated via comments$ signal
      },
      error: (error) => {
        console.error('Error loading post comments:', error);
        this.comments = [];
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/feed']);
  }

  likePost(): void {
    if (this.post) {
      // Use SocialService.togglePostLike() - returns updated Post domain model
      this.socialService.togglePostLike(this.post.id).subscribe({
        next: (updatedPost) => {
          this.post = updatedPost; // Update with new Post model
        },
        error: (error) => {
          console.error('Error toggling post like:', error);
        }
      });
    }
  }

  addComment(): void {
    if (this.newComment.trim() && this.post) {
      // Use SocialService.addComment() - returns PostComment domain model
      this.socialService.addComment(this.post.id, { content: this.newComment }).subscribe({
        next: () => {
          // Comments are automatically updated via comments$ signal
          this.newComment = '';
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }
} 