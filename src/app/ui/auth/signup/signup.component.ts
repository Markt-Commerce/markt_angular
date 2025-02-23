import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { confirmPasswordValidator } from '../../../validators/confirm-password';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from "../../../services/services";
import { SignUpTypeChangeService } from '../../../services/utilities/signupTypeConv';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private signUpTypeChange = inject(SignUpTypeChangeService);

  currentStep = 1;

  signupForm = this.formBuilder.group(
    {
      accountType: ['buyer', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      username: [
        '',
        [Validators.required, Validators.pattern(/^@[a-zA-Z0-9_.]+$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      shopDescription: [''],
      shopDirections: [''],
      shopCategory: [''],
      location: [''],
      houseNumber: [''],
      street: [''],
      city: [''],
      cardNumber: ['', [Validators.pattern('^[0-9]{13,16}$')]],
      cardExpiry: ['', [Validators.pattern('^(0[1-9]|1[0-2])/[0-9]{2}$')]],
      cvv: ['', [Validators.pattern('^[0-9]{3}$')]],
    },
    { validators: confirmPasswordValidator() }
  );

  get accountType(): AbstractControl {
    return this.signupForm.controls['accountType'];
  }
  get name(): AbstractControl {
    return this.signupForm.controls['name'];
  }
  get password(): AbstractControl {
    return this.signupForm.controls['password'];
  }
  get confirmPassword(): AbstractControl {
    return this.signupForm.controls['confirmPassword'];
  }
  get username(): AbstractControl {
    return this.signupForm.controls['username'];
  }
  get email(): AbstractControl {
    return this.signupForm.controls['email'];
  }
  get phone(): AbstractControl {
    return this.signupForm.controls['phone'];
  }
  get cvv(): AbstractControl {
    return this.signupForm.controls['cvv'];
  }
  get cardExpiry(): AbstractControl {
    return this.signupForm.controls['cardExpiry'];
  }
  get cardNumber(): AbstractControl {
    return this.signupForm.controls['cardNumber'];
  }
  get city(): AbstractControl {
    return this.signupForm.controls['city'];
  }
  get street(): AbstractControl {
    return this.signupForm.controls['street'];
  }
  get houseNumber(): AbstractControl {
    return this.signupForm.controls['houseNumber'];
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  errormessage: string = '';

  setErrorMessageTimeout(error: string) {
    this.errormessage = error;
    setTimeout(() => {
      this.errormessage = '';
    }, 5000);
  }

  onCreateAccount() {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);
      console.log('Account type:', this.accountType.value);
      if (this.accountType.value == "buyer") this.userService.registerBuyer(this.signUpTypeChange.convertDataToBuyerType(this.signupForm.value)).subscribe((data) => {
        if (data.status == 409) this.setErrorMessageTimeout("User with this email already exists");
        if (data.status >= 200 && data.status < 300) this.router.navigate(['/login']);
      });
      if (this.accountType.value == "seller") this.userService.registerSeller(this.signUpTypeChange.convertDataToSellerType(this.signupForm.value)).subscribe((data) => {
        if (data.status == 409) this.setErrorMessageTimeout("User with this email already exists");
        if (data.status >= 200 && data.status < 300) this.router.navigate(['/login']);
      });

    }
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.signupForm.patchValue({
          location: `${position.coords.latitude}, ${position.coords.longitude}`,
        });
      });
      console.log(this.signupForm.controls['location'].value);
    }
  }
}
