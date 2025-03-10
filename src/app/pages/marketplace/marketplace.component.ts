import { Component, HostListener } from '@angular/core';
import { HeaderComponent } from '../../ui/header/header.component';
import { FlashSaleTimerComponent } from '../../ui/flash-sale-timer/flash-sale-timer.component';

import { CategoryListItemComponent } from '../../ui/category-list-item/category-list-item.component';
import { ProductListItemComponent } from '../../ui/product-list-item/product-list-item.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    HeaderComponent,
    FlashSaleTimerComponent,
    ProductListItemComponent,
    CategoryListItemComponent,
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css',
})
export class MarketplaceComponent {
  categories: string[] = [
    'Phones',
    'Computers',
    'SmartWatch',
    'Camera',
    'HeadPhones',
    'Gaming',
  ];


  /**
   * this functionality should be added to a dedicated service for reusability
   * a function that takes in the due date and sets the timer
   */
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  private targetDate: Date = new Date('2025-01-31T23:59:59'); // We set our target date here

  private startTimer(): void {
    setInterval(() => {
      const currentTime = new Date().getTime();
      const difference = this.targetDate.getTime() - currentTime;

      if (difference > 0) {
        this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
        this.hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        this.minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        this.seconds = Math.floor((difference % (1000 * 60)) / 1000);
      } else {
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
      }
    }, 1000);
  }

  showBackToTop: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition =
      window.scrollY || document.documentElement.scrollTop || 0;
    this.showBackToTop = scrollPosition > 100; //  button shows only if our user scrolled 100px down
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
