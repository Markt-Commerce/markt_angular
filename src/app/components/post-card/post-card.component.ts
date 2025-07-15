import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface PostProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  likes: number;
  comments: PostComment[];
  shares: number;
  createdAt: string;
  type: 'product' | 'request' | 'story';
  isLiked?: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css',
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() currentUser?: CurrentUser;
  @Input() showComments: boolean = false;

  @Output() like = new EventEmitter<Post>();
  @Output() comment = new EventEmitter<Post>();
  @Output() share = new EventEmitter<Post>();
  @Output() viewProduct = new EventEmitter<PostProduct>();
  @Output() imageClick = new EventEmitter<{ image: string; index: number }>();
  @Output() moreOptions = new EventEmitter<Post>();

  newComment: string = '';

  get isLiked(): boolean {
    return this.post.isLiked || false;
  }

  formatTime(timestamp: string): string {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = now.getTime() - postTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return postTime.toLocaleDateString();
    }
  }

  onLike() {
    this.like.emit(this.post);
  }

  onComment() {
    this.comment.emit(this.post);
  }

  onShare() {
    this.share.emit(this.post);
  }

  onViewProduct() {
    // Handle product view
  }

  onImageClick(image: string, index: number) {
    this.imageClick.emit({ image, index });
  }

  onMoreOptions() {
    this.moreOptions.emit(this.post);
  }

  onSubmitComment() {
    if (this.newComment.trim()) {
      // Add comment logic here
      this.newComment = '';
    }
  }
}
