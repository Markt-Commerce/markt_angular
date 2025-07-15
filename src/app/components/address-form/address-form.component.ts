import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.css',
})
export class AddressFormComponent implements OnInit {
  @Input() initialAddress?: Partial<Address>;
  @Input() isEditing = false;
  @Input() loading = false;
  @Output() saveAddress = new EventEmitter<Address>();
  @Output() cancel = new EventEmitter<void>();

  addressForm: FormGroup;
  countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
  ];

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
      ],
      country: ['US', Validators.required],
      label: [''],
      isDefault: [false],
    });
  }

  ngOnInit() {
    if (this.initialAddress) {
      this.addressForm.patchValue(this.initialAddress);
    }
  }

  onSubmit() {
    if (this.addressForm.valid) {
      this.saveAddress.emit(this.addressForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  private markFormGroupTouched() {
    Object.keys(this.addressForm.controls).forEach((key) => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.addressForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength'])
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }
}
