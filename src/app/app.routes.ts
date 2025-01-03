import { Routes } from '@angular/router';
import { MarketplaceHomepageComponent } from './marketplace/marketplace-homepage/marketplace-homepage.component';
import { SignupComponent } from './ui/auth/signup/signup.component';

export const routes: Routes = [
  { path: '', component: MarketplaceHomepageComponent }, // Default landing page
  { path: 'create', component: SignupComponent, title: 'Create Account' },
];
