import { Component } from '@angular/core';
import { HeaderComponent } from '../../ui/header/header.component';
import { NgFor } from '@angular/common';
import { ProductListItemComponent } from '../../ui/product-list-item/product-list-item.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [HeaderComponent, NgFor, ProductListItemComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  stars: number[] = [1, 2, 3, 4, 5];
}
