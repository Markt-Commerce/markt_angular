import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderTabItemComponent } from '../order-tab-item/order-tab-item.component';
// Import our mock service (replace with real service later)
import { MockOrderService as OrderService } from '../../../app/services/http/mock-order.service';
import { Order } from '../../api/models';

@Component({
  selector: 'app-order-tabs',
  standalone: true,
  imports: [NgIf, NgFor, OrderTabItemComponent],
  templateUrl: './order-tabs.component.html',
  styleUrl: './order-tabs.component.css',
})
export class OrderTabsComponent implements OnInit {
  // Orders data
  allOrders: Order[] = [];
  deliveredOrders: Order[] = [];
  notShippedOrders: Order[] = [];
  cancelledOrders: Order[] = [];
  last30DaysOrders: Order[] = [];

  // Current user ID - we should get this from our auth service
  currentUserId = 'buyer_001'; // Replace with actual user ID

  tabs = [
    { name: 'Orders All', badgeCount: 0, hasDropdown: false },
    { name: 'Delivered', badgeCount: 0, hasDropdown: false },
    { name: 'Not Yet Shipped', badgeCount: 0, hasDropdown: false },
    { name: 'Cancelled Orders', badgeCount: 0, hasDropdown: false },
    { name: 'Last 30 Days', badgeCount: 0, hasDropdown: true },
  ];

  dropdownOptions = ['Today', 'Yesterday', 'Last Week', 'Last Month'];
  activeTabIndex = 0;
  showDropdown = false;
  loading = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    // Load all buyer orders
    this.orderService.getBuyerOrders(this.currentUserId).subscribe({
      next: (orders: Order[]): void => {
        this.allOrders = orders;
        this.filterOrdersByStatus();
        this.updateBadgeCounts();
        this.loading = false;
      },
      error: (error: unknown): void => {
        // Handle order loading error appropriately
        this.loading = false;
        // In production, this should show a user-friendly error message
      },
    });
  }

  filterOrdersByStatus(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.deliveredOrders = this.allOrders.filter(
      (order) => order.order_status === 'delivered'
    );

    this.notShippedOrders = this.allOrders.filter((order) =>
      ['pending', 'confirmed', 'processing', 'accepted'].includes(
        order.order_status
      )
    );

    this.cancelledOrders = this.allOrders.filter(
      (order) => order.order_status === 'cancelled'
    );

    this.last30DaysOrders = this.allOrders.filter(
      (order) => order.order_date && new Date(order.order_date) >= thirtyDaysAgo
    );
  }

  updateBadgeCounts(): void {
    this.tabs[0].badgeCount = this.allOrders.length;
    this.tabs[1].badgeCount = this.deliveredOrders.length;
    this.tabs[2].badgeCount = this.notShippedOrders.length;
    this.tabs[3].badgeCount = this.cancelledOrders.length;
    this.tabs[4].badgeCount = this.last30DaysOrders.length;
  }

  switchTab(index: number): void {
    this.activeTabIndex = index;
    this.showDropdown = false;
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  getCurrentTabOrders(): Order[] {
    switch (this.activeTabIndex) {
      case 0:
        return this.allOrders;
      case 1:
        return this.deliveredOrders;
      case 2:
        return this.notShippedOrders;
      case 3:
        return this.cancelledOrders;
      case 4:
        return this.last30DaysOrders;
      default:
        return [];
    }
  }

  // Helper method to format date
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // Helper method to get estimated delivery date (we can customize this logic)
  getEstimatedDeliveryDate(orderDate: Date | undefined): string {
    if (!orderDate) return 'N/A';
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7); // Add 7 days for delivery
    return this.formatDate(deliveryDate);
  }
}
