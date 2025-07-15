import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  image: string;
  price: number;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export interface OrderSeller {
  id: string;
  name: string;
  avatar: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  icon: string;
  timestamp: Date;
  description?: string;
}

export interface OrderAction {
  text: string;
  icon: string;
  action: string;
}

export interface Order {
  id: string;
  orderId: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  orderDate: Date;
  estimatedDelivery: Date;
  items: OrderItem[];
  seller: OrderSeller;
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  isUrgent: boolean;
  progress?: number;
  timeline?: TimelineEvent[];
  primaryAction?: OrderAction;
  secondaryAction?: OrderAction;
}

@Component({
  selector: 'app-order-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list-item.component.html',
  styleUrl: './order-list-item.component.css',
})
export class OrderListItemComponent {
  @Input() order!: Order;

  @Output() viewDetails = new EventEmitter<Order>();
  @Output() track = new EventEmitter<Order>();
  @Output() contact = new EventEmitter<Order>();
  @Output() primaryAction = new EventEmitter<{
    order: Order;
    action: string;
  }>();
  @Output() secondaryAction = new EventEmitter<{
    order: Order;
    action: string;
  }>();
  @Output() cancel = new EventEmitter<Order>();

  get canCancel(): boolean {
    return ['pending', 'confirmed', 'processing'].includes(this.order.status);
  }

  getStatusIcon(): string {
    const icons = {
      pending: 'fas fa-clock',
      confirmed: 'fas fa-check-circle',
      processing: 'fas fa-cog',
      shipped: 'fas fa-truck',
      delivered: 'fas fa-box-check',
      cancelled: 'fas fa-times-circle',
      refunded: 'fas fa-undo',
    };
    return icons[this.order.status] || 'fas fa-question-circle';
  }

  getStatusText(): string {
    const statusTexts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return statusTexts[this.order.status] || 'Unknown';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onViewDetails() {
    this.viewDetails.emit(this.order);
  }

  onTrack() {
    this.track.emit(this.order);
  }

  onContact() {
    this.contact.emit(this.order);
  }

  onPrimaryAction() {
    if (this.order.primaryAction) {
      this.primaryAction.emit({
        order: this.order,
        action: this.order.primaryAction.action,
      });
    }
  }

  onSecondaryAction() {
    if (this.order.secondaryAction) {
      this.secondaryAction.emit({
        order: this.order,
        action: this.order.secondaryAction.action,
      });
    }
  }

  onCancel() {
    this.cancel.emit(this.order);
  }
}
