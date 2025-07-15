import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-overall-sales',
  standalone: true,
  imports: [],
  templateUrl: './overall-sales.component.html',
  styleUrl: './overall-sales.component.css',
})
export class OverallSalesComponent implements AfterViewInit {
  ngAfterViewInit() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        datasets: [
          {
            label: 'Sales',
            data: [100, 120, 140, 130, 150, 180, 200, 220, 240, 260, 300],
            borderColor: '#e94c2a',
            backgroundColor: 'rgba(233, 76, 42, 0.1)',
            tension: 0.4,
            pointBackgroundColor: '#e94c2a',
            pointBorderColor: '#e94c2a',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              borderColor: 'transparent', // Correct property name
            } as any, // Override type checking
          },
          y: {
            ticks: {
              callback: function (value: number) {
                // Explicitly typed parameter
                return `$${value}K`;
              },
            },
            grid: {
              borderColor: 'transparent', // Correct property name
            } as any, // Override type checking
          },
        },
      } as any, // Override type checking for entire options object
    });
  }
}
