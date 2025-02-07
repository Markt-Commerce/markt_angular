import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { OrderTabItemComponent } from "../order-tab-item/order-tab-item.component";

@Component({
  selector: 'app-order-tabs',
  standalone: true,
  imports: [NgIf, NgFor, OrderTabItemComponent],
  templateUrl: './order-tabs.component.html',
  styleUrl: './order-tabs.component.css',
})
export class OrderTabsComponent {
  tabs = [
    { name: 'Orders All', badgeCount: 3, hasDropdown: false },
    { name: 'Delivered', badgeCount: null, hasDropdown: false },
    { name: 'Not Yet Shipped', badgeCount: null, hasDropdown: false },
    { name: 'Cancelled Orders', badgeCount: null, hasDropdown: false },
    { name: 'Last 30 Days', badgeCount: null, hasDropdown: true },
  ];

  dropdownOptions = ['Today', 'Yesterday', 'Last Week', 'Last Month'];
  activeTabIndex = 0;
  showDropdown = false;

  switchTab(index: number): void {
    this.activeTabIndex = index;
    this.showDropdown = false;
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }
}
