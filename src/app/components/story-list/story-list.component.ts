import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isViewed: boolean;
  isCurrentUser?: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-list.component.html',
  styleUrl: './story-list.component.css',
})
export class StoryListComponent {
  @Input() stories: Story[] = [];
  @Input() loading = false;
  @Output() storyClick = new EventEmitter<Story>();
  @Output() addStory = new EventEmitter<void>();

  onStoryClick(story: Story) {
    this.storyClick.emit(story);
  }

  onAddStory() {
    this.addStory.emit();
  }
}
