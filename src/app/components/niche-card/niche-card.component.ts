import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NicheBadge {
  text: string;
  count?: number;
  type?: 'success' | 'warning' | 'error' | 'info';
}

export interface PreviewProduct {
  id: string;
  name: string;
  image: string;
  price: number;
}

export interface Niche {
  id: string;
  name: string;
  description: string;
  icon: string;
  followers: number;
  products: number;
  sellers: number;
  growthRate: number;
  avgRating: number;
  lastActivity: Date;
  isFeatured: boolean;
  isTrending: boolean;
  isFollowing: boolean;
  tags?: string[];
  previewProducts: PreviewProduct[];
  badge?: NicheBadge;
}

@Component({
  selector: 'app-niche-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './niche-card.component.html',
  styleUrl: './niche-card.component.css',
})
export class NicheCardComponent {
  @Input() niche!: Niche;

  @Output() nicheClick = new EventEmitter<Niche>();
  @Output() follow = new EventEmitter<Niche>();
  @Output() share = new EventEmitter<Niche>();
  @Output() explore = new EventEmitter<Niche>();
  @Output() viewAll = new EventEmitter<Niche>();

  onNicheClick() {
    this.nicheClick.emit(this.niche);
  }

  onFollow() {
    this.niche.isFollowing = !this.niche.isFollowing;
    this.follow.emit(this.niche);
  }

  onShare() {
    this.share.emit(this.niche);
  }

  onExplore() {
    this.explore.emit(this.niche);
  }

  onViewAll() {
    this.viewAll.emit(this.niche);
  }

  formatLastActivity(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
