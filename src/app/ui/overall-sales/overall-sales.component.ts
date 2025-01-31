import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto'


@Component({
  selector: 'app-overall-sales',
  standalone: true,
  imports: [],
  templateUrl: './overall-sales.component.html',
  styleUrl: './overall-sales.component.css'
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
            borderColor: '#e94b26',
            backgroundColor: 'rgba(233, 75, 38, 0.2)',
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#e94b26',
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
              callback: function (value: number) { // Explicitly typed parameter
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