import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-messages-listing',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent ],
  templateUrl: './messages-listing.component.html',
  styleUrl: './messages-listing.component.css'
})
export class MessagesListingComponent {

}
