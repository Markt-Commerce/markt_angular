import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [class]="'w-' + size + ' h-' + size + ' ' + className" 
      fill="currentColor" 
      viewBox="0 0 24 24"
      [attr.aria-label]="name"
    >
      <ng-container [ngSwitch]="name">
        <!-- Users Icon -->
        <g *ngSwitchCase="'users'">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          <path d="M15 21a3 3 0 11-6 0 3 3 0 016 0z"/>
        </g>
        
        <!-- Search Icon -->
        <path *ngSwitchCase="'search'" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        
        <!-- Dollar Icon -->
        <path *ngSwitchCase="'dollar'" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
        
        <!-- Chat Icon -->
        <path *ngSwitchCase="'chat'" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        
        <!-- Shopping Bag Icon -->
        <path *ngSwitchCase="'shopping-bag'" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        
        <!-- Default case -->
        <path *ngSwitchDefault d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </ng-container>
    </svg>
  `,
  styles: []
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: string = '6';
  @Input() className: string = '';
} 