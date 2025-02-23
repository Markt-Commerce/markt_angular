import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { confirmPasswordValidator } from '../../../validators/confirm-password';
import { FormsModule } from '@angular/forms';
import { AuthService } from "../../../services/services";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  errormessage: string = '';

  loginForm = this.formBuilder.group(
    {
      accountType: ['buyer', Validators.required],
      email: ['', [Validators.required, Validators.required]],
      password: ['', [Validators.required, Validators.required]],
    },
    { validators: confirmPasswordValidator() }
  );

  get accountType(): AbstractControl {
    return this.loginForm.controls['accountType'];
  }
  get email(): AbstractControl {
    return this.loginForm.controls['email'];
  }
  get password(): AbstractControl {
    return this.loginForm.controls['password'];
  }

  setErrorMessageTimeout(error: string) {
    this.errormessage = error;
    setTimeout(() => {
      this.errormessage = '';
    }, 5000);
  }


  login() {
    if (this.loginForm.valid) {
      if (this.accountType.value == "buyer") this.authService.authenticateUser({
        account_type: this.accountType.value,
        email: this.email.value,
        password: this.password.value,
        username: ""
      }).subscribe((data) => {
        if (data.status >= 200 && data.status < 300) this.router.navigate(['/marketplace']);
        else if (data.status == 401) this.setErrorMessageTimeout("Invalid credentials");
        else this.setErrorMessageTimeout("An error occured, please try again");
      });
      if (this.accountType.value == "seller") this.authService.authenticateUser({
        account_type: this.accountType.value,
        email: this.email.value,
        password: this.password.value,
        username: ""
      }).subscribe((data) => {
        if (data.status >= 200 && data.status < 300) this.router.navigate(['/seller/dashboard']);
        else if (data.status == 401) this.setErrorMessageTimeout("Invalid credentials");
        else this.setErrorMessageTimeout("An error occured, please try again");
      });

    }
  }

}
