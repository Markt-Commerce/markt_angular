import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-seller-invoices',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent ],
  templateUrl: './seller-invoices.component.html',
  styleUrl: './seller-invoices.component.css'
})
export class SellerInvoicesComponent {

}
