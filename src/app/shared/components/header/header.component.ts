import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Enhanced Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-markt-border/30 bg-white/98 backdrop-blur-md px-6 lg:px-10 shadow-lg">
      <div class="flex items-center gap-6 text-markt-dark">
        
        <div class="h-12 lg:h-16 xl:h-20">
          <img src="/markt-text-logo.png" alt="Markt" class="h-full w-auto object-contain drop-shadow-lg">
        </div>
      </div>
      <div class="flex flex-1 justify-end gap-8 lg:gap-10">
        <div class="hidden md:flex items-center gap-10">
          <a class="text-markt-dark text-base font-semibold leading-normal hover:text-markt-primary transition-colors duration-200 hover:scale-105 transform" [routerLink]="['/app/marketplace']">Explore</a>
          <a class="text-markt-dark text-base font-semibold leading-normal hover:text-markt-primary transition-colors duration-200 hover:scale-105 transform" [routerLink]="['/app/seller']">Sell</a>
          <a class="text-markt-dark text-base font-semibold leading-normal hover:text-markt-primary transition-colors duration-200 hover:scale-105 transform" href="#help">Help</a>
        </div>
        
        <!-- Guest User Actions -->
        <div *ngIf="!(isAuthenticated$ | async)" class="flex gap-4">
          <button
            class="flex min-w-[100px] lg:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-gradient-to-r from-markt-primary to-markt-secondary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            [routerLink]="['/auth/register']"
          >
            <span class="truncate">Sign up</span>
          </button>
          <button
            class="flex min-w-[100px] lg:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-white text-markt-dark text-base font-bold leading-normal tracking-[0.015em] border-2 border-markt-border hover:bg-markt-light hover:border-markt-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            [routerLink]="['/auth/login']"
          >
            <span class="truncate">Log in</span>
          </button>
        </div>
        
        <!-- Authenticated User Actions -->
        <div *ngIf="isAuthenticated$ | async" class="flex gap-4">
          <button
            class="flex min-w-[100px] lg:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-gradient-to-r from-markt-primary to-markt-secondary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            [routerLink]="['/app/dashboard']"
          >
            <span class="truncate">Dashboard</span>
          </button>
          <button
            class="flex min-w-[100px] lg:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-white text-markt-dark text-base font-bold leading-normal tracking-[0.015em] border-2 border-markt-border hover:bg-markt-light hover:border-markt-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            (click)="logout()"
          >
            <span class="truncate">Logout</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  get isAuthenticated$() {
    return this.authService.authState$.pipe(
      map(state => {
        console.log('🔍 Header: Auth state changed:', state);
        return state.isAuthenticated;
      })
    );
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/landing']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still navigate to landing page even if logout fails
        this.router.navigate(['/landing']);
      }
    });
  }
} 