import { Component } from '@angular/core';
import { HeaderComponent } from '../../ui/header/header.component';
import { CartListItemComponent } from '../../ui/cart-list-item/cart-list-item.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [HeaderComponent, CartListItemComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {}
