import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ROUTES_ABSOLUTE } from '../../../core/config/routes.config';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Shipping Addresses</h1>
          <p class="text-sm text-gray-500">Manage saved addresses for faster checkout</p>
        </div>
        <button (click)="goBack()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
      </div>

      <div *ngIf="loading" class="text-gray-500">Loading addresses...</div>
      <div *ngIf="!loading && addresses.length === 0" class="text-gray-500">No addresses found.</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="!loading && addresses.length">
        <div *ngFor="let addr of addresses" class="bg-white border rounded-lg p-4 shadow-sm">
          <div class="font-medium text-gray-900">{{ addr?.street }} {{ addr?.house_number }}</div>
          <div class="text-sm text-gray-600">{{ addr?.city }}, {{ addr?.state }}, {{ addr?.country }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ addr?.postal_code }}</div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ShippingComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  loading = false;
  addresses: any[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.api.getUserAddresses().subscribe({
      next: (res) => {
        this.addresses = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.addresses = [];
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate([ROUTES_ABSOLUTE.APP.SETTINGS]);
  }
} 