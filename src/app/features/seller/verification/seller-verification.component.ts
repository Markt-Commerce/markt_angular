import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-seller-verification',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NgOptimizedImage],
  templateUrl: './seller-verification.component.html',
  styleUrls: ['./seller-verification.component.css']
})
export class SellerVerificationComponent { }


