import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTab: string = '';

  @Output() tabChange = new EventEmitter<string>();

  onTabClick(tab: Tab) {
    if (!tab.disabled && tab.id !== this.activeTab) {
      this.activeTab = tab.id;
      this.tabChange.emit(tab.id);
    }
  }
}
