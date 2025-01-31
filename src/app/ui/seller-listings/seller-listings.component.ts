import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-seller-listings',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent ],
  templateUrl: './seller-listings.component.html',
  styleUrl: './seller-listings.component.css'
})
export class SellerListingsComponent {

}
