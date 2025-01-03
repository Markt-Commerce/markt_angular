import { Component } from '@angular/core';
import { HeaderComponent } from '../../ui/header/header.component';

@Component({
  selector: 'app-marketplace-homepage',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './marketplace-homepage.component.html',
  styleUrl: './marketplace-homepage.component.css',
})
export class MarketplaceHomepageComponent {}
