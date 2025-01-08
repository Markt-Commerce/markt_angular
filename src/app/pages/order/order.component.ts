import { Component } from '@angular/core';
import { AuthenticatedUserHeaderComponent } from '../../ui/authenticated-user-header/authenticated-user-header.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [AuthenticatedUserHeaderComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent {}
