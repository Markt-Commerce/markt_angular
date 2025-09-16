import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbsService } from '../../../core/services/breadcrumbs.service';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (items$ | async; as items) {
      <nav class="container mx-auto px-4 lg:px-8" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 py-3 text-sm">
          <li>
            <a routerLink="/app/marketplace" class="text-markt-muted hover:text-markt-primary">Marketplace</a>
          </li>
          @for (bc of items; track bc; let last = $last) {
            <li class="text-markt-muted" aria-hidden="true">/</li>
            @if (!last) {
              <li>
                <a [routerLink]="bc.url || '/app/marketplace'" class="text-markt-muted hover:text-markt-primary">{{ bc.label }}</a>
              </li>
            }
            @if (last) {
              <li class="text-markt-dark font-medium truncate max-w-[40vw]" [attr.aria-current]="'page'" [title]="bc.label">{{ bc.label }}</li>
            }
          }
        </ol>
      </nav>
    }
  `
})
export class BreadcrumbsComponent {
  private service = inject(BreadcrumbsService);
  items$ = this.service.breadcrumbs$;
} 