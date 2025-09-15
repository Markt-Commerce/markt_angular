import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbsService } from '../../../core/services/breadcrumbs.service';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="container mx-auto px-4 lg:px-8" aria-label="Breadcrumb" *ngIf="(items$ | async) as items">
      <ol class="flex items-center gap-2 py-3 text-sm">
        <li>
          <a routerLink="/app/marketplace" class="text-markt-muted hover:text-markt-primary">Marketplace</a>
        </li>
        <ng-container *ngFor="let bc of items; let last = last">
          <li class="text-markt-muted" aria-hidden="true">/</li>
          <li *ngIf="!last">
            <a [routerLink]="bc.url || '/app/marketplace'" class="text-markt-muted hover:text-markt-primary">{{ bc.label }}</a>
          </li>
          <li *ngIf="last" class="text-markt-dark font-medium truncate max-w-[40vw]" [attr.aria-current]="'page'" [title]="bc.label">{{ bc.label }}</li>
        </ng-container>
      </ol>
    </nav>
  `
})
export class BreadcrumbsComponent {
  private service = inject(BreadcrumbsService);
  items$ = this.service.breadcrumbs$;
} 