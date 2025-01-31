import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';
import { OverallSalesComponent } from '../overall-sales/overall-sales.component';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [SideBarComponent, OverallSalesComponent, FooterComponent],
  templateUrl: './seller-profile.component.html',
  styleUrl: './seller-profile.component.css',
})

export class SellerProfileComponent {}