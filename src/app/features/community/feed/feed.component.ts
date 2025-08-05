import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style='font-family: Inter, "Noto Sans", sans-serif;'>
      <div class="layout-container flex h-full grow flex-col">
        
        <!-- Main Content -->
        <div class="px-40 flex flex-1 justify-center py-5">
          <div class="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            <!-- Create Post Section -->
            <div class="flex items-center px-4 py-3 gap-3 @container">
              <label class="flex flex-col min-w-40 h-full flex-1">
                <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div class="flex border border-[#e5dddc] bg-white justify-end pl-[15px] pr-[15px] pt-[15px] rounded-l-lg border-r-0">
                    <div
                      class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                      style='background-image: url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");'
                    ></div>
                  </div>
                  <div class="flex flex-1 flex-col">
                    <textarea
                      placeholder="What's on your mind? Share with the Markt community..."
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181211] focus:outline-0 focus:ring-0 border border-[#e5dddc] bg-white focus:border-[#e5dddc] h-auto placeholder:text-[#cebfbb] rounded-l-none border-l-0 pl-2 rounded-b-none border-b-0 text-base font-normal leading-normal pt-[22px]"
                      [(ngModel)]="newPostContent"
                    ></textarea>
                    <div class="flex border border-[#e5dddc] bg-white justify-end pr-[15px] rounded-br-lg border-l-0 border-t-0 px-[15px] pb-[15px]">
                      <div class="flex items-center gap-4 justify-end">
                        <div class="flex items-center gap-1">
                          <button class="flex items-center justify-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                            <div class="text-[#886a63]" data-icon="Image" data-size="20px" data-weight="regular">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"></path>
                              </svg>
                            </div>
                          </button>
                          <button class="flex items-center justify-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                            <div class="text-[#886a63]" data-icon="ChartPolar" data-size="20px" data-weight="regular">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm87.63,96H191.48A64.1,64.1,0,0,0,136,64.52V40.37A88.13,88.13,0,0,1,215.63,120ZM120,120H80.68A48.09,48.09,0,0,1,120,80.68Zm0,16v39.32A48.09,48.09,0,0,1,80.68,136Zm16,0h39.32A48.09,48.09,0,0,1,136,175.32Zm0-16V80.68A48.09,48.09,0,0,1,175.32,120ZM120,40.37V64.52A64.1,64.1,0,0,0,64.52,120H40.37A88.13,88.13,0,0,1,120,40.37ZM40.37,136H64.52A64.1,64.1,0,0,0,120,191.48v24.15A88.13,88.13,0,0,1,40.37,136ZM136,215.63V191.48A64.1,64.1,0,0,0,191.48,136h24.15A88.13,88.13,0,0,1,136,215.63Z"></path>
                              </svg>
                            </div>
                          </button>
                          <button class="flex items-center justify-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                            <div class="text-[#886a63]" data-icon="Tag" data-size="20px" data-weight="regular">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
                              </svg>
                            </div>
                          </button>
                        </div>
                        <button
                          (click)="createPost()"
                          [disabled]="!newPostContent.trim()"
                          class="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e85530] text-white text-sm font-medium leading-normal hidden @[480px]:block disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d64426] transition-colors duration-200"
                        >
                          <span class="truncate">Post</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            
            <!-- Feed Posts -->
            <div class="feed-posts" *ngFor="let post of feedPosts">
              <div class="p-4 @container">
                <div class="flex flex-col items-stretch justify-start rounded-lg @xl:flex-row @xl:items-start hover:bg-gray-50 transition-colors duration-200 p-4 rounded-xl">
                  <div
                    class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                    [style.background-image]="'url(' + post.image + ')'"
                  ></div>
                  <div class="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
                    <p class="text-[#181211] text-lg font-bold leading-tight tracking-[-0.015em]">
                      {{ post.title }}
                    </p>
                    <div class="flex items-end gap-3 justify-between">
                      <div class="flex flex-col gap-1">
                        <p class="text-[#886a63] text-base font-normal leading-normal">
                          {{ post.content }}
                        </p>
                        <p class="text-[#886a63] text-base font-normal leading-normal">
                          Posted by {{ post.author }} · {{ post.timeAgo }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Post Actions -->
                    <div class="flex items-center gap-4 mt-3">
                      <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.69,146.26,196.16,128,206.8Z"></path>
                        </svg>
                        <span class="text-sm text-gray-600">{{ post.likes }}</span>
                      </button>
                      <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M216,48H40a16,16,0,0,0-16,16V192a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,208a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,176H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,192V64H216V160H82.5a16,16,0,0,0-10.3,3.75L40,192Z"></path>
                        </svg>
                        <span class="text-sm text-gray-600">{{ post.comments }}</span>
                      </button>
                      <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M237.66,117.66l-80,80A8,8,0,0,1,144,192V152.23c-57.1,3.24-96,96.25-96,96.25a8,8,0,0,1-12.25-10.06C50.46,205.15,72.09,152,144,152V112a8,8,0,0,1,13.66-5.66l80,80A8,8,0,0,1,237.66,117.66Z"></path>
                        </svg>
                        <span class="text-sm text-gray-600">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FeedComponent {
  newPostContent = '';
  
  feedPosts = [
    {
      id: 1,
      title: "Discovering the latest trends in sustainable fashion. Check out these eco-friendly brands!",
      content: "I'm loving the new collection from Green Threads. Their commitment to sustainability is truly inspiring. What are your favorite eco-conscious brands?",
      author: "Olivia Carter",
      timeAgo: "2h ago",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: "Just unboxed the new TechPro headphones! The sound quality is incredible.",
      content: "These headphones are a game-changer for my workouts. The noise cancellation is top-notch, and the battery life is amazing. Highly recommend!",
      author: "Ethan Walker",
      timeAgo: "4h ago",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      likes: 42,
      comments: 15
    },
    {
      id: 3,
      title: "Exploring the art of coffee making with my new espresso machine.",
      content: "I've always been fascinated by the process of making the perfect cup of coffee. This machine is making it so much fun to experiment with different roasts and techniques.",
      author: "Sophia Bennett",
      timeAgo: "6h ago",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      likes: 18,
      comments: 6
    },
    {
      id: 4,
      title: "Weekend getaway to the mountains! The views are breathtaking.",
      content: "Spending some time in nature is so refreshing. The crisp air, the stunning scenery, and the peace and quiet are exactly what I needed.",
      author: "Liam Harris",
      timeAgo: "8h ago",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      likes: 56,
      comments: 12
    },
    {
      id: 5,
      title: "New art supplies arrived! Time to get creative.",
      content: "I'm so excited to start working on my next project. These high-quality paints and brushes will definitely elevate my work.",
      author: "Ava Thompson",
      timeAgo: "10h ago",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
      likes: 33,
      comments: 9
    }
  ];

  createPost() {
    if (this.newPostContent.trim()) {
      // TODO: Implement post creation logic
      console.log('Creating post:', this.newPostContent);
      this.newPostContent = '';
    }
  }
} 