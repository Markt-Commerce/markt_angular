import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SummaryData {
  icon?: string;
  title: string;
  value: string | number;
  description?: string;
  color?: string;
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent {
  @Input() summary: SummaryData = { title: '', value: '' };
  @Input() loading = false;
}
