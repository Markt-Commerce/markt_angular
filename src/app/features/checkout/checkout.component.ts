import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService, CreateOrderRequest, PaymentMethod } from '../../core/services/order.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your purchase</p>
      </div>

      <div class="checkout-content" *ngIf="!(loading$ | async)">
        <!-- Checkout Steps -->
        <div class="checkout-steps">
          <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
            <div class="step-number">1</div>
            <div class="step-label">Shipping</div>
          </div>
          <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
            <div class="step-number">2</div>
            <div class="step-label">Payment</div>
          </div>
          <div class="step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
            <div class="step-number">3</div>
            <div class="step-label">Review</div>
          </div>
        </div>

        <!-- Step 1: Shipping Information -->
        <div class="checkout-step" *ngIf="currentStep === 1">
          <div class="step-content">
            <h2>Shipping Information</h2>
            
            <form [formGroup]="shippingForm" (ngSubmit)="onShippingSubmit()">
              <div class="form-row">
                <div class="form-group">
                  <app-input
                    id="firstName"
                    name="firstName"
                    type="text"
                    label="First Name"
                    placeholder="Enter your first name"
                    formControlName="firstName"
                    [required]="true"
                    [errorMessage]="getErrorMessage('firstName')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
                <div class="form-group">
                  <app-input
                    id="lastName"
                    name="lastName"
                    type="text"
                    label="Last Name"
                    placeholder="Enter your last name"
                    formControlName="lastName"
                    [required]="true"
                    [errorMessage]="getErrorMessage('lastName')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
              </div>

              <div class="form-group">
                <app-input
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  formControlName="email"
                  [required]="true"
                  [errorMessage]="getErrorMessage('email')"
                  [fullWidth]="true"
                ></app-input>
              </div>

              <div class="form-group">
                <app-input
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  formControlName="phone"
                  [required]="true"
                  [errorMessage]="getErrorMessage('phone')"
                  [fullWidth]="true"
                ></app-input>
              </div>

              <div class="form-group">
                <app-input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  label="Address Line 1"
                  placeholder="Enter your street address"
                  formControlName="addressLine1"
                  [required]="true"
                  [errorMessage]="getErrorMessage('addressLine1')"
                  [fullWidth]="true"
                ></app-input>
              </div>

              <div class="form-group">
                <app-input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  label="Address Line 2 (Optional)"
                  placeholder="Apartment, suite, etc."
                  formControlName="addressLine2"
                  [fullWidth]="true"
                ></app-input>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <app-input
                    id="city"
                    name="city"
                    type="text"
                    label="City"
                    placeholder="Enter your city"
                    formControlName="city"
                    [required]="true"
                    [errorMessage]="getErrorMessage('city')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
                <div class="form-group">
                  <app-input
                    id="state"
                    name="state"
                    type="text"
                    label="State/Province"
                    placeholder="Enter your state"
                    formControlName="state"
                    [required]="true"
                    [errorMessage]="getErrorMessage('state')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <app-input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    label="Postal Code"
                    placeholder="Enter your postal code"
                    formControlName="postalCode"
                    [required]="true"
                    [errorMessage]="getErrorMessage('postalCode')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
                <div class="form-group">
                  <app-input
                    id="country"
                    name="country"
                    type="text"
                    label="Country"
                    placeholder="Enter your country"
                    formControlName="country"
                    [required]="true"
                    [errorMessage]="getErrorMessage('country')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
              </div>

              <div class="form-actions">
                <app-button
                  type="submit"
                  variant="primary"
                  size="lg"
                  [loading]="processing"
                  [disabled]="shippingForm.invalid || processing"
                  [fullWidth]="true"
                >
                  Continue to Payment
                </app-button>
              </div>
            </form>
          </div>
        </div>

        <!-- Step 2: Payment Information -->
        <div class="checkout-step" *ngIf="currentStep === 2">
          <div class="step-content">
            <h2>Payment Information</h2>
            
            <form [formGroup]="paymentForm" (ngSubmit)="onPaymentSubmit()">
              <div class="payment-methods">
                <h3>Select Payment Method</h3>
                
                <div class="payment-option">
                  <input 
                    type="radio" 
                    id="card" 
                    name="paymentMethod" 
                    value="card"
                    formControlName="paymentMethod"
                  >
                  <label for="card" class="payment-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span>Credit/Debit Card</span>
                  </label>
                </div>

                <div class="payment-option">
                  <input 
                    type="radio" 
                    id="paystack" 
                    name="paymentMethod" 
                    value="paystack"
                    formControlName="paymentMethod"
                  >
                  <label for="paystack" class="payment-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    <span>Paystack</span>
                  </label>
                </div>
              </div>

              <div class="card-details" *ngIf="paymentForm.get('paymentMethod')?.value === 'card'">
                <div class="form-group">
                  <app-input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    formControlName="cardNumber"
                    [required]="true"
                    [errorMessage]="getErrorMessage('cardNumber')"
                    [fullWidth]="true"
                  ></app-input>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <app-input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      label="Expiry Date"
                      placeholder="MM/YY"
                      formControlName="expiryDate"
                      [required]="true"
                      [errorMessage]="getErrorMessage('expiryDate')"
                      [fullWidth]="true"
                    ></app-input>
                  </div>
                  <div class="form-group">
                    <app-input
                      id="cvv"
                      name="cvv"
                      type="text"
                      label="CVV"
                      placeholder="123"
                      formControlName="cvv"
                      [required]="true"
                      [errorMessage]="getErrorMessage('cvv')"
                      [fullWidth]="true"
                    ></app-input>
                  </div>
                </div>

                <div class="form-group">
                  <app-input
                    id="cardholderName"
                    name="cardholderName"
                    type="text"
                    label="Cardholder Name"
                    placeholder="Name on card"
                    formControlName="cardholderName"
                    [required]="true"
                    [errorMessage]="getErrorMessage('cardholderName')"
                    [fullWidth]="true"
                  ></app-input>
                </div>
              </div>

              <div class="form-actions">
                <app-button
                  variant="secondary"
                  size="lg"
                  (clicked)="previousStep()"
                >
                  Back to Shipping
                </app-button>
                <app-button
                  type="submit"
                  variant="primary"
                  size="lg"
                  [loading]="processing"
                  [disabled]="paymentForm.invalid || processing"
                >
                  Continue to Review
                </app-button>
              </div>
            </form>
          </div>
        </div>

        <!-- Step 3: Order Review -->
        <div class="checkout-step" *ngIf="currentStep === 3">
          <div class="step-content">
            <h2>Order Review</h2>
            
            <div class="review-sections">
              <!-- Shipping Review -->
              <div class="review-section">
                <h3>Shipping Information</h3>
                <div class="review-info">
                  <p><strong>{{ shippingForm.get('firstName')?.value }} {{ shippingForm.get('lastName')?.value }}</strong></p>
                  <p>{{ shippingForm.get('addressLine1')?.value }}</p>
                  <p *ngIf="shippingForm.get('addressLine2')?.value">{{ shippingForm.get('addressLine2')?.value }}</p>
                  <p>{{ shippingForm.get('city')?.value }}, {{ shippingForm.get('state')?.value }} {{ shippingForm.get('postalCode')?.value }}</p>
                  <p>{{ shippingForm.get('country')?.value }}</p>
                  <p>{{ shippingForm.get('email')?.value }}</p>
                  <p>{{ shippingForm.get('phone')?.value }}</p>
                </div>
                <button class="edit-btn" (click)="editStep(1)">Edit</button>
              </div>

              <!-- Payment Review -->
              <div class="review-section">
                <h3>Payment Method</h3>
                <div class="review-info">
                  <p><strong>{{ getPaymentMethodDisplay() }}</strong></p>
                  <p *ngIf="paymentForm.get('paymentMethod')?.value === 'card'">
                    **** **** **** {{ paymentForm.get('cardNumber')?.value?.slice(-4) }}
                  </p>
                </div>
                <button class="edit-btn" (click)="editStep(2)">Edit</button>
              </div>

              <!-- Order Items Review -->
              <div class="review-section">
                <h3>Order Items</h3>
                <div class="order-items">
                  <div class="order-item" *ngFor="let item of cartItems$ | async">
                    <div class="item-image">
                      <img [src]="item.product.images[0] || '/assets/placeholder-product.jpg'" [alt]="item.product.title">
                    </div>
                    <div class="item-details">
                      <h4>{{ item.product.title }}</h4>
                      <p>Quantity: {{ item.quantity }}</p>
                      <p class="item-price">{{ item.total_price | currency:item.product.currency:'symbol':'1.0-0' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <app-button
                variant="secondary"
                size="lg"
                (clicked)="previousStep()"
              >
                Back to Payment
              </app-button>
              <app-button
                variant="primary"
                size="lg"
                (clicked)="placeOrder()"
                [loading]="processing"
                [disabled]="processing"
              >
                Place Order
              </app-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading$ | async">
        <div class="loading-spinner"></div>
        <p>Loading checkout information...</p>
      </div>

      <!-- Order Summary Sidebar -->
      <div class="order-summary" *ngIf="!(loading$ | async)">
        <div class="summary-header">
          <h3>Order Summary</h3>
        </div>

        <div class="summary-items">
          <div class="summary-item" *ngFor="let item of cartItems$ | async">
            <div class="item-info">
              <h4>{{ item.product.title }}</h4>
              <p>Qty: {{ item.quantity }}</p>
            </div>
            <div class="item-price">
              {{ item.total_price | currency:item.product.currency:'symbol':'1.0-0' }}
            </div>
          </div>
        </div>

        <div class="summary-totals">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ (cartSummary$ | async)?.subtotal | currency:'NGN':'symbol':'1.0-0' }}</span>
          </div>
          <div class="summary-row" *ngIf="(cartSummary$ | async) && (cartSummary$ | async)!.tax > 0">
            <span>Tax</span>
            <span>{{ (cartSummary$ | async)!.tax | currency:'NGN':'symbol':'1.0-0' }}</span>
          </div>
          <div class="summary-row" *ngIf="(cartSummary$ | async) && (cartSummary$ | async)!.shipping > 0">
            <span>Shipping</span>
            <span>{{ (cartSummary$ | async)!.shipping | currency:'NGN':'symbol':'1.0-0' }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ (cartSummary$ | async)?.total | currency:'NGN':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <div class="summary-security">
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Secure checkout with SSL encryption
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      align-items: start;
    }

    /* Header */
    .checkout-header {
      grid-column: 1 / -1;
      text-align: center;
      margin-bottom: 2rem;
    }

    .checkout-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .checkout-header p {
      font-size: 1.125rem;
      color: #6b7280;
    }

    /* Checkout Steps */
    .checkout-steps {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      margin-bottom: 3rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      position: relative;
    }

    .step:not(:last-child)::after {
      content: '';
      position: absolute;
      right: -1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 2rem;
      height: 2px;
      background: #e5e7eb;
    }

    .step.active .step-number {
      background: #3b82f6;
      color: white;
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-number {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: #e5e7eb;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .step-label {
      font-weight: 500;
      color: #374151;
    }

    .step.active .step-label {
      color: #3b82f6;
    }

    .step.completed .step-label {
      color: #10b981;
    }

    /* Step Content */
    .checkout-step {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }

    .step-content h2 {
      margin: 0 0 2rem 0;
      color: #1f2937;
      font-size: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    /* Payment Methods */
    .payment-methods {
      margin-bottom: 2rem;
    }

    .payment-methods h3 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .payment-option {
      margin-bottom: 1rem;
    }

    .payment-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-label:hover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    input[type="radio"]:checked + .payment-label {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .card-details {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    /* Review Sections */
    .review-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .review-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .review-section h3 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .review-info p {
      margin: 0 0 0.25rem 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .edit-btn {
      background: none;
      border: 1px solid #d1d5db;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: #3b82f6;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .edit-btn:hover {
      background: #eff6ff;
      border-color: #3b82f6;
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .item-image {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      color: #374151;
    }

    .item-details p {
      margin: 0 0 0.25rem 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .item-price {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.875rem;
    }

    /* Loading State */
    .loading-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Order Summary */
    .order-summary {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .summary-header h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .summary-items {
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .item-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      color: #374151;
    }

    .item-info p {
      margin: 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .item-price {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .summary-totals {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }

    .summary-row.total {
      border-top: 1px solid #e5e7eb;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .summary-security {
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .summary-security p {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 0.75rem;
      color: #6b7280;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .checkout-container {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .checkout-steps {
        flex-direction: column;
        gap: 1rem;
      }

      .step:not(:last-child)::after {
        display: none;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private appStateService = inject(AppStateService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Observables
  cartItems$ = this.cartService.cartItems$;
  cartSummary$ = this.cartService.cartSummary$;
  loading$ = this.cartService.loading$;

  // Forms
  shippingForm: FormGroup;
  paymentForm: FormGroup;

  // Local state
  currentStep = 1;
  processing = false;

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.minLength(3)]],
      country: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['card', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Load cart data
    this.cartService.loadCart();

    // Check if cart is empty
    this.cartItems$.subscribe(items => {
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  onShippingSubmit(): void {
    if (this.shippingForm.valid) {
      this.currentStep = 2;
    }
  }

  onPaymentSubmit(): void {
    if (this.paymentForm.valid) {
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  editStep(step: number): void {
    this.currentStep = step;
  }

  placeOrder(): void {
    if (this.shippingForm.valid && this.paymentForm.valid) {
      this.processing = true;

      // Get cart items for order
      this.cartItems$.subscribe(items => {
        const orderData = {
          items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          })),
          shipping_address: this.shippingForm.value,
          billing_address: this.shippingForm.value, // Use same address for billing
          shipping_method_id: 'standard', // Default shipping method
          payment_method: this.paymentForm.get('paymentMethod')?.value,
          notes: ''
        };

        this.orderService.createOrder(orderData).subscribe({
          next: (order) => {
            this.processing = false;
            this.appStateService.addNotification({
              type: 'success',
              title: 'Order Placed Successfully',
              message: `Your order #${order.id} has been placed successfully.`
            });
            
            // Clear cart and redirect to order confirmation
            this.cartService.clearCart().subscribe(() => {
              this.router.navigate(['/orders', order.id]);
            });
          },
          error: (error) => {
            this.processing = false;
            console.error('Place order error:', error);
            this.appStateService.addNotification({
              type: 'error',
              title: 'Order Failed',
              message: 'Failed to place order. Please try again.'
            });
          }
        });
      });
    }
  }

  getPaymentMethodDisplay(): string {
    const method = this.paymentForm.get('paymentMethod')?.value;
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'paystack':
        return 'Paystack';
      default:
        return 'Payment Method';
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.shippingForm.get(controlName) || this.paymentForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return `Please enter a valid ${controlName.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }
    return '';
  }
} 