import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../ui/header/header.component';
import { FlashSaleTimerComponent } from '../../ui/flash-sale-timer/flash-sale-timer.component';

import { FooterComponent } from '../../ui/footer/footer.component';
import { CategoryListItemComponent } from '../../ui/category-list-item/category-list-item.component';
import { ProductListItemComponent } from '../../ui/product-list-item/product-list-item.component';

@Component({
  selector: 'app-marketplace-homepage',
  standalone: true,
  imports: [
    HeaderComponent,
    FlashSaleTimerComponent,
    ProductListItemComponent,
    FooterComponent,
    CategoryListItemComponent,
  ],
  templateUrl: './marketplace-homepage.component.html',
  styleUrl: './marketplace-homepage.component.css',
})
export class MarketplaceHomepageComponent {
  categories: string[] = [
    'Phones',
    'Computers',
    'SmartWatch',
    'Camera',
    'HeadPhones',
    'Gaming',
  ];

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  private targetDate: Date = new Date('2025-01-31T23:59:59'); // We set our target date here

  ngOnInit(): void {
    this.startTimer();
  }

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
}
