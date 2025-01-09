import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-order-tab-item',
  standalone: true,
  imports: [NgFor],
  templateUrl: './order-tab-item.component.html',
  styleUrl: './order-tab-item.component.css',
})
export class OrderTabItemComponent {
  @Input() products!: Array<{
    name: string;
    quantity: number;
    color: string;
    price: number;
    image: string;
  }>;
  @Input() sellerName!: string;
  @Input() purchaseDate!: string;
  @Input() orderId!: string;
  @Input() deliveryDate!: string;
}
