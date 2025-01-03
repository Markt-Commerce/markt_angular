import { Component } from '@angular/core';
import { HeaderComponent } from '../../ui/header/header.component';
import { FlashSaleTimerComponent } from '../../ui/flash-sale-timer/flash-sale-timer.component';
import { FlashSaleProductListItemComponent } from '../../ui/flash-sale-product-list-item/flash-sale-product-list-item.component';
import { FooterComponent } from '../../ui/footer/footer.component';

@Component({
  selector: 'app-marketplace-homepage',
  standalone: true,
  imports: [
    HeaderComponent,
    FlashSaleTimerComponent,
    FlashSaleProductListItemComponent,
    FooterComponent,
  ],
  templateUrl: './marketplace-homepage.component.html',
  styleUrl: './marketplace-homepage.component.css',
})
export class MarketplaceHomepageComponent {}
