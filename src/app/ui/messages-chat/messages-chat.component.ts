import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-messages-chat',
  standalone: true,
  imports: [ SideBarComponent, FooterComponent ],
  templateUrl: './messages-chat.component.html',
  styleUrl: './messages-chat.component.css'
})
export class MessagesChatComponent {

}
