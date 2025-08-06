import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style="font-family: Inter, 'Noto Sans', sans-serif;">
      <div class="layout-container flex h-full grow flex-col">
        <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f4f1f0] px-10 ">
          <div class="flex items-center gap-4 text-[#181211]">
            <div class="h-12 lg:h-16 xl:h-20">
              <img src="/markt-text-logo.png" alt="Markt" class="h-full w-auto object-contain drop-shadow-lg">
            </div>
          </div>
        </header>
        
        <div class="px-40 flex flex-1 justify-center py-5">
          <div class="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h1 class="text-[#181211] tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">Welcome to Markt!</h1>
            <p class="text-[#181211] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">Let's get you started on your journey</p>
            
            <!-- Onboarding Steps -->
            <div class="grid grid-cols-[40px_1fr] gap-x-2 px-4">
              <!-- Step 1: Create Account -->
              <div class="flex flex-col items-center gap-1 pt-3">
                <div class="text-[#181211]" data-icon="User" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                  </svg>
                </div>
                <div class="w-[1.5px] bg-[#e5dddc] h-2 grow"></div>
              </div>
              <div class="flex flex-1 flex-col py-3">
                <p class="text-[#181211] text-base font-medium leading-normal">Create Your Account</p>
                <p class="text-[#886a63] text-base font-normal leading-normal">Sign up and verify your email</p>
          </div>

              <!-- Step 2: Complete Profile -->
              <div class="flex flex-col items-center gap-1">
                <div class="w-[1.5px] bg-[#e5dddc] h-2"></div>
                <div class="text-[#181211]" data-icon="UserCircle" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"></path>
                  </svg>
                </div>
                <div class="w-[1.5px] bg-[#e5dddc] h-2 grow"></div>
            </div>
              <div class="flex flex-1 flex-col py-3">
                <p class="text-[#181211] text-base font-medium leading-normal">Complete Your Profile</p>
                <p class="text-[#886a63] text-base font-normal leading-normal">Add your details and preferences</p>
          </div>

              <!-- Step 3: Start Exploring -->
              <div class="flex flex-col items-center gap-1 pb-3">
                <div class="w-[1.5px] bg-[#e5dddc] h-2"></div>
                <div class="text-[#181211]" data-icon="MagnifyingGlass" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex flex-1 flex-col py-3">
                <p class="text-[#181211] text-base font-medium leading-normal">Start Exploring</p>
                <p class="text-[#886a63] text-base font-normal leading-normal">Browse products and connect with sellers</p>
              </div>
            </div>
            
            <!-- Features Section -->
            <h2 class="text-[#181211] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">What you can do on Markt:</h2>
            <div class="px-4">
              <label class="flex gap-x-3 py-3 flex-row">
                <input
                  type="checkbox"
                  checked
                  disabled
                  class="h-5 w-5 rounded border-[#e5dddc] border-2 bg-transparent text-[#e85530] checked:bg-[#e85530] checked:border-[#e85530] focus:ring-0 focus:ring-offset-0 focus:border-[#e5dddc] focus:outline-none"
                  style="background-image: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')"
                />
                <p class="text-[#181211] text-base font-normal leading-normal">Buy and sell products in a secure environment</p>
              </label>
              <label class="flex gap-x-3 py-3 flex-row">
                <input
                  type="checkbox"
                  checked
                  disabled
                  class="h-5 w-5 rounded border-[#e5dddc] border-2 bg-transparent text-[#e85530] checked:bg-[#e85530] checked:border-[#e85530] focus:ring-0 focus:ring-offset-0 focus:border-[#e5dddc] focus:outline-none"
                  style="background-image: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')"
                />
                <p class="text-[#181211] text-base font-normal leading-normal">Connect with local buyers and sellers</p>
              </label>
              <label class="flex gap-x-3 py-3 flex-row">
                <input
                  type="checkbox"
                  checked
                  disabled
                  class="h-5 w-5 rounded border-[#e5dddc] border-2 bg-transparent text-[#e85530] checked:bg-[#e85530] checked:border-[#e85530] focus:ring-0 focus:ring-offset-0 focus:border-[#e5dddc] focus:outline-none"
                  style="background-image: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')"
                />
                <p class="text-[#181211] text-base font-normal leading-normal">Join community discussions and get recommendations</p>
              </label>
              <label class="flex gap-x-3 py-3 flex-row">
                <input
                  type="checkbox"
                  checked
                  disabled
                  class="h-5 w-5 rounded border-[#e5dddc] border-2 bg-transparent text-[#e85530] checked:bg-[#e85530] checked:border-[#e85530] focus:ring-0 focus:ring-offset-0 focus:border-[#e5dddc] focus:outline-none"
                  style="background-image: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')"
                />
                <p class="text-[#181211] text-base font-normal leading-normal">Track your orders and manage your listings</p>
              </label>
        </div>

            <!-- Call-to-Action Buttons -->
            <div class="flex justify-center">
              <div class="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                <button
                  class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#e85530] text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#d64426] transition-colors duration-200"
            [routerLink]="['/auth/register']"
          >
                  <span class="truncate">Get Started</span>
                </button>
                <button
                  class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#f4f1f0] text-[#181211] text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#e5dddc] transition-colors duration-200"
            [routerLink]="['/auth/login']"
          >
                  <span class="truncate">I Already Have an Account</span>
                </button>
              </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OnboardingComponent { } 