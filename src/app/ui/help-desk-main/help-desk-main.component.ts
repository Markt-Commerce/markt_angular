import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';
import { HelpCardComponent } from '../help-card/help-card.component';

@Component({
  selector: 'app-help-desk-main',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent, HelpCardComponent ],
  templateUrl: './help-desk-main.component.html',
  styleUrl: './help-desk-main.component.css'
})
export class HelpDeskMainComponent {
Rocket: string|undefined;

}
