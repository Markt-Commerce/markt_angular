import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaymentFeature {
  name: string;
  icon: string;
}

export interface SecurityBadge {
  name: string;
  icon: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentLimits {
  daily: number;
  dailyMax: number;
  monthly: number;
  monthlyMax: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  type:
    | 'credit'
    | 'debit'
    | 'paypal'
    | 'apple_pay'
    | 'google_pay'
    | 'bank_transfer';
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName?: string;
  billingAddress?: BillingAddress;
  isDefault: boolean;
  isVerified: boolean;
  lastUsed?: Date;
  usageCount?: number;
  features?: PaymentFeature[];
  securityBadges?: SecurityBadge[];
  limits?: PaymentLimits;
}

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css',
})
export class PaymentMethodComponent {
  @Input() payment!: PaymentMethod;
  @Input() isSelected: boolean = false;
  @Input() canEdit: boolean = true;
  @Input() canDelete: boolean = true;

  @Output() select = new EventEmitter<PaymentMethod>();
  @Output() edit = new EventEmitter<PaymentMethod>();
  @Output() delete = new EventEmitter<PaymentMethod>();

  get isDefault(): boolean {
    return this.payment.isDefault;
  }

  get isExpiringSoon(): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(this.payment.expiryYear);
    const expiryMonth = parseInt(this.payment.expiryMonth);

    if (expiryYear < currentYear) return true;
    if (expiryYear === currentYear && expiryMonth <= currentMonth + 3)
      return true;

    return false;
  }

  getPaymentIcon(): string {
    const icons = {
      credit: 'fas fa-credit-card',
      debit: 'fas fa-credit-card',
      paypal: 'fab fa-paypal',
      apple_pay: 'fab fa-apple-pay',
      google_pay: 'fab fa-google-pay',
      bank_transfer: 'fas fa-university',
    };
    return icons[this.payment.type] || 'fas fa-credit-card';
  }

  maskCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    const lastFour = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return masked + lastFour;
  }

  formatAddress(address: BillingAddress): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }

  formatLastUsed(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;

    return `${Math.floor(days / 365)} years ago`;
  }

  onSelect() {
    this.select.emit(this.payment);
  }

  onEdit() {
    this.edit.emit(this.payment);
  }

  onDelete() {
    this.delete.emit(this.payment);
  }
}
