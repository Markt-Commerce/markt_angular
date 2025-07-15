import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavLinkData {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-nav-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-link.component.html',
  styleUrl: './nav-link.component.css',
})
export class NavLinkComponent {
  @Input() link!: NavLinkData;
  @Input() isActive = false;
  @Input() showBadge = true;
  @Output() linkClick = new EventEmitter<NavLinkData>();

  onClick() {
    if (!this.link.disabled) {
      this.linkClick.emit(this.link);
    }
  }
}
