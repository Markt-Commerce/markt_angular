import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, 
  faPlay, 
  faPause, 
  faTimes,
  faCamera,
  faVideo,
  faClock,
  faEye,
  faHeart,
  faComment,
  faShare,
  faEllipsisH,
  faTrash,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import {
  SocialService,
  type StoryCreateDto,
  type Story,
} from '../../../domains/social';
import { AuthService } from '../../../domains/authentication/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Stories</h1>
            <p class="text-sm text-gray-500">
              Share moments with your community
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              (click)="openCreateStoryModal()"
              class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors font-medium flex items-center space-x-2"
            >
              <fa-icon [icon]="faPlus" class="w-4 h-4"></fa-icon>
              <span>Create Story</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stories Grid -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex items-center justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"
          ></div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading && stories.length === 0"
          class="text-center py-12"
        >
          <fa-icon
            [icon]="faCamera"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          ></fa-icon>
          <h2 class="text-xl font-medium text-gray-900 mb-2">No stories yet</h2>
          <p class="text-gray-500 mb-6">
            Create your first story to share with your community
          </p>
          <button 
            (click)="openCreateStoryModal()"
            class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
          >
            Create Your First Story
          </button>
        </div>

        <!-- Stories Grid -->
        <div
          *ngIf="!isLoading && stories.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div 
            *ngFor="let story of stories"
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            (click)="viewStory(story)"
          >
            <!-- Story Media -->
            <div class="relative aspect-[9/16] bg-gray-100">
              <img 
                [src]="story.mediaUrl" 
                [alt]="story.caption || 'Story'"
                class="w-full h-full object-cover"
                *ngIf="story.mediaType === 'image'"
              />
              <video 
                [src]="story.mediaUrl" 
                class="w-full h-full object-cover"
                *ngIf="story.mediaType === 'video'"
                preload="metadata"
              ></video>
              
              <!-- Video Play Icon -->
              <div 
                *ngIf="story.mediaType === 'video'"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20"
              >
                <fa-icon [icon]="faPlay" class="w-8 h-8 text-white"></fa-icon>
              </div>

              <!-- Story Info Overlay -->
              <div
                class="absolute top-3 left-3 right-3 flex items-center justify-between"
              >
                <div class="flex items-center space-x-2">
                  <img 
                    [src]="
                      story.user?.profilePictureUrl || '/markt-text-logo.png'
                    "
                    [alt]="story.user?.username || 'Story author'"
                    class="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span class="text-white text-sm font-medium drop-shadow-lg">
                    {{ story.user?.username || 'Anonymous' }}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white text-xs drop-shadow-lg">
                    <fa-icon [icon]="faClock" class="w-3 h-3 mr-1"></fa-icon>
                    {{ formatTimeAgo(story.createdAt) }}
                  </span>
                </div>
              </div>

              <!-- Story Actions -->
              <div
                class="absolute bottom-3 left-3 right-3 flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <button 
                    (click)="likeStory(story, $event)"
                    class="text-white hover:text-red-400 transition-colors"
                    [class.text-red-400]="story.isLiked"
                  >
                    <fa-icon [icon]="faHeart" class="w-4 h-4"></fa-icon>
                  </button>
                  <button 
                    (click)="commentOnStory(story, $event)"
                    class="text-white hover:text-blue-400 transition-colors"
                  >
                    <fa-icon [icon]="faComment" class="w-4 h-4"></fa-icon>
                  </button>
                  <button 
                    (click)="shareStory(story, $event)"
                    class="text-white hover:text-green-400 transition-colors"
                  >
                    <fa-icon [icon]="faShare" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
                
                <!-- Story Menu -->
                <div class="relative" *ngIf="isStoryOwner(story)">
                  <button 
                    (click)="showStoryMenu(story, $event)"
                    class="text-white hover:text-gray-300 transition-colors"
                  >
                    <fa-icon [icon]="faEllipsisH" class="w-4 h-4"></fa-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Story Caption -->
            <div class="p-4" *ngIf="story.caption">
              <p class="text-sm text-gray-700 line-clamp-2">
                {{ story.caption }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Story Modal -->
      <div 
        *ngIf="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        (click)="closeCreateStoryModal()"
      >
        <div 
          class="bg-white rounded-lg max-w-md w-full mx-4 p-6"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Create Story</h3>
            <button 
              (click)="closeCreateStoryModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <fa-icon [icon]="faTimes" class="w-5 h-5"></fa-icon>
            </button>
          </div>

          <form (ngSubmit)="createStory()" #storyForm="ngForm">
            <!-- Media Upload -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Media (Image or Video)
              </label>
              <div 
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-markt-primary transition-colors cursor-pointer"
                (click)="fileInput.click()"
              >
                <fa-icon
                  [icon]="faCamera"
                  class="w-8 h-8 text-gray-400 mx-auto mb-2"
                ></fa-icon>
                <p class="text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  PNG, JPG, MP4 up to 10MB
                </p>
              </div>
              <input 
                #fileInput
                type="file" 
                accept="image/*,video/*"
                (change)="onFileSelected($event)"
                class="hidden"
              />
              <div *ngIf="selectedFile" class="mt-2">
                <p class="text-sm text-gray-600">{{ selectedFile.name }}</p>
              </div>
            </div>

            <!-- Caption -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <textarea 
                [(ngModel)]="storyCaption"
                name="caption"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-markt-primary focus:border-markt-primary"
                placeholder="Add a caption to your story..."
              ></textarea>
            </div>

            <!-- Duration (for videos) -->
            <div
              class="mb-6"
              *ngIf="selectedFile && selectedFile.type.startsWith('video/')"
            >
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <input 
                [(ngModel)]="storyDuration"
                name="duration"
                type="number"
                min="1"
                max="60"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-markt-primary focus:border-markt-primary"
              />
            </div>

            <!-- Submit Button -->
            <div class="flex items-center justify-end space-x-3">
              <button 
                type="button"
                (click)="closeCreateStoryModal()"
                class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="!selectedFile || isCreating"
                class="bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <div
                  *ngIf="isCreating"
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                ></div>
                <span>{{ isCreating ? 'Creating...' : 'Create Story' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Story Menu Dropdown -->
      <div 
        *ngIf="showMenu"
        class="fixed inset-0 z-50"
        (click)="hideStoryMenu()"
      ></div>
      <div 
        *ngIf="showMenu"
        class="fixed z-50 bg-white rounded-md shadow-lg py-1 min-w-[160px]"
        [style.left.px]="menuPosition.x"
        [style.top.px]="menuPosition.y"
      >
        <button 
          (click)="editStory(selectedStory)"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <fa-icon [icon]="faEdit" class="w-4 h-4 mr-2"></fa-icon>
          Edit
        </button>
        <button 
          (click)="deleteStory(selectedStory)"
          class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <fa-icon [icon]="faTrash" class="w-4 h-4 mr-2"></fa-icon>
          Delete
        </button>
      </div>
    </div>
  `,
  styles: [
    `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    `,
  ],
})
export class StoriesComponent implements OnInit {
  // Icons
  faPlus = faPlus;
  faPlay = faPlay;
  faPause = faPause;
  faTimes = faTimes;
  faCamera = faCamera;
  faVideo = faVideo;
  faClock = faClock;
  faEye = faEye;
  faHeart = faHeart;
  faComment = faComment;
  faShare = faShare;
  faEllipsisH = faEllipsisH;
  faTrash = faTrash;
  faEdit = faEdit;

  // Component state
  stories: Story[] = [];
  isLoading = false;
  showCreateModal = false;
  showMenu = false;
  isCreating = false;
  
  // Form data
  selectedFile: File | null = null;
  storyCaption = '';
  storyDuration = 15;
  
  // Menu state
  selectedStory: Story | null = null;
  menuPosition = { x: 0, y: 0 };

  private socialService = inject(SocialService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.socialService.stories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stories) => {
        this.stories = stories ?? [];
      });

    this.loadStories();
  }

  /**
   * Load all stories
   */
  private loadStories(): void {
    this.isLoading = true;
    
    // Migrated to SocialService.getStories() - uses DDD pattern
    this.socialService
      .getStories()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
      error: (error) => {
        console.error('Error loading stories:', error);
        this.stories = [];
        },
    });
  }

  /**
   * Open create story modal
   */
  openCreateStoryModal(): void {
    this.showCreateModal = true;
    this.resetForm();
  }

  /**
   * Close create story modal
   */
  closeCreateStoryModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  /**
   * Reset form data
   */
  resetForm(): void {
    this.selectedFile = null;
    this.storyCaption = '';
    this.storyDuration = 15;
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  /**
   * Create a new story
   */
  createStory(): void {
    if (!this.selectedFile) return;

    this.isCreating = true;
    
    // First upload the media
    // Note: This would typically use the media service
    // For now, we'll simulate the upload
    const storyData: StoryCreateDto = {
      media_type: this.selectedFile.type.startsWith('image/')
        ? 'image'
        : 'video',
      media_url: URL.createObjectURL(this.selectedFile), // This would be the uploaded URL
      duration: this.selectedFile.type.startsWith('video/')
        ? this.storyDuration
        : undefined,
      caption: this.storyCaption,
    };

    this.socialService
      .createStory(storyData)
      .pipe(finalize(() => (this.isCreating = false)))
      .subscribe({
        next: () => {
        this.closeCreateStoryModal();
      },
      error: (error) => {
        console.error('Error creating story:', error);
        },
    });
  }

  /**
   * View a story
   */
  viewStory(story: Story): void {
    this.router.navigate(['/app/social/stories', story.id]);
  }

  /**
   * Like a story
   */
  likeStory(story: Story, event: Event): void {
    event.stopPropagation();
    // Implement like functionality
  }

  /**
   * Comment on a story
   */
  commentOnStory(story: Story, event: Event): void {
    event.stopPropagation();
    // Implement comment functionality
  }

  /**
   * Share a story
   */
  shareStory(story: Story, event: Event): void {
    event.stopPropagation();
    // Implement share functionality
  }

  /**
   * Show story menu
   */
  showStoryMenu(story: Story, event: Event): void {
    event.stopPropagation();
    this.selectedStory = story;
    this.menuPosition = {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY,
    };
    this.showMenu = true;
  }

  /**
   * Hide story menu
   */
  hideStoryMenu(): void {
    this.showMenu = false;
    this.selectedStory = null;
  }

  /**
   * Edit a story
   */
  editStory(story: Story | null): void {
    if (!story) return;
    
    this.selectedStory = story;
    this.storyCaption = story.caption || '';
    this.showCreateModal = true; // Reusing create modal for edit
  }

  /**
   * Delete a story
   */
  deleteStory(story: Story | null): void {
    if (!story) return;
    
    if (confirm('Are you sure you want to delete this story?')) {
      this.socialService.deleteStory(story.id).subscribe({
        next: () => {
          this.showCreateModal = false; // Close modal after deletion
        },
        error: (error) => {
          console.error('Error deleting story:', error);
        },
      });
    }
  }

  /**
   * Check if current user owns the story
   */
  isStoryOwner(story: Story): boolean {
    return story.userId === this.authService.getCurrentUser()?.id;
  }

  /**
   * Format time ago
   */
  formatTimeAgo(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
