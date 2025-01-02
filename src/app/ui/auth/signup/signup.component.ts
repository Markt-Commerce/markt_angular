import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { confirmPasswordValidator } from '../../../validators/confirm-password';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private formBuilder = inject(FormBuilder);

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

  onCreateAccount() {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);
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
