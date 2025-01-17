import { Routes } from '@angular/router';

//component imports
import { SignupComponent } from "./ui/auth/signup/signup.component";
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

export const routes: Routes = [
  { path: "signup", component: SignupComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'seller/profile', component: SellerProfileComponent},
  { path: "seller/dashboard", component: SellerDashboardComponent },
  { path: "seller/orders", component: SellerOrdersComponent },
  { path: "seller/pricing", component: SellerPricePlansComponent },
  { path: "seller/help", component: HelpDeskMainComponent },
  { path: "seller/faqs", component: HelpDeskFaqsComponent },
  { path: "seller/billing", component: SellerBillingComponent },
  { path: "seller/messages", component: MessagesChatComponent },
  { path: "seller/invoice", component: SellerInvoicesComponent },
  { path: "seller/returns", component: SellerReturnsComponent },
  { path: '**', redirectTo: 'error' },
];
