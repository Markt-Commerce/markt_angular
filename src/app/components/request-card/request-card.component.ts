import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Buyer {
  id: string;
  name: string;
  avatar: string;
}

export interface RequestProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  specifications: string[];
}

export interface Budget {
  min: number;
  max: number;
}

export interface BuyerRequest {
  id: string;
  buyer: Buyer;
  product: RequestProduct;
  description: string;
  budget: Budget;
  timeline: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  timestamp: Date;
  deadline: Date;
  views: number;
  offers: number;
  tags?: string[];
}

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.css',
})
export class RequestCardComponent {
  @Input() request!: BuyerRequest;
  @Input() currentUserId!: string;
  @Input() isSaved: boolean = false;
  @Input() canMakeOffer: boolean = true;
  @Input() canContact: boolean = true;

  @Output() makeOffer = new EventEmitter<BuyerRequest>();
  @Output() viewDetails = new EventEmitter<BuyerRequest>();
  @Output() contactBuyer = new EventEmitter<BuyerRequest>();
  @Output() save = new EventEmitter<BuyerRequest>();
  @Output() unsave = new EventEmitter<BuyerRequest>();

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
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
      return timestamp.toLocaleDateString();
    }
  }

  getTimeLeft(): string {
    const now = new Date();
    const diff = this.request.deadline.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return 'Expired';
    }
  }

  onMakeOffer() {
    this.makeOffer.emit(this.request);
  }

  onViewDetails() {
    this.viewDetails.emit(this.request);
  }

  onContactBuyer() {
    this.contactBuyer.emit(this.request);
  }

  onSave() {
    this.save.emit(this.request);
  }

  onUnsave() {
    this.unsave.emit(this.request);
  }
}
