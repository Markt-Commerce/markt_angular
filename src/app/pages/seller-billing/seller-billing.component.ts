import { Component } from '@angular/core';
import { SideBarComponent } from '../../ui/side-bar/side-bar.component';
import { FooterComponent } from '../../ui/footer/footer.component';

@Component({
  selector: 'app-seller-billing',
  standalone: true,
  imports: [SideBarComponent, FooterComponent],
  templateUrl: './seller-billing.component.html',
  styleUrl: './seller-billing.component.css'
})
export class SellerBillingComponent {

}
