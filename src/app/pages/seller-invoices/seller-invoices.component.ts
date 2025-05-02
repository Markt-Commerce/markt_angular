import { Component } from '@angular/core';
import { SideBarComponent } from '../../ui/side-bar/side-bar.component';
import { FooterComponent } from '../../ui/footer/footer.component';

@Component({
  selector: 'app-seller-invoices',
  standalone: true,
  imports: [SideBarComponent, FooterComponent],
  templateUrl: './seller-invoices.component.html',
  styleUrl: './seller-invoices.component.css'
})
export class SellerInvoicesComponent {

}
