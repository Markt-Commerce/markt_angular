/**
 * Seller Start Cards Component
 *
 * Displays onboarding/start cards for sellers with completion status.
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  SellerStartCardsService,
  StartCardsResponse,
  StartCard,
} from '../../../domains/authentication';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faCircle,
  faArrowRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-start-cards',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  template: `
    <div class="start-cards-container">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p class="text-gray-600">
            Complete these steps to set up your shop and start selling
          </p>
        </div>

        <!-- Progress Overview -->
        <div *ngIf="startCards()" class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              Overall Progress
            </h2>
            <span class="text-2xl font-bold text-markt-primary"
              >{{ getOverallCompletion() }}%</span
            >
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-markt-primary h-3 rounded-full transition-all duration-300"
              [style.width.%]="getOverallCompletion()"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            {{ startCards()!.getCompletedCount() }} of
            {{ startCards()!.getTotalCount() }} tasks completed
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex items-center justify-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-markt-primary"
          ></div>
        </div>

        <!-- Start Cards -->
        <div *ngIf="!isLoading() && startCards()" class="space-y-4">
          <div
            *ngFor="let card of startCards()!.items"
            class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            [class.opacity-60]="card.completed"
          >
            <div class="flex items-start space-x-4">
              <!-- Completion Icon -->
              <div class="flex-shrink-0 mt-1">
                <fa-icon
                  *ngIf="card.completed"
                  [icon]="faCheckCircle"
                  class="w-6 h-6 text-green-500"
                ></fa-icon>
                <fa-icon
                  *ngIf="!card.completed"
                  [icon]="faCircle"
                  class="w-6 h-6 text-gray-300"
                ></fa-icon>
              </div>

              <!-- Card Content -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ card.title }}
                    </h3>
                    <p class="text-gray-600 text-sm mt-1">
                      {{ card.description }}
                    </p>
                  </div>
                  <span
                    *ngIf="card.completed"
                    class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                  >
                    Completed
                  </span>
                </div>

                <!-- Progress Bar (if in progress) -->
                <div *ngIf="card.isInProgress() && card.progress" class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-600">Progress</span>
                    <span class="text-sm font-medium text-gray-900"
                      >{{ card.progress.current }} /
                      {{ card.progress.target }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-markt-primary h-2 rounded-full transition-all duration-300"
                      [style.width.%]="card.getCompletionPercentage()"
                    ></div>
                  </div>
                </div>

                <!-- CTA Button -->
                <div class="mt-4">
                  <a
                    [routerLink]="card.cta.href"
                    class="inline-flex items-center space-x-2 bg-markt-primary text-white px-4 py-2 rounded-md hover:bg-markt-secondary transition-colors text-sm font-medium"
                    [class.opacity-50]="card.completed"
                    [class.cursor-default]="card.completed"
                  >
                    <span>{{ card.cta.label }}</span>
                    <fa-icon
                      *ngIf="!card.completed"
                      [icon]="faArrowRight"
                      class="w-4 h-4"
                    ></fa-icon>
                    <fa-icon
                      *ngIf="card.completed"
                      [icon]="faCheck"
                      class="w-4 h-4"
                    ></fa-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading() && !startCards()"
          class="text-center py-12 bg-white rounded-lg shadow"
        >
          <h2 class="text-xl font-medium text-gray-900 mb-2">
            No start cards available
          </h2>
          <p class="text-gray-500">
            Unable to load onboarding tasks. Please try again later.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .start-cards-container {
        padding: 20px;
        min-height: calc(100vh - 200px);
      }
    `,
  ],
})
export class StartCardsComponent implements OnInit {
  private startCardsService = inject(SellerStartCardsService);
  private router = inject(Router);

  // Icons
  faCheckCircle = faCheckCircle;
  faCircle = faCircle;
  faArrowRight = faArrowRight;
  faCheck = faCheck;

  // Signals
  startCards = signal<StartCardsResponse | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadStartCards();
  }

  /**
   * Load start cards
   */
  private loadStartCards(): void {
    this.isLoading.set(true);
    this.startCardsService.getStartCards().subscribe({
      next: (cards) => {
        this.startCards.set(cards);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading start cards:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Get overall completion percentage
   */
  getOverallCompletion(): number {
    const cards = this.startCards();
    return cards ? Math.round(cards.getOverallCompletion()) : 0;
  }
}
