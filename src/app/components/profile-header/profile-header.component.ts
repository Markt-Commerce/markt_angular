import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  bio?: string;
  isVerified: boolean;
  followers: number;
  following: number;
  products: number;
  rating: number;
}

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.css',
})
export class ProfileHeaderComponent {
  @Input() profile!: Profile;
  @Input() currentUserId!: string;
  @Input() isFollowing: boolean = false;
  @Input() activeTab: string = 'posts';

  @Output() tabChange = new EventEmitter<string>();
  @Output() follow = new EventEmitter<string>();
  @Output() unfollow = new EventEmitter<string>();
  @Output() message = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();
  @Output() editProfile = new EventEmitter<void>();
  @Output() editAvatar = new EventEmitter<void>();
  @Output() editCover = new EventEmitter<void>();

  get isOwnProfile(): boolean {
    return this.profile.id === this.currentUserId;
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  onFollow() {
    this.follow.emit(this.profile.id);
  }

  onUnfollow() {
    this.unfollow.emit(this.profile.id);
  }

  onMessage() {
    this.message.emit(this.profile.id);
  }

  onShare() {
    this.share.emit(this.profile.id);
  }

  onEditProfile() {
    this.editProfile.emit();
  }

  onEditAvatar() {
    this.editAvatar.emit();
  }

  onEditCover() {
    this.editCover.emit();
  }
}
