import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserCardData {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  isFollowing?: boolean;
  isVerified?: boolean;
  bio?: string;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() user!: UserCardData;
  @Input() showActions = true;
  @Output() follow = new EventEmitter<UserCardData>();
  @Output() message = new EventEmitter<UserCardData>();

  onFollow() {
    this.follow.emit(this.user);
  }

  onMessage() {
    this.message.emit(this.user);
  }
}
