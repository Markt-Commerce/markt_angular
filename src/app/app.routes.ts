import { Routes } from '@angular/router';

//component imports
import { SignupComponent } from "./ui/auth/signup/signup.component";
import { ErrorComponent } from './ui/error/error.component';
import { ContactComponent } from './ui/contact/contact.component';
import { AboutComponent } from './ui/about/about.component';

export const routes: Routes = [
  { path: "signup", component: SignupComponent },
  { path: "contact", component: ContactComponent },
  { path: "about", component: AboutComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'error' },
];
