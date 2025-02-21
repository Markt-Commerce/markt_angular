import { Routes } from '@angular/router';

import { SignupComponent } from './ui/auth/signup/signup.component';
import { LoginComponent } from './ui/auth/login/login.component';
import { OrderComponent } from './pages/order/order.component';
import { MarketplaceComponent } from './pages/marketplace/marketplace.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { ErrorComponent } from './ui/error/error.component';
import { SellerProfileComponent } from './ui/seller-profile/seller-profile.component';
import { SellerDashboardComponent } from './ui/seller-dashboard/seller-dashboard.component';
import { SellerOrdersComponent } from './ui/seller-orders/seller-orders.component';
import { SellerPricePlansComponent } from './ui/seller-price-plans/seller-price-plans.component';
import { HelpDeskMainComponent } from './ui/help-desk-main/help-desk-main.component';
import { HelpDeskFaqsComponent } from './ui/help-desk-faqs/help-desk-faqs.component';
import { SellerBillingComponent } from './ui/seller-billing/seller-billing.component';
import { MessagesChatComponent } from './ui/messages-chat/messages-chat.component';
import { SellerInvoicesComponent } from './ui/seller-invoices/seller-invoices.component';
import { SellerReturnsComponent } from './ui/seller-returns/seller-returns.component';
import { SellerListingsComponent } from './ui/seller-listings/seller-listings.component';
import { MessagesListingComponent } from './ui/messages-listing/messages-listing.component';

export const routes: Routes = [
  { path: '', redirectTo: 'marketplace', pathMatch: 'full' },

  {
    path: 'marketplace',
    component: MarketplaceComponent,
    title: 'Markt | Marketplace',
  },
  {
    path: 'create',
    component: SignupComponent,
    title: 'Markt | Create account',
  },
  {path: 'login', component: LoginComponent, title: 'Markt | Login'},
  { path: 'order', component: OrderComponent, title: 'Markt | Your orders' },
  { path: 'cart', component: CartComponent, title: 'Markt | Your cart' },
  { path: 'checkout', component: CheckoutComponent, title: 'Markt | Checkout' },
  {
    path: 'product-details',
    component: ProductDetailsComponent,
    title: 'Markt | Product Details',
  },
  {
    path: 'my-account',
    component: MyAccountComponent,
    title: 'Markt | Your Account',
  },
  { path: 'error', component: ErrorComponent },
  { path: 'seller/profile', component: SellerProfileComponent},
  { path: "seller/dashboard", component: SellerDashboardComponent },
  { path: "seller/orders", component: SellerOrdersComponent },
  { path: "seller/pricing", component: SellerPricePlansComponent },
  { path: "seller/help", component: HelpDeskMainComponent },
  { path: "seller/faqs", component: HelpDeskFaqsComponent },
  { path: "seller/billing", component: SellerBillingComponent },
  { path: "seller/message", component: MessagesChatComponent },
  { path: "seller/invoice", component: SellerInvoicesComponent },
  { path: "seller/returns", component: SellerReturnsComponent },
  { path: "seller/listing", component: SellerListingsComponent },
  { path: "seller/messages", component: MessagesListingComponent },

];
