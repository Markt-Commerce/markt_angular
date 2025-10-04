import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgOptimizedImage } from '@angular/common';
import { 
  faArrowLeft, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope,
  faUser,
  faCreditCard,
  faTruck,
  faShieldAlt,
  faCheck,
  faLock,
  faEye,
  faEyeSlash,
  faPlus,
  faEdit,
  faTrash,
  faCalendar,
  faClock,
  faStar,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { AccessControlService } from '../../core/services/access-control.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, NgOptimizedImage],
  template: `
    <div class="min-h-screen bg-gray-50">
    <!-- Progress Indicator - matches Figma design -->
    <section class="bg-white border-b border-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-center space-x-8">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              <fa-icon [icon]="faCheck" class="w-4 h-4"></fa-icon>
            </div>
            <span class="ml-2 text-sm font-medium text-dark">Cart</span>
          </div>
          <div class="w-16 h-0.5 bg-primary"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span class="ml-2 text-sm font-medium text-primary">Checkout</span>
          </div>
          <div class="w-16 h-0.5 bg-gray-300"></div>
          <div class="flex items-center">
            <div class="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <span class="ml-2 text-sm font-medium text-gray-500">Confirmation</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Checkout Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (offerContext.offerId) {
        <div class="rounded-md border border-green-200 bg-green-50 text-green-800 px-4 py-2 text-sm">
          Offer accepted. Item added to your cart. You can complete checkout below.
        </div>
      }

      <!-- Error Message -->
      @if (errorMessage) {
        <div class="rounded-md border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
            <button (click)="errorMessage = ''" class="text-red-400 hover:text-red-600">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (loading) {
        <div class="rounded-md border border-blue-200 bg-blue-50 text-blue-800 px-4 py-3 text-sm mb-4">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            <span>Loading checkout data...</span>
          </div>
        </div>
      }
      <!-- Buyer mode gate -->
      @if (!canCheckout) {
        <div class="rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center justify-between">
          <div>
            Cart and checkout are available in Buyer mode. Switch to continue.
          </div>
          <button (click)="switchToBuyer()" class="ml-4 bg-markt-primary text-white px-3 py-1.5 rounded-md hover:bg-markt-secondary transition-colors">Switch to Buyer</button>
        </div>
      }

      @if (!loading) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column - Forms -->
          <div class="lg:col-span-2 space-y-6" [class.opacity-60]="!canCheckout">
          <!-- Shipping Information -->
          <div class="bg-white rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Shipping Information</h2>
              <fa-icon [icon]="faTruck" class="w-5 h-5 text-markt-primary"></fa-icon>
            </div>
            <div class="p-6">
              <form [formGroup]="shippingForm" (ngSubmit)="onShippingSubmit()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      id="firstName"
                      type="text" 
                      formControlName="firstName"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                      placeholder="Enter first name"
                      [disabled]="!canCheckout"
                    >
                    @if (shippingForm.get('firstName')?.invalid && shippingForm.get('firstName')?.touched) {
                      <div class="text-red-500 text-sm mt-1">
                        First name is required
                      </div>
                    }
                  </div>
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      id="lastName"
                      type="text" 
                      formControlName="lastName"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                      placeholder="Enter last name"
                      [disabled]="!canCheckout"
                    >
                    @if (shippingForm.get('lastName')?.invalid && shippingForm.get('lastName')?.touched) {
                      <div class="text-red-500 text-sm mt-1">
                        Last name is required
                      </div>
                    }
                  </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    formControlName="email"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Enter email address"
                    [disabled]="!canCheckout"
                  >
                  @if (shippingForm.get('email')?.invalid && shippingForm.get('email')?.touched) {
                    <div class="text-red-500 text-sm mt-1">
                      Valid email is required
                    </div>
                  }
                </div>

                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    id="phone"
                    type="tel" 
                    formControlName="phone"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Enter phone number"
                    [disabled]="!canCheckout"
                  >
                  @if (shippingForm.get('phone')?.invalid && shippingForm.get('phone')?.touched) {
                    <div class="text-red-500 text-sm mt-1">
                      Phone number is required
                    </div>
                  }
                </div>

                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    id="address"
                    type="text" 
                    formControlName="address"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Enter street address"
                    [disabled]="!canCheckout"
                  >
                  @if (shippingForm.get('address')?.invalid && shippingForm.get('address')?.touched) {
                    <div class="text-red-500 text-sm mt-1">
                      Address is required
                    </div>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      id="city"
                      type="text" 
                      formControlName="city"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                      placeholder="Enter city"
                      [disabled]="!canCheckout"
                    >
                  </div>
                  <div>
                    <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select 
                      id="state"
                      formControlName="state"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                      [disabled]="!canCheckout"
                    >
                      <option value="">Select state</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Kano">Kano</option>
                      <option value="Oyo">Oyo</option>
                    </select>
                  </div>
                  <div>
                    <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input 
                      id="postalCode"
                      type="text" 
                      formControlName="postalCode"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                      placeholder="Enter postal code"
                      [disabled]="!canCheckout"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea 
                    formControlName="notes"
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                    placeholder="Any special instructions for delivery"
                    [disabled]="!canCheckout"
                  ></textarea>
                </div>

                <div class="flex justify-end">
                  <button 
                    type="submit"
                    [disabled]="shippingForm.invalid || isProcessing || !canCheckout"
                    class="bg-markt-primary text-white px-6 py-2 rounded-md hover:bg-markt-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Payment Information (shown after shipping) -->
          @if (currentStep >= 2) {
            <div class="bg-white rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Payment Method</h2>
              <fa-icon [icon]="faCreditCard" class="w-5 h-5 text-markt-primary"></fa-icon>
            </div>
            <div class="p-6">
              <form [formGroup]="paymentForm" (ngSubmit)="onPaymentSubmit()" class="space-y-4">
                <!-- Payment Methods -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div class="grid grid-cols-3 gap-3">
                    <!-- Credit Card -->
                    <button type="button"
                            (click)="selectPayment('card')"
                            [class.bg-markt-primary]="selectedPaymentMethod === 'card'"
                            [class.text-white]="selectedPaymentMethod === 'card'"
                            [class.border-markt-primary]="selectedPaymentMethod === 'card'"
                            class="flex items-center justify-center border-2 border-gray-200 rounded-lg px-4 py-3 text-sm hover:border-markt-primary transition-colors">
                      <fa-icon [icon]="faCreditCard" class="w-5 h-5 mr-2"></fa-icon>
                      Credit Card
                    </button>
                    
                    <!-- PayPal -->
                    <button type="button"
                            (click)="selectPayment('paypal')"
                            [class.bg-markt-primary]="selectedPaymentMethod === 'paypal'"
                            [class.text-white]="selectedPaymentMethod === 'paypal'"
                            [class.border-markt-primary]="selectedPaymentMethod === 'paypal'"
                            class="flex items-center justify-center border-2 border-gray-200 rounded-lg px-4 py-3 text-sm hover:border-markt-primary transition-colors">
                      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.543-.7c-.608-.495-1.46-.8-2.53-.8H9.89c-.524 0-.968.382-1.05.9L7.26 19.04h4.616c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c2.57 0 4.578-.543 5.69-1.81.608-.693.95-1.54.95-2.42 0-.143-.023-.288-.047-.437z"/>
                      </svg>
                      PayPal
                    </button>
                    
                    <!-- Apple Pay -->
                    <button type="button"
                            (click)="selectPayment('apple')"
                            [class.bg-markt-primary]="selectedPaymentMethod === 'apple'"
                            [class.text-white]="selectedPaymentMethod === 'apple'"
                            [class.border-markt-primary]="selectedPaymentMethod === 'apple'"
                            class="flex items-center justify-center border-2 border-gray-200 rounded-lg px-4 py-3 text-sm hover:border-markt-primary transition-colors">
                      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Apple Pay
                    </button>
                  </div>
                </div>

                <!-- Card Details (if card payment selected) -->
                @if (selectedPaymentMethod === 'card') {
                  <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        formControlName="cardNumber"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                        placeholder="1234 5678 9012 3456"
                        maxlength="19"
                        [disabled]="!canCheckout"
                      >
                      <fa-icon [icon]="faCreditCard" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></fa-icon>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        formControlName="expiryDate"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                        placeholder="MM/YY"
                        maxlength="5"
                        [disabled]="!canCheckout"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <div class="relative">
                        <input 
                          [type]="showCvv ? 'text' : 'password'"
                          formControlName="cvv"
                          class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                          placeholder="123"
                          maxlength="4"
                          [disabled]="!canCheckout"
                        >
                        <button 
                          type="button"
                          (click)="toggleCvv()"
                          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <fa-icon [icon]="showCvv ? faEyeSlash : faEye" class="w-4 h-4"></fa-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input 
                      type="text" 
                      formControlName="cardholderName"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary"
                      placeholder="Enter cardholder name"
                      [disabled]="!canCheckout"
                    >
                  </div>
                </div>
                }

                <div class="flex justify-between">
                  <button 
                    type="button"
                    (click)="previousStep()"
                    class="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    [disabled]="paymentForm.invalid || isProcessing || !canCheckout"
                    class="bg-markt-primary text-white px-6 py-2 rounded-md hover:bg-markt-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Order
                  </button>
                </div>
              </form>
            </div>
          </div>
          }

          <!-- Billing Information (optional) -->
          @if (currentStep >= 2) {
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Billing Information</h2>
                <fa-icon [icon]="faCreditCard" class="w-5 h-5 text-markt-primary"></fa-icon>
              </div>
              <div class="p-6 space-y-4">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" [(ngModel)]="billingSameAsShipping" name="billingSameAsShipping"
                         (change)="syncBillingWithShipping()"
                         class="h-4 w-4 text-markt-primary border-gray-300 rounded">
                  <span class="text-sm text-gray-700">Same as shipping address</span>
                </label>
                @if (!billingSameAsShipping) {
                  <form [formGroup]="billingForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input type="text" formControlName="firstName" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input type="text" formControlName="lastName" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary">
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input type="text" formControlName="address" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" formControlName="city" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" formControlName="state" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary">
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input type="text" formControlName="postalCode" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-markt-primary">
                      </div>
                    </div>
                  </form>
                }
              </div>
            </div>
          }

          <!-- Order Review (shown after payment) -->
          @if (currentStep >= 3) {
            <div class="bg-white rounded-lg border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Order Review</h2>
            </div>
            <div class="p-6">
              <!-- Shipping Address -->
              <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="font-medium">{{ shippingForm.value.firstName }} {{ shippingForm.value.lastName }}</p>
                  <p class="text-gray-600">{{ shippingForm.value.address }}</p>
                  <p class="text-gray-600">{{ shippingForm.value.city }}, {{ shippingForm.value.state }} {{ shippingForm.value.postalCode }}</p>
                  <p class="text-gray-600">{{ shippingForm.value.phone }}</p>
                  <p class="text-gray-600">{{ shippingForm.value.email }}</p>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center">
                    <fa-icon [icon]="getPaymentMethodIcon()" class="w-5 h-5 text-gray-600 mr-2"></fa-icon>
                    <span class="font-medium">{{ getPaymentMethodName() }}</span>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                <div class="space-y-3">
                  @for (item of cartItems; track item.id) {
                    <div class="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <img 
                      [src]="item.product?.images[0]?.url || '/markt-text-logo.png'" 
                      [alt]="item.product?.name"
                      class="w-16 h-16 object-cover rounded-lg"
                    >
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{{ item.product?.name }}</h4>
                      <p class="text-sm text-gray-500">Qty: {{ item.quantity }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium text-gray-900">{{ item.price * item.quantity | currency:'USD' }}</p>
                    </div>
                  </div>
                  }
                </div>
              </div>

              <div class="flex justify-end">
                <button 
                  type="button"
                  (click)="previousStep()"
                  class="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
          }

          </div>
          
          <!-- Right Column - Order Summary -->
          <div class="lg:col-span-1">
            <section class="bg-white rounded-lg border border-border p-6 sticky top-24">
              <h2 class="text-xl font-semibold text-dark mb-6">Order Summary</h2>
              
              <!-- Order Items -->
              <div class="space-y-4 mb-6">
                @for (item of cartItems; track item.id) {
                  <div class="flex items-center space-x-3">
                    <img 
                      ngSrc="{{ item.product?.images?.[0]?.url || '/assets/images/products/sony-headphones.png' }}"
                      width="64" height="64" priority
                      alt="{{ item.product?.name }}"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                    <div class="flex-1">
                      <h3 class="font-medium text-dark">{{ item.product?.name }}</h3>
                      <p class="text-sm text-muted">Qty: {{ item.quantity }}</p>
                    </div>
                    <span class="font-semibold text-dark">{{ item.price * item.quantity | currency:'USD' }}</span>
                  </div>
                }
              </div>
              
              <!-- Promo Code -->
              <div class="mb-6">
                <div class="flex space-x-2">
                  <input type="text" [(ngModel)]="couponCode" name="couponCode" placeholder="Promo code"
                         class="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                  <button type="button" (click)="applyCoupon()"
                          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">Apply</button>
                </div>
              </div>
              
              <!-- Price Breakdown -->
              <div class="space-y-3 border-t border-border pt-4">
                <div class="flex justify-between text-sm">
                  <span class="text-muted">Subtotal</span>
                  <span class="text-dark">{{ cartSubtotal | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted">Shipping</span>
                  <span class="text-dark">{{ cartShipping | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted">Tax</span>
                  <span class="text-dark">{{ cartTax | currency:'USD' }}</span>
                </div>
                <div class="flex justify-between text-sm text-green-600">
                  <span>Student Discount</span>
                  <span>-{{ couponDiscount | currency:'USD' }}</span>
                </div>
                <div class="border-t border-border pt-3">
                  <div class="flex justify-between text-lg font-semibold">
                    <span class="text-dark">Total</span>
                    <span class="text-dark">{{ cartTotal | currency:'USD' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Delivery Info -->
              <div class="mt-6 p-4 bg-light rounded-lg">
                <div class="flex items-center text-sm text-muted mb-2">
                  <fa-icon [icon]="faTruck" class="w-4 h-4 mr-2"></fa-icon>
                  <span>Estimated Delivery</span>
                </div>
                <p class="font-medium text-dark">3-5 business days</p>
              </div>
              
              <!-- Security Badges -->
              <div class="mt-6 flex items-center justify-center space-x-4 text-xs text-muted">
                <div class="flex items-center">
                  <fa-icon [icon]="faShieldAlt" class="w-3 h-3 text-green-500 mr-1"></fa-icon>
                  <span>SSL Secure</span>
                </div>
                <div class="flex items-center">
                  <fa-icon [icon]="faLock" class="w-3 h-3 text-green-500 mr-1"></fa-icon>
                  <span>256-bit Encryption</span>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <!-- Terms and Place Order -->
        <section class="mt-8 bg-white rounded-lg border border-border p-6">
          <div class="flex items-start space-x-3 mb-6">
            <input type="checkbox" [(ngModel)]="termsAccepted" name="termsAccepted"
                   class="w-4 h-4 text-primary border-border rounded focus:ring-primary mt-0.5">
            <div class="text-sm text-muted">
              I agree to the <span class="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span class="text-primary hover:underline cursor-pointer">Privacy Policy</span>. I understand the <span class="text-primary hover:underline cursor-pointer">Return Policy</span> and confirm my order details are correct.
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button type="button" (click)="previousStep()" 
                    class="flex-1 px-6 py-3 border border-border text-dark rounded-lg hover:bg-gray-50 transition-colors">
              <fa-icon [icon]="faArrowLeft" class="mr-2"></fa-icon>
              Back to Cart
            </button>
            <button (click)="placeOrder()"
                    [disabled]="isProcessing || !canCheckout || !termsAccepted"
                    class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              <fa-icon [icon]="faLock" class="mr-2"></fa-icon>
              Place Order - {{ cartTotal | currency:'USD' }}
            </button>
          </div>
        </section>
      }
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-border mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col md:flex-row items-center justify-between">
            <div class="flex items-center space-x-6 text-sm text-muted">
              <span>© 2024 Markt. All rights reserved.</span>
              <span class="hover:text-primary cursor-pointer">Privacy</span>
              <span class="hover:text-primary cursor-pointer">Terms</span>
              <span class="hover:text-primary cursor-pointer">Support</span>
            </div>
            <div class="flex items-center space-x-4 mt-4 md:mt-0">
              <div class="flex items-center space-x-2 text-xs text-muted">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.574-2.354 1.574-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.343 18.031c.058.049.12.102.181.16 1.253 1.34 3.558 3.592 3.558 3.592l5.918-11.944c.042-.084.05-.189.008-.283a.326.326 0 0 0-.244-.209l-9.151-1.932a.311.311 0 0 0-.315.452l3.245 6.43-3.245 6.43a.311.311 0 0 0 .315.452l9.151-1.932a.326.326 0 0 0 .244-.209c.042-.094.034-.199-.008-.283l-5.918 11.944s-2.305-2.252-3.558-3.592c-.061-.058-.123-.111-.181-.16l3.245-6.43-3.245-6.43z"/>
                </svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.543-.7c-.608-.495-1.46-.8-2.53-.8H9.89c-.524 0-.968.382-1.05.9L7.26 19.04h4.616c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c2.57 0 4.578-.543 5.69-1.81.608-.693.95-1.54.95-2.42 0-.143-.023-.288-.047-.437z"/>
                </svg>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  public access = inject(AccessControlService);

  // Icons
  faArrowLeft = faArrowLeft;
  faMapMarkerAlt = faMapMarkerAlt;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faUser = faUser;
  faCreditCard = faCreditCard;
  faTruck = faTruck;
  faShieldAlt = faShieldAlt;
  faCheck = faCheck;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faPlus = faPlus;
  faEdit = faEdit;
  faTrash = faTrash;
  faCalendar = faCalendar;
  faClock = faClock;
  faStar = faStar;
  faStore = faStore;

  // Forms
  shippingForm: FormGroup;
  paymentForm: FormGroup;

  // Data
  cartItems: any[] = [];
  cartSubtotal = 0;
  cartShipping = 0;
  cartTax = 0;
  cartTotal = 0;
  
  // State
  currentStep = 1;
  isProcessing = false;
  showCvv = false;
  selectedPaymentMethod = 'card';
  loading = false;
  errorMessage = '';
  cart: any = null;
  cartSummary: any = null;
  offerContext: { offerId?: string } = {};
  addresses: any[] = [];
  couponCode = '';
  couponApplied = false;
  couponDiscount = 0;
  couponError = '';
  totalAmount = 0;
  userEmail = '';
  userId = '';
  paymentError = '';
  selectedAddress: any = null;
  paymentMethod = 'card';
  orderNotes = '';
  order: any = null;
  orderError = '';
  subtotal = 0;
  shipping = 0;
  tax = 0;
  canCheckout = true;
  termsAccepted = false;
  billingSameAsShipping = true;

  // Billing form (used when not same as shipping)
  billingForm: FormGroup = this.fb.group({
    firstName: ['John'],
    lastName: ['Doe'],
    address: ['123 University Ave'],
    city: ['College Town'],
    state: [''],
    postalCode: ['12345']
  });

  // Payment methods
  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', shortName: 'Credit Card', icon: this.faCreditCard },
    { id: 'paypal', name: 'PayPal', shortName: 'PayPal', icon: this.faCreditCard },
    { id: 'apple', name: 'Apple Pay', shortName: 'Apple Pay', icon: this.faCreditCard }
  ];

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: ['john.doe@university.edu', [Validators.required, Validators.email]],
      phone: ['(555) 123-4567', Validators.required],
      address: ['123 University Ave', Validators.required],
      city: ['College Town', Validators.required],
      state: ['', Validators.required],
      postalCode: ['12345', Validators.required],
      notes: ['Leave at the front desk if not available']
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['card', Validators.required],
      cardNumber: ['1234 5678 9012 3456', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
      expiryDate: ['MM/YY', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['123', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['John Doe', Validators.required]
    });
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const offerId = qp.get('offerId') || undefined;
    if (qp.get('source') === 'offer' && offerId) {
      this.offerContext.offerId = offerId;
    }
    this.canCheckout = this.access.isBuyer;
    this.authService.authState$.subscribe(() => {
      this.canCheckout = this.access.isBuyer;
    });
    this.loadCheckoutData();
  }

  private loadCheckoutData(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Load cart data
    this.apiService.getCart().subscribe({
      next: (response) => {
        this.cart = response.data;
        this.cartItems = (this.cart?.items || []).map((ci: any) => ({
          id: ci.id,
          product: ci.product,
          quantity: ci.quantity,
          price: (ci.product_price ?? ci.price ?? 0) / 100
        }));
        this.calculateTotals();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        // Mock data from Figma design
        this.cartItems = [
          {
            id: 'cart-item-1',
            product: {
              id: 'economics-textbook',
              name: 'Economics Textbook',
              images: [{ media: { original_url: '/assets/images/products/economics-textbook.png' } }]
            },
            quantity: 1,
            price: 89.99
          },
          {
            id: 'cart-item-2',
            product: {
              id: 'university-hoodie',
              name: 'University Hoodie',
              images: [{ media: { original_url: '/assets/images/products/university-hoodie.png' } }]
            },
            quantity: 1,
            price: 45.00
          }
        ];
        this.cartSubtotal = 134.99; // $89.99 + $45.00
        this.cartShipping = 5.99;
        this.cartTax = 11.24;
        this.couponDiscount = 10.00; // Student Discount
        this.cartTotal = this.cartSubtotal + this.cartShipping + this.cartTax - this.couponDiscount; // $142.22
        this.loading = false;
      }
    });

    // Load cart summary
    this.apiService.getCartSummary().subscribe({
      next: (response) => {
        this.cartSummary = response.data;
      },
      error: (error) => {
        console.error('Error loading cart summary:', error);
        // ignore, totals are computed from fallback above
      }
    });

    // Load user addresses (non-blocking)
    this.apiService.getUserAddresses().subscribe({
      next: (response) => {
        this.addresses = response.data || [];
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.addresses = [];
        // do not set a blocking error
      }
    });
  }

  applyCoupon(): void {
    if (this.couponCode) {
      this.apiService.applyCoupon({ code: this.couponCode }).subscribe({
        next: (response) => {
          this.couponApplied = true;
          this.couponDiscount = response.data.discount_amount || 0;
          this.calculateTotals();
        },
        error: (error) => {
          console.error('Error applying coupon:', error);
          this.couponError = error.message || 'Invalid coupon code';
        }
      });
    }
  }

  initializePayment(): void {
    const paymentData = {
      amount: this.totalAmount,
      currency: 'NGN',
      email: this.userEmail,
      reference: this.generateReference(),
      callback_url: window.location.origin + '/app/checkout/success',
      metadata: {
        cart_id: this.cart.id,
        user_id: this.userId
      }
    };

    this.apiService.initializePayment(paymentData).subscribe({
      next: (response) => {
        // Redirect to payment gateway
        window.location.href = response.data.authorization_url;
      },
      error: (error) => {
        console.error('Error initializing payment:', error);
        this.paymentError = error.message || 'Payment initialization failed';
      }
    });
  }

  processOrder(): void {
    const orderData = {
      cart_id: this.cart.id,
      shipping_address: this.selectedAddress,
      billing_address: this.selectedAddress,
      payment_method: this.paymentMethod,
      coupon_code: this.couponCode,
      notes: this.orderNotes
    };

    this.apiService.createOrder(orderData).subscribe({
      next: (response) => {
        this.order = response.data;
        this.initializePayment();
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.orderError = error.message || 'Order creation failed';
      }
    });
  }

  private generateReference(): string {
    return 'MARKT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private calculateTotals(): void {
    if (this.cart) {
      this.subtotal = this.cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      this.shipping = this.cartSummary?.shipping_cost || 0;
      this.tax = this.cartSummary?.tax_amount || 0;
      this.totalAmount = this.subtotal + this.shipping + this.tax - (this.couponDiscount || 0);
    }
  }

  syncBillingWithShipping(): void {
    if (this.billingSameAsShipping) {
      this.billingForm.patchValue({
        firstName: this.shippingForm.value.firstName,
        lastName: this.shippingForm.value.lastName,
        address: this.shippingForm.value.address,
        city: this.shippingForm.value.city,
        state: this.shippingForm.value.state,
        postalCode: this.shippingForm.value.postalCode
      }, { emitEvent: false });
    }
  }

  onShippingSubmit(): void {
    if (this.shippingForm.valid) {
      this.currentStep = 2;
    } else {
      this.markFormGroupTouched(this.shippingForm);
    }
  }

  onPaymentSubmit(): void {
    if (this.paymentForm.valid) {
      this.currentStep = 3;
    } else {
      this.markFormGroupTouched(this.paymentForm);
    }
  }

  selectPayment(methodId: string): void {
    this.selectedPaymentMethod = methodId;
    this.paymentForm.get('paymentMethod')?.setValue(methodId, { emitEvent: false });
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  toggleCvv(): void {
    this.showCvv = !this.showCvv;
  }

  getPaymentMethodIcon(): any {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return method ? method.icon : this.faCreditCard;
  }

  getPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod);
    return method ? method.name : 'Unknown';
  }

  private getPaymentDetails(): any {
    if (this.selectedPaymentMethod === 'card') {
      return {
        card_number: this.paymentForm.value.cardNumber,
        expiry_date: this.paymentForm.value.expiryDate,
        cvv: this.paymentForm.value.cvv,
        cardholder_name: this.paymentForm.value.cardholderName
      };
    }
    return {};
  }

  private createOrderData(): any {
    const user = this.authService.getCurrentUser();
    const cart = this.cartService.getCurrentCart();
    return {
      cart_id: cart?.id,
      shipping_address: {
        firstName: user?.first_name || user?.username || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone_number || '',
        address: this.shippingForm.get('address')?.value || '',
        city: this.shippingForm.get('city')?.value || '',
        state: this.shippingForm.get('state')?.value || '',
        postal_code: this.shippingForm.get('postalCode')?.value || '',
        notes: this.shippingForm.get('notes')?.value || ''
      },
      payment_method: this.paymentForm.get('paymentMethod')?.value || 'card',
      payment_details: this.getPaymentDetails()
    };
  }

  placeOrder(): void {
    if (!this.canCheckout) {
      this.errorMessage = 'Please switch to buyer mode to complete checkout';
      return;
    }
    
    if (!this.shippingForm.valid || !this.paymentForm.valid) {
      this.errorMessage = 'Please complete all required fields';
      this.markFormGroupTouched(this.shippingForm);
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const orderData = this.createOrderData();

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response.success) {
          // Clear cart
          this.cartService.clearCart().subscribe();
          
          // Navigate to order confirmation
          this.router.navigate(['/app/checkout/confirmation', response.data.id]);
        } else {
          this.errorMessage = response.message || 'Failed to place order';
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.errorMessage = error.message || 'Failed to place order. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Payment endpoint integrations - using component data instead of hardcoded values
  getPayment(paymentId?: string): void {
    const id = paymentId || this.order?.payment_id;
    if (!id) return;
    
    this.apiService.getPayment(id).subscribe({
      next: (response) => {
        console.log('Payment details:', response.data);
      },
      error: (error) => {
        console.error('Error getting payment:', error);
      }
    });
  }

  payOrder(): void {
    if (!this.order?.id || !this.paymentForm.valid) return;
    
    const paymentData = this.getPaymentDetails();
    this.apiService.payOrder(this.order.id, paymentData).subscribe({
      next: (response) => {
        console.log('Order paid:', response.data);
      },
      error: (error) => {
        console.error('Error paying order:', error);
      }
    });
  }

  handlePaystackWebhook(webhookData: any): void {
    this.apiService.handlePaystackWebhook(webhookData).subscribe({
      next: (response) => {
        console.log('Webhook handled:', response.data);
      },
      error: (error) => {
        console.error('Error handling webhook:', error);
      }
    });
  }

  handlePaymentCallback(paymentId?: string): void {
    const id = paymentId || this.order?.payment_id;
    if (!id) return;
    
    this.apiService.handlePaymentCallback(id).subscribe({
      next: (response) => {
        console.log('Payment callback handled:', response.data);
      },
      error: (error) => {
        console.error('Error handling payment callback:', error);
      }
    });
  }

  // Additional payment endpoint integrations
  createPayment(paymentData: any): void {
    this.apiService.createPayment(paymentData).subscribe({
      next: (response) => {
        console.log('Payment created:', response.data);
      },
      error: (error) => {
        console.error('Error creating payment:', error);
      }
    });
  }

  processPayment(paymentId: string, paymentData: any): void {
    this.apiService.processPayment(paymentId, paymentData).subscribe({
      next: (response) => {
        console.log('Payment processed:', response.data);
      },
      error: (error) => {
        console.error('Error processing payment:', error);
      }
    });
  }

  verifyPayment(paymentId: string): void {
    this.apiService.verifyPayment(paymentId).subscribe({
      next: (response) => {
        console.log('Payment verified:', response.data);
      },
      error: (error) => {
        console.error('Error verifying payment:', error);
      }
    });
  }

  getPayments(): void {
    this.apiService.getPayments().subscribe({
      next: (response) => {
        console.log('Payments loaded:', response.data);
      },
      error: (error) => {
        console.error('Error loading payments:', error);
      }
    });
  }

  switchToBuyer(): void {
    this.authService.switchRole().subscribe({
      next: () => {
        this.canCheckout = this.access.isBuyer;
      },
      error: () => {}
    });
  }
} 