import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-help-card',
  standalone: true, // Mark it as standalone
  templateUrl: './help-card.component.html',
  styleUrls: ['./help-card.component.css'],
})
export class HelpCardComponent {
  @Input() image?: string;
  @Input() title!: string;
  @Input() description!: string;
}
