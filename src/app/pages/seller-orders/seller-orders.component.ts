import { Component } from '@angular/core';
import { SideBarComponent } from '../../ui/side-bar/side-bar.component';
import { FooterComponent } from '../../ui/footer/footer.component';
import { EachSellerOrderComponent } from '../../ui/each-seller-order/each-seller-order.component';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [SideBarComponent, FooterComponent, EachSellerOrderComponent],
  templateUrl: './seller-orders.component.html',
  styleUrl: './seller-orders.component.css'
})
export class SellerOrdersComponent { }
