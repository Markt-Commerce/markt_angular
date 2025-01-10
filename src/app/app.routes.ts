import { Routes } from '@angular/router';

import { SignupComponent } from './ui/auth/signup/signup.component';
import { OrderComponent } from './pages/order/order.component';
import { MarketplaceComponent } from './pages/marketplace/marketplace.component';
import { CartComponent } from './pages/cart/cart.component';

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
  { path: 'order', component: OrderComponent, title: 'Markt | Your orders' },
  { path: 'cart', component: CartComponent, title: 'Markt | Your cart' },
];
