import { Component } from '@angular/core';
import { AuthenticatedUserHeaderComponent } from '../../ui/authenticated-user-header/authenticated-user-header.component';
import { OrderTabsComponent } from '../../ui/order-tabs/order-tabs.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [AuthenticatedUserHeaderComponent, OrderTabsComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {}
