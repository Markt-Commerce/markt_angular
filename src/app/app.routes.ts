import { Routes } from '@angular/router';

//component imports
import { SignupComponent } from "./ui/auth/signup/signup.component";
import { ErrorComponent } from './ui/error/error.component';
import { SellerProfileComponent } from './ui/seller-profile/seller-profile.component';
import { SellerDashboardComponent } from './ui/seller-dashboard/seller-dashboard.component';

export const routes: Routes = [
  { path: "signup", component: SignupComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'seller/profile', component: SellerProfileComponent},
  { path: "seller/dashboard", component: SellerDashboardComponent },
  { path: '**', redirectTo: 'error' },
];
