import { Routes } from '@angular/router';

//component imports
import { SignupComponent } from "./ui/auth/signup/signup.component";
import { ErrorComponent } from './ui/error/error.component';
import { SellerProfileComponent } from './ui/seller-profile/seller-profile.component';
import { SellerDashboardComponent } from './ui/seller-dashboard/seller-dashboard.component';
import { SellerOrdersComponent } from './ui/seller-orders/seller-orders.component';
import { SellerPricePlansComponent } from './ui/seller-price-plans/seller-price-plans.component';
import { HelpDeskMainComponent } from './ui/help-desk-main/help-desk-main.component';

export const routes: Routes = [
  { path: "signup", component: SignupComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'seller/profile', component: SellerProfileComponent},
  { path: "seller/dashboard", component: SellerDashboardComponent },
  { path: "seller/orders", component: SellerOrdersComponent },
  { path: "seller/pricing", component: SellerPricePlansComponent },
  { path: "seller/help", component: HelpDeskMainComponent },
  { path: '**', redirectTo: 'error' },
];
