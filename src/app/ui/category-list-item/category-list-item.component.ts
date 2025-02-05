import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-list-item',
  standalone: true,
  imports: [],
  templateUrl: './category-list-item.component.html',
  styleUrl: './category-list-item.component.css',
})
export class CategoryListItemComponent {
  @Input() categoryName!: string;
}
