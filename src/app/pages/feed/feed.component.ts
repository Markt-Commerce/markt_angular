import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  PostCardComponent,
  Post,
} from '../../components/post-card/post-card.component';
import {
  FilterBarComponent,
  Category,
  FilterData,
} from '../../components/filter-bar/filter-bar.component';
import {
  StoryListComponent,
  Story as StoryListStory,
} from '../../components/story-list/story-list.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    PostCardComponent,
    FilterBarComponent,
    StoryListComponent,
    SearchBarComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  private router = inject(Router);

  // Categories for filter bar
  categories: Category[] = [
    { id: 'all', name: 'All', count: 10 },
    { id: 'products', name: 'Products', count: 5 },
    { id: 'requests', name: 'Requests', count: 2 },
    { id: 'stories', name: 'Stories', count: 3 },
    { id: 'trending', name: 'Trending', count: 4 },
  ];

  // Feed data
  posts = signal<Post[]>([]);
  stories = signal<StoryListStory[]>([]);
  currentFilter = signal<string>('all');
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadFeedData();
  }

  private loadFeedData() {
    this.loading.set(true);
    setTimeout(() => {
      this.posts.set([
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah Johnson',
          userAvatar: '/assets/icons/default-avatar.png',
          content:
            'Just listed my vintage camera collection! Perfect for photography enthusiasts. DM for details.',
          images: [
            '/assets/547953_9C2ST_8746_001_082_0000_Light-Gucci-Savoy-medium-duffle-bag 1.png',
            '/assets/672462_ZAH9D_5626_002_100_0000_Light-The-North-Face-x-Gucci-coat 1.png',
          ],
          likes: 24,
          comments: [
            {
              id: '1',
              userId: 'user2',
              userName: 'Mike Chen',
              content: "These are amazing! What's your asking price?",
              createdAt: '2024-01-15T10:30:00Z',
            },
          ],
          shares: 3,
          createdAt: '2024-01-15T09:00:00Z',
          type: 'product',
          isLiked: false,
        },
        {
          id: '2',
          userId: 'user3',
          userName: 'Emma Davis',
          userAvatar: '/assets/icons/default-avatar.png',
          content: 'Looking for a study group for CS 101! Anyone interested?',
          images: [],
          likes: 12,
          comments: [
            {
              id: '2',
              userId: 'user4',
              userName: 'Alex Kim',
              content: "I'm in! When do you want to start?",
              createdAt: '2024-01-15T11:00:00Z',
            },
          ],
          shares: 1,
          createdAt: '2024-01-15T10:30:00Z',
          type: 'request',
          isLiked: true,
        },
      ]);
      this.stories.set([
        {
          id: '1',
          userId: 'user1',
          userName: 'Sarah Johnson',
          userAvatar: '/assets/icons/default-avatar.png',
          isViewed: false,
          createdAt: new Date('2024-01-15T09:00:00Z'),
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Mike Chen',
          userAvatar: '/assets/icons/default-avatar.png',
          isViewed: true,
          createdAt: new Date('2024-01-15T10:00:00Z'),
        },
      ]);
      this.loading.set(false);
    }, 1000);
  }

  onSearch(query: string) {
    // Handle search
    console.log('Search query:', query);
  }

  onFilterChange(filter: FilterData) {
    // For demo, just set the first selected category as the filter
    if (filter.categories && filter.categories.length > 0) {
      this.currentFilter.set(filter.categories[0]);
    } else {
      this.currentFilter.set('all');
    }
    // Implement actual filtering logic as needed
  }

  onStoryClick(story: StoryListStory) {
    // Handle story click
    console.log('Story clicked:', story);
  }

  onLike(post: Post) {
    // Handle like
    console.log('Liked post:', post);
  }

  onComment(post: Post) {
    // Handle comment
    console.log('Comment on post:', post);
  }

  onShare(post: Post) {
    // Handle share
    console.log('Shared post:', post);
  }

  loadMorePosts() {
    // Implement load more logic
    console.log('Load more posts');
  }

  get isLoading() {
    return this.loading();
  }
}
