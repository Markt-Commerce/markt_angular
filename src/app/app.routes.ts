import { Routes } from '@angular/router';
import { MarketplaceHomepageComponent } from './marketplace/marketplace-homepage/marketplace-homepage.component';
import { SignupComponent } from './ui/auth/signup/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: 'marketplace', pathMatch: 'full' },
  { path: 'marketplace', component: MarketplaceHomepageComponent },
  { path: 'create', component: SignupComponent, title: 'Create Account' },
];
