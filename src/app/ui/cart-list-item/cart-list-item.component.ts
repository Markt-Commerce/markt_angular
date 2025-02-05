import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cart-list-item',
  standalone: true,
  imports: [],
  templateUrl: './cart-list-item.component.html',
  styleUrl: './cart-list-item.component.css',
})
export class CartListItemComponent {
  @Input() product!: {
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  @Output() quantityChanged = new EventEmitter<number>();
}
