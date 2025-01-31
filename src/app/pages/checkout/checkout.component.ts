import { Component } from '@angular/core';
import { HeaderComponent } from "../../ui/header/header.component";

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

}
