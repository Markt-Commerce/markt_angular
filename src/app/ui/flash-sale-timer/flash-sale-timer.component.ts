import { Component } from '@angular/core';

@Component({
  selector: 'app-flash-sale-timer',
  standalone: true,
  imports: [],
  templateUrl: './flash-sale-timer.component.html',
  styleUrl: './flash-sale-timer.component.css',
})
export class FlashSaleTimerComponent {
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
