import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-seller-returns',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent ],
  templateUrl: './seller-returns.component.html',
  styleUrl: './seller-returns.component.css'
})
export class SellerReturnsComponent {

}
