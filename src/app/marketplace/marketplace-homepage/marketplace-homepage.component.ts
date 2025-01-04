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
export class MarketplaceHomepageComponent implements OnInit {
  categories: string[] = [
    'Phones',
    'Computers',
    'SmartWatch',
    'Camera',
    'HeadPhones',
    'Gaming',
  ];

  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';

  private targetTime: Date = new Date();

  ngOnInit(): void {
    this.targetTime.setHours(this.targetTime.getHours() + 1);

    this.startCountdown();
  }

  private startCountdown(): void {
    setInterval(() => {
      const now = new Date().getTime();
      const distance = this.targetTime.getTime() - now;

      if (distance > 0) {
        this.hours = this.formatTime(
          Math.floor((distance / (1000 * 60 * 60)) % 24)
        );
        this.minutes = this.formatTime(
          Math.floor((distance / (1000 * 60)) % 60)
        );
        this.seconds = this.formatTime(Math.floor((distance / 1000) % 60));
      } else {
        this.hours = '00';
        this.minutes = '00';
        this.seconds = '00';
      }
    }, 1000);
  }

  private formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }
}
