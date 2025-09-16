import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  template: `
    <div class="space-y-6">
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
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            routerLink="/app/cart"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <fa-icon [icon]="faArrowLeft" class="w-5 h-5"></fa-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Checkout</h1>
            <p class="text-gray-500">Complete your purchase</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <div class="flex items-center">
            <fa-icon [icon]="faShieldAlt" class="w-4 h-4 mr-1"></fa-icon>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <!-- Checkout Steps -->
      <div class="flex items-center justify-center space-x-8">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-markt-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <span class="font-medium text-markt-primary">Shipping</span>
        </div>
        <div class="w-16 h-1 bg-gray-200"></div>
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <span class="font-medium text-gray-500">Payment</span>
        </div>
        <div class="w-16 h-1 bg-gray-200"></div>
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
            3
          </div>
          <span class="font-medium text-gray-500">Review</span>
        </div>
      </div>

      <!-- Empty Cart State -->
      @if (!loading && !errorMessage && (!cartItems || cartItems.length === 0)) {
        <div class="text-center py-12">
          <div class="max-w-md mx-auto">
            <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p class="mt-2 text-gray-500">Add some items to your cart to proceed with checkout.</p>
            <div class="mt-6">
              <button 
                routerLink="/app/marketplace"
                class="bg-markt-primary text-white px-6 py-3 rounded-md hover:bg-markt-secondary transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      }

      @if (!loading && !errorMessage && cartItems && cartItems.length > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2 space-y-6" [class.opacity-60]="!canCheckout">
          <!-- Shipping Information -->
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Shipping Information</h2>
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
            <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Payment Information</h2>
            </div>
            <div class="p-6">
              <form [formGroup]="paymentForm" (ngSubmit)="onPaymentSubmit()" class="space-y-4">
                <!-- Payment Methods -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div class="space-y-3">
                    @for (method of paymentMethods; track method.id) {
                      <label 
                        class="flex items-center p-4 border border-gray-200 rounded-md hover:border-markt-primary cursor-pointer"
                        [class.border-markt-primary]="selectedPaymentMethod === method.id"
                      >
                      <input 
                        type="radio" 
                        [value]="method.id"
                        formControlName="paymentMethod"
                        class="h-4 w-4 text-markt-primary focus:ring-markt-primary border-gray-300"
                        [disabled]="!canCheckout"
                      >
                      <div class="ml-3 flex items-center">
                        <fa-icon [icon]="method.icon" class="w-5 h-5 text-gray-600 mr-2"></fa-icon>
                        <span class="font-medium text-gray-900">{{ method.name }}</span>
                      </div>
                    </label>
                    }
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

          <!-- Order Review (shown after payment) -->
          @if (currentStep >= 3) {
            <div class="bg-white rounded-lg shadow">
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
                      <p class="font-medium text-gray-900">{{ item.price * item.quantity | currency:'NGN' }}</p>
                    </div>
                  </div>
                  }
                </div>
              </div>

              <div class="flex justify-between">
                <button 
                  type="button"
                  (click)="previousStep()"
                  class="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button 
                  (click)="placeOrder()"
                  [disabled]="isProcessing || !canCheckout"
                  class="bg-markt-primary text-white px-6 py-2 rounded-md hover:bg-markt-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (!isProcessing) {
                    <span>Place Order</span>
                  }
                  @if (isProcessing) {
                    <span>Processing...</span>
                  }
                </button>
              </div>
            </div>
          </div>
          }

          <!-- Order Summary -->
          <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow sticky top-6">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Order Summary</h2>
            </div>
            <div class="p-6 space-y-4">
              <!-- Order Items Summary -->
              <div class="space-y-3">
                @for (item of cartItems; track item.id) {
                  <div class="flex justify-between text-sm">
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">{{ item.product?.name }}</p>
                      <p class="text-gray-500">Qty: {{ item.quantity }}</p>
                    </div>
                    <span class="font-medium">{{ item.price * item.quantity | currency:'NGN' }}</span>
                  </div>
                }
              </div>

              <!-- Totals -->
              <div class="border-t border-gray-200 pt-4 space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-medium">{{ cartSubtotal | currency:'NGN' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Shipping</span>
                  <span class="font-medium">{{ cartShipping | currency:'NGN' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tax</span>
                  <span class="font-medium">{{ cartTax | currency:'NGN' }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{{ cartTotal | currency:'NGN' }}</span>
                </div>
              </div>

              <!-- Security Notice -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                  <fa-icon [icon]="faLock" class="w-5 h-5 text-green-600 mr-2"></fa-icon>
                  <div>
                    <p class="text-sm font-medium text-green-800">Secure Checkout</p>
                    <p class="text-xs text-green-600">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
    </div>}
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

  // Payment methods
  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: this.faCreditCard },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: this.faCreditCard },
    { id: 'wallet', name: 'Markt Wallet', icon: this.faCreditCard }
  ];

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      notes: ['']
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['card', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', Validators.required]
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
        this.calculateTotals();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.errorMessage = 'Failed to load cart. Please try again.';
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
        this.errorMessage = 'Failed to load cart summary. Please try again.';
      }
    });

    // Load user addresses
    this.apiService.getUserAddresses().subscribe({
      next: (response) => {
        this.addresses = response.data || [];
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.addresses = [];
        this.errorMessage = 'Failed to load addresses. Please try again.';
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
    if (!this.canCheckout) return;
    if (!this.shippingForm.valid || !this.paymentForm.valid) {
      return;
    }

    this.isProcessing = true;

    const orderData = this.createOrderData();

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response.success) {
          // Clear cart
          this.cartService.clearCart().subscribe();
          
          // Navigate to order confirmation
          this.router.navigate(['/app/orders', response.data.id]);
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error placing order:', error);
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