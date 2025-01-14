import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-seller-price-plans',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent ],
  templateUrl: './seller-price-plans.component.html',
  styleUrl: './seller-price-plans.component.css'
})
export class SellerPricePlansComponent {

}
