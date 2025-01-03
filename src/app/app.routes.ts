import { Routes } from '@angular/router';
import { MarketplaceHomepageComponent } from './marketplace/marketplace-homepage/marketplace-homepage.component';
import { SignupComponent } from './ui/auth/signup/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: 'marketplace/homepage', pathMatch: 'full' },
  { path: 'marketplace/homepage', component: MarketplaceHomepageComponent },
  { path: 'create', component: SignupComponent, title: 'Create Account' },
];
