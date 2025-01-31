import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'], // Fix here
})

export class ErrorComponent {}