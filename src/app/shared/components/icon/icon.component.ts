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
        <!-- Home Icon -->
        <path *ngSwitchCase="'home'" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline *ngSwitchCase="'home'" points="9,22 9,12 15,12 15,22"/>
        
        <!-- Store/Marketplace Icon -->
        <path *ngSwitchCase="'store'" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <path *ngSwitchCase="'store'" d="M9 22V12h6v10"/>
        
        <!-- Users/Community Icon -->
        <g *ngSwitchCase="'users'">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          <path d="M15 21a3 3 0 11-6 0 3 3 0 016 0z"/>
        </g>
        
        <!-- Message Circle Icon -->
        <path *ngSwitchCase="'message-circle'" d="M21 15a4 4 0 0 1-4 4H8l-5 3 1-4A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z"/>
        
        <!-- Shopping Bag/Orders Icon -->
        <path *ngSwitchCase="'shopping-bag'" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        
        <!-- Tag/Offers Icon -->
        <path *ngSwitchCase="'tag'" d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line *ngSwitchCase="'tag'" x1="7" y1="7" x2="7.01" y2="7"/>
        
        <!-- Clipboard/Requests Icon -->
        <path *ngSwitchCase="'clipboard'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline *ngSwitchCase="'clipboard'" points="14,2 14,8 20,8"/>
        <line *ngSwitchCase="'clipboard'" x1="16" y1="13" x2="8" y2="13"/>
        <line *ngSwitchCase="'clipboard'" x1="16" y1="17" x2="8" y2="17"/>
        <polyline *ngSwitchCase="'clipboard'" points="10,9 9,9 8,9"/>
        
        <!-- Bar Chart/Seller Dashboard Icon -->
        <line *ngSwitchCase="'bar-chart'" x1="12" y1="20" x2="12" y2="10"/>
        <line *ngSwitchCase="'bar-chart'" x1="18" y1="20" x2="18" y2="4"/>
        <line *ngSwitchCase="'bar-chart'" x1="6" y1="20" x2="6" y2="16"/>
        
        <!-- List/My Listings Icon -->
        <line *ngSwitchCase="'list'" x1="8" y1="6" x2="21" y2="6"/>
        <line *ngSwitchCase="'list'" x1="8" y1="12" x2="21" y2="12"/>
        <line *ngSwitchCase="'list'" x1="8" y1="18" x2="21" y2="18"/>
        <line *ngSwitchCase="'list'" x1="3" y1="6" x2="3.01" y2="6"/>
        <line *ngSwitchCase="'list'" x1="3" y1="12" x2="3.01" y2="12"/>
        <line *ngSwitchCase="'list'" x1="3" y1="18" x2="3.01" y2="18"/>
        
        <!-- Plus Circle/Add Product Icon -->
        <circle *ngSwitchCase="'plus-circle'" cx="12" cy="12" r="10"/>
        <line *ngSwitchCase="'plus-circle'" x1="12" y1="8" x2="12" y2="16"/>
        <line *ngSwitchCase="'plus-circle'" x1="8" y1="12" x2="16" y2="12"/>
        
        <!-- User/Profile Icon -->
        <path *ngSwitchCase="'user'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle *ngSwitchCase="'user'" cx="12" cy="7" r="4"/>
        
        <!-- Settings Icon -->
        <circle *ngSwitchCase="'settings'" cx="12" cy="12" r="3"/>
        <path *ngSwitchCase="'settings'" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        
        <!-- Search Icon -->
        <path *ngSwitchCase="'search'" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        
        <!-- Bell/Notification Icon -->
        <path *ngSwitchCase="'bell'" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path *ngSwitchCase="'bell'" d="M13.73 21a2 2 0 0 1-3.46 0"/>
        
        <!-- Chevron Down Icon -->
        <polyline *ngSwitchCase="'chevron-down'" points="6,9 12,15 18,9"/>
        
        <!-- Menu Icon -->
        <line *ngSwitchCase="'menu'" x1="3" y1="6" x2="21" y2="6"/>
        <line *ngSwitchCase="'menu'" x1="3" y1="12" x2="21" y2="12"/>
        <line *ngSwitchCase="'menu'" x1="3" y1="18" x2="21" y2="18"/>
        
        <!-- Package/Box Icon -->
        <path *ngSwitchCase="'package'" d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline *ngSwitchCase="'package'" points="3.27,6.96 12,12.01 20.73,6.96"/>
        <line *ngSwitchCase="'package'" x1="12" y1="22.08" x2="12" y2="12"/>
        
        <!-- Eye Icon -->
        <path *ngSwitchCase="'eye'" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle *ngSwitchCase="'eye'" cx="12" cy="12" r="3"/>
        
        <!-- Heart Icon -->
        <path *ngSwitchCase="'heart'" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        
        <!-- Star Icon -->
        <polygon *ngSwitchCase="'star'" points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        
        <!-- Filter Icon -->
        <polygon *ngSwitchCase="'filter'" points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
        
        <!-- Grid View Icon -->
        <rect *ngSwitchCase="'grid'" x="3" y="3" width="7" height="7"/>
        <rect *ngSwitchCase="'grid'" x="14" y="3" width="7" height="7"/>
        <rect *ngSwitchCase="'grid'" x="14" y="14" width="7" height="7"/>
        <rect *ngSwitchCase="'grid'" x="3" y="14" width="7" height="7"/>
        
        <!-- List View Icon -->
        <line *ngSwitchCase="'list-view'" x1="8" y1="6" x2="21" y2="6"/>
        <line *ngSwitchCase="'list-view'" x1="8" y1="12" x2="21" y2="12"/>
        <line *ngSwitchCase="'list-view'" x1="8" y1="18" x2="21" y2="18"/>
        <line *ngSwitchCase="'list-view'" x1="3" y1="6" x2="3.01" y2="6"/>
        <line *ngSwitchCase="'list-view'" x1="3" y1="12" x2="3.01" y2="12"/>
        <line *ngSwitchCase="'list-view'" x1="3" y1="18" x2="3.01" y2="18"/>
        
        <!-- Verified/Badge Icon -->
        <path *ngSwitchCase="'verified'" d="M9 12l2 2 4-4"/>
        <path *ngSwitchCase="'verified'" d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
        <path *ngSwitchCase="'verified'" d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6H3z"/>
        
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