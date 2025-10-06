import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  imageUrl: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    university?: string;
    sales: number;
    responseTime: string;
  };
  condition: string;
  quantity: number;
}

interface OfferForm {
  offerAmount: number;
  expiryDate: string;
  paymentMethod: string;
  deliveryPreference: string;
  quantity: number;
  message: string;
}

@Component({
  selector: 'app-make-offer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './make-offer.component.html',
  styleUrl: './make-offer.component.css'
})
export class MakeOfferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  product: Product = {
    id: '1',
    name: 'MacBook Pro 13" M2 Chip',
    price: 1299,
    originalPrice: 1499,
    discount: 13,
    imageUrl: '/assets/images/products/sony-headphones.png',
    seller: {
      name: 'Sarah Chen',
      avatar: '/assets/images/sarah-seller.png',
      rating: 4.9,
      university: 'Stanford University',
      sales: 47,
      responseTime: 'Within 2 hours'
    },
    condition: 'Like New',
    quantity: 1
  };

  offerForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadProduct();
  }

  private initForm(): void {
    this.offerForm = this.fb.group({
      offerAmount: [1100, [Validators.required, Validators.min(1)]],
      expiryDate: [this.getDefaultExpiryDate(), [Validators.required]],
      paymentMethod: ['paypal', [Validators.required]],
      deliveryPreference: ['campus-pickup', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      message: ['Hi Sarah! I\'m a fellow student interested in your MacBook. Would you consider my offer? I can pick it up on campus at your convenience. Thanks!']
    });
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (productId) {
      // TODO: Load product from API
      // this.apiService.getProduct(productId).subscribe({
      //   next: (response) => {
      //     this.product = response.data;
      //   },
      //   error: (error) => {
      //     console.error('Error loading product:', error);
      //   }
      // });
    }
  }

  private getDefaultExpiryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date.toISOString().split('T')[0];
  }

  getSavings(): number {
    const offerAmount = this.offerForm.get('offerAmount')?.value || 0;
    return this.product.price - offerAmount;
  }

  getSavingsPercentage(): number {
    const savings = this.getSavings();
    return (savings / this.product.price) * 100;
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  getDeliveryLabel(preference: string): string {
    const labels: { [key: string]: string } = {
      'campus-pickup': 'Campus Pickup',
      'delivery': 'Delivery',
      'shipping': 'Shipping'
    };
    return labels[preference] || preference;
  }

  saveDraft(): void {
    if (this.offerForm.valid) {
      // TODO: Save draft to API
      console.log('Saving draft:', this.offerForm.value);
      // Show success message
    }
  }

  submitOffer(): void {
    if (this.offerForm.valid) {
      const offerData = {
        ...this.offerForm.value,
        productId: this.product.id,
        sellerId: this.product.seller.name // This should be actual seller ID
      };

      // TODO: Submit offer to API
      console.log('Submitting offer:', offerData);
      
      // this.apiService.createOffer(offerData).subscribe({
      //   next: (response) => {
      //     // Navigate to offers page or show success message
      //     this.router.navigate(['/app/offers']);
      //   },
      //   error: (error) => {
      //     console.error('Error submitting offer:', error);
      //   }
      // });
      
      // For now, just navigate back
      this.router.navigate(['/app/offers']);
    }
  }

  // Expose Math to template
  Math = Math;

  onSubmit(): void {
    if (this.offerForm.valid) {
      this.submitOffer();
    }
  }
}
