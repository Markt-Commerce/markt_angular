import { Component } from '@angular/core';
import { OverallSalesComponent } from '../overall-sales/overall-sales.component';
import { FooterComponent } from '../footer/footer.component';
import { SideBarComponent } from '../side-bar/side-bar.component';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [ SideBarComponent, OverallSalesComponent, FooterComponent ],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent {

}
