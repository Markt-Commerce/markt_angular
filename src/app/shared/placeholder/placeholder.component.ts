import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div style="padding: 2rem; text-align: center;">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class PlaceholderComponent {
  title = 'Coming Soon';
  message = 'This page is under development.';
} 